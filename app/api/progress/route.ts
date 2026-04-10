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

import { calculateSRS } from '@/lib/srs'

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Quality: 1 (Again) to 5 (Easy)
    const { wordId, quality } = await request.json()

    if (!wordId || typeof quality !== 'number') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    // 1. Record in PracticeHistory
    await prisma.practiceHistory.create({
      data: { userId, wordId, isCorrect: quality >= 3 }
    })

    // 2. SRS calculation
    const prev = await prisma.userProgress.findUnique({ where: { userId_wordId: { userId, wordId } } })
    
    const { interval, easeFactor, masteryLevel, nextReviewDate, timesReviewed } = calculateSRS(quality, {
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

    return NextResponse.json({ success: true, progress })
  } catch (error) {
    console.error('SRS/History Update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
