import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserId } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    // Use raw query to include settings and gamification fields
    const users: any[] = await prisma.$queryRaw`
      SELECT "id", "email", "name", "role", "settings", "xp", "level", "streakCount", "streakFreezes", "createdAt" FROM "User" WHERE "id" = ${userId}
    `

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: users[0] })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}
