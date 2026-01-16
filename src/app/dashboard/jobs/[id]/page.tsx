'use client'

import JobDetails from '@/components/JobDetails'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  return (
    <div className="w-full mx-auto">
      <Button 
        variant="ghost" 
        onClick={() => router.push('/dashboard')} 
        className="mb-4 flex items-center"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      <JobDetails id={params.id} />
    </div>
  )
}