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

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth || (auth.role?.toLowerCase() !== 'admin' && auth.role?.toLowerCase() !== 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const words = await prisma.word.findMany({
      orderBy: { word: 'asc' },
    })

    const headers = [
      'word',
      'partOfSpeech',
      'level',
      'phonetic',
      'meaning',
      'examples',
      'images',
      'scenario',
      'scenarioImages',
      'emotionalConnection',
      'tags'
    ]

    const csvRows = [headers.join(',')]

    for (const w of words) {
      const examples = JSON.parse(w.examples || '[]').join(';')
      const images = JSON.parse(w.images || '[]').join(';')
      const scenarioImages = JSON.parse(w.scenarioImages || '[]').join(';')
      const tags = JSON.parse(w.tags || '[]').join(';')

      const row = [
        w.word,
        w.partOfSpeech,
        w.level,
        w.phonetic || '',
        w.meaning || '',
        examples,
        images,
        w.scenario || '',
        scenarioImages,
        w.emotionalConnection || '',
        tags
      ].map(val => {
        // Simple CSV escape: wrap in quotes and escape internal quotes
        const str = String(val).replace(/"/g, '""')
        return `"${str}"`
      })

      csvRows.push(row.join(','))
    }

    const csvContent = csvRows.join('\n')

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=word_library_backup_${new Date().toISOString().split('T')[0]}.csv`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
