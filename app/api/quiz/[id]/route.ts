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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { 
        createdBy: { select: { id: true, name: true, email: true } },
        attempts: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' }
        }
      },
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Authorization: Only creator or admin can see attempts/analysis
    const role = auth.role?.toLowerCase()
    const isAuthorized = role === 'admin' || quiz.createdById === auth.id
    
    const wordIds: string[] = JSON.parse(quiz.wordIds)
    const words = await prisma.word.findMany({
      where: { id: { in: wordIds } },
    })

    return NextResponse.json({
      ...quiz,
      wordIds,
      attempts: isAuthorized ? quiz.attempts : [],
      isAuthorized,
      words: words.map(w => ({
        ...w,
        images: typeof w.images === 'string' ? JSON.parse(w.images) : w.images,
        scenarioImages: typeof w.scenarioImages === 'string' ? JSON.parse(w.scenarioImages) : w.scenarioImages,
      })),
    })
  } catch (error) {
    console.error('Quiz error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(request)
    if (!auth || auth.role === 'User') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, description, type, wordIds } = body

    const updateData: any = {}
    if (title) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (type) updateData.type = type
    if (wordIds) updateData.wordIds = JSON.stringify(wordIds)

    const quiz = await prisma.quiz.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, quiz: { ...quiz, wordIds } })
  } catch (error) {
    console.error('Quiz update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth(request)
    if (!auth || auth.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await prisma.quiz.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Quiz delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
