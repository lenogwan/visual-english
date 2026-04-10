import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserId } from '@/lib/auth-utils'

async function getAuth(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) return null
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    return user
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { quizId, answers } = body

    if (!quizId || !answers) {
      return NextResponse.json({ error: 'Quiz ID and answers required' }, { status: 400 })
    }

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } })
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    const wordIds: string[] = JSON.parse(quiz.wordIds)
    const words = await prisma.word.findMany({ where: { id: { in: wordIds } } })

    let score = 0
    const results = words.map((word, idx) => {
      const userAnswer = answers[idx] || ''
      const correct = userAnswer.toLowerCase().trim() === word.word.toLowerCase().trim()
      if (correct) score++
      return { wordId: word.id, word: word.word, userAnswer, correct }
    })

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId: auth.id,
        score,
        total: words.length,
        details: results,
        completed: true,
      },
    })

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score,
      total: words.length,
      percentage: Math.round((score / words.length) * 100),
      results,
    })
  } catch (error) {
    console.error('Submit quiz error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const quizId = searchParams.get('quizId')

    if (!quizId) {
      return NextResponse.json({ error: 'Quiz ID required' }, { status: 400 })
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ attempts })
  } catch (error) {
    console.error('Get attempts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
