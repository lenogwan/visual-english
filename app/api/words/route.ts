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
    const { 
      word, 
      partOfSpeech, // Expecting this to be an array now
      // senseIndex is managed internally now
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
    if (Array.isArray(body.partOfSpeech)) {
      partsToProcess = body.partOfSpeech.filter(p => typeof p === 'string' && p.trim() !== ''); // Filter out empty strings
      if (partsToProcess.length === 0) partsToProcess = ['unknown']; // Handle case where array was empty or contained only empty strings
    } else if (typeof body.partOfSpeech === 'string' && body.partOfSpeech.trim() !== '') {
      // If it's a single non-empty string, treat it as the only part of speech
      partsToProcess = [body.partOfSpeech.trim()];
    } else if (tags && tags.length > 0 && typeof tags[0] === 'string' && tags[0].trim() !== '') {
      // Fallback to the first tag if partOfSpeech is missing or default/empty
      partsToProcess = [tags[0].trim()];
    } else {
      // Default if nothing else is available
      partsToProcess = ['unknown'];
    }

    const createdWords = [];
    for (let i = 0; i < partsToProcess.length; i++) {
      const currentPartOfSpeech = partsToProcess[i];
      const currentSenseIndex = i; // Increment senseIndex for each part of speech

      const newWordEntry = await prisma.word.create({
        data: {
          word,
          partOfSpeech: currentPartOfSpeech, // Assign the string directly for Json type
          senseIndex: currentSenseIndex,
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

    // Return the first created word if only one, or the array if multiple
    return NextResponse.json({ success: true, word: createdWords.length === 1 ? createdWords[0] : createdWords });
  } catch (error) {
    console.error('Create word error:', error)
    // Catch unique constraint errors specifically
    if (error instanceof Error && error.message.includes('unique constraint failed')) {
       return NextResponse.json({ error: 'Word with this part of speech and sense index already exists.' }, { status: 409 });
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
