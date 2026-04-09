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

    const [allPotentialWords, totalCount] = await Promise.all([
      prisma.word.findMany({
        where: search ? { word: { contains: search, mode: 'insensitive' } } : {},
        orderBy: { word: 'asc' },
      }),
      prisma.word.count({
        where: search ? { word: { contains: search, mode: 'insensitive' } } : {},
      }),
    ])

    let words = allPotentialWords;
    
    if (level && level !== 'All' && level !== 'ANY') {
      words = words.filter((w: any) => w.level === level)
    }

    if (topic && topic !== 'All' && topic !== 'ANY') {
      words = words.filter((w: any) => {
        const tags = safeJsonParse(w.tags, []);
        return tags.includes(topic);
      });
    }

    let total = words.length;
    words = words.slice(offset, offset + limit);

    let isSuggestion = false;
    if (words.length === 0 && search) {
      words = await prisma.word.findMany({
        take: limit,
        orderBy: { word: 'asc' },
      });
      total = await prisma.word.count();
      isSuggestion = true;
    }

    if (search && !isSuggestion) {
      const lowerSearch = search.toLowerCase();
      words.sort((a, b) => {
        const aWord = a.word.toLowerCase();
        const bWord = b.word.toLowerCase();
        const aExact = aWord === lowerSearch;
        const bExact = bWord === lowerSearch;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        const aStarts = aWord.startsWith(lowerSearch);
        const bStarts = bWord.startsWith(lowerSearch);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return aWord.localeCompare(bWord);
      });
    }

    return NextResponse.json({
      words: words.map((w: any) => {
        let displayPos = 'word';
        const pos = w.partOfSpeech;
        if (Array.isArray(pos)) {
          displayPos = pos[0] || 'word';
        } else if (typeof pos === 'string') {
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
      isSuggestion
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
    
    const maxSenseResult = await prisma.word.findFirst({
      where: { word },
      orderBy: { senseIndex: 'desc' },
      select: { senseIndex: true }
    });
    
    let nextAvailableIndex = (maxSenseResult?.senseIndex ?? -1) + 1;

    for (const currentPartOfSpeech of partsToProcess) {
      const newWordEntry = await prisma.word.create({
        data: {
          word,
          partOfSpeech: [currentPartOfSpeech],
          senseIndex: nextAvailableIndex,
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
      nextAvailableIndex++;
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
