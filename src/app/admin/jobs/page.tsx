'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Building2, IndianRupee, Calendar, Plus, Search, Download, Edit, CheckCircle, XCircle, ToggleLeft, ToggleRight } from 'lucide-react'
import * as XLSX from 'xlsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import JobCard from '@/components/AdminJobCard'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  applications_count?: number
}

type Application = {
  id: string
  user: {
    full_name: string
    email: string
    phone: string
  }
  applied_at: string
  status: 'pending' | 'accepted' | 'rejected'
}

// Define a more specific type for the job application data from Supabase
type JobApplicationData = {
  id: string;
  applied_at: string;
  status: string;
  user_id: string;
  users: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedJobApplications, setSelectedJobApplications] = useState<Application[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)
  const [uniqueApplicationCounts, setUniqueApplicationCounts] = useState<{ [key: string]: number }>({})
  const jobsPerPage = 100
  const supabase = createClientComponentClient()
  const [isExporting, setIsExporting] = useState(false)

  const fetchJobs = async (search: string = '') => {
    setIsLoading(true)
    try {
      const { data, error, count } = await supabase
        .from('jobs')
        .select(`
          *,
          applications:job_applications!job_id(count)
        `, { count: 'exact' })
        .ilike('title', `%${search}%`)
        .order('created_at', { ascending: sortOrder === 'asc' })
        .range((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage - 1)

      if (error) throw error

      const jobsWithCount = await Promise.all(data.map(async job => {
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('job_applications')
          .select(`
            id,
            applied_at,
            status,
            user_id,
            users!job_applications_user_id_fkey (
              first_name,
              last_name,
              email
            )
          `)
          .eq('job_id', job.id)

        if (applicationsError) {
          console.error('Error fetching applications:', applicationsError)
          return { ...job, applications_count: 0 }
        }

        const typedApplicationsData = applicationsData as unknown as JobApplicationData[];
        
        const uniqueSet = new Set(typedApplicationsData.map(app => `${app.users.first_name} ${app.users.last_name}-${app.users.email}`))
        setUniqueApplicationCounts(prevCounts => ({
          ...prevCounts,
          [job.id]: uniqueSet.size
        }))

        return { ...job, applications_count: uniqueSet.size }
      }))

      setJobs(jobsWithCount)
      setTotalJobs(count || 0)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchJobs()
  }, [supabase, currentPage, sortOrder])

  const handleSearch = () => {
    fetchJobs(searchTerm)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    fetchJobs()
  }

  const fetchApplications = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          applied_at,
          status,
          user_id,
          users!job_applications_user_id_fkey (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('job_id', jobId)

      if (error) throw error
      
      const typedData = data as unknown as JobApplicationData[];
      
      const formattedData = typedData.map(item => ({
        id: item.id,
        applied_at: item.applied_at,
        status: item.status as 'pending' | 'accepted' | 'rejected',
        user: {
          full_name: [item.users.first_name, item.users.last_name]
            .filter(Boolean)
            .join(' ') || 'N/A',
          email: item.users.email || 'N/A',
          phone: item.users.phone || 'N/A'
        }
      })) || []
      
      setSelectedJobApplications(formattedData)

      // Calculate unique application count for this job
      const uniqueSet = new Set(formattedData.map(app => `${app.user.full_name}-${app.user.email}`));
      setUniqueApplicationCounts(prevCounts => ({
        ...prevCounts,
        [jobId]: uniqueSet.size
      }));

    } catch (error) {
      console.error('Error fetching applications:', error)
      setSelectedJobApplications([])
      setUniqueApplicationCounts(prevCounts => ({
        ...prevCounts,
        [jobId]: 0
      }));
    }
  }

  // Get unique locations from jobs
  const uniqueLocations = Array.from(new Set(jobs.map(job => job.location))).sort()

  // Updated filtering logic
  const filteredJobs = jobs
    .filter(job => {
      const matchesSearch = 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(job.location);
      
      return matchesSearch && matchesLocation;
    });

  const fetchAllJobs = async () => {
    try {
      console.log('Starting to fetch all jobs...')
      let allJobs: Job[] = []
      let hasMore = true
      let page = 0
      const pageSize = 100 // Fetch 100 records at a time

      while (hasMore) {
        console.log(`Fetching page ${page + 1}...`)
        
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1)

        if (jobsError) throw jobsError
        if (!jobs || jobs.length === 0) {
          hasMore = false
          continue
        }

        allJobs = [...allJobs, ...jobs]
        console.log(`Fetched ${jobs.length} jobs in current batch`)

        // If we got less than pageSize records, we've reached the end
        if (jobs.length < pageSize) {
          hasMore = false
        } else {
          page++
        }
      }

      console.log(`Total jobs fetched: ${allJobs.length}`)
      return allJobs
    } catch (error) {
      console.error('Error fetching all jobs:', error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      return []
    }
  }

  const exportToExcel = async () => {
    setIsExporting(true)
    try {
      const allJobs = await fetchAllJobs()
      
      if (!allJobs || allJobs.length === 0) {
        console.error('No jobs data to export')
        return
      }

      console.log(`Preparing to export ${allJobs.length} jobs...`)

      const worksheet = XLSX.utils.json_to_sheet(allJobs.map(job => ({
        Title: job.title,
        Company: job.company,
        Location: job.location,
        Type: job.type,
        Salary: job.salary,
        'Posted Date': new Date(job.created_at).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
      })))

      // Set column widths
      const columnWidths = [
        { wch: 30 }, // Title
        { wch: 25 }, // Company
        { wch: 20 }, // Location
        { wch: 15 }, // Type
        { wch: 15 }, // Salary
        { wch: 20 }  // Posted Date
      ]
      worksheet['!cols'] = columnWidths

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs")

      console.log('Generating Excel file...')
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

      // Convert to Blob
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' })

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `jobs_${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log('Export completed successfully')
    } catch (error) {
      console.error('Error exporting to Excel:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const uniqueSelectedJobApplications = selectedJobApplications.reduce((acc: Application[], current) => {
    const x = acc.find(item => item.user.full_name === current.user.full_name && item.user.email === current.user.email);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, [] as Application[]);

  const handleSortChange = (order: 'desc' | 'asc') => {
    setSortOrder(order)
    setCurrentPage(1) // Reset to first page when changing sort order
  }

  const handleLocationChange = (location: string, checked: boolean) => {
    setSelectedLocations(prev =>
      checked
        ? [...prev, location]
        : prev.filter(loc => loc !== location)
    )
  }

  const handleSelectAllLocations = () => {
    setSelectedLocations([...uniqueLocations])
  }

  const handleDeselectAllLocations = () => {
    setSelectedLocations([])
  }

  const toggleJobStatus = async (jobId: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ is_active: !currentStatus })
        .eq('id', jobId)

      if (error) throw error

      // Refresh the jobs list to show updated status
      await fetchJobs(searchTerm)
    } catch (error) {
      console.error('Error updating job status:', error)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Jobs<span className='text-lg text-muted-foreground ml-2'>({totalJobs})</span></h1>
        <div className="space-x-2">
          <Button onClick={exportToExcel} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" /> {isExporting ? 'Exporting...' : 'Export to Excel'}
          </Button>
          <Button asChild>
            <Link href="/admin/jobs/add">
              <Plus className="mr-2 h-4 w-4" /> Add New Job
            </Link>
          </Button>
        </div>
      </div>
      <div className="mb-4 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
          <Button variant="secondary" onClick={handleClearSearch} disabled={isLoading}>
            Clear
          </Button>
          <div className="mb-4 flex gap-4 items-start flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent className="max-h-[400px]">
                  <div className="flex items-center justify-between p-2 border-b">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="location-select-all"
                        checked={selectedLocations.length === uniqueLocations.length}
                        onChange={() => {
                          if (selectedLocations.length === uniqueLocations.length) {
                            handleDeselectAllLocations()
                          } else {
                            handleSelectAllLocations()
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <label htmlFor="location-select-all" className="text-sm font-medium">
                        {selectedLocations.length === uniqueLocations.length ? 'Deselect All' : 'Select All'}
                      </label>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {selectedLocations.length} selected
                    </span>
                  </div>
                  {uniqueLocations.map(location => (
                    <div key={location} className="flex items-center space-x-2 p-2">
                      <input
                        type="checkbox"
                        id={`location-${location}`}
                        checked={selectedLocations.includes(location)}
                        onChange={(e) => handleLocationChange(location, e.target.checked)}
                        className="h-4 w-4"
                      />
                      <label htmlFor={`location-${location}`}>{location}</label>
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label>Sort by:</Label>
            <Select value={sortOrder} onValueChange={(value: 'desc' | 'asc') => handleSortChange(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Posted Date</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead>Actions</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[80px]" /></TableCell>
                </TableRow>
              ))
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{job.company}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{job.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{job.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <span>{job.salary.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(job.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => fetchApplications(job.id.toString())}
                        >
                          {uniqueApplicationCounts[job.id] || 0}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Applications for {job.title}</DialogTitle>
                          <DialogDescription>
                            Total Applications: {uniqueApplicationCounts[job.id] || 0}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Applied Date</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {uniqueSelectedJobApplications.length > 0 ? (
                                uniqueSelectedJobApplications.map((application) => (
                                  <TableRow key={application.id}>
                                    <TableCell className="font-medium">
                                      {application.user.full_name}
                                    </TableCell>
                                    <TableCell>{application.user.email}</TableCell>
                                    <TableCell>{application.user.phone || 'N/A'}</TableCell>
                                    <TableCell>
                                      {new Date(application.applied_at).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric'
                                      })}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={
                                        application.status === 'pending' ? 'secondary' :
                                        application.status === 'accepted' ? 'default' :
                                        'destructive'
                                      }>
                                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                    No applications found for this job.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => setSelectedJob(job)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Job Details</DialogTitle>
                            <DialogDescription>
                              Detailed information about the job posting
                            </DialogDescription>
                          </DialogHeader>
                          {selectedJob && (
                            <>
                              <JobCard job={selectedJob} />
                              <div className="mt-4 flex justify-end">                                
                                <Dialog>
                                  <DialogTrigger asChild>                                    
                                    <Button 
                                      variant="secondary"
                                      onClick={() => fetchApplications(job.id.toString())}
                                    >
                                      View Applications ({selectedJob.applications_count || 0})
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Applications for {job.title}</DialogTitle>
                                      <DialogDescription>
                                        Total Applications: {uniqueApplicationCounts[job.id] || 0}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="mt-4">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Applied Date</TableHead>
                                            <TableHead>Status</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {uniqueSelectedJobApplications.length > 0 ? (
                                            uniqueSelectedJobApplications.map((application) => (
                                              <TableRow key={application.id}>
                                                <TableCell className="font-medium">
                                                  {application.user.full_name}
                                                </TableCell>
                                                <TableCell>{application.user.email}</TableCell>
                                                <TableCell>{application.user.phone || 'N/A'}</TableCell>
                                                <TableCell>
                                                  {new Date(application.applied_at).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric'
                                                  })}
                                                </TableCell>
                                                <TableCell>
                                                  <Badge variant={
                                                    application.status === 'pending' ? 'secondary' :
                                                    application.status === 'accepted' ? 'default' :
                                                    'destructive'
                                                  }>
                                                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                                  </Badge>
                                                </TableCell>
                                              </TableRow>
                                            ))
                                          ) : (
                                            <TableRow>
                                              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                No applications found for this job.
                                              </TableCell>
                                            </TableRow>
                                          )}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/jobs/edit/${job.id}`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        job.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {job.is_active ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {job.is_active ? 'Active' : 'Inactive'}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleJobStatus(job.id, job.is_active)}
                        className="h-6 w-6 p-0"
                      >
                        {job.is_active ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No jobs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            First
          </Button>
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            Prev
          </Button>
          
          {/* Page Numbers */}
          {Array.from({ length: Math.min(5, Math.ceil(totalJobs / jobsPerPage)) }, (_, i) => {
            let pageNum;
            if (Math.ceil(totalJobs / jobsPerPage) <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= Math.ceil(totalJobs / jobsPerPage) - 2) {
              pageNum = Math.ceil(totalJobs / jobsPerPage) - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
              >
                {pageNum}
              </Button>
            );
          })}

          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage * jobsPerPage >= totalJobs}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
          <Button
            onClick={() => handlePageChange(Math.ceil(totalJobs / jobsPerPage))}
            disabled={currentPage === Math.ceil(totalJobs / jobsPerPage)}
            variant="outline"
            size="sm"
          >
            Last
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {Math.ceil(totalJobs / jobsPerPage)}
        </span>
      </div>

      {/* Export Loading Dialog */}
      <Dialog open={isExporting} onOpenChange={setIsExporting}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exporting Data</DialogTitle>
            <DialogDescription>
              Please wait while we prepare your export. Do not refresh or close the page.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}