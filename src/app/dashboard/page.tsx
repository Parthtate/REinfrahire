'use client'

import { useEffect, useState } from 'react'
import { JobProvider } from '@/contexts/JobContext'
import JobSearch from '@/components/JobSearch'
import JobList from '@/components/JobList'
import { Skeleton } from "@/components/ui/skeleton"

function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="w-full mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        <Skeleton className="h-12 w-full" /> {/* JobSearch skeleton */}
        <Skeleton className="h-6 w-32" /> {/* Total jobs count skeleton */}
        <div className="mt-4 sm:mt-6 md:mt-8">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} className="h-[150px] sm:h-[175px] md:h-[200px] w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full mx-auto space-y-4 sm:space-y-6 md:space-y-8">
      <JobSearch />
      <div className="mt-4 sm:mt-4 md:mt-4">
        <JobList />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <JobProvider>
      <DashboardContent />
    </JobProvider>
  )
}
// 'use client'

// import { useEffect, useState } from 'react'
// import { JobProvider } from '@/contexts/JobContext'
// import JobSearch from '@/components/JobSearch'
// import JobList from '@/components/JobList'
// import { Skeleton } from "@/components/ui/skeleton"

// function DashboardContent() {
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     // Simulate loading delay
//     const timer = setTimeout(() => setIsLoading(false), 1000)
//     return () => clearTimeout(timer)
//   }, [])

//   if (isLoading) {
//     return (
//       <div className="w-full mx-auto space-y-4 sm:space-y-6 md:space-y-8">
//         <Skeleton className="h-[150px] sm:h-[175px] md:h-[200px] w-full" /> {/* JobSearch skeleton */}
//         <div className="mt-4 sm:mt-6 md:mt-8">
//           <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
//             {[...Array(6)].map((_, index) => (
//               <Skeleton key={index} className="h-[150px] sm:h-[175px] md:h-[200px] w-full" />
//             ))}
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="w-full mx-auto space-y-4 sm:space-y-6 md:space-y-8">
//       <JobSearch />
//       <div className="mt-4 sm:mt-6 md:mt-8">
//         <JobList />
//       </div>
//     </div>
//   )
// }

// export default function DashboardPage() {
//   return (
//     <JobProvider>
//       <DashboardContent />
//     </JobProvider>
//   )
// }