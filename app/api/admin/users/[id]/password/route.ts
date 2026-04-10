import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserId } from '@/lib/auth-utils'
import { hash } from 'bcryptjs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = await getUserId(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!adminUser || (adminUser.role.toLowerCase() !== 'admin' && adminUser.role.toLowerCase() !== 'teacher')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { newPassword } = await request.json()

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }

    const hashedPassword = await hash(newPassword, 10)

    const updatedUser = await prisma.user.update({
      where: { id },
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
