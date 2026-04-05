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
    const auth = await getAuth(request)
    if (!auth || (auth.role.toLowerCase() !== 'admin' && auth.role.toLowerCase() !== 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch unique parts of speech
    const posResults = await prisma.word.findMany({
      select: { partOfSpeech: true },
      distinct: ['partOfSpeech'],
    })
    const partsOfSpeech = posResults
      .map(r => r.partOfSpeech)
      .filter(Boolean)
      .sort()

    // Fetch unique categories from tags
    // Since tags is a JSON string in SQLite, we fetch all and parse in memory for simplicity
    const allTags = await prisma.word.findMany({
      select: { tags: true },
    })

    const categoriesSet = new Set<string>()
    allTags.forEach(w => {
      try {
        const tags = JSON.parse(w.tags || '[]')
        if (Array.isArray(tags)) {
          // Typically the second tag is the category (e.g. ['noun', 'food', 'A1'])
          // But to be safe and dynamic, we collect all except the first (POS) and last (Level)?
          // Actually, let's just collect all tags and the UI can filter or the user can choose.
          // The request says "categories", so we take everything that isn't a POS or Level if possible.
          // For now, let's just grab all unique tags to give the user full flexibility.
          tags.forEach(t => {
            if (t && t.length > 0) categoriesSet.add(t)
          })
        }
      } catch (e) {
        console.error('Failed to parse tags:', w.tags)
      }
    })

    // Filter out known POS and Levels from categories to keep it clean
    const levels = ['A1', 'A2', 'B1']
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
