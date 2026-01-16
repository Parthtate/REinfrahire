// 'use client'

// import { useState } from 'react'
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// import { useRouter } from 'next/navigation'
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Slider } from "@/components/ui/slider"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Alert, AlertDescription } from "@/components/ui/alert"

// export default function AddJobForm() {
//   const [title, setTitle] = useState('')
//   const [company, setCompany] = useState('')
//   const [location, setLocation] = useState('')
//   const [type, setType] = useState('')
//   const [salary, setSalary] = useState(50000)
//   const [description, setDescription] = useState('')
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const supabase = createClientComponentClient()
//   const router = useRouter()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsSubmitting(true)
//     setError(null)

//     const { data: { user } } = await supabase.auth.getUser()

//     if (!user) {
//       setError('You must be logged in to add a job')
//       setIsSubmitting(false)
//       return
//     }

//     const { data, error } = await supabase
//       .from('jobs')
//       .insert([
//         {
//           title,
//           company,
//           location,
//           type,
//           salary,
//           description,
//           created_by: user.id
//         }
//       ])

//     if (error) {
//       setError('Failed to add job. Please try again.')
//       console.error('Error adding job:', error)
//     } else {
//       router.push('/admin/jobs')
//       router.refresh()
//     }

//     setIsSubmitting(false)
//   }

//   return (
//     <Card className="w-full max-w-2xl mx-auto">
//       <CardHeader>
//         <CardTitle>Add New Job</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className='flex gap-2'>
//             <div className="space-y-2 w-1/2">
//               <Label htmlFor="title">Job Title</Label>
//               <Input
//                 id="title"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 required
//               />
//             </div>

//             <div className="space-y-2 w-1/2">
//               <Label htmlFor="company">Company</Label>
//               <Input
//                 id="company"
//                 value={company}
//                 onChange={(e) => setCompany(e.target.value)}
//                 required
//               />
//             </div>
//           </div>

//           <div className='flex gap-2'>
//             <div className="space-y-2 w-1/2">
//               <Label htmlFor="location">Location</Label>
//               <Input
//                 id="location"
//                 value={location}
//                 onChange={(e) => setLocation(e.target.value)}
//                 required
//               />
//             </div>

//             <div className="space-y-2 w-1/2">
//               <Label htmlFor="type">Job Type</Label>
//               <Select value={type} onValueChange={setType} required>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select a job type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Full Time">Full Time</SelectItem>
//                   <SelectItem value="Part Time">Part Time</SelectItem>
//                   <SelectItem value="Contract">Contract</SelectItem>
//                   <SelectItem value="Internship">Internship</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
          

          

//           <div className="space-y-2">
//             <Label htmlFor="salary">Salary</Label>
//             <Slider
//               id="salary"
//               min={50000}
//               max={5000000}
//               step={50000}
//               value={[salary]}
//               onValueChange={(value) => setSalary(value[0])}
//             />
//             <div className="flex justify-between text-sm text-muted-foreground">
//               <span>₹50,000</span>
//               <span>₹{salary.toLocaleString()}</span>
//               <span>₹50,00,000</span>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="description">Job Description</Label>
//             <Textarea
//               id="description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               required
//               rows={4}
//             />
//           </div>

//           {error && (
//             <Alert variant="destructive">
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}
//         </form>
//       </CardContent>
//       <CardFooter>
//         <Button type="submit" disabled={isSubmitting} className="w-full" onClick={handleSubmit}>
//           {isSubmitting ? 'Adding Job...' : 'Add Job'}
//         </Button>
//       </CardFooter>
//     </Card>
//   )
// }
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AddJobForm() {
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('')
  const [salary, setSalary] = useState(50000)
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFormValid, setIsFormValid] = useState(false)

  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const isValid = 
      title.trim() !== '' &&
      company.trim() !== '' &&
      location.trim() !== '' &&
      type !== '' &&
      description.trim() !== ''
    setIsFormValid(isValid)
  }, [title, company, location, type, description])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) {
      setError('Please fill in all fields before submitting.')
      return
    }
    setIsSubmitting(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to add a job')
      setIsSubmitting(false)
      return
    }

    const { data, error } = await supabase
      .from('jobs')
      .insert([
        {
          title,
          company,
          location,
          type,
          salary,
          description,
          created_by: user.id
        }
      ])

    if (error) {
      setError('Failed to add job. Please try again.')
      console.error('Error adding job:', error)
    } else {
      router.push('/admin/jobs')
      router.refresh()
    }

    setIsSubmitting(false)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Job</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className='flex gap-2'>
            <div className="space-y-2 w-1/2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 w-1/2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
          </div>

          <div className='flex gap-2'>
            <div className="space-y-2 w-1/2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 w-1/2">
              <Label htmlFor="type">Job Type</Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Time">Full Time</SelectItem>
                  <SelectItem value="Part Time">Part Time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">Salary</Label>
            <Slider
              id="salary"
              min={50000}
              max={5000000}
              step={50000}
              value={[salary]}
              onValueChange={(value) => setSalary(value[0])}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>₹50,000</span>
              <span>₹{salary.toLocaleString()}</span>
              <span>₹50,00,000</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          disabled={isSubmitting || !isFormValid} 
          className="w-full" 
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Adding Job...' : 'Add Job'}
        </Button>
      </CardFooter>
    </Card>
  )
}