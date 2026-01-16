'use client'

import { useEffect, useState } from 'react'
import { useJobContext } from '@/contexts/JobContext'
import JobCard from '@/components/JobCard'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Skeleton } from "@/components/ui/skeleton"

export default function AppliedJobsPage() {
  const router = useRouter()
  const { appliedJobs, refreshAppliedJobs } = useJobContext()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      await refreshAppliedJobs()
      setIsLoading(false)
    }
    fetchAppliedJobs()
  }, [refreshAppliedJobs])

  return (
    <div className="w-full mx-auto">
      <div>
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')} 
          className="mb-4 flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">My Applied Jobs</h1>
      </div>
      <div className='space-y-4 mt-4'>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} className="h-[200px] w-full" />
            ))}
          </div>
        ) : appliedJobs.length === 0 ? (
          <Alert>
            <AlertDescription>You haven't applied to any jobs yet.</AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {appliedJobs.map((application) => (
              <JobCard 
                key={application.id} 
                job={application.job} 
                appliedAt={application.applied_at} 
              />
            ))}
          </div>
        )}
      </div>      
    </div>
  )
}