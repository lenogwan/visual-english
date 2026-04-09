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

    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'meaning' // meaning, spelling, scenario

    const progress = await prisma.userProgress.findMany({
      where: { userId, learned: true },
      include: { word: true },
      take: 50
    })

    if (progress.length === 0) return NextResponse.json({ error: 'No learned words' }, { status: 404 })

    const randomIndex = Math.floor(Math.random() * progress.length)
    const p = progress[randomIndex]
    const word = p.word

    let response = { wordId: word.id, mode } as any

    if (mode === 'spelling') {
      response.question = `Listen to the pronunciation.`
      response.correctAnswer = word.word
      response.options = [] // Spelling logic handled in frontend
    } else if (mode === 'scenario') {
      response.question = word.scenario
      response.correctAnswer = word.word
      const distractors = await prisma.word.findMany({ where: { id: { not: word.id } }, take: 3, select: { word: true } })
      response.options = [...distractors.map(d => d.word), word.word].sort(() => Math.random() - 0.5)
    } else {
      response.question = word.word
      response.correctAnswer = word.meaning
      const distractors = await prisma.word.findMany({ where: { id: { not: word.id } }, take: 3, select: { meaning: true } })
      response.options = [...distractors.map(d => d.meaning), word.meaning].sort(() => Math.random() - 0.5)
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
