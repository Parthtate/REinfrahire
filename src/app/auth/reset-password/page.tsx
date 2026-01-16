import AuthForm from '@/components/AuthForm'
import Link from 'next/link'
import Image from 'next/image'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left column (3/12) */}
      <div className="hidden lg:flex lg:w-3/12 p-4 ">
        <div className="w-full relative ">
          <Image
            src="/img/auth-banner.jpg"
            alt="Reset password background"
            layout="fill"
            objectFit="cover"
            priority
            className='rounded-3xl'
          />
        </div>
      </div>

      {/* Right column (9/12) */}
      <div className="w-full lg:w-9/12 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-3">
          <div className="lg:hidden flex justify-left mb-4">
            <Image
              src="/img/logo.svg"
              alt="Logo"
              width={180}
              height={180}
              priority
            />
          </div>
          <h2 className="mt-6 text-left text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
          <p>Enter your email address and we'll send you instructions to reset your password.</p>
          <AuthForm mode="reset" />
          {/* <div className="text-center mt-4">
            <Link href="/auth/login" className="font-medium text-indigo-500 hover:text-indigo-600">
              Remember your password? Log in
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  )
}