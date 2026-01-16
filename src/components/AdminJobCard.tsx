
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Building2, IndianRupee, Calendar } from 'lucide-react'
import DOMPurify from 'dompurify'

type Job = {
  id: number
  title: string
  company: string
  location: string
  type: string
  salary: number
  created_at: string
  description: string
  created_by: string
  is_active: boolean
}

export default function JobCard({ job }: { job: Job }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{job.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Company:</span>
          <span>{job.company}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Location:</span>
          <span>{job.location}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{job.type}</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Salary:</span>
          <span>₹{job.salary.toLocaleString()} per year</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Posted on:</span>
          <span>{new Date(job.created_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Job Description</h3>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description) }}
          />
        </div>
      </CardContent>
    </Card>
  )
}