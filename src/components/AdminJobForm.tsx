'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AdminJobForm() {
  const [job, setJob] = useState({
    title: '',
    company: '',
    location: '',
    type: '',
    salary: '',
    description: '',
  })
  const supabase = createClientComponentClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setJob(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        ...job,
        salary: parseInt(job.salary),
      })

    if (error) {
      console.error('Error adding job:', error)
    } else {
      alert('Job added successfully!')
      setJob({
        title: '',
        company: '',
        location: '',
        type: '',
        salary: '',
        description: '',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="title"
        value={job.title}
        onChange={handleChange}
        placeholder="Job Title"
        className="w-full px-4 py-2 border rounded"
        required
      />
      <input
        type="text"
        name="company"
        value={job.company}
        onChange={handleChange}
        placeholder="Company"
        className="w-full px-4 py-2 border rounded"
        required
      />
      <input
        type="text"
        name="location"
        value={job.location}
        onChange={handleChange}
        placeholder="Location"
        className="w-full px-4 py-2 border rounded"
        required
      />
      <select
        name="type"
        value={job.type}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded"
        required
      >
        <option value="">Select Job Type</option>
        <option value="Full Time">Full Time</option>
        <option value="Part Time">Part Time</option>
        <option value="Contract">Contract</option>
        <option value="Internship">Internship</option>
      </select>
      <input
        type="number"
        name="salary"
        value={job.salary}
        onChange={handleChange}
        placeholder="Salary"
        className="w-full px-4 py-2 border rounded"
        required
      />
      <textarea
        name="description"
        value={job.description}
        onChange={handleChange}
        placeholder="Job Description"
        className="w-full px-4 py-2 border rounded"
        rows={4}
        required
      />
      <button
        type="submit"
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add Job
      </button>
    </form>
  )
}