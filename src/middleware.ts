import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get the current path
  const path = req.nextUrl.pathname

  // Define public paths that don't require authentication
  const publicPaths = ['/auth/login', '/auth/signup', '/', '/auth/reset-password']
  const isPublicPath = publicPaths.includes(path)

  // If the user is not signed in and the path is not public, redirect to login
  if (!session && !isPublicPath) {
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirectedFrom', path)
    return NextResponse.redirect(redirectUrl)
  }

  // If the user is signed in and trying to access auth pages, redirect to home
  if (session && (path === '/auth/login' || path === '/auth/signup')) {
    // Check user role and redirect accordingly
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userData?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url))
    } else {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Role-based access control
  if (session) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    // Admin routes protection
    if (path.startsWith('/admin') && userData?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Dashboard routes protection
    if (path.startsWith('/dashboard') && userData?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
  }

  return res
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    // Protect specific routes that require authentication
    '/admin/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/jobs/:path*',
    '/applications/:path*',
  ],
} 