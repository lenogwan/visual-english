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

// GET: List all favorite word IDs for the user
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const favorites = await prisma.favoriteWord.findMany({
      where: { userId },
      include: { word: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      favorites: favorites.map((f: any) => ({
        id: f.id,
        wordId: f.wordId,
        createdAt: f.createdAt,
        word: {
          ...f.word,
          images: JSON.parse(f.word.images),
          tags: JSON.parse(f.word.tags),
          examples: JSON.parse(f.word.examples || '[]'),
        },
      })),
    })
  } catch (error) {
    console.error('Favorites GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Toggle favorite (add if not exists, remove if exists)
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { wordId } = await request.json()
    if (!wordId) return NextResponse.json({ error: 'wordId is required' }, { status: 400 })

    // Check if already favorited
    const existing = await prisma.favoriteWord.findUnique({
      where: { userId_wordId: { userId, wordId } },
    })

    if (existing) {
      // Remove favorite
      await prisma.favoriteWord.delete({ where: { id: existing.id } })
      return NextResponse.json({ favorited: false, message: 'Removed from favorites' })
    } else {
      // Add favorite
      await prisma.favoriteWord.create({ data: { userId, wordId } })
      return NextResponse.json({ favorited: true, message: 'Added to favorites' })
    }
  } catch (error) {
    console.error('Favorites POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
