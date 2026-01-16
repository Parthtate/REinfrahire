import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type HelpSupportModalProps = {
  isOpen: boolean
  onClose: () => void
  user: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
}

export default function HelpSupportModal({ isOpen, onClose, user }: HelpSupportModalProps) {
  const [firstName, setFirstName] = useState(user.first_name)
  const [lastName, setLastName] = useState(user.last_name)
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user.phone)
  const [category, setCategory] = useState('')
  const [query, setQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

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
      // Replace this with your actual API endpoint
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
      setCategory('')
    } catch (error) {
      setSubmitError('Failed to submit query. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Help & Support</DialogTitle>
          <DialogDescription>
            Submit your query and we'll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                readOnly
                className="bg-gray-100"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly
              className="bg-gray-100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (10 digits)</Label>
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
              readOnly
              className="bg-gray-100"
              maxLength={10}
              pattern="[0-9]{10}"
            />
            <div className="text-sm text-gray-500">
              {phone.length}/10 digits {phone.length === 10 ? '✓' : ''}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
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
            <Label htmlFor="query">Your Query</Label>
            <Textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
              className="min-h-[100px]"
            />
          </div>
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          {submitSuccess && (
            <Alert>
              <AlertDescription>Your query has been submitted successfully!</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Query'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}