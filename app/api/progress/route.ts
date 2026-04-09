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
    
    let interval = prev?.interval || 0
    let easeFactor = prev?.easeFactor || 2.5
    let masteryLevel = prev?.masteryLevel || 0

    if (quality < 3) {
      interval = 0
      masteryLevel = Math.max(0, masteryLevel - 1)
    } else {
      if (interval === 0) interval = 1
      else if (interval === 1) interval = 6
      else interval = Math.round(interval * easeFactor)
      
      easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
      masteryLevel = Math.min(5, masteryLevel + 1)
    }

    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + interval)

    const progress = await prisma.userProgress.upsert({
      where: { userId_wordId: { userId, wordId } },
      update: {
        interval,
        easeFactor,
        masteryLevel,
        nextReviewDate,
        lastReviewedAt: new Date(),
        timesReviewed: { increment: 1 },
        learned: true
      },
      create: {
        userId, wordId,
        interval, easeFactor, masteryLevel, nextReviewDate,
        lastReviewedAt: new Date(),
        timesReviewed: 1, learned: true
      }
    })

    return NextResponse.json({ success: true, progress })
  } catch (error) {
    console.error('SRS/History Update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
