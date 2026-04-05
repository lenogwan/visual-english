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
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get user settings for daily goal
    const userRows: any[] = await prisma.$queryRaw`
      SELECT settings FROM User WHERE id = ${userId}
    `
    const settings = userRows[0]?.settings ? JSON.parse(userRows[0].settings) : {}
    const dailyGoal = parseInt(settings.dailyGoal || '20')

    // Total words in system
    const totalWords = await prisma.word.count()

    // User progress stats
    const allProgress = await prisma.userProgress.findMany({
      where: { userId },
    })

    const totalLearned = allProgress.filter((p: any) => p.learned).length
    const totalReviewed = allProgress.length

    // Today's progress (words reviewed today)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayProgress = allProgress.filter(
      (p: any) => p.lastReviewedAt && new Date(p.lastReviewedAt) >= todayStart
    ).length

    // Calculate streak (consecutive days with activity)
    let streak = 0
    const now = new Date()
    for (let i = 0; i < 365; i++) {
      const dayStart = new Date(now)
      dayStart.setDate(dayStart.getDate() - i)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)
      
      const hasActivity = allProgress.some(
        (p: any) => p.lastReviewedAt && new Date(p.lastReviewedAt) >= dayStart && new Date(p.lastReviewedAt) < dayEnd
      )
      if (hasActivity) {
        streak++
      } else if (i > 0) {
        break // streak broken (skip today if no activity yet)
      }
    }

    // Favorites count
    const favoritesCount = await prisma.favoriteWord.count({ where: { userId } })

    // Quiz attempts for accuracy
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    const totalScore = attempts.reduce((sum: number, a: any) => sum + a.score, 0)
    const totalQuestions = attempts.reduce((sum: number, a: any) => sum + a.total, 0)
    const accuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0

    // Words due for review (reviewed > 1 day ago, mastery < 5)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const dueForReview = allProgress.filter(
      (p: any) => p.masteryLevel < 5 && p.lastReviewedAt && new Date(p.lastReviewedAt) < oneDayAgo
    ).length

    // Weekly accuracy trend (last 7 days)
    const weeklyTrend: { day: string; accuracy: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now)
      dayStart.setDate(dayStart.getDate() - i)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const dayAttempts = attempts.filter(
        (a: any) => new Date(a.createdAt) >= dayStart && new Date(a.createdAt) < dayEnd
      )
      const dayScore = dayAttempts.reduce((s: number, a: any) => s + a.score, 0)
      const dayTotal = dayAttempts.reduce((s: number, a: any) => s + a.total, 0)

      weeklyTrend.push({
        day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        accuracy: dayTotal > 0 ? Math.round((dayScore / dayTotal) * 100) : -1,
      })
    }

    return NextResponse.json({
      dailyGoal,
      todayProgress,
      totalLearned,
      totalReviewed,
      totalWords,
      streak,
      favoritesCount,
      accuracy,
      dueForReview,
      weeklyTrend,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
