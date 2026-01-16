// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { AlertCircle } from "lucide-react"

// export default function OTPVerificationForm() {
//   const [otp, setOtp] = useState('')
//   const [email, setEmail] = useState('')
//   const [error, setError] = useState<string | null>(null)
//   const router = useRouter()
//   const supabase = createClientComponentClient({
//     supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//   })

//   useEffect(() => {
//     const storedEmail = localStorage.getItem('verificationEmail')
//     if (storedEmail) {
//       setEmail(storedEmail)
//     } else {
//       setError('Email not found. Please try signing up again.')
//     }
//   }, [])

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError(null)

//     if (!email) {
//       setError('Email not found. Please try signing up again.')
//       return
//     }

//     try {
//       const { error } = await supabase.auth.verifyOtp({
//         email,
//         token: otp,
//         type: 'signup'
//       })

//       if (error) throw error

//       localStorage.removeItem('verificationEmail')
//       router.push('/dashboard')
//     } catch (error) {
//       if (error instanceof Error) {
//         setError(error.message)
//       } else {
//         setError('An unexpected error occurred')
//       }
//       console.error('Verification error:', error)
//     }
//   }

//   return (
//     <Card className="w-full max-w-md">
//       <CardHeader>
//         <CardTitle>Verify Your Email</CardTitle>
//         <CardDescription>
//           Enter the verification code sent to your email
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {error && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertTitle>Error</AlertTitle>
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}
//           <div className="space-y-2">
//             <Label htmlFor="otp">Verification Code</Label>
//             <Input
//               id="otp"
//               type="text"
//               placeholder="Enter verification code"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               required
//             />
//           </div>
//           <Button type="submit" className="w-full">
//             Verify
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function OTPVerificationForm() {
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const storedEmail = localStorage.getItem('verificationEmail')
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      setError('Email not found. Please try signing up again.')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError('Email not found. Please try signing up again.')
      return
    }

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      })

      if (error) throw error

      localStorage.removeItem('verificationEmail')
      router.push('/dashboard')
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred')
      }
      console.error('Verification error:', error)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>
          Enter the verification code sent to your email. Please check your spam folder if you don't see it in your inbox.
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
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter verification code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Verify
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}