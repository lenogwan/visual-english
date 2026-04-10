import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserId } from '@/lib/auth-utils'
import { getOrCreateSession, incrementSessionCounters } from '@/lib/session'
import { calculateSRS, SRSQuality } from '@/lib/srs'
import { awardPracticeXP, updateStreak, calculateLevel } from '@/lib/gamification'

interface Answer {
  wordId: string
  isCorrect: boolean
  responseTimeMs?: number
}

function getQualityFromPractice(isCorrect: boolean, mode: string): SRSQuality {
  if (isCorrect) {
    if (mode === 'spelling') return 5
    if (mode === 'scenario') return 3
    return 4
  } else {
    return 1
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { mode, answers }: { mode: string; answers: Answer[] } = body

    if (!mode || !answers || answers.length === 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const session = await getOrCreateSession(userId)
    let totalXP = 0
    let correctCount = 0

    for (const ans of answers) {
      const quality = getQualityFromPractice(ans.isCorrect, mode)
      const xp = awardPracticeXP(ans.isCorrect, mode)
      totalXP += xp
      if (ans.isCorrect) correctCount++

      await prisma.learningEvent.create({
        data: {
          userId,
          wordId: ans.wordId,
          eventType: 'PRACTICE_ANSWER',
          mode,
          quality,
          isCorrect: ans.isCorrect,
          responseTimeMs: ans.responseTimeMs,
          sessionId: session.id,
        },
      })

      const prev = await prisma.userProgress.findUnique({
        where: { userId_wordId: { userId, wordId: ans.wordId } },
      })

      if (prev) {
        const srsResult = calculateSRS(quality, {
          interval: prev.interval,
          easeFactor: prev.easeFactor,
          masteryLevel: prev.masteryLevel,
          timesReviewed: prev.timesReviewed,
        })

        await prisma.userProgress.update({
          where: { userId_wordId: { userId, wordId: ans.wordId } },
          data: {
            interval: srsResult.interval,
            easeFactor: srsResult.easeFactor,
            masteryLevel: srsResult.masteryLevel,
            nextReviewDate: srsResult.nextReviewDate,
            lastReviewedAt: new Date(),
            timesReviewed: srsResult.timesReviewed,
            learned: true,
          },
        })
      }
    }

    await incrementSessionCounters(session.id, {
      practiceCount: answers.length,
      practiceCorrect: correctCount,
      xpEarned: totalXP,
    })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user) {
      const { newStreak, newFreezes } = updateStreak(
        user.streakCount,
        user.lastActiveDate,
        user.streakFreezes
      )

      const newTotalXp = user.xp + totalXP
      const { level } = calculateLevel(newTotalXp)

      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: newTotalXp,
          level,
          streakCount: newStreak,
          streakFreezes: newFreezes,
          lastActiveDate: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        xpEarned: totalXP,
        correctCount,
        totalQuestions: answers.length,
        levelUp: level > user.level,
        newLevel: level,
      })
    }

    return NextResponse.json({
      success: true,
      xpEarned: totalXP,
      correctCount,
      totalQuestions: answers.length,
    })
  } catch (error) {
    console.error('Practice Submit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
