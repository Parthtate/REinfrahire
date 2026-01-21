/**
 * SECURITY: Masks all PII before sending to external APIs
 * Complies with data privacy regulations
 */

interface MaskingResult {
  maskedText: string;
  detectedPII: {
    emails: number;
    phones: number;
    aadhaar: number;
    pan: number;
  };
}

export function maskPII(text: string): MaskingResult {
  let masked = text;
  const detected = {
    emails: 0,
    phones: 0,
    aadhaar: 0,
    pan: 0
  };

  // Email addresses
  masked = masked.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    (match) => {
      detected.emails++;
      return '[EMAIL_REDACTED]';
    }
  );

  // Indian phone numbers (all formats)
  masked = masked.replace(
    /(\+91[\s-]?)?0?[6-9]\d{9}/g,
    (match) => {
      detected.phones++;
      return '[PHONE_REDACTED]';
    }
  );

  // Aadhaar numbers
  masked = masked.replace(
    /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
    (match) => {
      detected.aadhaar++;
      return '[AADHAAR_REDACTED]';
    }
  );

  // PAN numbers
  masked = masked.replace(
    /\b[A-Z]{5}\d{4}[A-Z]\b/g,
    (match) => {
      detected.pan++;
      return '[PAN_REDACTED]';
    }
  );

  // URLs (optional)
  masked = masked.replace(
    /https?:\/\/[^\s]+/g,
    '[URL_REDACTED]'
  );

  return { maskedText: masked, detectedPII: detected };
}

// Extract structured text from user profile
export function extractResumeText(
  profile: any,
  workExperiences: any[]
): string {
  const sections: string[] = [];

  // Education
  if (profile.highest_education) {
    sections.push(`Education: ${profile.highest_education}`);
  }
  if (profile.passout_college) {
    sections.push(`Institution: ${profile.passout_college}`);
  }
  if (profile.passout_year) {
    sections.push(`Graduation Year: ${profile.passout_year}`);
  }

  // Professional summary
  if (profile.core_field) {
    sections.push(`\nCore Field: ${profile.core_field}`);
  }
  if (profile.core_expertise) {
    sections.push(`Expertise: ${profile.core_expertise}`);
  }
  if (profile.position) {
    sections.push(`Current Role: ${profile.position}`);
  }
  if (profile.current_employer) {
    sections.push(`Employer: ${profile.current_employer}`);
  }

  // Experience summary
  if (profile.experience) {
    sections.push(`\nTotal Experience: ${profile.experience} years`);
  }
  if (profile.notice_period) {
    sections.push(`Notice Period: ${profile.notice_period}`);
  }

  // Work history details
  if (workExperiences?.length > 0) {
    sections.push('\n=== Work Experience ===');
    
    workExperiences.forEach((exp, idx) => {
      sections.push(`\nRole ${idx + 1}:`);
      sections.push(`Position: ${exp.designation}`);
      sections.push(`Company: ${exp.company_name}`);
      
      if (exp.duration_from) {
        const duration = exp.is_current 
          ? `${exp.duration_from} to Present`
          : `${exp.duration_from} to ${exp.duration_to || 'N/A'}`;
        sections.push(`Duration: ${duration}`);
      }
      
      if (exp.job_summary) {
        sections.push(`Summary: ${exp.job_summary}`);
      }
    });
  }

  // Location
  if (profile.current_location) {
    sections.push(`\nLocation: ${profile.current_location}`);
  }

  return sections.join('\n');
}

// Extract skills-focused text
export function extractSkillsText(
  profile: any,
  workExperiences: any[]
): string {
  const skills: string[] = [];

  if (profile.core_expertise) {
    skills.push(profile.core_expertise);
  }

  if (profile.position) {
    skills.push(profile.position);
  }

  // Extract from job summaries
  workExperiences?.forEach(exp => {
    if (exp.job_summary) {
      // Remove common words, keep technical terms
      const technicalTerms = exp.job_summary
        .split(/\s+/)
        .filter((word: string) => word.length > 3)
        .join(' ');
      skills.push(technicalTerms);
    }
  });

  return skills.join(' ');
}