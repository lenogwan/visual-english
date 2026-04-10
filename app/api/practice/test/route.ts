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
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'meaning'

    let word: any
    
    if (userId) {
        const progress = await prisma.userProgress.findMany({
            where: { userId, learned: true },
            include: { word: true },
            take: 50
        })
        if (progress.length > 0) {
            word = progress[Math.floor(Math.random() * progress.length)].word
        }
    }
    
    if (!word) {
        const count = await prisma.word.count()
        const skip = Math.floor(Math.random() * count)
        word = (await prisma.word.findMany({ take: 1, skip }))[0]
    }

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
