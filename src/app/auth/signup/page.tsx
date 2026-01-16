import AuthForm from '@/components/AuthForm'
import Link from 'next/link'
import Image from 'next/image'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left column (3/12) */}
      <div className="hidden lg:flex lg:w-3/12 p-4 ">
        <div className="w-full relative ">
          <Image
            src="/img/auth-banner.jpg"
            alt="Login background"
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
          Welcome, Let's get started
          </h2>
          <p className="mt-2 text-left text-sm text-gray-600 mt-0">
          Create your account to discover and connect with top talent or opportunities in just a few clicks!
          </p>
          {/* <div className="bg-indigo-100 border-l-4 border-indigo-500 text-grey-700 p-2" role="alert">
            <p className="font-bold">Important</p>
            <p>After signing up, you'll need to confirm your email address.</p>
          </div> */}
          <AuthForm mode="signup" />
          <div className="text-center mt-4">
            <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Already have an account? Log in
            </Link>
          </div>
          <div className="text-center mt-4">
            <Link href="/privacy-policy" className="font-medium text-indigo-500 hover:text-indigo-600">
              By continuing, you agree to our <span className="underline">Privacy Policy</span>
            </Link>
          </div>
          <div className="text-center mt-4">
            <Link href="/help-support" className="font-medium text-indigo-500 hover:text-indigo-600">
              Need help? <span className="underline">Contact Support</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}