interface User {
  role?: string
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
