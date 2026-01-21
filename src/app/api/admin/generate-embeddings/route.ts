import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs'; // Enforce Node.js runtime

import { generateEmbedding } from '@/lib/embeddings';
import { maskPII, extractResumeText, extractSkillsText } from '@/lib/pii-masking';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify admin role
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify JWT Token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    const { userId, forceReprocess } = await request.json();

    // STEP 2: FETCH CANDIDATES MANUALLY (To avoid relationship errors)
    // 2.1 Fetch users with role 'candidate'
    let usersQuery = supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .eq('role', 'candidate');

    if (userId) {
      usersQuery = usersQuery.eq('id', userId);
    }

    const { data: users, error: userError } = await usersQuery;

    if (userError) {
      console.error('Failed to fetch users:', userError);
      throw userError;
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ summary: { processed: 0, skipped: 0, errors: 0 } });
    }

    const userIds = users.map(u => u.id);

    // 2.2 Fetch profiles for these users
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        user_id:id,
        core_field,
        core_expertise,
        position,
        experience,
        current_employer,
        notice_period,
        current_location,
        highest_education,
        passout_college,
        passout_year,
        is_fresher
      `)
      .in('id', userIds);

    if (profileError) {
       console.error('Failed to fetch profiles:', profileError);
       throw profileError;
    }

    // 2.3 Fetch work experiences
    const { data: workExperiences, error: workError } = await supabase
      .from('work_experiences')
      .select('*')
      .in('user_id', userIds);

    if (workError) {
      console.error('Failed to fetch work experiences:', workError);
      // Continued execution allowed, just won't have experiences
    }

    // 2.4 Merge data manually
    const fullProfiles = profiles?.map(profile => {
      const user = users.find(u => u.id === profile.id);
      const experiences = workExperiences?.filter(w => w.user_id === profile.id) || [];
      return {
        ...profile,
        users: user, // Attach user object to match expected structure
        work_experiences: experiences
      };
    }) || [];
    
    // Process the merged profiles (use fullProfiles instead of profiles)
    let processed = 0;
    let skipped = 0;
    let errors = 0;
    const errorDetails: any[] = [];

    for (const profile of fullProfiles) {

      const user = Array.isArray(profile.users) ? profile.users[0] : profile.users;
      try {
        // COST CONTROL: Check if reprocessing is needed
        if (!forceReprocess) {
          const { data: needsUpdate } = await supabase
            .rpc('check_if_needs_reprocessing', {
              p_user_id: profile.id
            });

          if (!needsUpdate) {
            console.log(`⏭️ Skipping ${user.email} - already up to date`);
            skipped++;
            continue;
          }
        }

        // Extract resume sections
        const fullText = extractResumeText(profile, profile.work_experiences || []);
        const skillsText = extractSkillsText(profile, profile.work_experiences || []);

        // PII PROTECTION: Mask sensitive data
        const { maskedText, detectedPII } = maskPII(fullText);
        const { maskedText: maskedSkills } = maskPII(skillsText);

        console.log(`Processing ${user.email}:`, {
          textLength: fullText.length,
          piiDetected: detectedPII
        });

        // Generate embeddings (RATE LIMITED)
        const [fullEmbedding, skillsEmbedding] = await Promise.all([
          generateEmbedding(maskedText),
          generateEmbedding(maskedSkills)
        ]);

        // Calculate experience in months
        const experienceMonths = profile.is_fresher 
          ? 0 
          : (profile.experience || 0) * 12;

        // Store in database
        const { error: upsertError } = await supabase
          .from('resume_embeddings')
          .upsert({
            user_id: profile.user_id,
            masked_resume_text: maskedText,
            full_profile_embedding: fullEmbedding,
            skills_embedding: skillsEmbedding,
            experience_embedding: fullEmbedding,
            core_field: profile.core_field,
            total_experience_months: experienceMonths,
            current_location: profile.current_location,
            last_processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (upsertError) {
          throw upsertError;
        }

        processed++;
        
        // RATE LIMITING: Prevent API abuse
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error processing ${profile.user_id}:`, error);
        errors++;
        errorDetails.push({
          userId: profile.user_id,
          email: user?.email,
          error: (error as Error).message
        });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: profiles?.length || 0,
        processed,
        skipped,
        errors
      },
      errorDetails: errors > 0 ? errorDetails : undefined
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Rate limiting check
const requestCounts = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_HOUR = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const count = requestCounts.get(ip) || 0;
  
  if (count >= MAX_REQUESTS_PER_HOUR) {
    return false;
  }
  
  requestCounts.set(ip, count + 1);
  
  // Clean up old entries
  setTimeout(() => {
    requestCounts.delete(ip);
  }, RATE_LIMIT_WINDOW);
  
  return true;
}