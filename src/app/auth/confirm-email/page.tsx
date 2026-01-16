import Link from 'next/link'
import Image from 'next/image'

export default function ConfirmEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-3">
        <div className="flex justify-left mb-4">
            <Image
              src="/img/logo.svg"
              alt="Logo"
              width={180}
              height={180}
              priority
            />
          </div>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent you an email with a link to confirm your account. Please check your inbox and click the link to complete your registration.
          </p>
        </div>
        <div className="mt-5">
          <Link href="/auth/login" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  )
}