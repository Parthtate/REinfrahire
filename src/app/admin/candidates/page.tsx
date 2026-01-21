'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Download, FileText, CheckCircle, XCircle, ToggleLeft, ToggleRight, Edit, Trash2, RefreshCw, Sparkles, Filter, X } from 'lucide-react'
import * as XLSX from 'xlsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

type Experience = {
  id: string
  user_id: string
  company_name: string
  designation: string
  duration_from: string
  duration_to: string
  job_summary: string
  is_primary?: boolean
}

type Candidate = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  created_at: string
  is_active: boolean
  user_profile: {
    current_location: string
    highest_education: string
    core_field: string
    experience: string
    passout_year: string
    passout_college: string
    receive_updates: boolean
    whatsapp_number: string
    core_expertise: string
    position: string
    current_employer: string
    notice_period: string
    current_salary: string
    expected_salary: string
    resume_url: string
    is_fresher: boolean
  } | null
  work_experiences: Experience[]
  similarity?: number
}

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCandidates, setTotalCandidates] = useState(0)
  const candidatesPerPage = 100
  const supabase = createClientComponentClient()
  const [filters, setFilters] = useState({
    locations: new Set<string>(),
    education: new Set<string>(),
    field: new Set<string>(),
    experience: new Set<string>(),
  })

  const [availableFilters, setAvailableFilters] = useState({
    locations: new Set<string>(),
    education: new Set<string>(),
    field: new Set<string>(),
    experience: new Set<string>(),
  })

  const [filteredResults, setFilteredResults] = useState<Candidate[]>([])
  const [isFiltered, setIsFiltered] = useState(false)
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([])

  const [filterSearchTerms, setFilterSearchTerms] = useState({
    locations: '',
    education: '',
    field: '',
    experience: '',
  })

  // Edit candidate state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Delete candidate state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingCandidate, setDeletingCandidate] = useState<Candidate | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // New Semantic Search State
  const [searchMode, setSearchMode] = useState<'traditional' | 'semantic'>('traditional')
  const [semanticKeywords, setSemanticKeywords] = useState<string[]>([])
  const [currentKeyword, setCurrentKeyword] = useState('')
  const [isSemanticSearching, setIsSemanticSearching] = useState(false)
  const [semanticResults, setSemanticResults] = useState<Candidate[]>([])
  const [showSemanticFilters, setShowSemanticFilters] = useState(false)
  const [semanticFilters, setSemanticFilters] = useState({
    coreField: '',
    minExperience: '',
    location: ''
  })
  const [isSyncing, setIsSyncing] = useState(false)

  // New: Semantic Search Functions
  const addSemanticKeyword = () => {
    const trimmed = currentKeyword.trim()
    if (trimmed && !semanticKeywords.includes(trimmed)) {
      setSemanticKeywords([...semanticKeywords, trimmed])
      setCurrentKeyword('')
    }
  }

  const removeSemanticKeyword = (keyword: string) => {
    setSemanticKeywords(semanticKeywords.filter(k => k !== keyword))
  }

  const handleSemanticSearch = async () => {
    if (semanticKeywords.length === 0) {
      alert('Please add at least one keyword')
      return
    }

    setIsSemanticSearching(true)
    try {
      const session = await supabase.auth.getSession()
      const response = await fetch('/api/admin/search-candidates', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`
        },
        body: JSON.stringify({
          query: semanticKeywords.join(' '),
          filters: {
            coreField: semanticFilters.coreField || undefined,
            minExperience: semanticFilters.minExperience ? parseInt(semanticFilters.minExperience) : undefined,
            location: semanticFilters.location || undefined
          },
          useHybrid: true
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error + (data.details ? `\nDetails: ${data.details}` : '') || 'Search failed')
      setSemanticResults(data.results || [])
    } catch (error) {
      console.error('Semantic search error:', error)
      alert('Semantic search failed. Please check console for details.')
    } finally {
      setIsSemanticSearching(false)
    }
  }

  const clearSemanticSearch = () => {
    setSemanticKeywords([])
    setCurrentKeyword('')
    setSemanticResults([])
    setSemanticFilters({ coreField: '', minExperience: '', location: '' })
  }

  const handleSyncEmbeddings = async (forceReprocess = false) => {
    if (!confirm('Generate embeddings for candidates? This may take a few minutes.')) return

    setIsSyncing(true)
    try {
      const session = await supabase.auth.getSession()
      const response = await fetch('/api/admin/generate-embeddings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`
        },
        body: JSON.stringify({ forceReprocess })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Sync failed')
      alert(`✅ Sync completed!\nProcessed: ${data.summary.processed}\nSkipped: ${data.summary.skipped}\nErrors: ${data.summary.errors}`)
    } catch (error) {
      console.error('Sync error:', error)
      alert('❌ Sync failed: ' + (error as Error).message)
    } finally {
      setIsSyncing(false)
    }
  }

  const toggleCandidateStatus = async (candidateId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', candidateId)

      if (error) throw error

      // Update the local state
      setCandidates(prev => prev.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, is_active: !currentStatus }
          : candidate
      ))

      // Update filtered results if they exist
      if (isFiltered) {
        setFilteredResults(prev => prev.map(candidate => 
          candidate.id === candidateId 
            ? { ...candidate, is_active: !currentStatus }
            : candidate
        ))
      }

      // Update all candidates if they exist
      if (allCandidates.length > 0) {
        setAllCandidates(prev => prev.map(candidate => 
          candidate.id === candidateId 
            ? { ...candidate, is_active: !currentStatus }
            : candidate
        ))
      }
    } catch (error) {
      console.error('Error updating candidate status:', error)
    }
  }

  const openEditModal = (candidate: Candidate) => {
    setEditingCandidate(candidate)
    setEditForm({
      firstName: candidate.first_name,
      lastName: candidate.last_name,
      phone: candidate.phone
    })
    setEditError(null)
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCandidate) return

    // Validate phone number
    if (editForm.phone.length !== 10 || !/^[0-9]{10}$/.test(editForm.phone)) {
      setEditError('Phone number must be exactly 10 digits')
      return
    }

    setIsUpdating(true)
    setEditError(null)

    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: editForm.firstName.trim(),
          last_name: editForm.lastName.trim(),
          phone: editForm.phone.trim()
        })
        .eq('id', editingCandidate.id)

      if (error) throw error

      // Update local state
      const updateCandidate = (candidate: Candidate) =>
        candidate.id === editingCandidate.id
          ? {
              ...candidate,
              first_name: editForm.firstName.trim(),
              last_name: editForm.lastName.trim(),
              phone: editForm.phone.trim()
            }
          : candidate

      setCandidates(prev => prev.map(updateCandidate))
      
      if (isFiltered) {
        setFilteredResults(prev => prev.map(updateCandidate))
      }

      if (allCandidates.length > 0) {
        setAllCandidates(prev => prev.map(updateCandidate))
      }

      setIsEditModalOpen(false)
      setEditingCandidate(null)
    } catch (error) {
      console.error('Error updating candidate:', error)
      setEditError('Failed to update candidate. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const openDeleteModal = (candidate: Candidate) => {
    setDeletingCandidate(candidate)
    setDeleteError(null)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteCandidate = async () => {
    if (!deletingCandidate) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      // Delete in the correct order to avoid foreign key constraint violations
      
      // 1. Delete job applications
      const { error: jobAppsError } = await supabase
        .from('job_applications')
        .delete()
        .eq('user_id', deletingCandidate.id)

      if (jobAppsError) throw jobAppsError

      // 2. Delete push tokens
      const { error: pushTokensError } = await supabase
        .from('push_tokens')
        .delete()
        .eq('user_id', deletingCandidate.id)

      if (pushTokensError) throw pushTokensError

      // 3. Delete saved jobs
      const { error: savedJobsError } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', deletingCandidate.id)

      if (savedJobsError) throw savedJobsError

      // 4. Delete work experience
      const { error: workExpError } = await supabase
        .from('work_experience')
        .delete()
        .eq('user_id', deletingCandidate.id)

      if (workExpError) throw workExpError

      // 5. Delete user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', deletingCandidate.id)

      if (profileError) throw profileError

      // 6. Delete from users table
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', deletingCandidate.id)

      if (userError) throw userError

      // 7. Delete from Supabase auth
      const { error: authError } = await supabase.auth.admin.deleteUser(deletingCandidate.id)
      
      if (authError) {
        console.warn('Error deleting auth user (may not exist):', authError)
        // Don't throw here as the user data is already deleted from our tables
      }

      // Update local state
      const filterOutCandidate = (candidate: Candidate) => candidate.id !== deletingCandidate.id

      setCandidates(prev => prev.filter(filterOutCandidate))
      
      if (isFiltered) {
        setFilteredResults(prev => prev.filter(filterOutCandidate))
      }

      if (allCandidates.length > 0) {
        setAllCandidates(prev => prev.filter(filterOutCandidate))
      }

      // Update total count
      setTotalCandidates(prev => Math.max(0, prev - 1))

      setIsDeleteModalOpen(false)
      setDeletingCandidate(null)

    } catch (error) {
      console.error('Error deleting candidate:', error)
      setDeleteError('Failed to delete candidate. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const fetchAllFilterValues = async () => {
    try {
      // Fetch all user profiles to get unique filter values
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('current_location, highest_education, core_field, experience')

      if (profilesError) throw profilesError

      // Explicit list of education values to always include
      const explicitEducationList = [
        "Below 10th pass", "12th pass", "Agro Processing", "architectural Assistant", "Architectural Draughtsman", "Architectural Draughtsman (NE)", "Attendant Operator (Chemical Plant)", "Bakers and Confectioner", "Bamboo works", "Basic Cosmetology", "Cane willow and Bamboo workers", "Carpenter", "Catering and Hospitality Assistant", "Civil Engineer Assistant", "Computer Aided Embroidery and Designing", "Computer Hardware and Netwrok Maintenance", "Computer Operator and Programming Assistant (VI)", "Computer Operator and Programming Asistant", "Craftsman Food Productions (Vegeterian)", "Cutting and Sewing", "Dairing", "Data Entry Operator", "Dental Laboratory Equipement Technician", "Desk Top Publishing Operator", "Digital Photographer", "Draftsman", "Draughtsman (Civil)", "Draughtsman (Mechanical)", "Dress Making", "Driver cum Mechanic", "Electrician", "Electician Power Distribution", "Electonics Mechanical", "ElectroPlater", "Fashion Design and technology", "Finance Executive", "Fire Techonolgy and Industrial Safety Management", "Fireman", "Fitter", "Floricultural and Landscaping", "Food and Beverage Service Assistant", "Food Beverage", "Food Production", "Footware Maker", "Foundryman", "Front Office Assistant", "Fruit and Vegetable Processor", "Geo Informatics Assistant", "Hair and skin care", "Hatchery Management", "Health safety and Environment", "Health Sanitary Inspector", "Horticulture", "Hospital House Keeping", "House Keeping", "Human Resource Executive", "Industrial Painter", "Information Communication Technology System Maintenance", "Information Technology", "Insturment Mechanic", "Interior Decoration And Designing", "Laboratory Assistant", "Leather Goods Maker", "Lift and Escalator Mechanic", "Lift Mechanic", "Litho Offset Machine Minder", "Machinist", "Maintenance mechanic", "Marine Engine Fitter", "Marine Fitter", "Marketing Executive", "Mason", "Mech Repair and Maintenance of Heavy Vehicles", "Mech Repair and Maintenance of Light Vehicles", "Mechanic", "Mechanic Agriculture Machinery", "Mechanic Auto Body Painting", "Mechanic Auto Body Repair", "Mechanic Auto Electrical and Electronics", "Mechanic Communication Equipment Maintenance", "Mechanic Computer Hardware", "Mechanic Consumer Electronics", "Mechanic Consumer Electronics Appliances", "Mechanic Cum Operator Electronics Communication Systems", "Mechanic Diesel", "Mechanic Industrial Electronics", "Mechanic Lens/Prism Grinding", "Mechanic Machine Tool Maintenance", "Mechanic Mechatronics", "Mechanic Mining  Machinery", "Mechanic Medical Electronics", "Mechanic Motor Cycle", "Mechanic Radio and TV", "Metal Cutting Attendance", "Milk and Milk Products", "Multimedia Animation And Special Effects", "Office Assistant cum Computer Operator", "Old Age Care", "Operator Advanced Machine Tools", "Painter General", "Photographer", "Physiotherapy Technician", "Plastic Processing Operator", "Plate Maker cum Impositor", "Plumber", "Pre/Preparatory School Management", "Pum Operator cum Mechanic", "Radiology Technician", "Sanitary Hardware Fitter", "Secretarial Practice", "Sewing technology", "Sheet Metal Worker", "Soil Testing and Crop Technician", "Solar technician", "Spa Therapy", "Spinning Technician", "Stenographer And Secretarial Assistant", "Stone Mining Machine Operator", "Stone Processing Machine Operator", "Surface Ornamentation Techniques", "Surveyor", "Technician Power Electornics System", "Textile Mechatronics", "Textile Wet processing technician", "Tool and Die Maker", "Tourist Guide", "Travel and Tour Assistant", "Turner", "Vessel Navigator", "Weaving of Woolen Fabrics", "Weaving technician", "Weaving techinican for Silk and Woolen Fabrics", "Welder", "Wireman", "Automobile Enginerring", "Civil Engineering", "Communication Engineering", "Computer Science Engineering", "Diploma In Hotel Management", "Diploma in Others", "Diploma in Pharmacy", "Education", "Electrical Engineering", "Electornics and Communication Engineering", "Electronics Engineering", "Industrial Engineering", "Information Technology", "Mechanical Engineering", "Mettalurgical Engineering", "Petroleum Engineering", "Power Engineering", "Production Engineering", "Robotics Engineering", "Sturctural Engineering", "Telecommunication Engineering", "Textile Engineering", "Tool Engineering", "B.A.", "B.A. Hons", "B.A. Pass", "B. Arch", "B.B.A", "B.Com", "B.Des", "B.Des Arch", "B.E./B.Tech.", "B.Ed.", "B.I.Ed.", "B. Pharm", "B.Sc.", "B.Voc", "Bachelor in Naval Architecture and ocean Engineering", "Bachelor in Others", "Bachelor of Naturopathy and Yogic Science (BNYS)", "Bachelor of Occupational Therapy", "Bachelor of Physiotherapy", "Bachelor of Veterinary Science and Animal Husbandary", "BAMS", "BBE", "BBS", "BCA", "BDS", "BHMS", "BMLT", "BMM", "BMS", "BSW", "BUMS", "CA", "CS", "ICWA", "Integrated Law program", "MBBS", "M.A.", "M.Arch", "M.Com", "M.Ed", "M. Pharm", "M.S", "M. Tech/M.E.", "Masters in Others", "MBA", "MCA", "MD/MS", "MDS", "Mphil", "PGDCA", "PGDM", "Ph.D"
      ];

      // Extract all unique, trimmed, non-empty education values from DB
      const dbEducation = profiles
        ?.map(profile => typeof profile.highest_education === 'string' ? profile.highest_education.trim() : '')
        .filter((edu): edu is string => edu !== undefined && edu !== null && edu !== '') || [];

      // Merge, deduplicate, and sort
      const education = new Set([...explicitEducationList, ...dbEducation].map(e => e.trim()).filter(Boolean).sort());

      const locations = new Set(
        profiles
          ?.map(profile => typeof profile.current_location === 'string' ? profile.current_location.trim() : '')
          .filter((location): location is string => location !== undefined && location !== null && location !== '')
      )
      const field = new Set(
        profiles
          ?.map(profile => typeof profile.core_field === 'string' ? profile.core_field.trim() : '')
          .filter((field): field is string => field !== undefined && field !== null && field !== '')
      )
      const experience = new Set(
        profiles
          ?.map(profile => typeof profile.experience === 'string' ? profile.experience.trim() : '')
          .filter((exp): exp is string => exp !== undefined && exp !== null && exp !== '')
      )

      setAvailableFilters({
        locations,
        education,
        field,
        experience
      })
    } catch (error) {
      console.error('Error fetching filter values:', error)
    }
  }

  useEffect(() => {
    fetchAllFilterValues()
  }, [])

  const fetchCandidates = async (search: string = '') => {
    setIsLoading(true)
    try {
      const searchTerm = search.trim();
      
      let query = supabase
        .from('users')
        .select('id, first_name, last_name, email, phone, created_at, is_active', { count: 'exact' })
        .eq('role', 'candidate')
        .order('created_at', { ascending: sortOrder === 'asc' });

      // Only apply search filters if search term is not empty
      if (searchTerm) {
        const searchParts = searchTerm.split(/\s+/);
        
        // If search term contains spaces, search for first_name and last_name combinations
        if (searchParts.length > 1) {
          query = query.or(
            `and(first_name.ilike.%${searchParts[0]}%,last_name.ilike.%${searchParts[1]}%),` +
            `and(last_name.ilike.%${searchParts[0]}%,first_name.ilike.%${searchParts[1]}%)`
          );
        } else {
          // Single word search
          query = query.or(
            `first_name.ilike.%${searchTerm}%,` +
            `last_name.ilike.%${searchTerm}%,` +
            `email.ilike.%${searchTerm}%,` +
            `phone.ilike.%${searchTerm}%`
          );
        }
      }

      const { data: users, error: usersError, count } = await query
        .range((currentPage - 1) * candidatesPerPage, currentPage * candidatesPerPage - 1);

      if (usersError) throw usersError;

      setTotalCandidates(count || 0);

      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .in('id', users.map(u => u.id));

      if (profilesError) throw profilesError;

      const { data: experiences, error: experiencesError } = await supabase
        .from('work_experience')
        .select('*')
        .in('user_id', users.map(u => u.id));

      if (experiencesError) throw experiencesError;

      const combinedData = users.map(user => ({
        ...user,
        user_profile: profiles?.find(profile => profile.id === user.id) || null,
        work_experiences: experiences?.filter(exp => exp.user_id === user.id) || []
      }));

      setCandidates(combinedData);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
    setIsLoading(false);
  };

  const handleSearch = () => {
    setCurrentPage(1) // Reset to first page when searching
    fetchCandidates(searchTerm)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setCurrentPage(1) // Reset to first page when clearing
    fetchCandidates()
  }

  // Initial load only
  useEffect(() => {
    fetchCandidates()
  }, []) // Empty dependency array means it only runs once on mount

  // Handle pagination separately
  useEffect(() => {
    if (searchTerm) {
      fetchCandidates(searchTerm)
    } else {
      fetchCandidates()
    }
  }, [currentPage, sortOrder])

  const fetchAllCandidates = async () => {
    try {
      console.log('Starting to fetch all candidates...')
      let allCandidates: Candidate[] = []
      let hasMore = true
      let page = 0
      const pageSize = 100 // Fetch 100 records at a time

      while (hasMore) {
        console.log(`Fetching page ${page + 1}...`)
        
        // Fetch users for current page
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, phone, created_at, is_active')
          .eq('role', 'candidate')
          .order('created_at', { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1)

        if (usersError) throw usersError
        if (!users || users.length === 0) {
          hasMore = false
          continue
        }

        // Get profiles for current batch of users
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('*')
          .in('id', users.map(u => u.id))

        if (profilesError) throw profilesError

        // Get experiences for current batch of users
        const { data: experiences, error: experiencesError } = await supabase
          .from('work_experience')
          .select('*')
          .in('user_id', users.map(u => u.id))

        if (experiencesError) throw experiencesError

        // Combine the data for current batch
        const batchCandidates = users.map(user => ({
          ...user,
          user_profile: profiles?.find(profile => profile.id === user.id) || null,
          work_experiences: experiences?.filter(exp => exp.user_id === user.id) || []
        }))

        allCandidates = [...allCandidates, ...batchCandidates]
        console.log(`Fetched ${batchCandidates.length} candidates in current batch`)

        // If we got less than pageSize records, we've reached the end
        if (users.length < pageSize) {
          hasMore = false
        } else {
          page++
        }
      }

      console.log(`Total candidates fetched: ${allCandidates.length}`)
      return allCandidates
    } catch (error) {
      console.error('Error fetching all candidates:', error)
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
      const allCandidates = await fetchAllCandidates()
      
      if (!allCandidates || allCandidates.length === 0) {
        console.error('No candidates data to export')
        return
      }

      console.log(`Preparing to export ${allCandidates.length} candidates...`)

      const exportData = allCandidates.map(candidate => ({
        'Name': `${candidate.first_name} ${candidate.last_name}`,
        'Email': candidate.email,
        'Phone': candidate.phone,
        'Location': candidate.user_profile?.current_location || '-',
        'Education': candidate.user_profile?.highest_education || '-',
        'Field': candidate.user_profile?.core_field || '-',
        'Experience': candidate.user_profile?.experience || '-',
        'Current Employer': candidate.user_profile?.current_employer || '-',
        'Notice Period': candidate.user_profile?.notice_period || '-',
        'Current Salary': candidate.user_profile?.current_salary || '-',
        'Expected Salary': candidate.user_profile?.expected_salary || '-',
        'Status': candidate.is_active ? 'Active' : 'Inactive',
        'Registered On': new Date(candidate.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }))

      console.log('Creating Excel file...')
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      
      // Set column widths
      const columnWidths = [
        { wch: 20 }, // Name
        { wch: 25 }, // Email
        { wch: 15 }, // Phone
        { wch: 20 }, // Location
        { wch: 20 }, // Education
        { wch: 20 }, // Field
        { wch: 15 }, // Experience
        { wch: 20 }, // Current Employer
        { wch: 15 }, // Notice Period
        { wch: 15 }, // Current Salary
        { wch: 15 }, // Expected Salary
        { wch: 10 }, // Status
        { wch: 15 }  // Registered On
      ]
      worksheet['!cols'] = columnWidths

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates")

      console.log('Generating Excel file...')
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

      // Convert to Blob
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' })

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `candidates_${new Date().toISOString().split('T')[0]}.xlsx`)
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

  const getResumePublicUrl = (path: string) => {
    // Check if the path is already a full URL (starts with https://)
    if (path && path.startsWith('https://')) {
      return path
    }
    
    // If it's just a filename, construct the public URL using Supabase
    const { data } = supabase.storage
      .from('resumes')
      .getPublicUrl(path)
    return data.publicUrl
  }

  const handleSortChange = (order: 'desc' | 'asc') => {
    setSortOrder(order)
    setCurrentPage(1) // Reset to first page when changing sort order
    if (searchTerm) {
      fetchCandidates(searchTerm)
    } else {
      fetchCandidates()
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
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
    setCurrentPage(1)
  }

  const handleSelectAll = (filterType: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: new Set(availableFilters[filterType])
    }))
    setCurrentPage(1)
  }

  const handleDeselectAll = (filterType: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: new Set()
    }))
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setFilters({
      locations: new Set<string>(),
      education: new Set<string>(),
      field: new Set<string>(),
      experience: new Set<string>(),
    })
    setCurrentPage(1)
    setIsFiltered(false)
    setFilteredResults([])
    setAllCandidates([])
  }

  const fetchAllCandidatesForFilter = async () => {
    try {
      // First get all user IDs
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, phone, created_at, is_active')
        .eq('role', 'candidate')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError
      if (!users) return []

      // Process in chunks of 50
      const chunkSize = 50
      const userChunks = []
      for (let i = 0; i < users.length; i += chunkSize) {
        userChunks.push(users.slice(i, i + chunkSize))
      }

      let allProfiles: Array<NonNullable<Candidate['user_profile']> & { id: string }> = []
      let allExperiences: Experience[] = []

      // Fetch profiles and experiences for each chunk
      for (const chunk of userChunks) {
        const userIds = chunk.map(u => u.id)
        
        // Fetch profiles for current chunk
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('*')
          .in('id', userIds)

        if (profilesError) throw profilesError
        if (profiles) allProfiles = [...allProfiles, ...profiles]

        // Fetch experiences for current chunk
        const { data: experiences, error: experiencesError } = await supabase
          .from('work_experience')
          .select('*')
          .in('user_id', userIds)

        if (experiencesError) throw experiencesError
        if (experiences) allExperiences = [...allExperiences, ...experiences]
      }

      // Combine the data
      const combinedData = users.map(user => ({
        ...user,
        user_profile: allProfiles.find(profile => profile.id === user.id) || null,
        work_experiences: allExperiences.filter(exp => exp.user_id === user.id) || []
      }))

      setAllCandidates(combinedData)
      return combinedData
    } catch (error) {
      console.error('Error fetching all candidates for filter:', error)
      return []
    }
  }

  useEffect(() => {
    const hasActiveFilters = 
      filters.locations.size > 0 || 
      filters.education.size > 0 || 
      filters.field.size > 0 || 
      filters.experience.size > 0;

    if (hasActiveFilters) {
      // Show loading state
      setIsLoading(true)
      
      // Fetch all candidates if we don't have them yet
      if (allCandidates.length === 0) {
        fetchAllCandidatesForFilter().then(candidates => {
          applyFilters(candidates)
          setIsLoading(false)
        }).catch(() => {
          setIsLoading(false)
        })
      } else {
        applyFilters(allCandidates)
        setIsLoading(false)
      }
    } else {
      setFilteredResults([])
      setIsFiltered(false)
      setIsLoading(false)
    }
  }, [filters])

  const applyFilters = (candidates: Candidate[]) => {
    const filtered = candidates.filter(candidate => {
      const matchesLocation = filters.locations.size === 0 || 
        (candidate.user_profile?.current_location && filters.locations.has(candidate.user_profile.current_location));
      
      const matchesEducation = filters.education.size === 0 || 
        (candidate.user_profile?.highest_education && filters.education.has(candidate.user_profile.highest_education));
      
      const matchesField = filters.field.size === 0 || 
        (candidate.user_profile?.core_field && filters.field.has(candidate.user_profile.core_field));
      
      const matchesExperience = filters.experience.size === 0 || 
        (candidate.user_profile?.experience && filters.experience.has(candidate.user_profile.experience));
      
      return matchesLocation && matchesEducation && matchesField && matchesExperience;
    });

    setFilteredResults(filtered);
    setIsFiltered(true);
  }

  const filteredCandidates = candidates
    .filter(candidate => {
      const fullName = `${candidate.first_name} ${candidate.last_name}`.toLowerCase();
      const searchTermLower = searchTerm.toLowerCase();
      
      const matchesSearch = 
        fullName.includes(searchTermLower) ||
        candidate.email.toLowerCase().includes(searchTermLower) ||
        candidate.phone.toLowerCase().includes(searchTermLower);
      
      const matchesLocation = filters.locations.size === 0 || 
        (candidate.user_profile?.current_location && filters.locations.has(candidate.user_profile.current_location));
      
      const matchesEducation = filters.education.size === 0 || 
        (candidate.user_profile?.highest_education && filters.education.has(candidate.user_profile.highest_education));
      
      const matchesField = filters.field.size === 0 || 
        (candidate.user_profile?.core_field && filters.field.has(candidate.user_profile.core_field));
      
      const matchesExperience = filters.experience.size === 0 || 
        (candidate.user_profile?.experience && filters.experience.has(candidate.user_profile.experience));
      
      return matchesSearch && matchesLocation && matchesEducation && matchesField && matchesExperience;
    });

  // Helper to get filtered values for dropdown
  const getFilteredValues = (filterType: keyof typeof availableFilters, searchTerm: string) => {
    const values = Array.from(availableFilters[filterType])
    if (!searchTerm) return values
    return values.filter(value =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  return (
  <div className="container mx-auto py-10">
    {/* Header Section */}
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold">
          View Candidates <span className='text-sm text-muted-foreground'>({totalCandidates})</span>
        </h1>
        {searchMode === 'semantic' && (
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered semantic search finds candidates by meaning, not just keywords
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={() => handleSyncEmbeddings(false)}
          disabled={isSyncing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync AI'}
        </Button>
        <Button onClick={exportToExcel} disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" /> Export to Excel
        </Button>
      </div>
    </div>

    {/* Search Mode Tabs */}
    <Tabs value={searchMode} onValueChange={(v) => setSearchMode(v as 'traditional' | 'semantic')} className="mb-6">
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        <TabsTrigger value="traditional" className="gap-2">
          <Search className="h-4 w-4" />
          Traditional Search
        </TabsTrigger>
        <TabsTrigger value="semantic" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI Semantic Search
        </TabsTrigger>
      </TabsList>

      {/* ========================================
          TRADITIONAL SEARCH TAB (Your existing code)
          ======================================== */}
      <TabsContent value="traditional" className="space-y-4">
        {/* Search candidate input bar */}
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-8"
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
          <Button variant='secondary' onClick={handleClearSearch} disabled={isLoading}>
            Clear
          </Button>
        </div>

        {/* Filters Row */}
        <div className="flex gap-4 flex-wrap">
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
                  <div className="p-2 border-b">
                    <Input
                      placeholder={`Search ${filterType}...`}
                      value={filterSearchTerms[filterType as keyof typeof filterSearchTerms]}
                      onChange={(e) => setFilterSearchTerms(prev => ({
                        ...prev,
                        [filterType]: e.target.value
                      }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  {getFilteredValues(filterType as keyof typeof availableFilters, filterSearchTerms[filterType as keyof typeof filterSearchTerms]).map((value) => (
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
                  {getFilteredValues(filterType as keyof typeof availableFilters, filterSearchTerms[filterType as keyof typeof filterSearchTerms]).length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No {filterType} found matching "{filterSearchTerms[filterType as keyof typeof filterSearchTerms]}"
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          ))}

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
      </TabsContent>

      {/* ========================================
          SEMANTIC SEARCH TAB (NEW)
          ======================================== */}
      <TabsContent value="semantic" className="space-y-4">
        <Card className="p-6">
          <div className="space-y-4">
            {/* Keyword Input Row */}
            <div className="flex items-center gap-4">
              <Input
                placeholder="Type keyword: 'Civil Engineer', 'React', 'JavaScript'..."
                value={currentKeyword}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSemanticKeyword()}
                className="flex-1"
              />
              <Button onClick={addSemanticKeyword} variant="outline">
                Add Keyword
              </Button>
              <Button 
                onClick={() => setShowSemanticFilters(!showSemanticFilters)} 
                variant="outline"
                size="icon"
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleSemanticSearch} 
                disabled={isSemanticSearching || semanticKeywords.length === 0}
                className="min-w-32"
              >
                {isSemanticSearching ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Search
                  </>
                )}
              </Button>
            </div>

            {/* Keywords Display */}
            {semanticKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {semanticKeywords.map((kw, i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1">
                    {kw}
                    <button
                      onClick={() => removeSemanticKeyword(kw)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Button onClick={clearSemanticSearch} variant="ghost" size="sm" className="h-7">
                  Clear All
                </Button>
              </div>
            )}

            {/* Optional Filters */}
            {showSemanticFilters && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <Select
                  value={semanticFilters.coreField}
                  onValueChange={(v) => setSemanticFilters({...semanticFilters, coreField: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Engineering Field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Civil">Civil Engineering</SelectItem>
                    <SelectItem value="Electrical">Electrical Engineering</SelectItem>
                    <SelectItem value="Mechanical">Mechanical Engineering</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={semanticFilters.minExperience}
                  onValueChange={(v) => setSemanticFilters({...semanticFilters, minExperience: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Min Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Fresher</SelectItem>
                    <SelectItem value="12">1+ years</SelectItem>
                    <SelectItem value="36">3+ years</SelectItem>
                    <SelectItem value="60">5+ years</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Location (e.g., Pune)"
                  value={semanticFilters.location}
                  onChange={(e) => setSemanticFilters({...semanticFilters, location: e.target.value})}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Semantic Search Results */}
        {semanticResults.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {semanticResults.length} Candidates Found (AI Matched)
              </h3>
              <Button variant="outline" onClick={clearSemanticSearch} size="sm">
                Clear Results
              </Button>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader> 
                  <TableRow>
                    <TableHead>Match Score</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Education</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>View Details</TableHead>
                    <TableHead>Edit/Delete</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {semanticResults.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          {candidate.similarity ? `${(candidate.similarity * 100).toFixed(0)}%` : 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>{candidate.first_name} {candidate.last_name}</TableCell>
                      <TableCell>{candidate.email}</TableCell>
                      <TableCell>{candidate.phone}</TableCell>
                      <TableCell>{candidate.user_profile?.current_location || '-'}</TableCell>
                      <TableCell>{candidate.user_profile?.highest_education || '-'}</TableCell>
                      <TableCell>{candidate.user_profile?.core_field || '-'}</TableCell>
                      <TableCell>{candidate.user_profile?.experience || '-'}</TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => setSelectedCandidate(candidate)}>
                          View Details
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditModal(candidate)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDeleteModal(candidate)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            candidate.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {candidate.is_active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {candidate.is_active ? 'Active' : 'Inactive'}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCandidateStatus(candidate.id, candidate.is_active)}
                            className="h-6 w-6 p-0"
                          >
                            {candidate.is_active ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {!isSemanticSearching && semanticResults.length === 0 && semanticKeywords.length > 0 && (
          <Card className="p-12 text-center text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No candidates found matching your search</p>
            <p className="text-sm mt-2">Try adjusting your keywords or filters</p>
          </Card>
        )}

        {semanticKeywords.length === 0 && (
          <Card className="p-12 text-center text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">Start your AI-powered search</p>
            <p className="text-sm mt-2">Add keywords like "Civil Engineer", "Solar", "React" to find candidates</p>
          </Card>
        )}
      </TabsContent>
    </Tabs>

    {/* ========================================
        TRADITIONAL SEARCH RESULTS (Only show when in traditional mode)
        ======================================== */}
    {searchMode === 'traditional' && (
      <>
        {isLoading ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Education</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Registered On</TableHead>
                  <TableHead>View Details</TableHead>
                  <TableHead>Edit/Delete</TableHead>
                  <TableHead>Status</TableHead>                
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-[80px]" /></TableCell>                  
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <>
            {/* Show filtered results if filters are active */}
            {isFiltered && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Filtered Results ({filteredResults.length})
                  </h2>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                </div>
                {filteredResults.length > 0 ? (
                  <div className="rounded-md border">
                    {/* YOUR EXISTING FILTERED RESULTS TABLE - Keep as is */}
                    <Table>
                      {/* ... Keep your existing filtered results table code ... */}
                    </Table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">No candidates match the selected filters.</p>
                )}
              </div>
            )}

            {/* Show regular paginated results if no filters are active */}
            {!isFiltered && (
              <>
                <div className="rounded-md border">
                  {/* YOUR EXISTING REGULAR RESULTS TABLE - Keep as is */}
                  <Table>
                    {/* ... Keep your existing regular table code ... */}
                  </Table>
                </div>
                
                {/* YOUR EXISTING PAGINATION - Keep as is */}
                <div className="flex justify-between items-center mt-4">
                  {/* ... Keep your existing pagination code ... */}
                </div>
              </>
            )}
          </>
        )}
      </>
    )}

    {/* ========================================
        ALL YOUR EXISTING MODALS (Keep unchanged)
        ======================================== */}
    
    {/* Candidate Details Dialog */}
    {selectedCandidate && (
      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        {/* ... Keep your existing candidate details dialog ... */}
      </Dialog>
    )}

    {/* Export Loading Dialog */}
    <Dialog open={isExporting} onOpenChange={setIsExporting}>
      {/* ... Keep your existing export dialog ... */}
    </Dialog>

    {/* Edit Candidate Dialog */}
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      {/* ... Keep your existing edit dialog ... */}
    </Dialog>

    {/* Delete Candidate Confirmation Dialog */}
    <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
      {/* ... Keep your existing delete dialog ... */}
    </Dialog>
  </div>
)
}