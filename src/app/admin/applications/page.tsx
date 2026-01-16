'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Search } from 'lucide-react'
import * as XLSX from 'xlsx'
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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
    phone: string
  } | null
  user_profiles: {
    current_location: string
    highest_education: string
    passout_year: string
    current_company: string
    passout_college: string
    experience: string
    current_salary: string
    expected_salary: string
    notice_period: string
    resume_url: string
  } | null
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [companyFilter, setCompanyFilter] = useState('')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [statusToUpdate, setStatusToUpdate] = useState<string>('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [filters, setFilters] = useState({
    companies: new Set<string>(),
    locations: new Set<string>(),
    education: new Set<string>(),
    experience: new Set<string>(),
  })
  const [availableFilters, setAvailableFilters] = useState({
    companies: new Set<string>(),
    locations: new Set<string>(),
    education: new Set<string>(),
    experience: new Set<string>(),
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalApplications, setTotalApplications] = useState(0)
  const applicationsPerPage = 100
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

        const { data: applicationsData, error: applicationsError, count } = await supabase
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
              email,
              phone
            )
          `, { count: 'exact' })
          .order('applied_at', { ascending: sortOrder === 'asc' })
          .range((currentPage - 1) * applicationsPerPage, currentPage * applicationsPerPage - 1)

        if (applicationsError) throw new Error(`Failed to fetch job applications: ${applicationsError.message}`)

        setTotalApplications(count || 0)

        // Fetch user profiles separately
        const userIds = applicationsData?.map(app => app.users?.id).filter(Boolean) || []
        const { data: userProfilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('*')
          .in('id', userIds)

        if (profilesError) throw new Error(`Failed to fetch user profiles: ${profilesError.message}`)

        // Combine the data
        const combinedData = applicationsData?.map(app => ({
          ...app,
          user_profiles: userProfilesData?.find(profile => profile.id === app.users?.id) || null
        })) || []

        setApplications(combinedData)
        setFilteredApplications(combinedData)
      } catch (error) {
        console.error('Error in AdminApplicationsPage:', error)
        setError(error instanceof Error ? error.message : 'An unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [supabase, router, currentPage, sortOrder])

  useEffect(() => {
    const companies = new Set(applications.map(app => app.jobs?.company || '').filter(Boolean))
    const locations = new Set(applications.map(app => app.user_profiles?.current_location || '').filter(Boolean))
    const education = new Set(applications.map(app => app.user_profiles?.highest_education || '').filter(Boolean))
    const experience = new Set(applications.map(app => app.user_profiles?.experience || '').filter(Boolean))

    setAvailableFilters({ companies, locations, education, experience })
  }, [applications])

  useEffect(() => {
    const filtered = applications.filter(app => {
      const matchesCompany = filters.companies.size === 0 || 
        (app.jobs?.company && filters.companies.has(app.jobs.company))
      
      const matchesLocation = filters.locations.size === 0 ||
        (app.user_profiles?.current_location && filters.locations.has(app.user_profiles.current_location))
      
      const matchesEducation = filters.education.size === 0 ||
        (app.user_profiles?.highest_education && filters.education.has(app.user_profiles.highest_education))
      
      const matchesExperience = filters.experience.size === 0 ||
        (app.user_profiles?.experience && filters.experience.has(app.user_profiles.experience))

      return matchesCompany && matchesLocation && matchesEducation && matchesExperience
    })
    
    setFilteredApplications(filtered)
  }, [filters, applications])

  const getResumePublicUrl = (path: string) => {
    const { data } = supabase.storage
      .from('resumes')
      .getPublicUrl(path)
    return data.publicUrl
  }

  const fetchAllApplications = async () => {
    try {
      console.log('Starting to fetch all applications...')
      let allApplications: Application[] = []
      let hasMore = true
      let page = 0
      const pageSize = 100 // Fetch 100 records at a time

      while (hasMore) {
        console.log(`Fetching page ${page + 1}...`)
        
        // Fetch applications for current page
        const { data: apps, error: appsError } = await supabase
          .from('job_applications')
          .select(`
            *,
            users:user_id (
              id,
              first_name,
              last_name,
              email,
              phone
            ),
            jobs:job_id (
              id,
              title,
              company
            )
          `)
          .order('applied_at', { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1)

        if (appsError) throw appsError
        if (!apps || apps.length === 0) {
          hasMore = false
          continue
        }

        // Get all user IDs from the applications
        const userIds = apps.map(app => app.users?.id).filter(Boolean)
        
        // Fetch user profiles separately
        const { data: userProfiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('*')
          .in('id', userIds)

        if (profilesError) throw profilesError

        // Create a map of user profiles for easy lookup
        const userProfilesMap = new Map(
          userProfiles?.map(profile => [profile.id, profile]) || []
        )

        // Combine the data
        const transformedApps = apps.map(app => ({
          ...app,
          user_profiles: app.users?.id ? userProfilesMap.get(app.users.id) || null : null
        }))

        allApplications = [...allApplications, ...transformedApps]
        console.log(`Fetched ${apps.length} applications in current batch`)

        // If we got less than pageSize records, we've reached the end
        if (apps.length < pageSize) {
          hasMore = false
        } else {
          page++
        }
      }

      console.log(`Total applications fetched: ${allApplications.length}`)
      return allApplications
    } catch (error) {
      console.error('Error fetching all applications:', error)
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
      const allApplications = await fetchAllApplications()
      
      if (!allApplications || allApplications.length === 0) {
        console.error('No applications data to export')
        return
      }

      console.log(`Preparing to export ${allApplications.length} applications...`)

      const exportData = allApplications.map(app => ({
        'Job Title Applied for': app.jobs?.title || 'N/A',      
        'Company Applying for': app.jobs?.company || 'N/A',
        'First Name': app.users?.first_name || 'N/A',
        'Last Name': app.users?.last_name || 'N/A',
        'Current Location': app.user_profiles?.current_location || 'N/A',
        'Candidate Email': app.users?.email || 'N/A',
        'Phone': app.users?.phone || 'N/A',
        'Experience': app.user_profiles?.experience || 'N/A',      
        'Highest Education': app.user_profiles?.highest_education || 'N/A',
        'Current Company': app.user_profiles?.current_company || 'N/A',      
        'Current Salary': app.user_profiles?.current_salary || 'N/A',
        'Expected Salary': app.user_profiles?.expected_salary || 'N/A',
        'Notice Period': app.user_profiles?.notice_period || 'N/A',            
        'Passout Year': app.user_profiles?.passout_year || 'N/A',
        'Passout College': app.user_profiles?.passout_college || 'N/A',      
        'Status': app.status,
        'Applied On/At': new Date(app.applied_at).toLocaleString()
      }))

      console.log('Creating Excel file...')
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      
      // Set column widths
      const columnWidths = [
        { wch: 25 }, // Job Title
        { wch: 25 }, // Company
        { wch: 15 }, // First Name
        { wch: 15 }, // Last Name
        { wch: 20 }, // Current Location
        { wch: 25 }, // Email
        { wch: 15 }, // Phone
        { wch: 15 }, // Experience
        { wch: 20 }, // Education
        { wch: 20 }, // Current Company
        { wch: 15 }, // Current Salary
        { wch: 15 }, // Expected Salary
        { wch: 15 }, // Notice Period
        { wch: 15 }, // Passout Year
        { wch: 20 }, // Passout College
        { wch: 15 }, // Status
        { wch: 20 }  // Applied On/At
      ]
      worksheet['!cols'] = columnWidths

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Applications")

      console.log('Generating Excel file...')
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
      window.URL.revokeObjectURL(url)
      
      console.log('Export completed successfully')
    } catch (error) {
      console.error('Error exporting to Excel:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => {
      const newFilters = new Set(prev[filterType])
      if (newFilters.has(value)) {
        newFilters.delete(value)
      } else {
        newFilters.add(value)
      }
      return { ...prev, [filterType]: newFilters }
    })
  }

  const handleSelectAll = (filterType: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: new Set(availableFilters[filterType])
    }))
  }

  const handleDeselectAll = (filterType: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: new Set()
    }))
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleSortChange = (order: 'desc' | 'asc') => {
    setSortOrder(order)
    setCurrentPage(1) // Reset to first page when changing sort order
  }

  const handleStatusChange = (application: Application) => {
    setSelectedApplication(application)
    setStatusToUpdate(application.status)
    setIsStatusModalOpen(true)
  }

  const testNotification = async (application: Application) => {
    try {
      console.log('Testing notification for user:', application.users?.id)
      
      // Check if push tokens exist for this user
      const { data: tokens, error: tokenError } = await supabase
        .from('push_tokens')
        .select('*')
        .eq('user_id', application.users?.id)
      
      if (tokenError) {
        console.error('Error fetching push tokens:', tokenError)
        return
      }
      
      console.log('Push tokens found:', tokens)
      
      if (!tokens || tokens.length === 0) {
        console.log('No push tokens found for user')
        alert('No push tokens found for this user. Make sure the mobile app is installed and notifications are enabled.')
        return
      }
      
      // Test the edge function
      console.log('Attempting to invoke edge function...')
      
      const { data: functionResult, error: notificationError } = await supabase.functions.invoke('send-job-notifications', {
        body: {
          type: 'application_status',
          userId: application.users?.id,
          applicationId: application.id,
          newStatus: 'test'
        }
      })
      
      if (notificationError) {
        console.error('Test notification error:', notificationError)
        console.error('Error type:', typeof notificationError)
        console.error('Error constructor:', notificationError.constructor.name)
        console.error('Full error object:', notificationError)
        
        let errorMessage = 'Unknown error'
        if (notificationError instanceof Error) {
          errorMessage = notificationError.message
        } else if (typeof notificationError === 'object' && notificationError !== null) {
          errorMessage = JSON.stringify(notificationError, null, 2)
        }
        
        alert(`Error sending test notification:\n${errorMessage}\n\nCheck console for full details.`)
      } else {
        console.log('Test notification sent successfully:', functionResult)
        alert('Test notification sent successfully! Check the mobile app.')
      }
    } catch (error) {
      console.error('Error testing notification:', error)
      alert('Error testing notification: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const updateApplicationStatus = async () => {
    if (!selectedApplication || !statusToUpdate) return

    setIsUpdatingStatus(true)
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: statusToUpdate })
        .eq('id', selectedApplication.id)

      if (error) throw error

      // Call the edge function to send notification
      try {
        console.log('Calling edge function with payload:', {
          type: 'application_status',
          userId: selectedApplication.users?.id,
          applicationId: selectedApplication.id,
          newStatus: statusToUpdate
        })

        const { data: functionResult, error: notificationError } = await supabase.functions.invoke('send-job-notifications', {
          body: {
            type: 'application_status',
            userId: selectedApplication.users?.id,
            applicationId: selectedApplication.id,
            newStatus: statusToUpdate
          }
        })

        if (notificationError) {
          console.error('Error sending notification:', notificationError)
          console.error('Error details:', JSON.stringify(notificationError, null, 2))
          // Don't throw error here - we don't want to prevent status update if notification fails
        } else {
          console.log('Edge function called successfully:', functionResult)
        }
      } catch (notificationError) {
        console.error('Error calling notification function:', notificationError)
        if (notificationError instanceof Error) {
          console.error('Error stack:', notificationError.stack)
        }
        // Continue with status update even if notification fails
      }

      // Update the local state
      setApplications(prev => 
        prev.map(app => 
          app.id === selectedApplication.id 
            ? { ...app, status: statusToUpdate }
            : app
        )
      )

      setFilteredApplications(prev => 
        prev.map(app => 
          app.id === selectedApplication.id 
            ? { ...app, status: statusToUpdate }
            : app
        )
      )

      setIsStatusModalOpen(false)
      setSelectedApplication(null)
      setStatusToUpdate('')
    } catch (error) {
      console.error('Error updating application status:', error)
      setError(error instanceof Error ? error.message : 'Failed to update status')
    } finally {
      setIsUpdatingStatus(false)
    }
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
        <h1 className="text-3xl font-bold">View Applications <span className='text-sm text-muted-foreground'>({totalApplications})</span></h1>
        <Button onClick={exportToExcel} disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" /> {isExporting ? 'Exporting...' : 'Export to Excel'}
        </Button>
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

      {/* Status Change Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Application Status</DialogTitle>
            <DialogDescription>
              Update the status for {selectedApplication?.users?.first_name} {selectedApplication?.users?.last_name}'s application
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup value={statusToUpdate} onValueChange={setStatusToUpdate}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PENDING" id="pending" />
                <Label htmlFor="pending">Pending</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="FORWARDED" id="forwarded" />
                <Label htmlFor="forwarded">Forwarded</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="IN-INTERVIEW" id="in-interview" />
                <Label htmlFor="in-interview">In Interview</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="REJECTED" id="rejected" />
                <Label htmlFor="rejected">Rejected</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="JOB OFFERED" id="job-offered" />
                <Label htmlFor="job-offered">Job Offered</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsStatusModalOpen(false)}
              disabled={isUpdatingStatus}
            >
              Cancel
            </Button>
            <Button
              onClick={updateApplicationStatus}
              disabled={isUpdatingStatus || !statusToUpdate}
            >
              {isUpdatingStatus ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mb-4 flex gap-4 items-start flex-wrap">
        {Object.entries(availableFilters).map(([filterType, values]) => (
          <div key={filterType} className="flex-1 min-w-[200px]">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={`Filter by ${filterType}`} />
              </SelectTrigger>
              <SelectContent className="max-h-[400px]">
                <div className="flex items-center justify-between p-2 border-b">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`${filterType}-select-all`}
                      checked={filters[filterType as keyof typeof filters].size === values.size}
                      onChange={() => {
                        if (filters[filterType as keyof typeof filters].size === values.size) {
                          handleDeselectAll(filterType as keyof typeof filters)
                        } else {
                          handleSelectAll(filterType as keyof typeof filters)
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <label htmlFor={`${filterType}-select-all`} className="text-sm font-medium">
                      {filters[filterType as keyof typeof filters].size === values.size ? 'Deselect All' : 'Select All'}
                    </label>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {filters[filterType as keyof typeof filters].size} selected
                  </span>
                </div>
                {Array.from(values).map((value) => (
                  <div key={value} className="flex items-center space-x-2 p-2">
                    <input
                      type="checkbox"
                      id={`${filterType}-${value}`}
                      checked={filters[filterType as keyof typeof filters].has(value)}
                      onChange={() => handleFilterChange(filterType as keyof typeof filters, value)}
                      className="h-4 w-4"
                    />
                    <label htmlFor={`${filterType}-${value}`}>{value}</label>
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        <div className="flex items-center gap-2">
          <Label>Sort by:</Label>
          <Select value={sortOrder} onValueChange={(value: 'desc' | 'asc') => setSortOrder(value)}>
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
      {filteredApplications.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Education</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Current Salary</TableHead>
                <TableHead>Expected Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied At</TableHead>
                {/* <TableHead>Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="font-medium">{application.users?.first_name} {application.users?.last_name}</div>
                    <div className="text-sm text-muted-foreground">{application.users?.email}</div>
                    <div className="text-sm text-muted-foreground">{application.users?.phone}</div>
                  </TableCell>
                  <TableCell>{application.jobs?.title || 'N/A'}</TableCell>
                  <TableCell>{application.jobs?.company || 'N/A'}</TableCell>
                  <TableCell>{application.user_profiles?.current_location || 'N/A'}</TableCell>
                  <TableCell>
                    <div>{application.user_profiles?.highest_education || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">
                      {application.user_profiles?.passout_year || 'N/A'}, {application.user_profiles?.passout_college || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>{application.user_profiles?.experience || 'N/A'}</TableCell>
                  <TableCell>{application.user_profiles?.current_salary || 'N/A'}</TableCell>
                  <TableCell>{application.user_profiles?.expected_salary || 'N/A'}</TableCell>
                  <TableCell>
                    <button
                      className={`px-2 py-1 text-xs font-semibold rounded-full cursor-pointer hover:opacity-80 transition-opacity ${
                        application.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        application.status === 'FORWARDED' ? 'bg-blue-100 text-blue-800' :
                        application.status === 'IN-INTERVIEW' ? 'bg-purple-100 text-purple-800' :
                        application.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        application.status === 'JOB OFFERED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                      onClick={() => handleStatusChange(application)}
                      title="Click to change status"
                    >
                      {application.status}
                    </button>
                  </TableCell>
                  <TableCell>{new Date(application.applied_at).toLocaleString()}</TableCell>
                  {/* <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testNotification(application)}
                      title="Test push notification"
                    >
                      Test 📱
                    </Button>
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center mt-8 text-muted-foreground">No job applications found.</div>
      )}
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
          {Array.from({ length: Math.min(5, Math.ceil(totalApplications / applicationsPerPage)) }, (_, i) => {
            let pageNum;
            if (Math.ceil(totalApplications / applicationsPerPage) <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= Math.ceil(totalApplications / applicationsPerPage) - 2) {
              pageNum = Math.ceil(totalApplications / applicationsPerPage) - 4 + i;
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
            disabled={currentPage * applicationsPerPage >= totalApplications}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
          <Button
            onClick={() => handlePageChange(Math.ceil(totalApplications / applicationsPerPage))}
            disabled={currentPage === Math.ceil(totalApplications / applicationsPerPage)}
            variant="outline"
            size="sm"
          >
            Last
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {Math.ceil(totalApplications / applicationsPerPage)}
        </span>
      </div>
    </div>
  )
}