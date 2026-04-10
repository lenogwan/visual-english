import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { entryPassword } = await request.json()

    if (!entryPassword || entryPassword.length !== 6) {
      return NextResponse.json({ error: 'Valid 6-digit password is required' }, { status: 400 })
    }

    const quiz = await prisma.quiz.findUnique({
      where: { entryPassword },
      select: { id: true, title: true, isActive: true }
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found. Please check your password.' }, { status: 404 })
    }

    if (!quiz.isActive) {
      return NextResponse.json({ error: 'This quiz is no longer active.' }, { status: 403 })
    }

    return NextResponse.json({ success: true, quizId: quiz.id, title: quiz.title })
  } catch (error) {
    console.error('Join quiz error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
