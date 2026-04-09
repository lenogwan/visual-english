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

    const learnedProgress = await prisma.userProgress.findMany({
      where: { userId, learned: true },
      include: { word: true },
      orderBy: { lastReviewedAt: 'desc' }
    })

    return NextResponse.json({
      words: learnedProgress.map(p => ({
        ...p.word,
        masteryLevel: p.masteryLevel,
        images: JSON.parse(p.word.images || '[]'),
        tags: JSON.parse(p.word.tags || '[]'),
      }))
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
