'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import Image from 'next/image'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Check if the user is authenticated
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // If not authenticated, redirect to login page
        router.push('/auth/login')
      }
    }
    checkSession()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      setSuccess(true)
      // Redirect to dashboard after successful password update
      setTimeout(() => router.push('/dashboard'), 3000)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred')
      }
      console.error('Password update error:', error)
    }
  }

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      setShowPassword(!showPassword)
    } else {
      setShowConfirmPassword(!showConfirmPassword)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left column (3/12) */}
      <div className="hidden lg:flex lg:w-3/12 p-4 ">
        <div className="w-full relative ">
          <Image
            src="/img/auth-banner.jpg"
            alt="Update password background"
            layout="fill"
            objectFit="cover"
            priority
            className='rounded-3xl'
          />
        </div>
      </div>

      {/* Right column (9/12) */}
      
      <div className="w-full lg:w-9/12 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">        
        
        <Card className="w-full max-w-md">
          <CardHeader>
              <div className="lg:hidden flex justify-left mb-4">
              <Image
                src="/img/logo.svg"
                alt="Logo"
                width={180}
                height={180}
                priority
              />
            </div>
            <CardTitle>Update Your Password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>Your password has been updated. Redirecting to dashboard...</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('password')}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}