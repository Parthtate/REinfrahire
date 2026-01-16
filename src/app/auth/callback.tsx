'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error during auth callback:', error)
        router.push('/auth/login')
      } else {
        router.push('/dashboard')
      }
    }

    handleAuthCallback()
  }, [router, supabase.auth])

  return <p>Processing authentication, please wait...</p>
}