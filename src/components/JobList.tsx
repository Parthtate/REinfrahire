'use client'

import { useJobContext } from '@/contexts/JobContext'
import JobCard from './JobCard'
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from 'react'
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MapPin, Briefcase } from 'lucide-react'

export default function JobList() {
  const { filteredJobs, isLoading } = useJobContext()
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [jobTypes, setJobTypes] = useState<string[]>([])

  useEffect(() => {
    // Extract unique locations and job types from jobs
    const uniqueLocations = Array.from(new Set(filteredJobs.map(job => job.location)))
    const uniqueJobTypes = Array.from(new Set(filteredJobs.map(job => job.job_category)))
    setLocations(uniqueLocations)
    setJobTypes(uniqueJobTypes)
  }, [filteredJobs])

  const handleLocationChange = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location)
        : [...prev, location]
    )
  }

  const handleJobTypeChange = (type: string) => {
    setSelectedJobTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const selectAllLocations = () => setSelectedLocations(locations)
  const deselectAllLocations = () => setSelectedLocations([])
  const selectAllJobTypes = () => setSelectedJobTypes(jobTypes)
  const deselectAllJobTypes = () => setSelectedJobTypes([])

  const filteredJobsByCriteria = filteredJobs
    .filter(job => {
      const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(job.location)
      const matchesJobType = selectedJobTypes.length === 0 || selectedJobTypes.includes(job.job_category)
      return matchesLocation && matchesJobType
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort by date descending (latest first)

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <Skeleton key={index} className="h-[200px] w-full" />
        ))}
      </div>
    )
  }

  if (filteredJobs.length === 0) {
    return <div className="text-center text-gray-500 mt-8">No jobs found matching your criteria.</div>
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Available Jobs</h2>
          <div className="mt-1 text-sm text-gray-600">
            Listing {filteredJobsByCriteria.length} job{filteredJobsByCriteria.length !== 1 ? 's' : ''} of {filteredJobs.length} total
          </div>
        </div>
        <div className="flex gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location ({selectedLocations.length})
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="flex justify-between mb-2">
                <Button variant="ghost" size="sm" onClick={selectAllLocations}>Select All</Button>
                <Button variant="ghost" size="sm" onClick={deselectAllLocations}>Deselect All</Button>
              </div>
              <ScrollArea className="h-72">
                <div className="space-y-2">
                  {locations.map(location => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={`location-${location}`}
                        checked={selectedLocations.includes(location)}
                        onCheckedChange={() => handleLocationChange(location)}
                      />
                      <label htmlFor={`location-${location}`}>{location}</label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Job Type ({selectedJobTypes.length})
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="flex justify-between mb-2">
                <Button variant="ghost" size="sm" onClick={selectAllJobTypes}>Select All</Button>
                <Button variant="ghost" size="sm" onClick={deselectAllJobTypes}>Deselect All</Button>
              </div>
              <ScrollArea className="h-72">
                <div className="space-y-2">
                  {jobTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={selectedJobTypes.includes(type)}
                        onCheckedChange={() => handleJobTypeChange(type)}
                      />
                      <label htmlFor={`type-${type}`}>{type}</label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {filteredJobsByCriteria.length === 0 ? (
        <p className="text-center text-muted-foreground">No jobs found. Try adjusting your search criteria.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 gap-4 xl:grid-cols-2">
          {filteredJobsByCriteria.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}