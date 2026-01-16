import Link from 'next/link'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white p-6">
      <nav className="space-y-4">
        <Link href="/dashboard" className="block hover:text-gray-300">
          Job Dashboard
        </Link>
        <Link href="/dashboard/applied-jobs" className="block hover:text-gray-300">
          Applied Jobs
        </Link>
        <Link href="/dashboard/profile" className="block hover:text-gray-300">
          My Profile
        </Link>
      </nav>
    </aside>
  )
}