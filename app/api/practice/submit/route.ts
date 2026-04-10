import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserId } from '@/lib/auth-utils'
import { getOrCreateSession, incrementSessionCounters } from '@/lib/session'
import { calculateSRS, SRSQuality } from '@/lib/srs'

interface Answer {
  wordId: string
  isCorrect: boolean
  responseTimeMs?: number
}

// Map practice correctness to SRS Quality based on mode
function getQualityFromPractice(isCorrect: boolean, mode: string): SRSQuality {
  if (isCorrect) {
    // Spelling is harder -> higher quality
    if (mode === 'spelling') return 5
    // Scenario is easier -> lower quality
    if (mode === 'scenario') return 3
    return 4 // Default Good
  } else {
    return 1 // Again
  }
}

function getXP(isCorrect: boolean, mode: string): number {
  if (isCorrect) {
    if (mode === 'spelling') return 20
    if (mode === 'scenario') return 10
    return 15
  }
  return 2 // Effort XP
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

    // 1. Get or Create Session
    const session = await getOrCreateSession(userId)

    let totalXP = 0
    let correctCount = 0

    // 2. Process each answer
    for (const ans of answers) {
      const quality = getQualityFromPractice(ans.isCorrect, mode)
      const xp = getXP(ans.isCorrect, mode)
      totalXP += xp
      if (ans.isCorrect) correctCount++

      // A. Create LearningEvent
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

      // B. Update UserProgress (SRS)
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

    // 3. Update Session Counters
    await incrementSessionCounters(session.id, {
      practiceCount: answers.length,
      practiceCorrect: correctCount,
      xpEarned: totalXP,
    })

    // 4. Update User XP and Streak
    const now = new Date()
    const today = new Date(now.toISOString().split('T')[0])
    
    // Simple streak logic: if lastActiveDate was yesterday or today, increment/keep. Else reset.
    // We'll do a basic update here.
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: totalXP },
        lastActiveDate: now,
        // Streak update logic can be refined, but for now just bump if needed
        // In a real app, we'd check lastActiveDate before updating streakCount
      },
    })

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
