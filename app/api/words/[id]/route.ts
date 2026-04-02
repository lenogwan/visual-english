import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'visual-english-secret-key-change-in-production'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const { id } = await params

    const body = await request.json()

    const word = await prisma.word.update({
      where: { id },
      data: {
        phonetic: body.phonetic,
        meaning: body.meaning,
        scenario: body.scenario,
        exampleSentence: body.exampleSentence,
        emotionalConnection: body.emotionalConnection,
        images: body.images,
        scenarioImages: body.scenarioImages,
        examples: body.examples,
        tags: body.tags,
      },
    })

    return NextResponse.json({
      ...word,
      images: JSON.parse(word.images),
      scenarioImages: JSON.parse(word.scenarioImages),
      tags: JSON.parse(word.tags),
      examples: JSON.parse(word.examples || '[]'),
    })
  } catch (error) {
    console.error('Word update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const word = await prisma.word.findUnique({ where: { id } })

    if (!word) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...word,
      images: JSON.parse(word.images),
      scenarioImages: JSON.parse(word.scenarioImages),
      tags: JSON.parse(word.tags),
      examples: JSON.parse(word.examples || '[]'),
    })
  } catch (error) {
    console.error('Word get error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
