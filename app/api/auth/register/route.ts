import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserId } from '@/lib/auth-utils'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.warn('WARNING: JWT_SECRET is not set. Using default. Set JWT_SECRET in production for security.')
    return 'visual-english-secret-key-change-in-production'
  }
  return secret
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    const { email, password, name, role } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Only admin can create users with specific roles
    let userRole = 'User'
    if (userId && role) {
      const admin = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
      if (admin?.role === 'Admin') {
        userRole = role
      }
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: userRole,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    // If not admin creating, just return user without token
    if (!userId) {
      const token = jwt.sign({ userId: user.id, role: user.role }, getJwtSecret(), { expiresIn: '7d' })
      return NextResponse.json({ user, token })
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
