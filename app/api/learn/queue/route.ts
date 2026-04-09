import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'visual-english-secret-key-change-in-production'

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return decoded.userId
  } catch { return null }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { settings: true } })
    const settings = user?.settings ? JSON.parse(user.settings) : {}
    const dailyGoal = parseInt(settings.dailyGoal || '20')
    const targetLevel = settings.englishLevel || ''

    const allWords = await prisma.word.findMany()

    const progress = await prisma.userProgress.findMany({ where: { userId } })
    const progressMap = new Map(progress.map(p => [p.wordId, p]))

    const toReview = []
    const toLearn = []

    for (const word of allWords) {
      const p = progressMap.get(word.id)
      if (p && p.nextReviewDate <= new Date()) {
        toReview.push({ ...word, progress: p })
      } else if (!p || !p.learned) {
        toLearn.push(word)
      }
    }

    const sortedToLearn = toLearn.sort((a, b) => {
        if (targetLevel) {
          if (a.level === targetLevel && b.level !== targetLevel) return -1
          if (a.level !== targetLevel && b.level === targetLevel) return 1
        }
        return 0
    })

    const queue = [...toReview, ...sortedToLearn.slice(0, dailyGoal - toReview.length)]

    return NextResponse.json({
      queue: queue.map((w: any) => ({
        ...w,
        images: JSON.parse(w.images || '[]'),
        scenarioImages: JSON.parse(w.scenarioImages || '[]'),
        tags: JSON.parse(w.tags || '[]'),
        examples: JSON.parse(w.examples || '[]'),
      }))
    })
  } catch (error) {
    console.error('Queue API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
