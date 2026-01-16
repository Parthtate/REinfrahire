'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useJobContext } from '@/contexts/JobContext'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Bookmark, BookmarkCheck, MessageCircle, Briefcase, Calendar } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { MapPin, Building2, IndianRupee } from 'lucide-react'
import Link from 'next/link'
import DOMPurify from 'dompurify'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Job = {
  id: number
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
  position: string
  experience: string
  current_employer: string
  notice_period: string
  current_salary: string
  expected_salary: string
  resume_url: string
}

export default function JobDetails({ id }: { id: string }) {
  const [job, setJob] = useState<Job | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isApplied, setIsApplied] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [countdown, setCountdown] = useState(20)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { refreshAppliedJobs, refreshSavedJobs } = useJobContext()

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (showAuthDialog) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [showAuthDialog])

  useEffect(() => {
    const fetchJobAndProfile = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setShowAuthDialog(true)
        setTimeout(() => {
          router.push('/auth/login')
        }, 20000)
        return
      }

      const [jobResult, profileResult, applicationResult, savedJobResult] = await Promise.all([
        supabase.from('jobs').select('*').eq('id', id).eq('is_active', true).single(),
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        supabase.from('job_applications').select('id').eq('job_id', id).eq('user_id', user.id).single(),
        supabase.from('saved_jobs').select('id').eq('job_id', id).eq('user_id', user.id).single()
      ])

      if (jobResult.error) {
        if (jobResult.error.code === 'PGRST116') {
          setError('This job is no longer available or has been deactivated.')
        } else {
          setError('Failed to load job details')
        }
      } else setJob(jobResult.data)

      if (profileResult.error) setError('Failed to load user profile')
      else setProfile(profileResult.data)

      setIsApplied(!!applicationResult.data)
      setIsSaved(!!savedJobResult.data)
      setIsLoading(false)
    }

    fetchJobAndProfile()
  }, [id, supabase])

  const isProfileComplete = () => {
    if (!profile) return false
    const requiredFields: (keyof Profile)[] = [
      'first_name', 'last_name', 'email', 'phone', 'current_location',
      'highest_education', 'passout_year', 'passout_college', 'core_field',
      'core_expertise', 'resume_url'
    ]
    return requiredFields.every(field => !!profile[field])
  }

  const handleApply = async () => {
    if (!isProfileComplete()) {
      setError('Please complete your profile before applying')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { error } = await supabase
      .from('job_applications')
      .insert({ job_id: id, user_id: user.id })

    if (error) {
      setError('Failed to apply for the job')
    } else {
      setIsApplied(true)
      await refreshAppliedJobs()
    }
  }

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (isSaved) {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('job_id', id)
        .eq('user_id', user.id)

      if (error) {
        setError('Failed to unsave the job')
      } else {
        setIsSaved(false)
        await refreshSavedJobs()
      }
    } else {
      const { error } = await supabase
        .from('saved_jobs')
        .insert({ job_id: id, user_id: user.id })

      if (error) {
        setError('Failed to save the job')
      } else {
        setIsSaved(true)
        await refreshSavedJobs()
      }
    }
  }

  if (showAuthDialog) {
    return (
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Please sign up or login to view job details</DialogTitle>
            <DialogDescription>
              In order to view job details, please create a new account by signing up or if you already have an account, please login. Redirecting to login page in {countdown} seconds...
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  if (isLoading) {
    return <Skeleton className="w-full h-[400px]" />
  }

  if (error || !job) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error || 'Failed to load job details'}</AlertDescription>
      </Alert>
    )
  }

  const whatsappMessage = encodeURIComponent(`Hello, I'm interested in the ${job.title} position at ${job.company}.`)
  const whatsappLink = `https://wa.me/918485861689?text=${whatsappMessage}`

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className='text-2xl'>
          {job.title}  
          <div className="flex items-center space-x-2 mt-2">            
            <Badge variant="secondary">{job.type}</Badge>
          </div>      
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
          <div>
            <strong className='text-lg'>Job Description:</strong>
            <div 
              className="mt-2 prose max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description) }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-4">
        <div className="flex flex-wrap gap-4 sm:flex-nowrap w-full sm:w-auto">
          <Button 
            onClick={handleApply} 
            disabled={isApplied || !isProfileComplete()}
            className="flex-1 sm:flex-none"
          >
            {isApplied ? 'Applied' : isProfileComplete() ? 'Apply Now' : 'Complete Profile to Apply'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSave}
            className="flex-1 sm:flex-none"
          >
            {isSaved ? <BookmarkCheck className="mr-2" /> : <Bookmark className="mr-2" />}
            {isSaved ? 'Saved' : 'Save Job'}
          </Button>
        </div>
        {/* <Link 
          href={whatsappLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-full sm:w-auto flex items-center justify-center gap-2 text-white-800 text-sm hover:underline bg-green-100 border border-green-300 p-2 rounded-md"
        >
          <MessageCircle className="h-4 w-4 text-muted-foreground" /> Contact REinfraHire HR
        </Link> */}
      </CardFooter>
    </Card>
  )
}