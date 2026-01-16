'use client'

import { useState, useRef, useEffect } from 'react'
import { useJobContext } from '@/contexts/JobContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Search } from 'lucide-react'

const RangeSlider = ({ className, ...props }: SliderPrimitive.SliderProps) => (
  <SliderPrimitive.Root
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    {props.defaultValue?.map((_, index) => (
      <SliderPrimitive.Thumb
        key={index}
        className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      />
    ))}
  </SliderPrimitive.Root>
)

export default function JobSearch() {
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('all')
  const [salaryRange, setSalaryRange] = useState([0, 5000000])
  const { jobs, setFilteredJobs, refreshJobs, isLoading } = useJobContext()
  const [isOpen, setIsOpen] = useState(false)
  const [totalJobs, setTotalJobs] = useState(0)
  const dialogTriggerRef = useRef<HTMLButtonElement>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const filteredJobs = jobs.filter(job => {
      const titleMatch = job.title.toLowerCase().includes(title.toLowerCase())
      const locationMatch = job.location.toLowerCase().includes(location.toLowerCase())
      const typeMatch = type === 'all' || job.type === type
      const salaryMatch = job.salary >= salaryRange[0] && job.salary <= salaryRange[1]
      
      return titleMatch && locationMatch && typeMatch && salaryMatch
    })

    setFilteredJobs(filteredJobs)
    setTotalJobs(filteredJobs.length)
    setIsOpen(false)
  }

  const handleReset = async () => {
    setTitle('')
    setLocation('')
    setType('all')
    setSalaryRange([0, 5000000])
    await refreshJobs()
    setTotalJobs(jobs.length)
  }

  useEffect(() => {
    setTotalJobs(jobs.length)
  }, [jobs])

  return (
    <div className="w-full mx-auto">
      <div className='flex gap-4'>
        <div className='w-1/2 lg:w-1/4'>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div>
          <Button
            ref={dialogTriggerRef}
            variant="outline"
            className="w-full text-left font-normal justify-start"
          >
            <Search className="mr-2 h-4 w-4" />
            <span>{title || "Search for jobs..."}</span>
          </Button>

          </div>
          
          
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <div>
            <h2 className="text-2xl font-bold">Search Jobs</h2>
          </div>
          <div>
            <form onSubmit={handleSearch} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Job Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Job Type</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger id="type" className="w-full">
                        <SelectValue placeholder="Select Job Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Full Time">Full Time</SelectItem>
                        <SelectItem value="Part Time">Part Time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* <div className="space-y-2">
                    <Label>Salary Range</Label>
                    <RangeSlider
                      min={0}
                      max={5000000}
                      step={10000}
                      value={salaryRange}
                      onValueChange={setSalaryRange}
                      defaultValue={[0, 5000000]}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>₹{salaryRange[0].toLocaleString()}</span>
                      <span>₹{salaryRange[1].toLocaleString()}</span>
                    </div>
                  </div> */}
                </form>
          </div>
          <div className='flex gap-4'>
            <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading} className="w-full sm:w-auto">
              Reset
            </Button>
            <Button type="submit" onClick={handleSearch} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? 'Loading...' : 'Search Jobs'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        </div>
        <div className='w-1/4'>
        <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading} className="w-full sm:w-auto">
          Reset
        </Button>
        </div>
      </div>
      
      {/* <div className="mt-4 text-md text-gray-800">
        {totalJobs} job{totalJobs !== 1 ? 's' : ''} found.
      </div> */}
    </div>
  )
}
// 'use client'

// import { useState } from 'react'
// import { useJobContext } from '@/contexts/JobContext'
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Label } from "@/components/ui/label"
// import * as SliderPrimitive from '@radix-ui/react-slider'
// import { cn } from "@/lib/utils"

// const RangeSlider = ({ className, ...props }: SliderPrimitive.SliderProps) => (
//   <SliderPrimitive.Root
//     className={cn("relative flex w-full touch-none select-none items-center", className)}
//     {...props}
//   >
//     <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
//       <SliderPrimitive.Range className="absolute h-full bg-primary" />
//     </SliderPrimitive.Track>
//     {props.defaultValue?.map((_, index) => (
//       <SliderPrimitive.Thumb
//         key={index}
//         className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
//       />
//     ))}
//   </SliderPrimitive.Root>
// )

// export default function JobSearch() {
//   const [title, setTitle] = useState('')
//   const [location, setLocation] = useState('')
//   const [type, setType] = useState('all')
//   const [salaryRange, setSalaryRange] = useState([0, 5000000])
//   const { jobs, setFilteredJobs, refreshJobs, isLoading } = useJobContext()

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault()
    
//     const filteredJobs = jobs.filter(job => {
//       const titleMatch = job.title.toLowerCase().includes(title.toLowerCase())
//       const locationMatch = job.location.toLowerCase().includes(location.toLowerCase())
//       const typeMatch = type === 'all' || job.type === type
//       const salaryMatch = job.salary >= salaryRange[0] && job.salary <= salaryRange[1]
      
//       return titleMatch && locationMatch && typeMatch && salaryMatch
//     })

//     setFilteredJobs(filteredJobs)
//   }

//   const handleReset = async () => {
//     setTitle('')
//     setLocation('')
//     setType('all')
//     setSalaryRange([0, 5000000])
//     await refreshJobs()
//   }

//   return (
//     <Card className="w-full mx-auto">
//       <CardHeader>
//         <CardTitle className="text-2xl font-bold">Search Jobs</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSearch} className="space-y-4">
//           <div className="grid gap-4 sm:grid-cols-2">
//             <div className="space-y-2">
//               <Label htmlFor="title">Job Title</Label>
//               <Input
//                 id="title"
//                 type="text"
//                 placeholder="Job Title"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 className="w-full"
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="location">Location</Label>
//               <Input
//                 id="location"
//                 type="text"
//                 placeholder="Location"
//                 value={location}
//                 onChange={(e) => setLocation(e.target.value)}
//                 className="w-full"
//               />
//             </div>
//           </div>
//           <div className="grid gap-4 sm:grid-cols-2">
//             <div className="space-y-2">
//               <Label htmlFor="type">Job Type</Label>
//               <Select value={type} onValueChange={setType}>
//                 <SelectTrigger id="type" className="w-full">
//                   <SelectValue placeholder="Select Job Type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Types</SelectItem>
//                   <SelectItem value="Full Time">Full Time</SelectItem>
//                   <SelectItem value="Part Time">Part Time</SelectItem>
//                   <SelectItem value="Contract">Contract</SelectItem>
//                   <SelectItem value="Internship">Internship</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="space-y-2">
//               <Label>Salary Range</Label>
//               <RangeSlider
//                 min={0}
//                 max={5000000}
//                 step={10000}
//                 value={salaryRange}
//                 onValueChange={setSalaryRange}
//                 defaultValue={[0, 5000000]}
//                 className="w-full"
//               />
//               <div className="flex justify-between text-sm text-muted-foreground">
//                 <span>₹{salaryRange[0].toLocaleString()}</span>
//                 <span>₹{salaryRange[1].toLocaleString()}</span>
//               </div>
//             </div>
//           </div>
//         </form>
//       </CardContent>
//       <CardFooter className="flex flex-col sm:flex-row justify-left gap-4">
//         <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading} className="w-full sm:w-auto">
//           Reset
//         </Button>
//         <Button type="submit" onClick={handleSearch} disabled={isLoading} className="w-full sm:w-auto">
//           {isLoading ? 'Loading...' : 'Search Jobs'}
//         </Button>
//       </CardFooter>
//     </Card>
//   )
// }