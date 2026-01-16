'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, X, Trash2, Eye, FileText, EyeOff, Edit } from 'lucide-react'
import { Separator } from "@/components/ui/separator"

type Experience = {
  id: string
  user_id: string
  company_name: string
  designation: string
  duration_from: string
  duration_to: string
  job_summary: string
  is_current?: boolean
  is_primary?: boolean
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
  receive_updates: boolean
  whatsapp_number: string
  core_field: string
  core_expertise: string
  position: string
  experience: string
  current_employer: string
  notice_period: string
  current_salary: string
  expected_salary: string
  resume_url: string
  is_fresher: boolean
}

export default function ProfileForm() {
  const [profile, setProfile] = useState<Profile>({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    current_location: '',
    highest_education: '',
    passout_year: '',
    passout_college: '',
    receive_updates: false,
    whatsapp_number: '',
    core_field: '',
    core_expertise: '',
    position: '',
    experience: '',
    current_employer: '',
    notice_period: '',
    current_salary: '',
    expected_salary: '',
    resume_url: '',
    is_fresher: false,
  })
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentExperience, setCurrentExperience] = useState<Experience>({
    id: '',
    user_id: '',
    company_name: '',
    designation: '',
    duration_from: '',
    duration_to: '',
    job_summary: '',
    is_current: false,
    is_primary: false
  })
  const [dateError, setDateError] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchProfileAndExperiences()
  }, [])

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [error, success])

  const fetchProfileAndExperiences = async () => {
    setIsLoading(true)
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("User not found. Please log in.")
      setIsLoading(false)
      return
    }

    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      setError("Failed to load profile. Please try again.")
    } else if (profileData) {
      setProfile({ ...profile, ...profileData, id: user.id })
    } else {
      setProfile(prev => ({ ...prev, id: user.id }))
    }

    const { data: experiencesData, error: experiencesError } = await supabase
      .from('work_experience')
      .select('*')
      .eq('user_id', user.id)

    if (experiencesError) {
      console.error('Error fetching experiences:', experiencesError)
      setError("Failed to load experiences. Please try again.")
    } else {
      setExperiences(experiencesData || [])
    }

    setIsLoading(false)
  }

  const handleChange = (name: string, value: string | boolean) => {
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return date.toISOString().split('T')[0]
  }

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  const handleExperienceChange = (field: string, value: string | boolean) => {
    setCurrentExperience(prev => ({
      ...prev,
      [field]: value,
      // If "Currently working here" is checked, set duration_to to "currently working"
      ...(field === 'is_current' && value === true ? { duration_to: 'currently working' } : {}),
      // If "Currently working here" is unchecked, clear duration_to
      ...(field === 'is_current' && value === false ? { duration_to: '' } : {})
    }))

    if (field === 'duration_from' || field === 'duration_to') {
      validateDates(field, value as string)
    }
  }

  const validateDates = (changedField: string, value: string) => {
    const fromDate = changedField === 'duration_from' ? new Date(value) : new Date(currentExperience.duration_from)
    const toDate = changedField === 'duration_to' ? new Date(value) : new Date(currentExperience.duration_to)
    const today = new Date()

    if (fromDate > toDate) {
      setDateError("'From' date must be before 'To' date")
    } else if (toDate > today) {
      setDateError("'To' date cannot be in the future")
    } else {
      setDateError(null)
    }
  }

  const handlePrimaryExperienceChange = (expId: string, checked: boolean) => {
    setExperiences(prev => prev.map(exp => ({
      ...exp,
      is_primary: exp.id === expId ? checked : false
    })))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a PDF, DOC, or DOCX file.')
      return
    }

    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File size exceeds 5MB. Please upload a smaller file.')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('User not authenticated. Please log in and try again.')
      return
    }

    const fileExt = file.name.split('.').pop()
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const year = today.getFullYear()
    const fileName = `${profile.first_name.toLowerCase()}_${profile.last_name.toLowerCase()}_${day}${month}${year}_${Date.now()}.${fileExt}`

    try {
      const { error: uploadError, data } = await supabase.storage
        .from('resumes')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Error uploading file:', uploadError)
        if (uploadError.message.includes('Bucket not found')) {
          setError('Storage bucket not found. Please contact support.')
        } else {
          setError('Error uploading resume. Please try again.')
        }
        return
      }

      if (data) {
        // Store only the file name, not the full path or URL
        setProfile(prev => ({ ...prev, resume_url: fileName }))
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ resume_url: fileName })
          .eq('id', user.id)

        if (updateError) {
          console.error('Error updating profile with resume URL:', updateError)
          setError('Error updating profile with resume URL. Please try again.')
        } else {
          setSuccess('Resume uploaded and profile updated successfully!')
        }
      }
    } catch (error) {
      console.error('Unexpected error during file upload:', error)
      setError('An unexpected error occurred. Please try again.')
    }
  }

  const handleDeleteResume = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('User not authenticated. Please log in and try again.')
      return
    }
  
    try {
      // Delete the file from storage
      const { error: deleteError } = await supabase.storage
        .from('resumes')
        .remove([profile.resume_url])
  
      if (deleteError) {
        console.error('Error deleting file:', deleteError)
        setError('Error deleting resume. Please try again.')
        return
      }
  
      // Update profile state and user_profiles table
      setProfile(prev => ({ ...prev, resume_url: '' }))
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ resume_url: null })
        .eq('id', user.id)
  
      if (updateError) {
        console.error('Error updating profile after resume deletion:', updateError)
        setError('Error updating profile after resume deletion. Please try again.')
      } else {
        setSuccess('Resume deleted successfully!')
      }
    } catch (error) {
      console.error('Unexpected error during resume deletion:', error)
      setError('An unexpected error occurred. Please try again.')
    }
  }

  const getResumeUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName)
    return data.publicUrl
  }

  const addExperience = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (currentExperience.company_name && currentExperience.designation && !dateError) {
      if (isEditMode) {
        // Update existing experience
        setExperiences(prev => prev.map(exp => 
          exp.id === currentExperience.id ? currentExperience : exp
        ))
      } else {
        // Add new experience
        setExperiences(prev => [...prev, { ...currentExperience, id: crypto.randomUUID(), user_id: profile.id }])
      }
      
      setCurrentExperience({
        id: '',
        user_id: '',
        company_name: '',
        designation: '',
        duration_from: '',
        duration_to: '',
        job_summary: '',
        is_current: false,
        is_primary: false
      })
      setIsModalOpen(false)
      setIsEditMode(false)
      setDateError(null)
    }
  }

  const editExperience = (experience: Experience, e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setCurrentExperience(experience)
    setIsEditMode(true)
    setIsModalOpen(true)
  }

  const openAddExperienceModal = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setCurrentExperience({
      id: '',
      user_id: '',
      company_name: '',
      designation: '',
      duration_from: '',
      duration_to: '',
      job_summary: '',
      is_current: false,
      is_primary: false
    })
    setIsEditMode(false)
    setIsModalOpen(true)
  }

  const removeExperience = (id: string, e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setExperiences(prev => prev.filter(exp => exp.id !== id))
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-8 w-[150px]" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-8 w-[180px]" />
        <Skeleton className="h-[250px] w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setSuccess("Password updated successfully")
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred')
      }
    }
  }

  const handleDeactivateAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not found")

      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', user.id)

      if (error) throw error

      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred')
      }
    }
  }

  const togglePasswordVisibility = (field: 'new' | 'confirm') => {
    if (field === 'new') {
      setShowNewPassword(!showNewPassword)
    } else {
      setShowConfirmNewPassword(!showConfirmNewPassword)
    }
  }

  const isProfileComplete = () => {
    const requiredFields: (keyof Profile)[] = [
      'first_name', 'last_name', 'email', 'phone', 'current_location',
      'highest_education', 'passout_year', 'passout_college', 'core_field',
      'core_expertise' ,'resume_url'
    ]
    return requiredFields.every(field => !!profile[field])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    
    // Create a copy of profile with salary fields defaulting to '0' if empty
    const profileToSubmit = {
      ...profile,
      current_salary: profile.current_salary || '0',
      expected_salary: profile.expected_salary || '0'
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("User not found. Please log in.")
      setIsLoading(false)
      return
    }

    if (!isProfileComplete()) {
      setError("Please fill in all required fields before saving.")
      setIsLoading(false)
      return
    }

    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({ ...profileToSubmit, id: user.id })

    if (profileError) {
      console.error('Error updating profile:', profileError)
      setError('Error updating profile. Please try again.')
      setIsLoading(false)
      return
    }

    // Update work experiences
    const { error: experiencesError } = await supabase
      .from('work_experience')
      .upsert(
        experiences.map(exp => ({
          id: exp.id,
          user_id: profile.id,
          company_name: exp.company_name,
          designation: exp.designation,
          duration_from: exp.duration_from,
          duration_to: exp.duration_to,
          job_summary: exp.job_summary,
          is_primary: exp.is_primary || false
        }))
      )

    if (experiencesError) throw new Error(`Failed to update work experiences: ${experiencesError.message}`)

    await fetchProfileAndExperiences()
    setSuccess('Profile and experiences updated successfully!')
    setIsLoading(false)
  }

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return ''
    if (dateString === 'currently working') return 'Currently Working'
    
    // Try to parse the date
    const date = new Date(dateString)
    
    // If valid date, format it
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}-${month}-${year}`
    }
    
    // If not a valid date, try to handle common formats
    // Check if it's already in DD-MM-YYYY format
    const ddmmyyyyRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/
    if (ddmmyyyyRegex.test(dateString)) {
      return dateString
    }
    
    // Check if it's in DD/MM/YYYY format
    const ddmmyyyySlashRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    const ddmmyyyySlashMatch = dateString.match(ddmmyyyySlashRegex)
    if (ddmmyyyySlashMatch) {
      const [, day, month, year] = ddmmyyyySlashMatch
      return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`
    }
    
    // Check if it's in MM/DD/YYYY format
    const mmddyyyySlashRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    const mmddyyyySlashMatch = dateString.match(mmddyyyySlashRegex)
    if (mmddyyyySlashMatch) {
      const [, month, day, year] = mmddyyyySlashMatch
      return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`
    }
    
    // Check if it's in YYYY-MM-DD format
    const yyyymmddRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/
    const yyyymmddMatch = dateString.match(yyyymmddRegex)
    if (yyyymmddMatch) {
      const [, year, month, day] = yyyymmddMatch
      return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`
    }
    
    // If none of the above, return the original string
    return dateString
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mt-4 bg-green-500 text-white">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
          <TabsTrigger value="personal" className="text-md md:text-sm">Personal Details</TabsTrigger>
          <TabsTrigger value="job" className="text-md md:text-sm">Job Role</TabsTrigger>
          <TabsTrigger value="experience" className="text-md md:text-sm">Experience</TabsTrigger>
          <TabsTrigger value="account" className="text-md md:text-sm">Account and Password</TabsTrigger>
        </TabsList>
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Enter your personal information here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className='flex gap-2'>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="first_name">First Name<span className="text-red-500">* (Required)</span></Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={profile.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 w-1/2">
                    <Label htmlFor="last_name">Last Name<span className="text-red-500">* (Required)</span></Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={profile.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className='flex gap-2'>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="email">Email<span className="text-red-500">* (Required)</span></Label>    
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="phone">Phone<span className="text-red-500">* (Required)</span></Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profile.phone}
                    readOnly
                    className="bg-gray-100"
                    // onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
              </div>
              
              <div className='flex gap-2'>
                <div  className="space-y-2 w-1/2">
                  <Label htmlFor="current_location">Current Location<span className="text-red-500">* (Required)</span></Label>
                  <Input
                    id="current_location"
                    name="current_location"
                    value={profile.current_location}
                    onChange={(e) => handleChange('current_location', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="highest_education">Highest Education<span className="text-red-500">* (Required)</span></Label>
                  <Select
                    value={profile.highest_education}
                    onValueChange={(value) => handleChange('highest_education', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your highest education" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Below 10th pass">Below 10th pass</SelectItem>
                      <SelectItem value="10th pass">10th pass</SelectItem>
                      <SelectItem value="12th pass">12th pass</SelectItem>
                      <SelectGroup>
                        <SelectLabel>ITI</SelectLabel>
                        <SelectItem value="Agro Processing">Agro Processing</SelectItem>
                        <SelectItem value="Architectural Assistant">Architectural Assistant</SelectItem>
                        <SelectItem value="Architectural Draughtsman">Architectural Draughtsman</SelectItem>
                        <SelectItem value="Architectural Draughtsman (NE)">Architectural Draughtsman (NE)</SelectItem>
                        <SelectItem value="Attendant Operator (Chemical Plant)">Attendant Operator (Chemical Plant)</SelectItem>
                        <SelectItem value="Bakers and Confectioner">Bakers and Confectioner</SelectItem>
                        <SelectItem value="Bamboo works">Bamboo works</SelectItem>
                        <SelectItem value="Basic Cosmetology">Basic Cosmetology</SelectItem>
                        <SelectItem value="Cane willow and Bamboo workers">Cane willow and Bamboo workers</SelectItem>
                        <SelectItem value="Carpenter">Carpenter</SelectItem>
                        <SelectItem value="Catering and Hospitality Assistant">Catering and Hospitality Assistant</SelectItem>
                        <SelectItem value="Civil Engineer Assistant">Civil Engineer Assistant</SelectItem>
                        <SelectItem value="Computer Aided Embroidery and Designing">Computer Aided Embroidery and Designing</SelectItem>
                        <SelectItem value="Computer Hardware and Netwrok Maintenance">Computer Hardware and Netwrok Maintenance</SelectItem>
                        <SelectItem value="Computer Operator and Programming Assistant (VI)">Computer Operator and Programming Assistant (VI)</SelectItem>
                        <SelectItem value="Computer Operator and Programming Asistant">Computer Operator and Programming Asistant</SelectItem>
                        <SelectItem value="Craftsman Food Productions (Vegeterian)">Craftsman Food Productions (Vegeterian)</SelectItem>
                        <SelectItem value="Cutting and Sewing">Cutting and Sewing</SelectItem>
                        <SelectItem value="Dairing">Dairing</SelectItem>
                        <SelectItem value="Data Entry Operator">Data Entry Operator</SelectItem>
                        <SelectItem value="Dental Laboratory Equipement Technician">Dental Laboratory Equipement Technician</SelectItem>
                        <SelectItem value="Desk Top Publishing Operator">Desk Top Publishing Operator</SelectItem>
                        <SelectItem value="Digital Photographer">Digital Photographer</SelectItem>
                        <SelectItem value="Draftsman">Draftsman</SelectItem>
                        <SelectItem value="Draughtsman (Civil)">Draughtsman (Civil)</SelectItem>
                        <SelectItem value="Draughtsman (Mechanical)">Draughtsman (Mechanical)</SelectItem>
                        <SelectItem value="Dress Making">Dress Making</SelectItem>
                        <SelectItem value="Driver cum Mechanic">Driver cum Mechanic</SelectItem>
                        <SelectItem value="Electrician">Electrician</SelectItem>
                        <SelectItem value="Electician Power Distribution">Electician Power Distribution</SelectItem>
                        <SelectItem value="Electonics Mechanical">Electonics Mechanical</SelectItem>
                        <SelectItem value="ElectroPlater">ElectroPlater</SelectItem>
                        <SelectItem value="Fashion Design and technology">Fashion Design and technology</SelectItem>
                        <SelectItem value="Finance Executive">Finance Executive</SelectItem>
                        <SelectItem value="Fire Techonolgy and Industrial Safety Management">Fire Techonolgy and Industrial Safety Management</SelectItem>
                        <SelectItem value="Fireman">Fireman</SelectItem>
                        <SelectItem value="Fitter">Fitter</SelectItem>
                        <SelectItem value="Floricultural and Landscaping">Floricultural and Landscaping</SelectItem>
                        <SelectItem value="Food and Beverage Service Assistant">Food and Beverage Service Assistant</SelectItem>
                        <SelectItem value="Food Beverage">Food Beverage</SelectItem>
                        <SelectItem value="Food Production">Food Production</SelectItem>
                        <SelectItem value="Footware Maker">Footware Maker</SelectItem>
                        <SelectItem value="Foundryman">Foundryman</SelectItem>
                        <SelectItem value="Front Office Assistant">Front Office Assistant</SelectItem>
                        <SelectItem value="Fruit and Vegetable Processor">Fruit and Vegetable Processor</SelectItem>
                        <SelectItem value="Geo Informatics Assistant">Geo Informatics Assistant</SelectItem>
                        <SelectItem value="Hair and skin care">Hair and skin care</SelectItem>
                        <SelectItem value="Hatchery Management">Hatchery Management</SelectItem>
                        <SelectItem value="Health safety and Environment">Health safety and Environment</SelectItem>
                        <SelectItem value="Health Sanitary Inspector">Health Sanitary Inspector</SelectItem>
                        <SelectItem value="Horticulture">Horticulture</SelectItem>
                        <SelectItem value="Hospital House Keeping">Hospital House Keeping</SelectItem>
                        <SelectItem value="House Keeping">House Keeping</SelectItem>
                        <SelectItem value="Human Resource Executive">Human Resource Executive</SelectItem>
                        <SelectItem value="Industrial Painter">Industrial Painter</SelectItem>
                        <SelectItem value="Information Communication Technology System Maintenance">Information Communication Technology System Maintenance</SelectItem>
                        <SelectItem value="Information Technology">Information Technology</SelectItem>
                        <SelectItem value="Insturment Mechanic">Insturment Mechanic</SelectItem>
                        <SelectItem value="Interior Decoration And Designing">Interior Decoration And Designing</SelectItem>
                        <SelectItem value="Laboratory Assistant">Laboratory Assistant</SelectItem>
                        <SelectItem value="Leather Goods Maker">Leather Goods Maker</SelectItem>
                        <SelectItem value="Lift and Escalator Mechanic">Lift and Escalator Mechanic</SelectItem>
                        <SelectItem value="Lift Mechanic">Lift Mechanic</SelectItem>
                        <SelectItem value="Litho Offset Machine Minder">Litho Offset Machine Minder</SelectItem>
                        <SelectItem value="Machinist">Machinist</SelectItem>
                        <SelectItem value="Maintenance mechanic">Maintenance mechanic</SelectItem>
                        <SelectItem value="Marine Engine Fitter">Marine Engine Fitter</SelectItem>
                        <SelectItem value="Marine Fitter">Marine Fitter</SelectItem>
                        <SelectItem value="Marketing Executive">Marketing Executive</SelectItem>
                        <SelectItem value="Mason">Mason</SelectItem>
                        <SelectItem value="Mech Repair and Maintenance of Heavy Vehicles">Mech Repair and Maintenance of Heavy Vehicles</SelectItem>
                        <SelectItem value="Mech Repair and Maintenance of Light Vehicles">Mech Repair and Maintenance of Light Vehicles</SelectItem>
                        <SelectItem value="Mechanic">Mechanic</SelectItem>
                        <SelectItem value="Mechanic Agriculture Machinery">Mechanic Agriculture Machinery</SelectItem>
                        <SelectItem value="Mechanic Auto Body Painting">Mechanic Auto Body Painting</SelectItem>
                        <SelectItem value="Mechanic Auto Body Repair">Mechanic Auto Body Repair</SelectItem>
                        <SelectItem value="Mechanic Auto Electrical and Electronics">Mechanic Auto Electrical and Electronics</SelectItem>
                        <SelectItem value="Mechanic Communication Equipment Maintenance">Mechanic Communication Equipment Maintenance</SelectItem>
                        <SelectItem value="Mechanic Computer Hardware">Mechanic Computer Hardware</SelectItem>
                        <SelectItem value="Mechanic Consumer Electronics">Mechanic Consumer Electronics</SelectItem>
                        <SelectItem value="Mechanic Consumer Electronics Appliances">Mechanic Consumer Electronics Appliances</SelectItem>
                        <SelectItem value="Mechanic Cum Operator Electronics Communication Systems">Mechanic Cum Operator Electronics Communication Systems</SelectItem>
                        <SelectItem value="Mechanic Diesel">Mechanic Diesel</SelectItem>
                        <SelectItem value="Mechanic Industrial Electronics">Mechanic Industrial Electronics</SelectItem>
                        <SelectItem value="Mechanic Lens/Prism Grinding">Mechanic Lens/Prism Grinding</SelectItem>
                        <SelectItem value="Mechanic Machine Tool Maintenance">Mechanic Machine Tool Maintenance</SelectItem>
                        <SelectItem value="Mechanic Mechatronics">Mechanic Mechatronics</SelectItem>
                        <SelectItem value="Mechanic Mining  Machinery">Mechanic Mining  Machinery</SelectItem>
                        <SelectItem value="Mechanic Medical Electronics">Mechanic Medical Electronics</SelectItem>
                        <SelectItem value="Mechanic Motor Cycle">Mechanic Motor Cycle</SelectItem>
                        <SelectItem value="Mechanic Radio and TV">Mechanic Radio and TV</SelectItem>
                        <SelectItem value="Metal Cutting Attendance">Metal Cutting Attendance</SelectItem>
                        <SelectItem value="Milk and Milk Products">Milk and Milk Products</SelectItem>
                        <SelectItem value="Multimedia Animation And Special Effects">Multimedia Animation And Special Effects</SelectItem>
                        <SelectItem value="Office Assistant cum Computer Operator">Office Assistant cum Computer Operator</SelectItem>
                        <SelectItem value="Old Age Care">Old Age Care</SelectItem>
                        <SelectItem value="Operator Advanced Machine Tools">Operator Advanced Machine Tools</SelectItem>
                        <SelectItem value="Painter General">Painter General</SelectItem>
                        <SelectItem value="Photographer">Photographer</SelectItem>
                        <SelectItem value="Physiotherapy Technician">Physiotherapy Technician</SelectItem>
                        <SelectItem value="Plastic Processing Operator">Plastic Processing Operator</SelectItem>
                        <SelectItem value="Plate Maker cum Impositor">Plate Maker cum Impositor</SelectItem>
                        <SelectItem value="Plumber">Plumber</SelectItem>
                        <SelectItem value="Pre/Preparatory School Management">Pre/Preparatory School Management</SelectItem>
                        <SelectItem value="Pum Operator cum Mechanic">Pum Operator cum Mechanic</SelectItem>
                        <SelectItem value="Radiology Technician">Radiology Technician</SelectItem>
                        <SelectItem value="Sanitary Hardware Fitter">Sanitary Hardware Fitter</SelectItem>
                        <SelectItem value="Secretarial Practice">Secretarial Practice</SelectItem>
                        <SelectItem value="Sewing technology">Sewing technology</SelectItem>
                        <SelectItem value="Sheet Metal Worker">Sheet Metal Worker</SelectItem>
                        <SelectItem value="Soil Testing and Crop Technician">Soil Testing and Crop Technician</SelectItem>
                        <SelectItem value="Solar technician">Solar technician</SelectItem>
                        <SelectItem value="Spa Therapy">Spa Therapy</SelectItem>
                        <SelectItem value="Spinning Technician">Spinning Technician</SelectItem>
                        <SelectItem value="Stenographer And Secretarial Assistant">Stenographer And Secretarial Assistant</SelectItem>
                        <SelectItem value="Stone Mining Machine Operator">Stone Mining Machine Operator</SelectItem>
                        <SelectItem value="Stone Processing Machine Operator">Stone Processing Machine Operator</SelectItem>
                        <SelectItem value="Surface Ornamentation Techniques">Surface Ornamentation Techniques</SelectItem>
                        <SelectItem value="Surveyor">Surveyor</SelectItem>
                        <SelectItem value="Technician Power Electornics System">Technician Power Electornics System</SelectItem>
                        <SelectItem value="Textile Mechatronics">Textile Mechatronics</SelectItem>
                        <SelectItem value="Textile Wet processing technician">Textile Wet processing technician</SelectItem>
                        <SelectItem value="Tool and Die Maker">Tool and Die Maker</SelectItem>
                        <SelectItem value="Tourist Guide">Tourist Guide</SelectItem>
                        <SelectItem value="Travel and Tour Assistant">Travel and Tour Assistant</SelectItem>
                        <SelectItem value="Turner">Turner</SelectItem>
                        <SelectItem value="Vessel Navigator">Vessel Navigator</SelectItem>
                        <SelectItem value="Weaving of Woolen Fabrics">Weaving of Woolen Fabrics</SelectItem>
                        <SelectItem value="Weaving technician">Weaving technician</SelectItem>
                        <SelectItem value="Weaving techinican for Silk and Woolen Fabrics">Weaving techinican for Silk and Woolen Fabrics</SelectItem>
                        <SelectItem value="Welder">Welder</SelectItem>
                        <SelectItem value="Wireman">Wireman</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Diploma</SelectLabel>
                        <SelectItem value="Automobile Enginerring">Automobile Enginerring</SelectItem>
                        <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                        <SelectItem value="Communication Engineering">Communication Engineering</SelectItem>
                        <SelectItem value="Computer Science Engineering">Computer Science Engineering</SelectItem>
                        <SelectItem value="Diploma In Hotel Management">Diploma In Hotel Management</SelectItem>
                        <SelectItem value="Diploma in Others">Diploma in Others</SelectItem>
                        <SelectItem value="Diploma in Pharmacy">Diploma in Pharmacy</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                        <SelectItem value="Electornics and Communication Engineering">Electornics and Communication Engineering</SelectItem>
                        <SelectItem value="Electronics Engineering">Electronics Engineering</SelectItem>
                        <SelectItem value="Industrial Engineering">Industrial Engineering</SelectItem>
                        <SelectItem value="Diploma Information Technology">Information Technology</SelectItem>
                        <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                        <SelectItem value="Mettalurgical Engineering">Mettalurgical Engineering</SelectItem>
                        <SelectItem value="Petroleum Engineering">Petroleum Engineering</SelectItem>
                        <SelectItem value="Power Engineering">Power Engineering</SelectItem>
                        <SelectItem value="Production Engineering">Production Engineering</SelectItem>
                        <SelectItem value="Robotics Engineering">Robotics Engineering</SelectItem>
                        <SelectItem value="Sturctural Engineering">Sturctural Engineering</SelectItem>
                        <SelectItem value="Telecommunication Engineering">Telecommunication Engineering</SelectItem>
                        <SelectItem value="Textile Engineering">Textile Engineering</SelectItem>
                        <SelectItem value="Tool Engineering">Tool Engineering</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Graduate</SelectLabel>
                        <SelectItem value="B.A.">B.A.</SelectItem>
                        <SelectItem value="B.A. Hons">B.A. Hons</SelectItem>
                        <SelectItem value="B.A. Pass">B.A. Pass</SelectItem>
                        <SelectItem value="B. Arch">B. Arch</SelectItem>
                        <SelectItem value="B.B.A">B.B.A</SelectItem>
                        <SelectItem value="B.Com">B.Com</SelectItem>
                        <SelectItem value="B.Des">B.Des</SelectItem>
                        <SelectItem value="B.Des Arch">B.Des Arch</SelectItem>
                        <SelectItem value="B.E./B.Tech.">B.E./B.Tech.</SelectItem>
                        <SelectItem value="B.Ed.">B.Ed.</SelectItem>
                        <SelectItem value="B.I.Ed.">B.I.Ed.</SelectItem>
                        <SelectItem value="B. Pharm">B. Pharm</SelectItem>
                        <SelectItem value="B.Sc.">B.Sc.</SelectItem>
                        <SelectItem value="B.Voc">B.Voc</SelectItem>
                        <SelectItem value="Bachelor in Naval Architecture and ocean Engineering">Bachelor in Naval Architecture and ocean Engineering</SelectItem>
                        <SelectItem value="Bachelor in Others">Bachelor in Others</SelectItem>
                        <SelectItem value="Bachelor of Naturopathy and Yogic Science (BNYS)">Bachelor of Naturopathy and Yogic Science (BNYS)</SelectItem>
                        <SelectItem value="Bachelor of Occupational Therapy">Bachelor of Occupational Therapy</SelectItem>
                        <SelectItem value="Bachelor of Physiotherapy">Bachelor of Physiotherapy</SelectItem>
                        <SelectItem value="Bachelor of Veterinary Science and Animal Husbandary">Bachelor of Veterinary Science and Animal Husbandary</SelectItem>
                        <SelectItem value="BAMS">BAMS</SelectItem>
                        <SelectItem value="BBA">BBA</SelectItem>
                        <SelectItem value="BBE">BBE</SelectItem>
                        <SelectItem value="BBS">BBS</SelectItem>
                        <SelectItem value="BCA">BCA</SelectItem>
                        <SelectItem value="BDS">BDS</SelectItem>
                        <SelectItem value="BHMS">BHMS</SelectItem>
                        <SelectItem value="BMLT">BMLT</SelectItem>
                        <SelectItem value="BMM">BMM</SelectItem>
                        <SelectItem value="BMS">BMS</SelectItem>
                        <SelectItem value="BSW">BSW</SelectItem>
                        <SelectItem value="BUMS">BUMS</SelectItem>
                        <SelectItem value="LLB">LLB</SelectItem>
                        <SelectItem value="CA">CA</SelectItem>
                        <SelectItem value="CS">CS</SelectItem>
                        <SelectItem value="ICWA">ICWA</SelectItem>
                        <SelectItem value="Integrated Law program">Integrated Law program</SelectItem>
                        <SelectItem value="MBBS">MBBS</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Post Graduate</SelectLabel>
                        <SelectItem value="M.A.">M.A.</SelectItem>
                        <SelectItem value="M.Arch">M.Arch</SelectItem>
                        <SelectItem value="M.Com">M.Com</SelectItem>
                        <SelectItem value="M.Ed">M.Ed</SelectItem>
                        <SelectItem value="M. Pharm">M. Pharm</SelectItem>
                        <SelectItem value="M.S">M.S</SelectItem>
                        <SelectItem value="M. Tech/M.E.">M. Tech/M.E.</SelectItem>
                        <SelectItem value="Masters in Others">Masters in Others</SelectItem>
                        <SelectItem value="MBA">MBA</SelectItem>
                        <SelectItem value="MCA">MCA</SelectItem>
                        <SelectItem value="MD/MS">MD/MS</SelectItem>
                        <SelectItem value="MDS">MDS</SelectItem>
                        <SelectItem value="Mphil">Mphil</SelectItem>
                        <SelectItem value="PGDCA">PGDCA</SelectItem>
                        <SelectItem value="PGDM">PGDM</SelectItem>
                        <SelectItem value="LLM">LLM</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Doctorate</SelectLabel>                        
                        <SelectItem value="PhD in Computer Science (AI, Cybersecurity)">PhD in Computer Science (AI, Cybersecurity)</SelectItem>
                        <SelectItem value="PhD in Mechanical Engineering (Robotics, Thermodynamics)">PhD in Mechanical Engineering (Robotics, Thermodynamics)</SelectItem>
                        <SelectItem value="PhD in Literature (Comparative Studies, Translation)">PhD in Literature (Comparative Studies, Translation)</SelectItem>
                        <SelectItem value="PhD in Management (Organizational Behavior, Strategy)">PhD in Management (Organizational Behavior, Strategy)</SelectItem>
                        <SelectItem value="PhD in Chemistry">PhD in Chemistry</SelectItem>
                        <SelectItem value="PhD in Physics">PhD in Physics</SelectItem>
                        <SelectItem value="PhD in Sociology">PhD in Sociology</SelectItem>
                        <SelectItem value="PhD in Economics">PhD in Economics</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='flex gap-2'>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="passout_year">Passout Year<span className="text-red-500">* (Required)</span></Label>
                  <Input
                    id="passout_year"
                    name="passout_year"
                    type="number"
                    value={profile.passout_year}
                    onChange={(e) => handleChange('passout_year', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="passout_college">Passout College<span className="text-red-500">* (Required)</span></Label>
                  <Input
                    id="passout_college"
                    name="passout_college"
                    value={profile.passout_college}
                    onChange={(e) => handleChange('passout_college', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="receive_updates"
                  checked={profile.receive_updates}
                  onCheckedChange={(checked) => handleChange('receive_updates', checked)}
                />
                <Label htmlFor="receive_updates">Receive important updates & promotions via Whatsapp</Label>
              </div>
              {profile.receive_updates && (
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                  <Input
                    id="whatsapp_number"
                    name="whatsapp_number"
                    type="tel"
                    value={profile.whatsapp_number}
                    onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="job">
          <Card>
            <CardHeader>
              <CardTitle>Job Role</CardTitle>
              <CardDescription>Enter your job preferences here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className='flex gap-2'>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="core_field">Core Field<span className="text-red-500">* (Required)</span></Label>
                  <Select
                    value={profile.core_field}
                    onValueChange={(value) => 
                      handleChange('core_field', value)
                    }
                  >
                    <SelectTrigger id="core_field">
                      <SelectValue placeholder="Select Core Field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Civil Engineer">Civil Engineer</SelectItem>
                      <SelectItem value="Mechanical Engineer">Mechanical Engineer</SelectItem>
                      <SelectItem value="Electrical  Engineer">Electrical Engineer</SelectItem>
                      <SelectItem value="HSE">Health,Safety & Environment(HSE)</SelectItem>
                      <SelectItem value="Material Science Engineering">Material Science Engineering</SelectItem>
                      <SelectItem value="Quality Engineering">Quality Engineering</SelectItem>
                      <SelectItem value="Planning Engineering">Planning Engineering</SelectItem>
                      <SelectItem value="Computer/IT/Network Engineering">Computer/IT/Network Engineering</SelectItem>
                      <SelectItem value="Commissioning">Commissioning</SelectItem>
                      <SelectItem value="Testing">Testing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 w-1/2">
                  <Label htmlFor="core_expertise">Core Expertise<span className="text-red-500">* (Required)</span></Label>
                  <Select
                    value={profile.core_expertise}
                    onValueChange={(value) => handleChange('core_expertise', value)}
                  >
                    <SelectTrigger id="core_expertise">
                      <SelectValue placeholder="Select Core Expertise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Material Management">Material Management</SelectItem>
                      <SelectItem value="Material Handelling">Material Handelling</SelectItem>
                      <SelectItem value="Safety Management">Safety Management</SelectItem>
                      <SelectItem value="Project Management">Project Management</SelectItem>
                      <SelectItem value="Project Planning">Project Planning</SelectItem>
                      <SelectItem value="Risk Management">Risk Management</SelectItem>
                      <SelectItem value="Procurement/SCM(Supply chain /management)">Procurement/SCM(Supply chain /management)</SelectItem>
                      <SelectItem value="Design & Engineering">Design & Engineering</SelectItem>
                      <SelectItem value="Construction Management">Construction Management</SelectItem>
                      <SelectItem value="Contract Management">Contract Management</SelectItem>
                      <SelectItem value="Environmental Impact Assessments">Environmental Impact Assessments</SelectItem>
                      <SelectItem value="Costing & Cost-Benefit Analysis">Costing & Cost-Benefit Analysis</SelectItem>
                      <SelectItem value="Value Engineering">Value Engineering</SelectItem>
                      <SelectItem value="SCADA & Communication Systems">SCADA & Communication Systems</SelectItem>
                      <SelectItem value="Environmental Health and Safety (EHS)">Environmental Health and Safety (EHS)</SelectItem>
                      <SelectItem value="First Aid and Crisis Management">First Aid and Crisis Management</SelectItem>
                      <SelectItem value="Quality Management">Quality Management</SelectItem>                
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='flex gap-2'>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="position">Position</Label>
                  <Select
                    value={profile.position}
                    onValueChange={(value) => handleChange('position', value)}
                  >
                    <SelectTrigger id="position">
                      <SelectValue placeholder="Select Position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Erection Engineer">Erection Engineer(Solar, Wind  ,Hydropower ,Geothermal ,Biomass Energy)</SelectItem>
                      <SelectItem value="Comissioning Engineer">Comissioning Engineer</SelectItem>
                      <SelectItem value="Electrical Engineer">Electrical Engineer</SelectItem>
                      <SelectItem value="Mechanical Engineer">Mechanical Engineer</SelectItem>
                      <SelectItem value="Energy Storage Engineer">Energy Storage Engineer</SelectItem>
                      <SelectItem value="Design Engineer">Design Engineer</SelectItem>
                      <SelectItem value="Project Manager">Project Manager</SelectItem>
                      <SelectItem value="Site Manager">Site Manager</SelectItem>
                      <SelectItem value="Construction Manager">Construction Engineer</SelectItem>
                      <SelectItem value="Risk Manager">Risk Manager</SelectItem>
                      <SelectItem value="Environmental Compliance Officer">Environmental Compliance Officer</SelectItem>
                      <SelectItem value="Permitting Specialist">Permitting Specialist</SelectItem>
                      <SelectItem value="Sustainability Manager">Sustainability Manager</SelectItem>
                      <SelectItem value="Environmental Impact Assessment (EIA) Specialist">Environmental Impact Assessment (EIA) Specialist</SelectItem>
                      <SelectItem value="Energy Prognosis Analyst">Energy Prognosis Analyst</SelectItem>
                      <SelectItem value="Energy Economist">Energy Economist</SelectItem>
                      <SelectItem value="Investment Analyst">Investment Analyst</SelectItem>
                      <SelectItem value="Power Purchase Agreement (PPA) Specialist">Power Purchase Agreement (PPA) Specialist</SelectItem>
                      <SelectItem value="Energy Systems Modeler">Energy Systems Modeler</SelectItem>
                      <SelectItem value="SCADA Specialist">SCADA Specialist</SelectItem>
                      <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                      <SelectItem value="Health and Safety Officer (Renewables)">Health and Safety Officer (Renewables)</SelectItem>
                      <SelectItem value="Safety Engineer">Safety Engineer</SelectItem>
                      <SelectItem value="Sales & Marketing Manager/Engineer">Sales & Marketing Manager/Engineer</SelectItem>
                      <SelectItem value="Estimation Engineer">Estimation Engineer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="experience">Experience (in years)</Label>
                  <Input
                    id="experience"
                    name="experience"
                    value={profile.experience}
                    onChange={(e) => handleChange('experience', e.target.value)}
                  />
                </div>
              </div>
              
              <div className='flex gap-2'>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="current_employer">Current Employer</Label>
                  <Input
                    id="current_employer"
                    name="current_employer"
                    value={profile.current_employer}
                    onChange={(e) => 
                      handleChange('current_employer', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="notice_period">Notice Period</Label>
                  <Input
                    id="notice_period"
                    name="notice_period"
                    value={profile.notice_period}
                    onChange={(e) => handleChange('notice_period', e.target.value)}
                  />
                </div>
              </div>
              
              <div className='flex gap-2'>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="current_salary">Current Salary</Label>
                  <Input
                    id="current_salary"
                    name="current_salary"
                    type="number"
                    value={profile.current_salary}
                    onChange={(e) => handleChange('current_salary', e.target.value)}
                  />
                </div>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="expected_salary">Expected Salary</Label>
                  <Input
                    id="expected_salary"
                    name="expected_salary"
                    type="number"
                    value={profile.expected_salary}
                    onChange={(e) => handleChange('expected_salary', e.target.value)}
                  />
                </div>
              </div>

              <div className='flex gap-2'>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="resume">Resume (Only PDF, DOC, DOCX) <span className="text-red-500">Maximum File Size: 5MB  * (Required)</span></Label>
                  <Input
                    id="resume"
                    name="resume"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileUpload}
                  />
                </div>                
              </div>
              <div className='gap-2 w-1/2'>
              {profile.resume_url && (
                  
                  
                  <Card>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Current Resume</p>
                          {/* <p className="text-sm text-muted-foreground">
                            {profile.resume_url.split('/').pop()}
                          </p> */}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={getResumeUrl(profile.resume_url)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                            <Eye className="h-4 w-4 mr-2" /> View
                          </a>
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleDeleteResume}
                          className="flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>        
        <TabsContent value="experience">
          <Card>
            <CardHeader>
              <CardTitle>Experience</CardTitle>
              <CardDescription>Enter your work experience here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_fresher"
                  checked={profile.is_fresher}
                  onCheckedChange={(checked) => handleChange('is_fresher', checked)}
                />
                <Label htmlFor="is_fresher">I'm a fresher</Label>
              </div>
              {!profile.is_fresher && (
                <>
                  <div className="space-y-4">
                    {experiences.map((exp) => (
                      <div key={exp.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{exp.designation}</h3>
                          <p className="text-sm text-muted-foreground">{exp.company_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {`${formatDisplayDate(exp.duration_from)} - ${formatDisplayDate(exp.duration_to)}`}
                          </p>
                          <p className="mt-2 text-sm">{exp.job_summary}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Checkbox
                              id={`is_primary_${exp.id}`}
                              checked={exp.is_primary}
                              onCheckedChange={(checked) => handlePrimaryExperienceChange(exp.id, checked as boolean)}
                            />
                            <label htmlFor={`is_primary_${exp.id}`} className="text-sm">Is Primary Experience</label>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => editExperience(exp, e)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => removeExperience(exp.id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Dialog open={isModalOpen} onOpenChange={(open) => {
                    setIsModalOpen(open)
                    if (!open) {
                      setIsEditMode(false)
                      setDateError(null)
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button type="button" onClick={(e) => openAddExperienceModal(e)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Experience
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Edit Experience' : 'Add New Experience'}</DialogTitle>
                        <DialogDescription>
                          {isEditMode ? 'Update the details of your work experience.' : 'Enter the details of your work experience.'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="company_name" className="text-right">
                            Company
                          </Label>
                          <Input
                            id="company_name"
                            value={currentExperience.company_name}
                            onChange={(e) => handleExperienceChange('company_name', e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="designation" className="text-right">
                            Designation
                          </Label>
                          <Input
                            id="designation"
                            value={currentExperience.designation}
                            onChange={(e) => handleExperienceChange('designation', e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="duration_from" className="text-right">
                            From
                          </Label>
                          <div className="col-span-3">
                            <Input
                              id="duration_from"
                              type="date"
                              value={formatDateForInput(currentExperience.duration_from)}
                              onChange={(e) => handleExperienceChange('duration_from', e.target.value)}
                            />
                            {/* {currentExperience.duration_from && (
                              <span className="text-sm text-muted-foreground mt-1 block">
                                {formatDateForDisplay(currentExperience.duration_from)}
                              </span>
                            )} */}
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="duration_to" className="text-right">
                            To
                          </Label>
                          <div className="col-span-3 space-y-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="is_current"
                                checked={currentExperience.is_current}
                                onChange={(e) => handleExperienceChange('is_current', e.target.checked)}
                                className="h-4 w-4"
                              />
                              <label htmlFor="is_current" className="text-sm">Currently working here</label>
                            </div>
                            {!currentExperience.is_current && (
                              <div>
                                <Input
                                  id="duration_to"
                                  type="date"
                                  value={formatDateForInput(currentExperience.duration_to)}
                                  onChange={(e) => handleExperienceChange('duration_to', e.target.value)}
                                />
                                {/* {currentExperience.duration_to && (
                                  <span className="text-sm text-muted-foreground mt-1 block">
                                    {formatDateForDisplay(currentExperience.duration_to)}
                                  </span>
                                )} */}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="job_summary" className="text-right">
                            Job Summary
                          </Label>
                          <Textarea
                            id="job_summary"
                            value={currentExperience.job_summary}
                            onChange={(e) => handleExperienceChange('job_summary', e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      {dateError && (
                        <p className="text-sm text-red-500 mb-4">{dateError}</p>
                      )}
                      <DialogFooter>
                        <Button type="button" onClick={(e) => addExperience(e)}>
                          {isEditMode ? 'Update Experience' : 'Add Experience'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account and Password</CardTitle>
              <CardDescription>Manage your account settings and password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('new')}
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-new-password"
                    type={showConfirmNewPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('confirm')}
                    aria-label={showConfirmNewPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="button" onClick={handlePasswordUpdate}>Update Password</Button>
              
              <Separator className="my-4 bg-gray-300" />
              <div className="">
                <p className='text-red-500 mb-4'>Not getting the best from REinfrahire? Click below to  deactivate your account.</p>
                <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>                  
                  <DialogTrigger asChild>                    
                    <Button variant="destructive">Deactivate Account</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Deactivate Account</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to deactivate your account? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDeactivateDialogOpen(false)}>Cancel</Button>
                      <Button variant="destructive" onClick={handleDeactivateAccount}>Deactivate</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>      
      {/* <Button type="submit" className="w-full mt-4" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Profile'}
      </Button> */}
      <Button type="submit" className="w-full mt-4" disabled={isLoading || !isProfileComplete()}>
        {isLoading ? 'Saving...' : isProfileComplete() ? 'Save Profile' : 'Complete Profile to Save'}
      </Button>
    </form>
  )
}

