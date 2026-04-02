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
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const progress = await prisma.userProgress.findMany({
      where: { userId },
      include: { word: true },
    })

    return NextResponse.json({
      progress: progress.map((p: any) => ({
        ...p,
        word: {
          ...p.word,
          images: JSON.parse(p.word.images),
          scenarioImages: JSON.parse(p.word.scenarioImages),
          tags: JSON.parse(p.word.tags),
        },
      })),
    })
  } catch (error) {
    console.error('Progress GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { wordId, learned, masteryLevel } = await request.json()

    if (!wordId) {
      return NextResponse.json({ error: 'Word ID is required' }, { status: 400 })
    }

    const progress = await prisma.userProgress.upsert({
      where: {
        userId_wordId: { userId, wordId },
      },
      update: {
        learned: learned ?? undefined,
        masteryLevel: masteryLevel ?? undefined,
        timesReviewed: { increment: 1 },
        lastReviewedAt: new Date(),
      },
      create: {
        userId,
        wordId,
        learned: learned ?? false,
        masteryLevel: masteryLevel ?? 0,
        timesReviewed: 1,
        lastReviewedAt: new Date(),
      },
      include: { word: true },
    })

    return NextResponse.json({
      progress: {
        ...progress,
        word: {
          ...progress.word,
          images: JSON.parse(progress.word.images),
          scenarioImages: JSON.parse(progress.word.scenarioImages),
          tags: JSON.parse(progress.word.tags),
        },
      },
    })
  } catch (error) {
    console.error('Progress POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
