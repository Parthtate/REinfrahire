'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Separator } from "@/components/ui/separator"
import { MapPin, Briefcase, DollarSign, Calendar, Building2, IndianRupee, TextSearch, BriefcaseBusiness, User, LogOut, LayoutDashboard, Users, FileText } from 'lucide-react'
import Image from 'next/image'


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error)
    } else {
      router.push('/auth/login')
    }
  }

  return (
    <div className="flex min-h-screen">
      
      <aside className="w-64 bg-gray-200 text-gray-800 p-6">
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Image
              src="/img/logo.svg"
              alt="Job Portal Logo"
              width={160}
              height={40}              
            />            
          </Link>
        </div>
        <nav className="space-y-4">
          <Link href="/admin/" className="block text-gray-700 hover:text-gray-900">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="h-4 w-4 text-white-400" />            
              <span>Dashboard</span>
            </div>                                    
          </Link>
          
          <Link href="/admin/jobs" className="block text-gray-700 hover:text-gray-900">          
            <div className="flex items-center space-x-2">
              <BriefcaseBusiness className="h-4 w-4 text-white-400" />            
              <span>Manage Jobs</span>
            </div>                                    
          </Link>
          <Link href="/admin/candidates" className="block text-gray-700 hover:text-gray-900">            
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-white-400" />            
              <span>View Candidates</span>
            </div>                                    
          </Link>
          <Link href="/admin/applications" className="block text-gray-700 hover:text-gray-900">            
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-white-400" />            
              <span>View Job Applications</span>
            </div>                                    
          </Link>

          <Separator className="my-4 bg-gray-600" />

          <button onClick={handleLogout} className="w-full text-left text-gray-700 hover:text-gray-900">
            <div className="flex items-center space-x-2">
              <LogOut className="h-4 w-4 text-white-400" />            
              <span>Logout</span>
            </div>                                    
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
