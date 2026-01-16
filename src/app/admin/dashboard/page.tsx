import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <nav className="space-y-4">
        <Link href="/admin/jobs/add" className="block p-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
          Post New Job
        </Link>
        <Link href="/admin/jobs" className="block p-4 bg-green-500 text-white rounded hover:bg-green-600 transition">
          Manage Jobs
        </Link>
        <Link href="/admin/applications" className="block p-4 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">
          View Applications
        </Link>
      </nav>
    </div>
  )
}