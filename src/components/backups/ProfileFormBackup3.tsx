'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, X, Trash2, Eye, FileText, EyeOff } from 'lucide-react'
import { Separator } from "@/components/ui/separator"

type Experience = {
  id: string
  user_id: string
  company_name: string
  designation: string
  duration_from: string
  duration_to: string
  job_summary: string
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
  const [currentExperience, setCurrentExperience] = useState<Experience>({
    id: '',
    user_id: '',
    company_name: '',
    designation: '',
    duration_from: '',
    duration_to: '',
    job_summary: ''
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

  const handleExperienceChange = (name: string, value: string) => {
    setCurrentExperience(prev => ({ ...prev, [name]: value }))
    if (name === 'duration_from' || name === 'duration_to') {
      validateDates(name, value)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("User not found. Please log in.")
      setIsLoading(false)
      return
    }

    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({ ...profile, id: user.id })

    if (profileError) {
      console.error('Error updating profile:', profileError)
      setError('Error updating profile. Please try again.')
      setIsLoading(false)
      return
    }

    // Update or insert experiences
    for (const exp of experiences) {
      const { error: expError } = await supabase
        .from('work_experience')
        .upsert({ ...exp, user_id: user.id })

      if (expError) {
        console.error('Error updating experience:', expError)
        setError('Error updating experiences. Please try again.')
        setIsLoading(false)
        return
      }
    }

    await fetchProfileAndExperiences()
    setSuccess('Profile and experiences updated successfully!')
    setIsLoading(false)
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

    // Check file size (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File size exceeds 2MB. Please upload a smaller file.')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('User not authenticated. Please log in and try again.')
      return
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

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

  const addExperience = () => {
    if (currentExperience.company_name && currentExperience.designation && !dateError) {
      setExperiences(prev => [...prev, { ...currentExperience, id: crypto.randomUUID(), user_id: profile.id }])
      setCurrentExperience({
        id: '',
        user_id: '',
        company_name: '',
        designation: '',
        duration_from: '',
        duration_to: '',
        job_summary: ''
      })
      setIsModalOpen(false)
      setDateError(null)
    }
  }

  const removeExperience = (id: string) => {
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

  return (
    <form onSubmit={handleSubmit}>
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
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={profile.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="last_name">Last Name</Label>
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
                  <Label htmlFor="email">Email</Label>
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
                  <Label htmlFor="phone">Phone</Label>
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
                  <Label htmlFor="current_location">Current Location</Label>
                  <Input
                    id="current_location"
                    name="current_location"
                    value={profile.current_location}
                    onChange={(e) => handleChange('current_location', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="highest_education">Highest Education</Label>
                  <Input
                    id="highest_education"
                    name="highest_education"
                    value={profile.highest_education}
                    onChange={(e) => handleChange('highest_education', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className='flex gap-2'>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="passout_year">Passout Year</Label>
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
                  <Label htmlFor="passout_college">Passout College</Label>
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
                  <Label htmlFor="core_field">Core Field</Label>
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
                  <Label htmlFor="core_expertise">Core Expertise</Label>
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
                  <Label htmlFor="resume">Resume (Only PDF, DOC, DOCX) Maximum File Size: 2MB</Label>
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
                      <div key={exp.id} className="flex items-center justify-between p-4 border rounded">
                        <div>
                          <h4 className="font-semibold">{exp.company_name}</h4>
                          <p className="text-sm text-gray-600">{exp.designation}</p>
                          <p className="text-sm text-gray-600">{`${exp.duration_from} - ${exp.duration_to}`}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExperience(exp.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <Button type="button">
                        <Plus className="mr-2 h-4 w-4" /> Add Experience
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Experience</DialogTitle>
                        <DialogDescription>
                          Enter the details of your work experience.
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
                          <Input
                            id="duration_from"
                            type="date"
                            value={currentExperience.duration_from}
                            onChange={(e) => handleExperienceChange('duration_from', e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="duration_to" className="text-right">
                            To
                          </Label>
                          <Input
                            id="duration_to"
                            type="date"
                            value={currentExperience.duration_to}
                            onChange={(e) => handleExperienceChange('duration_to', e.target.value)}
                            className="col-span-3"
                          />
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
                        <Button type="button" onClick={addExperience}>Add Experience</Button>
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
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mt-4">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" className="w-full mt-4" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  )
}

