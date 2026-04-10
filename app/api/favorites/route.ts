import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserId } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  const [favorites, totalCount] = await Promise.all([
    prisma.favoriteWord.findMany({
      where: { userId },
      include: { word: true },
      skip: offset,
      take: limit
    }),
    prisma.favoriteWord.count({ where: { userId } })
  ])
  
  return NextResponse.json({
    favorites: favorites.map(f => f.word),
    total: totalCount,
    limit,
    offset
  })
}

export async function POST(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { wordId } = await request.json()

  const existing = await prisma.favoriteWord.findUnique({ where: { userId_wordId: { userId, wordId } } })
  if (existing) {
    await prisma.favoriteWord.delete({ where: { id: existing.id } })
    return NextResponse.json({ status: 'removed' })
  } else {
    await prisma.favoriteWord.create({ data: { userId, wordId } })
    return NextResponse.json({ status: 'added' })
  }
}
