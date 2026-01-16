'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'

type Application = {
  id: string
  status: string
  applied_at: string
  jobs: {
    id: string
    title: string
    company: string
  } | null
  users: {
    id: string
    first_name: string
    last_name: string
    email: string
  } | null
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError) throw new Error(`Authentication error: ${authError.message}`)

        if (!user) {
          console.log('User not authenticated')
          router.push('/auth/login')
          return
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (userError) throw new Error(`Error fetching user role: ${userError.message}`)
        if (userData?.role !== 'admin') {
          console.log('User is not an admin')
          router.push('/dashboard')
          return
        }

        const { data, error: applicationsError } = await supabase
          .from('job_applications')
          .select(`
            *,
            jobs (
              id,
              title,
              company
            ),
            users (
              id,
              first_name,
              last_name,
              email
            )
          `)
          .order('applied_at', { ascending: false })

        if (applicationsError) throw new Error(`Failed to fetch job applications: ${applicationsError.message}`)

        setApplications(data || [])
      } catch (error) {
        console.error('Error in AdminApplicationsPage:', error)
        setError(error instanceof Error ? error.message : 'An unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [supabase, router])

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(applications.map(app => ({
      'Candidate Name': `${app.users?.first_name} ${app.users?.last_name}`,
      'Candidate Email': app.users?.email,
      'Job Title': app.jobs?.title || 'N/A',
      'Company': app.jobs?.company || 'N/A',
      'Status': app.status,
      'Applied At': new Date(app.applied_at).toLocaleString()
    })))

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications")

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

    // Convert to Blob
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' })

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `job_applications_${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.parentNode?.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">All Job Applications</h1>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center mt-8 text-destructive">
        <p>Error loading job applications. Please try again later.</p>
        <p className="text-sm mt-2">Error details: {error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Job Applications</h1>
        <Button onClick={exportToExcel}>
          <Download className="mr-2 h-4 w-4" /> Export to Excel
        </Button>
      </div>
      {applications.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="font-medium">{application.users?.first_name} {application.users?.last_name}</div>
                    <div className="text-sm text-muted-foreground">{application.users?.email}</div>
                  </TableCell>
                  <TableCell>{application.jobs?.title || 'N/A'}</TableCell>
                  <TableCell>{application.jobs?.company || 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {application.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(application.applied_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center mt-8 text-muted-foreground">No job applications found.</div>
      )}
    </div>
  )
}