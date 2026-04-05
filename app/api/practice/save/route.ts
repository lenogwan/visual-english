import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'visual-english-secret-key-change-in-production'

async function getAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { score, total } = await request.json()

    // Find or create a generic Practice quiz
    let practiceQuiz = await prisma.quiz.findFirst({
        where: { title: 'Practice Arena' }
    })

    if (!practiceQuiz) {
        // Find an admin to be the creator
        const admin = await prisma.user.findFirst({
            where: { role: { in: ['Admin', 'admin'] } }
        })
        
        practiceQuiz = await prisma.quiz.create({
            data: {
                id: 'practice-arena-generic',
                title: 'Practice Arena',
                description: 'Auto-generated practice session record',
                type: 'practice',
                wordIds: '[]',
                createdById: admin?.id || userId // Fallback to current user if no admin found
            }
        })
    }

    // Save the attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: practiceQuiz.id,
        userId: userId,
        score: score,
        total: total,
        completed: true,
      },
    })

    return NextResponse.json({ success: true, attempt })
  } catch (error) {
    console.error('Save practice error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
