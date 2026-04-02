import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'visual-english-secret-key-change-in-production'

async function getAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
    return user
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const level = searchParams.get('level') || ''
    const topic = searchParams.get('topic') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (search) {
      where.word = { contains: search }
    }
    
    // Improved dual filtering
    const filters = []
    if (level && level !== 'All') filters.push(level)
    if (topic && topic !== 'All') filters.push(topic)
    
    if (filters.length > 0) {
      where.AND = filters.map(f => ({
        tags: { contains: f }
      }))
    }

    const [words, total] = await Promise.all([
      prisma.word.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { word: 'asc' },
      }),
      prisma.word.count({ where }),
    ])

    return NextResponse.json({
      words: words.map((w: any) => ({
        ...w,
        images: JSON.parse(w.images),
        scenarioImages: JSON.parse(w.scenarioImages),
        tags: JSON.parse(w.tags),
        examples: JSON.parse(w.examples || '[]'),
      })),
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Words error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth || auth.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { word, phonetic, meaning, exampleSentence, emotionalConnection, scenario, images, scenarioImages, tags } = body

    if (!word) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 })
    }

    const newWord = await prisma.word.create({
      data: {
        word,
        phonetic: phonetic || null,
        meaning: meaning || null,
        exampleSentence: exampleSentence || null,
        emotionalConnection: emotionalConnection || null,
        scenario: scenario || null,
        images: JSON.stringify(images || []),
        scenarioImages: JSON.stringify(scenarioImages || []),
        tags: JSON.stringify(tags || ['noun', 'General', 'A1']),
      },
    })

    return NextResponse.json({ success: true, word: newWord })
  } catch (error) {
    console.error('Create word error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth || auth.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Word ID is required' }, { status: 400 })
    }

    await prisma.word.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete word error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
