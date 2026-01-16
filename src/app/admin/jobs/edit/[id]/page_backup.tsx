'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

type Job = {
  id: number
  title: string
  company: string
  location: string
  type: string
  salary: number
  description: string
}

export default function EditJobPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        setError('Failed to fetch job details')
        console.error('Error fetching job:', error)
      } else {
        setJob(data)
      }
      setIsLoading(false)
    }

    fetchJob()
  }, [params.id, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!job) return

    const { error } = await supabase
      .from('jobs')
      .update(job)
      .eq('id', job.id)

    if (error) {
      setError('Failed to update job')
      console.error('Error updating job:', error)
    } else {
      router.push('/admin/jobs')
    }
  }

  if (error) return <div>Error: {error}</div>
  if (!job && !isLoading) return <div>Job not found</div>

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>{isLoading ? <Skeleton className="h-8 w-[200px]" /> : 'Edit Job'}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className='flex gap-4'>
              <div className="space-y-2 w-1/2">
                <Label htmlFor="title">Job Title</Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input
                    id="title"
                    value={job?.title}
                    onChange={(e) => setJob(job ? { ...job, title: e.target.value } : null)}
                    required
                  />
                )}
              </div>
              <div className="space-y-2 w-1/2">
                <Label htmlFor="company">Company</Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input
                    id="company"
                    value={job?.company}
                    onChange={(e) => setJob(job ? { ...job, company: e.target.value } : null)}
                    required
                  />
                )}
              </div>
            </div>
            <div className='flex gap-4'>
              <div className="space-y-2 w-1/2">
                <Label htmlFor="location">Location</Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input
                    id="location"
                    value={job?.location}
                    onChange={(e) => setJob(job ? { ...job, location: e.target.value } : null)}
                    required
                  />
                )}
              </div>
              <div className="space-y-2 w-1/2">
                <Label htmlFor="type">Job Type</Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={job?.type}
                    onValueChange={(value) => setJob(job ? { ...job, type: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full Time">Full Time</SelectItem>
                      <SelectItem value="Part Time">Part Time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            
            <div className='flex gap-4'>
              <div className="space-y-2 w-1/2">
                <Label htmlFor="salary">Salary</Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input
                    id="salary"
                    type="number"
                    value={job?.salary}
                    onChange={(e) => setJob(job ? { ...job, salary: Number(e.target.value) } : null)}
                    required
                  />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              {isLoading ? (
                <Skeleton className="h-[120px] w-full" />
              ) : (
                <Textarea
                  id="description"
                  rows={5}
                  value={job?.description}
                  onChange={(e) => setJob(job ? { ...job, description: e.target.value } : null)}
                  required
                />
              )}
            </div>
          </CardContent>
          <CardFooter>
            {isLoading ? (
              <Skeleton className="h-10 w-[100px]" />
            ) : (
              <Button type="submit">Update Job</Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}