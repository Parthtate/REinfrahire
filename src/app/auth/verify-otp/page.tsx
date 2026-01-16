import Link from 'next/link'
import Image from 'next/image'
import OTPVerificationForm from '@/components/OTPVerificationForm'

export default function VerifyOTPPage() {
  return (
    <div className='items-center justify-center min-h-screen bg-gray-100 flex'>        
        <div className="flex-column">
          <div className="flex justify-left mb-4">
                <Image
                  src="/img/logo.svg"
                  alt="Logo"
                  width={180}
                  height={180}
                  priority
                />
            </div>
            <OTPVerificationForm />
            <div className="text-center mt-4">
                <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Don't have an account? Sign up
                </Link>
            </div>
        </div>
    </div>
  )
}