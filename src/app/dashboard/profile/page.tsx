'use client'
import ProfileForm from '@/components/ProfileForm'
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()

  return (
    <div className="w-full mx-auto">
      <div>
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')} 
          className="mb-4 flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
          <h1 className="text-3xl font-bold mb-4">My Profile</h1>
        </div>      
      <ProfileForm />
    </div>
  )
}