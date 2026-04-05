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
      const posStr = String(item.partOfSpeech || 'unknown').toLowerCase().trim()
      
      if (!wordStr) {
        skippedCount++
        continue
      }

      const existing = await prisma.word.findFirst({
        where: { 
          word: { equals: wordStr },
          partOfSpeech: { equals: posStr }
        }
      })

      const data = {
        word: wordStr,
        partOfSpeech: posStr,
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

      if (existing) {
        if (override) {
          await prisma.word.update({
            where: { id: existing.id },
            data
          })
          updatedCount++
        } else {
          skippedCount++
        }
      } else {
        await (prisma.word as any).create({
          data
        })
        createdCount++
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
