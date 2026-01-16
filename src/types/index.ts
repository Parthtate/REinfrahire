export type User = {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
    role: 'candidate' | 'admin'
    created_at: string
  }
  
  export type Job = {
    id: number
    title: string
    company: string
    location: string
    type: string
    salary: number
    description: string
    created_at: string
  }
  
  export type JobApplication = {
    id: number
    user_id: string
    job_id: number
    applied_at: string
    status: 'pending' | 'reviewed' | 'rejected' | 'accepted'
  }
  
  export type UserProfile = {
    id: string
    user_id: string
    current_location: string
    highest_education: string
    passout_year: number
    passout_college: string
    receive_updates: boolean
    whatsapp_number: string | null
    core_field: string | null
    core_expertise: string | null
    position: string | null
    experience: number | null
    current_employer: string | null
    notice_period: string | null
    current_salary: number | null
    expected_salary: number | null
    resume_url: string | null
    is_fresher: boolean
  }
  
  export type WorkExperience = {
    id: number
    user_id: string
    company_name: string
    designation: string
    duration_from: string
    duration_to: string | null
    job_summary: string
  }