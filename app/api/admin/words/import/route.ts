import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserId } from '@/lib/auth-utils'

async function getAuth(request: NextRequest) {
  const userId = await getUserId(request)
  if (!userId) return null
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
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

    // Sequential processing for safety
    for (const item of words) {
      const wordStr = String(item.word || '').trim()
      let senseIndex = parseInt(item.senseIndex || '0')
      
      if (!wordStr) {
        skippedCount++
        continue
      }

      const partOfSpeech = Array.isArray(item.partOfSpeech)
        ? item.partOfSpeech.map((pos: any) => String(pos).toLowerCase().trim()).filter(Boolean)
        : (String(item.partOfSpeech || 'unknown').toLowerCase().trim() === 'unknown' ? ['unknown'] : [String(item.partOfSpeech).toLowerCase().trim()])

      const data = {
        word: wordStr,
        partOfSpeech,
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
        // In override mode, we stick to the provided senseIndex (or default 0)
        await prisma.word.upsert({
          where: {
            word_senseIndex: {
              word: wordStr,
              senseIndex,
            }
          },
          update: { ...data, senseIndex },
          create: { ...data, senseIndex },
        })
        updatedCount++
      } else {
        // Intelligent skip/create logic: 
        // Find if this specific word with this specific sense already exists
        let existing = await prisma.word.findUnique({
          where: {
            word_senseIndex: {
              word: wordStr,
              senseIndex,
            }
          }
        })

        // If it exists, but we want to allow different types (senses), 
        // we find the next available senseIndex
        if (existing) {
          // Check if it's EXACTLY the same (optional, here we assume if senseIndex matches, it's a conflict)
          // Find the max senseIndex for this word and increment
          const maxSense = await prisma.word.findFirst({
            where: { word: wordStr },
            orderBy: { senseIndex: 'desc' },
            select: { senseIndex: true }
          })
          
          senseIndex = (maxSense?.senseIndex ?? 0) + 1
          
          await prisma.word.create({
            data: { ...data, senseIndex }
          })
          createdCount++
        } else {
          await prisma.word.create({
            data: { ...data, senseIndex }
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
