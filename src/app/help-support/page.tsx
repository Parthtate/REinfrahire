'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function HelpSupportPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [category, setCategory] = useState('')
  const [query, setQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (submitError || submitSuccess) {
      timer = setTimeout(() => {
        setSubmitError(null)
        setSubmitSuccess(false)
      }, 4000)
    }
    return () => clearTimeout(timer)
  }, [submitError, submitSuccess])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    // Validate phone number
    if (phone.length !== 10 || !/^[0-9]{10}$/.test(phone)) {
      setSubmitError('Phone number must be exactly 10 digits')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/help-support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          category,
          query,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit query')
      }

      setSubmitSuccess(true)
      setQuery('')
      setFirstName('')
      setLastName('')
      setEmail('')
      setPhone('')
      setCategory('')
    } catch (error) {
      setSubmitError('Failed to submit query. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Help & Support</h1>
          <p className="text-lg text-gray-600">
            Need assistance? We're here to help! Submit your query and we'll get back to you as soon as possible.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>
              Fill out the form below and our support team will respond to your inquiry promptly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (10 digits) <span className="text-red-500">*</span></Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                    if (value.length <= 10) {
                      setPhone(value);
                    }
                  }}
                  required
                  placeholder="Enter your 10-digit phone number"
                  maxLength={10}
                  pattern="[0-9]{10}"
                />
                <div className="text-sm text-gray-500">
                  {phone.length}/10 digits {phone.length === 10 ? '✓' : ''}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="suggestion">Suggestion</SelectItem>
                    <SelectItem value="account deletion">Account Deletion</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="query">Your Query <span className="text-red-500">*</span></Label>
                <Textarea
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  required
                  className="min-h-[120px]"
                  placeholder="Please describe your question or issue in detail..."
                />
              </div>

              {submitError && (
                <Alert variant="destructive">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}
              
              {submitSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    Your query has been submitted successfully! We'll get back to you soon.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Submitting...' : 'Submit Query'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                >
                  Go Back
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Other Ways to Reach Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-600">contact@nppmt.com</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                  <p className="text-gray-600">+91 9970173969</p>
                  <p className="text-gray-600">+91 9970960969</p>
                  <p className="text-gray-600">+91 2061095099</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
                  <p className="text-gray-600">
                    NP'S PROJECT MANAGEMENT AND TECHNOLOGY PRIVATE LIMITED<br />
                    801, LMS Finswell, Sakore Nagar,<br />
                    Viman Nagar, Pune, Pune-411014, Maharashtra
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 