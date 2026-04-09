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
  const userId = await getUserId(request)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const favorites = await prisma.favoriteWord.findMany({ where: { userId }, include: { word: true } })
  return NextResponse.json({ favorites: favorites.map(f => f.word) })
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
