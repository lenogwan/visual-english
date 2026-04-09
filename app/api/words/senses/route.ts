import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function safeJsonParse(data: any, fallback: any = []) {
  if (typeof data !== 'string') return data || fallback
  try {
    return JSON.parse(data)
  } catch (e) {
    return fallback
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const word = searchParams.get('word')

    if (!word) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 })
    }

    const senses = await (prisma.word as any).findMany({
      where: {
        word: {
            equals: word,
            mode: 'insensitive'
        }
      },
      orderBy: { senseIndex: 'asc' },
    })

    return NextResponse.json({
      senses: senses.map((s: any) => ({
        ...s,
        images: safeJsonParse(s.images),
        scenarioImages: safeJsonParse(s.scenarioImages),
        tags: safeJsonParse(s.tags),
        examples: safeJsonParse(s.examples),
        partOfSpeech: Array.isArray(s.partOfSpeech) ? s.partOfSpeech : [s.partOfSpeech || 'word']
      })),
    })
  } catch (error) {
    console.error('Senses API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
