import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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
            equals: word
        }
      },
      orderBy: { senseIndex: 'asc' },
    })

    return NextResponse.json({
      senses: senses.map((s: any) => ({
        ...s,
        images: JSON.parse(s.images),
        scenarioImages: JSON.parse(s.scenarioImages),
        tags: JSON.parse(s.tags),
        examples: JSON.parse(s.examples || '[]'),
      })),
    })
  } catch (error) {
    console.error('Senses API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
