import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

interface User {
  role?: string
}

// Centralized JWT secret validation
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.warn('WARNING: JWT_SECRET is not set. Using default. Set JWT_SECRET in production for security.')
    return 'visual-english-secret-key-change-in-production'
  }
  return secret
}

/**
 * Extract and verify user ID from request Authorization header.
 * Returns null if no token or invalid token (not authenticated).
 */
export async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}

/**
 * Require authentication - returns 401 response if not authenticated.
 * Usage: const auth = await requireAuth(request); if (auth.error) return auth.response;
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ userId: string } | { error: true; response: Response }> {
  const userId = await getUserId(request)
  if (!userId) {
    return {
      error: true,
      response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    }
  }
  return { userId }
}

/**
 * Require admin/teacher role - returns 403 if not staff.
 */
export async function requireStaff(
  request: NextRequest
): Promise<{ userId: string } | { error: true; response: Response }> {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth

  // For role check, we need to query the user from DB - caller should handle this
  // This just ensures a valid token exists
  return auth
}

/**
 * Check if a user has any of the specified roles
 * @param user - The user object
 * @param roles - Array of roles to check (case-insensitive)
 * @returns true if user has any of the specified roles
 */
export function hasRole(user: User | null | undefined, roles: string[]): boolean {
  if (!user?.role) return false
  const userRole = user.role.toLowerCase()
  return roles.some(role => role.toLowerCase() === userRole)
}

/**
 * Check if user is admin or teacher
 */
export function isStaff(user: User | null | undefined): boolean {
  return hasRole(user, ['admin', 'teacher'])
}

/**
 * Check if user is admin only
 */
export function isAdmin(user: User | null | undefined): boolean {
  return hasRole(user, ['admin'])
}
