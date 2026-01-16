'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Job = {
  id: string
  title: string
  company: string
  location: string
  type: string
  job_category: string
  salary: number
  description: string
  created_at: string
  created_by: string
  status: string
  is_active: boolean
}

type AppliedJob = {
  id: number
  applied_at: string
  job: Job
}

type SavedJob = {
  id: number
  saved_at: string
  job: Job
}

type JobContextType = {
  jobs: Job[]
  filteredJobs: Job[]
  setFilteredJobs: React.Dispatch<React.SetStateAction<Job[]>>
  appliedJobs: AppliedJob[]
  savedJobs: SavedJob[]
  refreshJobs: () => Promise<void>
  refreshAppliedJobs: () => Promise<void>
  refreshSavedJobs: () => Promise<void>
  applyToJob: (jobId: number) => Promise<void>
  saveJob: (jobId: string) => Promise<void>
  unsaveJob: (jobId: number) => Promise<void>
  isLoading: boolean
}

const JobContext = createContext<JobContextType | undefined>(undefined)

export const useJobContext = () => {
  const context = useContext(JobContext)
  if (!context) {
    throw new Error('useJobContext must be used within a JobProvider')
  }
  return context
}

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([])
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  const refreshJobs = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true) // Only fetch active jobs for candidates
    if (error) {
      console.error('Error fetching jobs:', error)
      setJobs([])
      setFilteredJobs([])
    } else {
      setJobs(data || [])
      setFilteredJobs(data || [])
    }
    setIsLoading(false)
  }

  const refreshAppliedJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        id,
        applied_at,
        job:jobs!inner (*)
      `)
      .eq('user_id', user.id)
      .eq('job.is_active', true) // Only show applications for active jobs
      .order('applied_at', { ascending: false })

    if (error) {
      console.error('Error fetching applied jobs:', error)
    } else {
      const typedAppliedJobs: AppliedJob[] = data.map((item: any) => ({
        id: item.id,
        applied_at: item.applied_at,
        job: item.job as Job
      }))
      setAppliedJobs(typedAppliedJobs)
    }
  }

  const refreshSavedJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('saved_jobs')
      .select(`
        id,
        saved_at,
        job:jobs!inner (*)
      `)
      .eq('user_id', user.id)
      .eq('job.is_active', true) // Only show saved jobs that are active
      .order('saved_at', { ascending: false })

    if (error) {
      console.error('Error fetching saved jobs:', error)
    } else {
      const typedSavedJobs: SavedJob[] = data.map((item: any) => ({
        id: item.id,
        saved_at: item.saved_at,
        job: item.job as Job
      }))
      setSavedJobs(typedSavedJobs)
    }
  }

  const applyToJob = async (jobId: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('job_applications')
      .insert({ job_id: jobId, user_id: user.id })

    if (error) {
      console.error('Error applying to job:', error)
      throw error
    }

    await refreshAppliedJobs()
  }

  const saveJob = async (jobId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth/login'
        return
      }

      const { error } = await supabase
        .from('saved_jobs')
        .insert({ job_id: jobId, user_id: user.id })

      if (error) throw error

      await refreshSavedJobs()
    } catch (error) {
      console.error('Failed to save job:', error)
      throw error
    }
  }

  const unsaveJob = async (jobId: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('job_id', jobId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error unsaving job:', error)
      throw error
    }

    await refreshSavedJobs()
  }

  useEffect(() => {
    refreshJobs()
    refreshAppliedJobs()
    refreshSavedJobs()
  }, [])

  return (
    <JobContext.Provider value={{
      jobs,
      filteredJobs,
      setFilteredJobs,
      appliedJobs,
      savedJobs,
      refreshJobs,
      refreshAppliedJobs,
      refreshSavedJobs,
      applyToJob,
      saveJob,
      unsaveJob,
      isLoading
    }}>
      {children}
    </JobContext.Provider>
  )
}