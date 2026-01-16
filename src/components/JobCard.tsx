import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useJobContext } from '@/contexts/JobContext'
import { Badge } from "@/components/ui/badge"
import { MapPin, Briefcase, DollarSign, Calendar, Building2, IndianRupee, Bookmark, BookmarkCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Profile = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  current_location: string
  highest_education: string
  passout_year: string
  passout_college: string
  core_field: string
  core_expertise: string
  resume_url: string
  [key: string]: any  // for other optional fields
}

type Job = {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary: number
  description: string
  created_at: string
  created_by: string
  job_category: string
  is_active: boolean
}

type JobCardProps = {
  job: Job
  appliedAt?: string  // Make this optional
}

export default function JobCard({ job, appliedAt }: JobCardProps) {
  const { saveJob, savedJobs, refreshAppliedJobs } = useJobContext()
  const [isApplied, setIsApplied] = useState(!!appliedAt)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)  // Add loading state
  const supabase = createClientComponentClient()

  const isSaved = savedJobs.some(savedJob => savedJob.job.id === job.id)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          setProfile(data)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [supabase])

  useEffect(() => {
    const checkIfApplied = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: applications, error } = await supabase
            .from('job_applications')
            .select('id')
            .eq('user_id', user.id)
            .eq('job_id', job.id)

          if (error) throw error

          setIsApplied(applications.length > 0)
        }
      } catch (error) {
        console.error('Error checking application status:', error)
      }
    }

    checkIfApplied()
  }, [supabase, job.id])

  const isProfileComplete = () => {
    if (!profile) return false
    const requiredFields: (keyof Profile)[] = [
      'first_name', 'last_name', 'email', 'phone', 'current_location',
      'highest_education', 'passout_year', 'passout_college', 'core_field',
      'core_expertise', 'resume_url'
    ]
    return requiredFields.every(field => !!profile[field])
  }

  const handleSave = async () => {
    try {
      await saveJob(job.id)
    } catch (error) {
      console.error('Failed to save job:', error)
    }
  }

  const handleApply = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth/login'
        return
      }

      const { error } = await supabase
        .from('job_applications')
        .insert({ job_id: job.id, user_id: user.id })

      if (error) {
        console.error('Failed to apply for job:', error)
      } else {
        setIsApplied(true)
        await refreshAppliedJobs()
      }
    } catch (error) {
      console.error('Failed to apply for job:', error)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{job.title}</CardTitle>
          <div className="flex items-center space-x-2">            
            <Badge variant="secondary">{job.type}</Badge>
          </div>      

      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
           <Building2 className="h-4 w-4 text-muted-foreground" /> <span>Company:</span>
            <p className="text-md">{job.company}</p>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-muted-foreground" /><span>Location:</span>
          <span className="text-md">{job.location}</span>
        </div>          
        <div className="flex items-center space-x-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" /><span>Category:</span>
          <span className="text-md">{job.job_category}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" /><span>Posted On:</span>
          <span className="text-md">{new Date(job.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
        {/* <div className="flex items-center space-x-2">
          <IndianRupee className="h-4 w-4 text-muted-foreground" /> <span>Salary:</span>
          <span className="text-sm font-medium">{job.salary.toLocaleString()}</span>
        </div> */}
        {appliedAt && (
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" /> <span>Applied On:</span>
            <span className="text-sm font-medium">{new Date(appliedAt).toLocaleDateString()}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-left gap-4">
        <Button variant="outline" onClick={handleSave} className='px-2'>
          {isSaved ? <BookmarkCheck className="mr-0" /> : <Bookmark className="mr-0" />}
          {isSaved ? 'Saved' : 'Save Job'}
        </Button>
        <Button className='px-2'>
          <Link href={`/dashboard/jobs/${job.id}`}>View Job Details</Link>
        </Button>
        {!appliedAt && (
          <Button 
            onClick={handleApply} 
            disabled={isApplied || (!isProfileComplete() && !isLoading)}
            className='px-2'
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              isApplied ? 'Applied' : isProfileComplete() ? 'Apply Now' : 'Complete Profile to Apply'
            )}
          </Button>
        )}
      </CardFooter>
      
    </Card>
  )
}  

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>{job.title}</CardTitle>
          // <div className="flex items-center space-x-2">            
          //   <Badge variant="secondary">{job.type}</Badge>
          // </div>      
//       </CardHeader>
//       <CardContent>
//         <div className="flex items-center space-x-2">
//           <Building2 className="h-4 w-4 text-muted-foreground" />
//             <p className="text-sm">{job.company}</p>
//         </div>
//         <div className="flex items-center space-x-2">
//           <MapPin className="h-4 w-4 text-muted-foreground" />
//           <span className="text-sm">{job.location}</span>
//         </div>          
//         <div className="flex items-center space-x-2">
//           <IndianRupee className="h-4 w-4 text-muted-foreground" />
//           <span className="text-sm font-medium">{job.salary.toLocaleString()}</span>
//         </div>
//         {/* <p><strong>Company:</strong> {job.company}</p>
//         <p><strong>Location:</strong> {job.location}</p>
//         <p><strong>Type:</strong> {job.type}</p>
//         <p><strong>Salary:</strong> ₹{job.salary.toLocaleString()}</p> */}
//         <p className="mt-2">{job.description.substring(0, 80)}...</p>
//       </CardContent>
      // <CardFooter className="flex justify-left gap-2">
      //   <Button onClick={handleApply} disabled={isApplied}>
      //     {isApplied ?   'Applied' : 'Apply'}
      //   </Button>
      //   <Button variant="outline" onClick={handleSave}>
      //     {isSaved ? 'Saved' : 'Save'}
      //   </Button>
      //   <Button asChild variant="link">
      //     <Link href={`/dashboard/jobs/${job.id}`}>View Details</Link>
      //   </Button>
      // </CardFooter>
//     </Card>
//   )
// }

// import Link from 'next/link'
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { MapPin, Briefcase, DollarSign, Calendar, Building2, IndianRupee } from 'lucide-react'

// type Job = {
//   id: number
//   title: string
//   company: string
//   location: string
//   type: string
//   salary: number
//   description: string
//   created_at: string
//   created_by: string
// }

// type JobCardProps = {
//   job: Job
//   appliedAt?: string  // Make this optional
// }

// export default function JobCard({ job, appliedAt }: JobCardProps) {
//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle>{job.title}</CardTitle>
//         <div className="flex items-center space-x-2">            
//             <Badge variant="secondary">{job.type}</Badge>
//           </div>        
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-2">
//           <div className="flex items-center space-x-2">
//             <Building2 className="h-4 w-4 text-muted-foreground" />
//             <p className="text-sm">{job.company}</p>
//           </div>
          
//           <div className="flex items-center space-x-2">
//             <MapPin className="h-4 w-4 text-muted-foreground" />
//             <span className="text-sm">{job.location}</span>
//           </div>          
          
//           <div className="flex items-center space-x-2">
//             <IndianRupee className="h-4 w-4 text-muted-foreground" />
//             <span className="text-sm font-medium">{job.salary.toLocaleString()}</span>
//           </div>
//           {appliedAt && (
//             <div className="flex items-center space-x-2">
//               <Calendar className="h-4 w-4 text-muted-foreground" />
//               <span className="text-sm">Applied: {new Date(appliedAt).toLocaleDateString()}</span>
//             </div>
//           )}
//         </div>
//       </CardContent>
//       <CardFooter>
//         <Button asChild className="w-full">
//           <Link href={`/dashboard/jobs/${job.id}`}>
//             View Details
//           </Link>
//         </Button>
//       </CardFooter>
//     </Card>
//   )
// }