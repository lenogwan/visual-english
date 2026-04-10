import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserId } from '@/lib/auth-utils'

function safeJsonParse(data: any, fallback: any = []) {
  if (typeof data !== 'string') return data || fallback
  try {
    return JSON.parse(data)
  } catch (e) {
    console.error('Failed to parse JSON:', data, e)
    return fallback
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = await params

    // Check if the word string or senseIndex is being changed
    const existingWord = await prisma.word.findUnique({
      where: { id },
      select: { word: true, senseIndex: true }
    });

    let finalSenseIndex = body.senseIndex;

    // If the word name is changing, we need to ensure the new word + senseIndex doesn't conflict
    if (existingWord && body.word && body.word !== existingWord.word) {
      const conflict = await prisma.word.findUnique({
        where: {
          word_senseIndex: {
            word: body.word,
            senseIndex: body.senseIndex ?? 0
          }
        }
      });

      if (conflict && conflict.id !== id) {
        // Find next available index for the new word
        const maxSense = await prisma.word.findFirst({
          where: { word: body.word },
          orderBy: { senseIndex: 'desc' },
          select: { senseIndex: true }
        });
        finalSenseIndex = (maxSense?.senseIndex ?? -1) + 1;
      }
    }

    const word = await (prisma.word as any).update({
      where: { id },
      data: {
        word: body.word,
        partOfSpeech: body.partOfSpeech,
        senseIndex: finalSenseIndex,
        phonetic: body.phonetic,
        meaning: body.meaning,
        scenario: body.scenario,
        exampleSentence: body.exampleSentence,
        emotionalConnection: body.emotionalConnection,
        images: Array.isArray(body.images) ? JSON.stringify(body.images) : body.images,
        scenarioImages: Array.isArray(body.scenarioImages) ? JSON.stringify(body.scenarioImages) : body.scenarioImages,
        examples: Array.isArray(body.examples) ? JSON.stringify(body.examples) : body.examples,
        tags: Array.isArray(body.tags) ? JSON.stringify(body.tags) : body.tags,
      },
    })

    return NextResponse.json({
      ...word,
      images: safeJsonParse(word.images),
      scenarioImages: safeJsonParse(word.scenarioImages),
      tags: safeJsonParse(word.tags),
      examples: safeJsonParse(word.examples),
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
      images: safeJsonParse(word.images),
      scenarioImages: safeJsonParse(word.scenarioImages),
      tags: safeJsonParse(word.tags),
      examples: safeJsonParse(word.examples),
    })
  } catch (error) {
    console.error('Word get error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
