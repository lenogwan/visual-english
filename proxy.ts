import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET_STR = process.env.JWT_SECRET || 'visual-english-secret-key-change-in-production'
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set. Using default. Set JWT_SECRET in production for security.')
}
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STR)

async function getRoleFromToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return (payload as { role?: string }).role || null
  } catch (e: any) {
    console.log('[Middleware] Verify error:', e.message)
    return null
  }
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  
  const { pathname } = request.nextUrl

  console.log('[Middleware] Path:', pathname, 'Token:', token ? 'YES' : 'NO')
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      console.log('[Middleware] Decoded:', payload)
    } catch(e: any) {
      console.log('[Middleware] Token verify failed:', e.message)
    }
  }

  const publicPaths = ['/', '/login', '/register', '/learn', '/search', '/practice', '/api/auth']
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))

  if (isPublicPath) {
    return NextResponse.next()
  }

  const publicApiPaths = ['/api/words', '/api/ai', '/api/practice', '/api/learn']
  const isPublicApi = publicApiPaths.some(path => pathname.startsWith(path))
  
  if (isPublicApi) {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const role = await getRoleFromToken(token)
  console.log('[Middleware] Role:', role)

  if (pathname.startsWith('/admin')) {
    if (!role) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (role.toLowerCase() !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (pathname.startsWith('/quiz/create') && role && role.toLowerCase() !== 'admin' && role.toLowerCase() !== 'teacher') {
    return NextResponse.redirect(new URL('/quiz', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
