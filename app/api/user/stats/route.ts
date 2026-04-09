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
        where: { userId, timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        include: { word: true } 
      }),
      prisma.userProgress.findMany({ where: { userId } }),
      prisma.word.count()
    ])

    const settings = stats?.settings ? JSON.parse(stats.settings) : {}
    const dailyGoal = parseInt(settings.dailyGoal || '20')
    const todayProgress = progress.filter(p => p.lastReviewedAt && p.lastReviewedAt > new Date(new Date().setHours(0,0,0,0))).length

    // Aggregate mistakes by Word Name
    const mistakeCounts = history.filter(h => !h.isCorrect).reduce((acc: any, h) => {
        const wordText = h.word?.word || 'Unknown';
        acc[wordText] = (acc[wordText] || 0) + 1
        return acc
    }, {})
    
    const refinementWords = Object.entries(mistakeCounts)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)
        .map(([word, count]) => ({ word, count }))

    // 記憶健康指標 (Mastery)
    const masteredCount = progress.filter(p => p.masteryLevel >= 4).length
    
    return NextResponse.json({
        dailyGoal,
        todayProgress,
        totalLearned: progress.filter(p => p.learned).length,
        totalReviewed: progress.reduce((acc, p) => acc + p.timesReviewed, 0),
        totalWords,
        streak: 0,
        favoritesCount: 0, 
        accuracy: history.length ? Math.round((history.filter(h => h.isCorrect).length / history.length) * 100) : 100,
        dueForReview: progress.filter(p => p.nextReviewDate <= new Date()).length,
        masteryScore: totalWords ? Math.round((masteredCount / totalWords) * 100) : 0,
        refinementWords
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
