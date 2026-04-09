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

function safeJsonParse(data: any, fallback: any = []) {
  if (typeof data !== 'string') return data || fallback
  try {
    return JSON.parse(data)
  } catch (e) {
    console.error('Failed to parse JSON:', data, e)
    return fallback
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

    if (level && level !== 'All' && level !== 'ANY') {
      where.level = level
    }

    if (topic && topic !== 'All' && topic !== 'ANY') {
      where.tags = { contains: topic }
    }

    // Exclude learned words if requested
    const excludeLearned = searchParams.get('excludeLearned') === 'true'
    if (excludeLearned) {
      const auth = await getAuth(request)
      if (auth) {
        where.progress = {
          none: {
            userId: auth.id,
            learned: true,
            masteryLevel: { gte: 5 } // Consider 'mastered' at level 5
          }
        }
      }
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
      words: words.map((w: any) => {
        let displayPos = 'word';
        const pos = w.partOfSpeech;
        if (Array.isArray(pos)) {
          displayPos = pos[0] || 'word';
        } else if (typeof pos === 'string') {
          // If it's a string, it might be a JSON string like '["noun"]' or just 'noun'
          const parsed = safeJsonParse(pos, [pos]);
          displayPos = Array.isArray(parsed) ? (parsed[0] || 'word') : (parsed || 'word');
        }
        
        return {
          ...w,
          partOfSpeech: displayPos,
          images: safeJsonParse(w.images),
          scenarioImages: safeJsonParse(w.scenarioImages),
          tags: safeJsonParse(w.tags),
          examples: safeJsonParse(w.examples),
        };
      }),
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
    const {
      word,
      partOfSpeech,
      phonetic,
      meaning,
      exampleSentence,
      emotionalConnection,
      scenario,
      images,
      scenarioImages,
      tags,
      level,
      examples
    } = body

    if (!word) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 })
    }

    // Ensure partOfSpeech is an array, default to ["unknown"] if not provided or invalid
    let partsToProcess: string[];
    if (Array.isArray(partOfSpeech)) {
      partsToProcess = partOfSpeech.filter((p: any) => typeof p === 'string' && p.trim() !== '');
      if (partsToProcess.length === 0) partsToProcess = ['unknown'];
    } else if (typeof partOfSpeech === 'string' && partOfSpeech.trim() !== '') {
      partsToProcess = [partOfSpeech.trim()];
    } else {
      partsToProcess = ['unknown'];
    }

    const createdWords = [];
    for (const currentPartOfSpeech of partsToProcess) {
      // Find the next available senseIndex for this word
      const maxSense = await prisma.word.findFirst({
        where: { word },
        orderBy: { senseIndex: 'desc' },
        select: { senseIndex: true }
      });
      
      const nextSenseIndex = (maxSense?.senseIndex ?? -1) + 1;

      const newWordEntry = await prisma.word.create({
        data: {
          word,
          // Store as an array to match Json type and schema default
          partOfSpeech: [currentPartOfSpeech],
          senseIndex: nextSenseIndex,
          phonetic: phonetic || null,
          meaning: meaning || null,
          exampleSentence: exampleSentence || null,
          emotionalConnection: emotionalConnection || null,
          scenario: scenario || null,
          images: JSON.stringify(images || []),
          scenarioImages: JSON.stringify(scenarioImages || []),
          tags: JSON.stringify(tags || []),
          level: level || 'A1',
          examples: JSON.stringify(examples || []),
        },
      });
      createdWords.push(newWordEntry);
    }

    return NextResponse.json({ success: true, word: createdWords.length === 1 ? createdWords[0] : createdWords });
  } catch (error) {
    console.error('Create word error:', error)
    if (error instanceof Error && (error.message.includes('unique constraint') || error.message.includes('P2002'))) {
      return NextResponse.json({ error: 'Word with this sense index already exists.' }, { status: 409 });
    }
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
