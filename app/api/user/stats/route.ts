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

    const [stats, history, progress, totalWords] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { settings: true } }),
      prisma.practiceHistory.findMany({ 
        where: { userId, timestamp: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        orderBy: { timestamp: 'asc' }
      }),
      prisma.userProgress.findMany({ where: { userId } }),
      prisma.word.count()
    ])

    const settings = stats?.settings ? JSON.parse(stats.settings) : {}
    const dailyGoal = parseInt(settings.dailyGoal || '20')
    const todayProgress = progress.filter(p => p.lastReviewedAt && p.lastReviewedAt > new Date(new Date().setHours(0,0,0,0))).length

    // Generate 30-day Trend
    const trend = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (29 - i))
      const dateStr = d.toISOString().split('T')[0]
      const dayHistory = history.filter(h => h.timestamp.toISOString().split('T')[0] === dateStr)
      const accuracy = dayHistory.length ? Math.round((dayHistory.filter(h => h.isCorrect).length / dayHistory.length) * 100) : -1
      return { day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), accuracy }
    })

    const mistakeCounts = history.filter(h => !h.isCorrect).reduce((acc: any, h) => {
        const wordText = h.word?.word || 'Unknown';
        acc[wordText] = (acc[wordText] || 0) + 1
        return acc
    }, {})
    
    const refinementWords = Object.entries(mistakeCounts)
        .sort((a: any, b: any) => (b[1] as number) - (a[1] as number))
        .slice(0, 5)
        .map(([word, count]) => ({ word, count }))

    const masteredCount = progress.filter(p => p.masteryLevel >= 4).length
    
    return NextResponse.json({
        dailyGoal,
        todayProgress,
        totalLearned: progress.filter(p => p.learned).length,
        totalReviewed: progress.reduce((acc, p) => acc + p.timesReviewed, 0),
        totalWords,
        accuracy: history.length ? Math.round((history.filter(h => h.isCorrect).length / history.length) * 100) : 100,
        dueForReview: progress.filter(p => p.nextReviewDate <= new Date()).length,
        masteryScore: totalWords ? Math.round((masteredCount / totalWords) * 100) : 0,
        refinementWords,
        trend
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
