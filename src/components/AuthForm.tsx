'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'

type AuthFormProps = {
  mode: 'login' | 'signup' | 'reset'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const validatePhone = (phone: string) => {
    return phone.length === 10 && /^[0-9]{10}$/.test(phone)
  }

  const isFormValid = () => {
    if (mode === 'signup') {
      return email && password && firstName && lastName && validatePhone(phone)
    }
    if (mode === 'reset') {
      return email
    }
    return email && password
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (mode === 'signup' && !validatePhone(phone)) {
      setError('Please enter a valid 10-digit phone number')
      setIsLoading(false)
      return
    }

    try {
      if (mode === 'signup') {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              phone,
            },
          },
        })
        if (authError) {
          if (authError.message.includes('User already registered')) {
            throw new Error('An account with this email already exists. Please try logging in instead.')
          }
          throw authError
        }

        if (authData.user) {
          // Use the service role key to insert user data
          const serviceRoleSupabase = createClientComponentClient({
            supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
          })

          // Insert data into users table
          const { error: insertUserError } = await serviceRoleSupabase
            .from('users')
            .upsert({
              id: authData.user.id,
              email,
              first_name: firstName,
              last_name: lastName,
              phone,
              role: 'candidate', // Set default role to 'candidate' for new signups
              is_active: true, // Set the account as active by default
            }, { onConflict: 'id' })

          if (insertUserError) {
            throw new Error('Failed to create user profile. Maybe the email is already registered. Try logging in or contact support.')
          }

          // Insert data into user_profiles table
          const { error: insertProfileError } = await serviceRoleSupabase
            .from('user_profiles')
            .upsert({
              id: authData.user.id,
              first_name: firstName,
              last_name: lastName,
              email,
              phone,
            }, { onConflict: 'id' })

          if (insertProfileError) {
            throw new Error('Failed to create user profile. Please try again.')
          }

          // Store email in localStorage for OTP verification
          localStorage.setItem('verificationEmail', email)
          router.push('/auth/verify-otp')
        }
      } else if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please try again.')
          }
          throw error
        }

        // Fetch user role and active status from the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role, is_active')
          .eq('id', data.user.id)
          .single()

        if (userError) {
          throw new Error('Failed to fetch user data. Please try again.')
        }

        if (!userData.is_active) {
          throw new Error('This account has been deactivated. Please contact support for assistance.')
        }

        // Get the redirect URL from the query parameters
        const searchParams = new URLSearchParams(window.location.search)
        const redirectTo = searchParams.get('redirectedFrom')

        console.log('User role:', userData.role)
        console.log('Redirect URL:', redirectTo)

        // Redirect based on user role
        if (userData.role === 'admin') {
          // For admin users, redirect to admin dashboard
          window.location.href = '/admin'
        } else {
          // For regular users, redirect to user dashboard
          window.location.href = '/dashboard'
        }
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        if (error) {
          if (error.message.includes('User not found')) {
            throw new Error('No account found with this email address.')
          }
          throw error
        }
        setResetSent(true)
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred. Please try again later.')
      }
      console.error('Auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {mode === 'login' ? 'Log In' : mode === 'signup' ? 'Sign Up' : 'Reset Password'}
        </CardTitle>
        <CardDescription>
          {mode === 'login' ? 'Enter your credentials to log in' : 
           mode === 'signup' ? 'Create a new account' : 
           'Enter your email to reset your password'}
        </CardDescription>
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
          {resetSent && (
            <Alert>
              <AlertTitle>Password Reset Email Sent</AlertTitle>
              <AlertDescription>Check your email for further instructions.</AlertDescription>
            </Alert>
          )}
          {mode === 'signup' && (
            <>
              <div className='flex gap-2'>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 w-1/2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (10 digits)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setPhone(value)
                    if (value.length > 0 && value.length !== 10) {
                      setError('Phone number must be exactly 10 digits')
                    } else {
                      setError(null)
                    }
                  }}
                  required
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit phone number"
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {mode !== 'reset' && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={togglePasswordVisibility}
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
          )}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'login' ? 'Logging in...' : mode === 'signup' ? 'Signing up...' : 'Sending...'}
              </>
            ) : (
              mode === 'login' ? 'Log In' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        {mode === 'login' && (
          <Button variant="link" onClick={() => router.push('/auth/reset-password')}>
            Forgot your password?
          </Button>
        )}
        {mode === 'reset' && (
          <Button variant="link" onClick={() => router.push('/auth/login')}>
            Back to Login
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}