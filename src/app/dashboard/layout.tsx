'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Separator } from "@/components/ui/separator"
import { MapPin, Briefcase, DollarSign, Calendar, Building2, IndianRupee, TextSearch, BriefcaseBusiness, User, LogOut, MessageCircleQuestion, BookmarkCheck, Menu, X, BookText } from 'lucide-react'
import Image from 'next/image'
import HelpSupportModal from '@/components/HelpSupportModal'
import { FAQModal } from '@/components/FAQModal'
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient()
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (data) setUser(data)
      }
    }

    fetchUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  const NavLink = ({ href, icon: Icon, children }: { href: string; icon: React.ElementType; children: React.ReactNode }) => (
    <Link
      href={href}
      className={`block text-gray-700 hover:text-gray-900 ${pathname === href ? 'font-semibold' : ''}`}
      onClick={closeSidebar}
    >
      <div className="flex items-center space-x-2">
        <Icon className="h-4 w-4" />
        <span>{children}</span>
      </div>
    </Link>
  )

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <aside className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-gray-200 text-gray-800 p-6 fixed md:relative z-10 h-full min-h-svh overflow-y-auto transition-all duration-300 ease-in-out`}>
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard" className="flex items-center space-x-2" onClick={closeSidebar}>
            <Image
              src="/img/logo.svg"
              alt="Reinfrahire"
              width={160}
              height={40}              
            />            
          </Link>
          <button onClick={toggleSidebar} className="md:hidden">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="space-y-4">
          <NavLink href="/dashboard" icon={TextSearch}>Job Dashboard</NavLink>
          <NavLink href="/dashboard/applied-jobs" icon={BriefcaseBusiness}>Applied Jobs</NavLink>
          <NavLink href="/dashboard/saved-jobs" icon={BookmarkCheck}>Saved Jobs</NavLink>
          <NavLink href="/dashboard/profile" icon={User}>My Profile</NavLink>

          <Separator className="my-4 bg-gray-600" />

          <button onClick={() => { setIsHelpModalOpen(true); closeSidebar(); }} className="w-full text-left text-gray-700 hover:text-gray-900">            
            <div className="flex items-center space-x-2">
              <MessageCircleQuestion className="h-4 w-4" />            
              <span>Help & Support</span>
            </div>                                    
          </button>

          <button onClick={() => { setIsFAQModalOpen(true); closeSidebar(); }} className="w-full text-left text-gray-700 hover:text-gray-900">            
            <div className="flex items-center space-x-2">
              <BookText className="h-4 w-4" />            
              <span>FAQs</span>
            </div>                                    
          </button>

          <button onClick={handleLogout} className="w-full text-left text-gray-700 hover:text-gray-900">
            <div className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />            
              <span>Logout</span>
            </div>                                    
          </button>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-6 w-6" />
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-8 bg-gray-100">{children}</main>
      </div>
      {user && (
        <HelpSupportModal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
          user={user}
        />
      )}
      <FAQModal
        isOpen={isFAQModalOpen}
        onClose={() => setIsFAQModalOpen(false)}
      />
    </div>
  )
}
// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// import { Separator } from "@/components/ui/separator"
// import { MapPin, Briefcase, DollarSign, Calendar, Building2, IndianRupee, TextSearch, BriefcaseBusiness, User, LogOut, MessageCircleQuestion,BookmarkCheck } from 'lucide-react'
// import Image from 'next/image'
// import HelpSupportModal from '@/components/HelpSupportModal'

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const router = useRouter()
//   const supabase = createClientComponentClient()
//   const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
//   const [user, setUser] = useState<any>(null)

//   useEffect(() => {
//     const fetchUser = async () => {
//       const { data: { user } } = await supabase.auth.getUser()
//       if (user) {
//         const { data, error } = await supabase
//           .from('users')
//           .select('*')
//           .eq('id', user.id)
//           .single()
        
//         if (data) setUser(data)
//       }
//     }

//     fetchUser()
//   }, [supabase])

//   const handleLogout = async () => {
//     await supabase.auth.signOut()
//     router.push('/auth/login')
//   }

//   return (
//     <div className="flex min-h-screen">
//       <aside className="w-64 bg-gray-200 text-gray-800 p-6">
//         <div className="mb-8">
//           <Link href="/dashboard" className="flex items-center space-x-2">
//             <Image
//               src="/img/logo.svg"
//               alt="REInfraHire"
//               width={160}
//               height={40}              
//             />            
//           </Link>
//         </div>
//         <nav className="space-y-4">
//           <Link href="/dashboard" className="block text-gray-700 hover:text-gray-900">
//             <div className="flex items-center space-x-2">
//               <TextSearch className="h-4 w-4 text-white-400" />            
//               <span>Job Dashboard</span>
//             </div>                                    
//           </Link>
          
//           <Link href="/dashboard/applied-jobs" className="block text-gray-700 hover:text-gray-900">          
//             <div className="flex items-center space-x-2">
//               <BriefcaseBusiness className="h-4 w-4 text-white-400" />            
//               <span>Applied Jobs</span>
//             </div>                                    
//           </Link>
//           <Link href="/dashboard/saved-jobs" className="block text-gray-700 hover:text-gray-900">          
//             <div className="flex items-center space-x-2">
//               <BookmarkCheck className="h-4 w-4 text-white-400" />            
//               <span>Saved Jobs</span>
//             </div>                                    
//           </Link>
//           <Link href="/dashboard/profile" className="block text-gray-700 hover:text-gray-900">            
//             <div className="flex items-center space-x-2">
//               <User className="h-4 w-4 text-white-400" />            
//               <span>My Profile</span>
//             </div>                                    
//           </Link>

//           <Separator className="my-4 bg-gray-600" />

//           <button onClick={() => setIsHelpModalOpen(true)} className="w-full text-left text-gray-700 hover:text-gray-900">            
//             <div className="flex items-center space-x-2">
//               <MessageCircleQuestion className="h-4 w-4 text-white-400" />            
//               <span>Help & Support</span>
//             </div>                                    
//           </button>

//           <button onClick={handleLogout} className="w-full text-left text-gray-700 hover:text-gray-900">
//             <div className="flex items-center space-x-2">
//               <LogOut className="h-4 w-4 text-white-400" />            
//               <span>Logout</span>
//             </div>                                    
//           </button>
//         </nav>
//       </aside>
//       <main className="flex-1 p-8 bg-gray-100">{children}</main>
//       {user && (
//         <HelpSupportModal
//           isOpen={isHelpModalOpen}
//           onClose={() => setIsHelpModalOpen(false)}
//           user={user}
//         />
//       )}
//     </div>
//   )
// }