// import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next()
//   const supabase = createMiddlewareClient({ req, res })

//   const {
//     data: { user },
//   } = await supabase.auth.getUser()

//   // Check if user is authenticated
//   if (!user) {
//     return NextResponse.redirect(new URL('/auth/signin', req.url))
//   }

//   // Check user role
//   const { data, error } = await supabase
//     .from('users')
//     .select('role')
//     .eq('id', user.id)
//     .single()

//   if (error) {
//     console.error('Error fetching user role:', error)
//     return NextResponse.redirect(new URL('/auth/signin', req.url))
//   }

//   // Redirect based on role and requested path
//   const path = req.nextUrl.pathname

//   if (path.startsWith('/admin') && data.role !== 'admin') {
//     return NextResponse.redirect(new URL('/candidate/dashboard', req.url))
//   }

//   if (path.startsWith('/candidate') && data.role === 'admin') {
//     return NextResponse.redirect(new URL('/admin/dashboard', req.url))
//   }

//   return res
// }

// export const config = {
//   matcher: ['/admin/:path*', '/candidate/:path*'],
// }

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If the user is not logged in and trying to access a protected route, redirect to login
  if (!user && req.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // If the user is logged in but not an admin, redirect to dashboard
  if (user && req.nextUrl.pathname.startsWith('/admin')) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*'],
}