import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'
import { hash, compare } from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'visual-english-secret-key-change-in-production'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    // Use raw query to access settings field (bypasses stale Prisma Client)
    const users: any[] = await prisma.$queryRaw`
      SELECT "id", "email", "name", "role", "settings" FROM "User" WHERE "id" = ${decoded.userId}
    `

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: users[0] })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const { name, settings, currentPassword, newPassword } = await request.json()

    // Fetch current user with raw query
    const users: any[] = await prisma.$queryRaw`
      SELECT "id", "email", "name", "role", "password", "settings" FROM "User" WHERE "id" = ${decoded.userId}
    `
    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const currentUser = users[0]

    // Build SET clauses dynamically
    const setClauses: string[] = []
    const values: any[] = []

    if (name !== undefined) {
      values.push(name)
      setClauses.push(`"name" = $${values.length}`)
    }

    if (settings !== undefined) {
      const settingsStr = typeof settings === 'object' ? JSON.stringify(settings) : settings
      values.push(settingsStr)
      setClauses.push(`"settings" = $${values.length}`)
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password required to change password' }, { status: 400 })
      }
      
      const isValid = await compare(currentPassword, currentUser.password)
      if (!isValid) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 })
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
      }

      const hashedPassword = await hash(newPassword, 10)
      values.push(hashedPassword)
      setClauses.push(`"password" = $${values.length}`)
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // Execute update with raw query
    const setClause = setClauses.join(', ')
    values.push(decoded.userId)
    await prisma.$executeRawUnsafe(
      `UPDATE "User" SET ${setClause} WHERE "id" = $${values.length}`,
      ...values
    )

    // Fetch updated user
    const updatedUsers: any[] = await prisma.$queryRaw`
      SELECT "id", "email", "name", "role", "settings" FROM "User" WHERE "id" = ${decoded.userId}
    `

    return NextResponse.json({ user: updatedUsers[0], message: 'Profile updated successfully' })
  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
