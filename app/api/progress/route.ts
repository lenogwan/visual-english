import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserId } from '@/lib/auth-utils'
import { calculateSRS, SRSQuality } from '@/lib/srs'
import { getOrCreateSession, incrementSessionCounters } from '@/lib/session'
import { awardSrsXP, updateStreak, calculateLevel } from '@/lib/gamification'

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { wordId, quality } = await request.json()

    if (!wordId || typeof quality !== 'number' || quality < 1 || quality > 5) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    // 1. Get or Create Session
    const session = await getOrCreateSession(userId)

    // 2. Record LearningEvent
    await prisma.learningEvent.create({
      data: {
        userId,
        wordId,
        eventType: 'LEARN_GRADE',
        quality,
        isCorrect: quality >= 3,
        sessionId: session.id,
      },
    })

    // 3. SRS calculation
    const prev = await prisma.userProgress.findUnique({ where: { userId_wordId: { userId, wordId } } })
    const { interval, easeFactor, masteryLevel, nextReviewDate, timesReviewed } = calculateSRS(quality as SRSQuality, {
      interval: prev?.interval || 0,
      easeFactor: prev?.easeFactor || 2.5,
      masteryLevel: prev?.masteryLevel || 0,
      timesReviewed: prev?.timesReviewed || 0
    })

    const progress = await prisma.userProgress.upsert({
      where: { userId_wordId: { userId, wordId } },
      update: {
        interval,
        easeFactor,
        masteryLevel,
        nextReviewDate,
        lastReviewedAt: new Date(),
        timesReviewed,
        learned: true
      },
      create: {
        userId, wordId,
        interval, easeFactor, masteryLevel, nextReviewDate,
        lastReviewedAt: new Date(),
        timesReviewed, learned: true
      }
    })

    // 4. Gamification: XP & Session Update
    const xpEarned = awardSrsXP(quality)
    const isCorrect = quality >= 3

    await incrementSessionCounters(session.id, {
      learnCount: 1,
      learnCorrect: isCorrect ? 1 : 0,
      xpEarned: xpEarned,
    })

    // 5. Update User XP and Streak
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user) {
      const { newStreak, newFreezes } = updateStreak(
        user.streakCount,
        user.lastActiveDate,
        user.streakFreezes
      )

      const newTotalXp = user.xp + xpEarned
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
        progress, 
        xpEarned,
        levelUp: level > user.level,
        newLevel: level
      })
    }

    return NextResponse.json({ success: true, progress, xpEarned })
  } catch (error) {
    console.error('SRS/History Update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
