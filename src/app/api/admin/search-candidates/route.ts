// File: /src/app/api/admin/search-candidates/route.ts
// SECURITY: This route implements all safety measures from Phase 3

export const runtime = 'nodejs'; // Enforce Node.js runtime

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '@/lib/embeddings';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

// ========================================
// RATE LIMITING IMPLEMENTATION
// ========================================
const searchCounts = new Map<string, { count: number; resetTime: number }>();
const MAX_SEARCHES_PER_HOUR = 50;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = searchCounts.get(identifier);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    searchCounts.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }

  if (record.count >= MAX_SEARCHES_PER_HOUR) {
    return false; // Rate limit exceeded
  }

  record.count++;
  return true;
}

// ========================================
// SEARCH HISTORY LOGGING (AUDIT TRAIL)
// ========================================
async function logSearch(
  adminUserId: string,
  query: string,
  filters: any,
  resultsCount: number
) {
  try {
    await supabase
      .from('admin_search_history')
      .insert({
        admin_user_id: adminUserId,
        search_query: query,
        filters_applied: filters,
        results_count: resultsCount
      });
  } catch (error) {
    // Don't fail the search if logging fails
    console.error('Failed to log search:', error);
  }
}

// ========================================
// MAIN SEARCH HANDLER
// ========================================
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // STEP 1: AUTHENTICATION CHECK
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing authentication' },
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

    const userId = user.id;

    // Verify admin role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // STEP 2: RATE LIMITING
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const rateLimitKey = `${userId}_${clientIp}`;

    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: 3600 // seconds
        },
        { status: 429 }
      );
    }

    // STEP 3: PARSE REQUEST BODY
    const body = await request.json();
    const { query, filters, useHybrid = true } = body;

    // Validation
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    if (query.length > 500) {
      return NextResponse.json(
        { error: 'Search query too long (max 500 characters)' },
        { status: 400 }
      );
    }

    // STEP 4: GENERATE QUERY EMBEDDING
    console.log(`🔍 Searching for: "${query}"`);
    let queryEmbedding: number[];
    
    try {
      queryEmbedding = await generateEmbedding(query);
    } catch (error) {
      console.error('Embedding generation failed:', error);
      return NextResponse.json(
        { 
          error: 'Failed to process search query. Please try again.',
          details: (error as Error).message
        },
        { status: 500 }
      );
    }

    // STEP 5: EXECUTE SEARCH
    let searchResults: any[];

    if (useHybrid) {
      // HYBRID SEARCH: Vector + Keyword
      const keywords = query
        .split(/\s+/)
        .filter(k => k.length > 2)
        .map(k => k.trim());

      const { data, error } = await supabase.rpc('hybrid_search_candidates', {
        query_embedding: queryEmbedding,
        keywords: keywords,
        p_match_count: 50
      });

      if (error) {
        throw error;
      }

      searchResults = data || [];

    } else {
      // PURE SEMANTIC SEARCH
      const { data, error } = await supabase.rpc('search_candidates_semantic', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        p_match_count: 50,
        filter_field: filters?.coreField,
        min_experience_months: filters?.minExperience,
        filter_location: filters?.location
      });

      if (error) {
        throw error;
      }

      searchResults = data || [];
    }

    // STEP 6: FETCH FULL USER DETAILS
    if (searchResults.length === 0) {
      // Log search even if no results
      await logSearch(userId, query, filters, 0);

      return NextResponse.json({
        results: [],
        metadata: {
          totalResults: 0,
          searchTime: Date.now() - startTime,
          query
        }
      });
    }

    const userIds = searchResults.map((r: any) => r.user_id);

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        user_profiles!inner(
          core_field,
          position,
          experience,
          current_location,
          resume_url,
          current_employer,
          notice_period,
          expected_salary
        )
      `)
      .in('id', userIds);

    if (usersError) {
      throw usersError;
    }

    // STEP 7: COMBINE & FORMAT RESULTS
    const results = searchResults
      .map((result: any) => {
        const user = users?.find((u: any) => u.id === result.user_id);
        if (!user) return null;

        const profile = user.user_profiles?.[0];
        if (!profile) return null;

        return {
          userId: result.user_id,
          similarity: result.similarity || result.combined_score || 0,
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          email: user.email || '',
          coreField: profile.core_field || '',
          totalExperience: profile.experience 
            ? profile.experience * 12 
            : 0,
          location: profile.current_location || '',
          position: profile.position || '',
          currentEmployer: profile.current_employer || '',
          noticePeriod: profile.notice_period || '',
          expectedSalary: profile.expected_salary || null,
          resumeUrl: profile.resume_url || ''
        };
      })
      .filter(r => r !== null)
      .sort((a: any, b: any) => b.similarity - a.similarity);

    // STEP 8: LOG SEARCH (AUDIT TRAIL)
    await logSearch(userId, query, filters, results.length);

    // STEP 9: RETURN RESULTS
    const searchTime = Date.now() - startTime;

    return NextResponse.json({
      results,
      metadata: {
        totalResults: results.length,
        searchTime,
        query,
        useHybrid,
        filters
      }
    });

  } catch (error) {
    console.error('Search API error:', error);
    
    // SECURITY: Don't expose internal errors in production
    const errorMessage = process.env.NODE_ENV === 'development'
      ? (error as Error).message
      : 'An error occurred while searching. Please try again.';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// ========================================
// OPTIONAL: GET SEARCH HISTORY
// ========================================
export async function GET(request: NextRequest) {
  try {
    const session = await supabase.auth.getSession();
    const userId = session.data.session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch recent searches for this admin
    const { data, error } = await supabase
      .from('admin_search_history')
      .select('*')
      .eq('admin_user_id', userId)
      .order('searched_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ searchHistory: data || [] });

  } catch (error) {
    console.error('Error fetching search history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search history' },
      { status: 500 }
    );
  }
}