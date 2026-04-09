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

    // Fetch user progress for learned words
    const progress = await prisma.userProgress.findMany({
      where: { userId, learned: true },
      include: { word: true },
      take: 20
    })

    if (progress.length === 0) return NextResponse.json({ error: 'No learned words' }, { status: 404 })

    // Pick a random word from progress
    const randomIndex = Math.floor(Math.random() * progress.length)
    const p = progress[randomIndex]
    const word = p.word

    // Generate distractors from other words
    const distractors = await prisma.word.findMany({
      where: { id: { not: word.id } },
      take: 3,
      select: { meaning: true }
    })

    return NextResponse.json({
      wordId: word.id,
      question: word.word,
      correctAnswer: word.meaning,
      options: [...distractors.map(d => d.meaning), word.meaning].sort(() => Math.random() - 0.5)
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
