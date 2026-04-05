import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'visual-english-secret-key-change-in-production'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    
    // Use raw query to include settings (bypasses stale Prisma Client)
    const users: any[] = await prisma.$queryRaw`
      SELECT id, email, name, role, settings, createdAt FROM User WHERE id = ${decoded.userId}
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
