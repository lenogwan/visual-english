import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserId } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const [
      stats,
      totalPractice,
      correctPractice,
      dailyGroups,
      correctDailyGroups,
      mistakeGroups,
      learnedCount,
      masteredCount,
      totalMasterySum,
      totalWords
    ] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { settings: true } }),
      prisma.practiceHistory.count({ where: { userId, timestamp: { gte: thirtyDaysAgo } } }),
      prisma.practiceHistory.count({ where: { userId, isCorrect: true, timestamp: { gte: thirtyDaysAgo } } }),
      prisma.practiceHistory.groupBy({
        by: ['timestamp'],
        where: { userId, timestamp: { gte: thirtyDaysAgo } },
        _count: { _all: true }
      }),
      prisma.practiceHistory.groupBy({
        by: ['timestamp'],
        where: { userId, isCorrect: true, timestamp: { gte: thirtyDaysAgo } },
        _count: { _all: true }
      }),
      prisma.practiceHistory.groupBy({
        by: ['wordId'],
        where: { userId, isCorrect: false, timestamp: { gte: thirtyDaysAgo } },
        _count: { _all: true }
      }),
      prisma.userProgress.count({ where: { userId, learned: true } }),
      prisma.userProgress.count({ where: { userId, masteryLevel: { gte: 4 } } }),
      prisma.userProgress.aggregate({
        where: { userId, learned: true },
        _sum: { masteryLevel: true }
      }),
      prisma.word.count()
    ])

    // Fetch words for mistake counts and daily groups
    const wordIdsForMistakes = mistakeGroups.map(g => g.wordId)
    const words = await prisma.word.findMany({
      where: { id: { in: wordIdsForMistakes } },
      select: { id: true, word: true }
    })
    const wordMap = new Map(words.map(w => [w.id, w.word]))

    const settings = stats?.settings ? JSON.parse(stats.settings) : {}
    const dailyGoal = parseInt(settings.dailyGoal || '20')

    const calculatedAchievements = []
    if (learnedCount >= 50) calculatedAchievements.push({ slug: 'pioneer', title: 'Learning Pioneer' })
    if (masteredCount >= 50) calculatedAchievements.push({ slug: 'master-50', title: 'Master 50' })
    if (totalPractice >= 100) calculatedAchievements.push({ slug: 'practitioner', title: 'Active Practitioner' })

    const refinementWords = mistakeGroups
        .sort((a, b) => b._count._all - a._count._all)
        .slice(0, 5)
        .map(g => ({ word: wordMap.get(g.wordId) || 'Unknown', count: g._count._all }))

    const masteryScore = learnedCount > 0
        ? Math.round(((totalMasterySum._sum.masteryLevel || 0) / (learnedCount * 5)) * 100)
        : 0

    // Process daily groups
    const dailyMap = new Map<string, { total: number, correct: number }>()
    dailyGroups.forEach(g => {
      const dateStr = g.timestamp.toISOString().split('T')[0]
      const existing = dailyMap.get(dateStr) || { total: 0, correct: 0 }
      dailyMap.set(dateStr, { total: existing.total + g._count._all, correct: existing.correct })
    })
    correctDailyGroups.forEach(g => {
      const dateStr = g.timestamp.toISOString().split('T')[0]
      const existing = dailyMap.get(dateStr) || { total: 0, correct: 0 }
      dailyMap.set(dateStr, { total: existing.total, correct: existing.correct + g._count._all })
    })

    return NextResponse.json({
        dailyGoal,
        totalLearned: learnedCount,
        totalWords,
        accuracy: totalPractice ? Math.round((correctPractice / totalPractice) * 100) : 100,
        masteryScore,
        refinementWords,
        achievements: calculatedAchievements,
        trend: Array.from({ length: 30 }).map((_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (29 - i))
          const dateStr = d.toISOString().split('T')[0]
          const dayData = dailyMap.get(dateStr)
          const accuracy = dayData ? Math.round((dayData.correct / dayData.total) * 100) : -1
          return { day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), accuracy }
        })
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
