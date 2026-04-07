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

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth || auth.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { words, override } = await request.json()
    if (!Array.isArray(words)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    let createdCount = 0
    let updatedCount = 0
    let skippedCount = 0

    // Sequential processing for safety (SQLite transactions)
    for (const item of words) {
      const wordStr = String(item.word || '').trim()
      const senseIndex = parseInt(item.senseIndex || '0')
      
      if (!wordStr) {
        skippedCount++
        continue
      }

      const data = {
        word: wordStr,
        senseIndex,
        partOfSpeech: Array.isArray(item.partOfSpeech)
  ? item.partOfSpeech.map((pos: any) => String(pos).toLowerCase().trim()).filter(Boolean)
  : (String(item.partOfSpeech || 'unknown').toLowerCase().trim() === 'unknown' ? ['unknown'] : [String(item.partOfSpeech).toLowerCase().trim()]),
        phonetic: item.phonetic || null,
        meaning: item.meaning || null,
        scenario: item.scenario || null,
        emotionalConnection: item.emotionalConnection || null,
        images: JSON.stringify(item.images || []),
        scenarioImages: JSON.stringify(item.scenarioImages || []),
        tags: JSON.stringify(item.tags || []),
        level: item.level || 'A1',
        examples: JSON.stringify(item.examples || []),
      }

      if (override) {
        await prisma.word.upsert({
          where: {
            word_senseIndex: {
              word: wordStr,
              senseIndex,
            }
          },
          update: data,
          create: data,
        })
        updatedCount++ // Treating upsert as update/create
      } else {
        const existing = await prisma.word.findUnique({
          where: {
            word_senseIndex: {
              word: wordStr,
              senseIndex,
            }
          }
        })

        if (existing) {
          skippedCount++
        } else {
          await prisma.word.create({
            data
          })
          createdCount++
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      created: createdCount, 
      updated: updatedCount, 
      skipped: skippedCount 
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
