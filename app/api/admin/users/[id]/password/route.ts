import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'
import { hash } from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'visual-english-secret-key-change-in-production'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const adminUser = await prisma.user.findUnique({ where: { id: decoded.userId } })
    if (!adminUser || (adminUser.role.toLowerCase() !== 'admin' && adminUser.role.toLowerCase() !== 'teacher')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { newPassword } = await request.json()

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }

    const hashedPassword = await hash(newPassword, 10)

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ 
      message: 'Password reset successfully',
      user: { id: updatedUser.id, email: updatedUser.email } 
    })
  } catch (error: any) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
