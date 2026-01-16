import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, FileText } from "lucide-react"


export default async function AdminDashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const fetchCount = async (table: string, condition?: { column: string; value: any }) => {
    let query = supabase.from(table).select('*', { count: 'exact', head: true })
    if (condition) {
      query = query.eq(condition.column, condition.value)
    }
    const { count, error } = await query
    if (error) {
      console.error(`Error fetching ${table} count:`, error)
      return 0
    }
    return count ?? 0
  }

  const jobsCount = await fetchCount('jobs')
  const candidatesCount = await fetchCount('users', { column: 'role', value: 'candidate' })
  const applicationsCount = await fetchCount('job_applications')

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              Total Jobs
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobsCount}</div>
            <p className="text-xs text-muted-foreground">
              Jobs posted on the platform
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              Total Candidates
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidatesCount}</div>
            <p className="text-xs text-muted-foreground">
              Registered candidates
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              Total Applications
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationsCount}</div>
            <p className="text-xs text-muted-foreground">
              Job applications submitted
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}