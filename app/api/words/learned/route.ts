import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserId } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const [learnedProgress, totalCount] = await Promise.all([
      prisma.userProgress.findMany({
        where: { userId, learned: true },
        include: { word: true },
        orderBy: { lastReviewedAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.userProgress.count({ where: { userId, learned: true } })
    ])

    return NextResponse.json({
      words: learnedProgress.map(p => ({
        ...p.word,
        masteryLevel: p.masteryLevel,
        images: JSON.parse(p.word.images || '[]'),
        tags: JSON.parse(p.word.tags || '[]'),
      })),
      total: totalCount,
      limit,
      offset
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
