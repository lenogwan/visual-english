import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserId } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    
    // Fallback for anonymous users: get 10 random words
    if (!userId) {
        const count = await prisma.word.count()
        const skip = Math.max(0, Math.floor(Math.random() * (count - 10)))
        const randomWords = await prisma.word.findMany({ take: 10, skip })
        return NextResponse.json({
            queue: randomWords.map((w: any) => ({
              ...w,
              images: JSON.parse(w.images || '[]'),
              scenarioImages: JSON.parse(w.scenarioImages || '[]'),
              tags: JSON.parse(w.tags || '[]'),
              examples: JSON.parse(w.examples || '[]'),
            }))
        })
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { settings: true } })
    const settings = user?.settings ? JSON.parse(user.settings) : {}
    const dailyGoal = parseInt(settings.dailyGoal || '20')
    const targetLevel = settings.englishLevel || ''

    const where: any = {}
    if (targetLevel && targetLevel !== 'All') {
        where.level = targetLevel
    }

    const allWords = await prisma.word.findMany({ where })
    const progress = await prisma.userProgress.findMany({ where: { userId } })
    const progressMap = new Map(progress.map(p => [p.wordId, p]))

    const toReview = []
    const toLearn = []

    for (const word of allWords) {
      const p = progressMap.get(word.id)
      if (p && p.nextReviewDate && new Date(p.nextReviewDate) <= new Date()) {
        toReview.push({ ...word, progress: p })
      } else if (!p || !p.learned) {
        toLearn.push(word)
      }
    }

    const needed = Math.max(0, dailyGoal - toReview.length)
    const queue = [...toReview, ...toLearn.slice(0, needed)]

    return NextResponse.json({
      queue: queue.map((w: any) => ({
        ...w,
        progress: w.progress || null,
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
