// 'use client'

// import { useState, useEffect } from 'react'
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// import { useJobContext } from '@/contexts/JobContext'
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Label } from "@/components/ui/label"
// import * as SliderPrimitive from '@radix-ui/react-slider'
// import { cn } from "@/lib/utils"

// type Job = {
//   id: number
//   title: string
//   company: string
//   location: string
//   type: string
//   salary: number
//   description: string
//   created_at: string
//   created_by: string
// }

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
//   const [type, setType] = useState('')
//   const [salaryRange, setSalaryRange] = useState([0, 500000])
//   const supabase = createClientComponentClient()
//   const { setJobs } = useJobContext()

//   const handleSearch = async (e: React.FormEvent) => {
//     e.preventDefault()
//     let query = supabase.from('jobs').select('*')

//     if (title) query = query.ilike('title', `%${title}%`)
//     if (location) query = query.ilike('location', `%${location}%`)
//     if (type && type !== 'all') query = query.eq('type', type)
//     query = query.gte('salary', salaryRange[0]).lte('salary', salaryRange[1])

//     const { data, error } = await query

//     if (error) {
//       console.error('Error searching jobs:', error)
//     } else {
//       setJobs(data as Job[])
//     }
//   }

//   useEffect(() => {
//     // Initial fetch of all jobs
//     const fetchAllJobs = async () => {
//       const { data, error } = await supabase.from('jobs').select('*')
//       if (error) {
//         console.error('Error fetching jobs:', error)
//       } else {
//         setJobs(data as Job[])
//       }
//     }
//     fetchAllJobs()
//   }, [supabase, setJobs])

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Search Jobs</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSearch} className="space-y-4">
//           <div className="flex gap-4">
//             <div className="space-y-2 w-1/2">
//               <Label htmlFor="title">Job Title</Label>
//               <Input
//                 id="title"
//                 type="text"
//                 placeholder="Job Title"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//               />
//             </div>
//             <div className="space-y-2 w-1/2">
//               <Label htmlFor="location">Location</Label>
//               <Input
//                 id="location"
//                 type="text"
//                 placeholder="Location"
//                 value={location}
//                 onChange={(e) => setLocation(e.target.value)}
//               />
//             </div>
//           </div>
//           <div className="flex gap-4">
//             <div className="space-y-2 w-1/2">
//               <Label htmlFor="type">Job Type</Label>
//               <Select value={type} onValueChange={setType}>
//                 <SelectTrigger id="type">
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
//             <div className="space-y-2 w-1/2">
//               <Label>Salary Range</Label>
//               <RangeSlider
//                 min={0}
//                 max={500000}
//                 step={10000}
//                 value={salaryRange}
//                 onValueChange={setSalaryRange}
//                 defaultValue={[0, 500000]}
//               />
//               <div className="flex justify-between text-sm text-muted-foreground">
//                 <span>₹{salaryRange[0].toLocaleString()}</span>
//                 <span>₹{salaryRange[1].toLocaleString()}</span>
//               </div>
//             </div>
//           </div>
//         </form>
//       </CardContent>
//       <CardFooter>
//         <Button type="submit" className="w-full" onClick={handleSearch}>
//           Search Jobs
//         </Button>
//       </CardFooter>
//     </Card>
//   )
// }