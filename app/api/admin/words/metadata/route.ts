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
    const auth = await getAuth(request)
    if (!auth || (auth.role.toLowerCase() !== 'admin' && auth.role.toLowerCase() !== 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch unique parts of speech
    const posResults = await prisma.word.findMany({
      select: { partOfSpeech: true },
      distinct: ['partOfSpeech'],
    })
    
    const partsOfSpeechSet = new Set<string>()
    posResults.forEach(r => {
      const pos = r.partOfSpeech
      if (Array.isArray(pos)) {
        pos.forEach(p => {
          if (typeof p === 'string') partsOfSpeechSet.add(p)
        })
      } else if (typeof pos === 'string') {
        partsOfSpeechSet.add(pos)
      }
    })
    const partsOfSpeech = Array.from(partsOfSpeechSet).filter(Boolean).sort()

    // Fetch unique categories from tags
    const allTags = await prisma.word.findMany({
      select: { tags: true },
    })

    const categoriesSet = new Set<string>()
    allTags.forEach(w => {
      const tags = safeJsonParse(w.tags)
      if (Array.isArray(tags)) {
        tags.forEach(t => {
          if (typeof t === 'string' && t.length > 0) categoriesSet.add(t)
        })
      }
    })

    // Filter out known POS and Levels from categories to keep it clean
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    const categories = Array.from(categoriesSet)
      .filter(c => !partsOfSpeech.includes(c) && !levels.includes(c))
      .sort()

    return NextResponse.json({ 
      partsOfSpeech, 
      categories 
    })
  } catch (error) {
    console.error('Metadata error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
