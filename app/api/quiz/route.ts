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
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const creatorOnly = searchParams.get('creatorOnly')

    const where = creatorOnly === 'true' && auth.role === 'Teacher' 
      ? { createdById: auth.id } 
      : {}

    const quizzes = await prisma.quiz.findMany({
      where,
      include: { createdBy: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ 
      quizzes: quizzes.map(q => ({
        ...q,
        wordIds: JSON.parse(q.wordIds)
      })) 
    })
  } catch (error) {
    console.error('Quizzes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    const role = auth?.role?.toLowerCase()
    if (!auth || (role !== 'admin' && role !== 'teacher')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, type, wordIds } = body

    if (!title || !type || !wordIds?.length) {
      return NextResponse.json({ error: 'Title, type and at least one word are required' }, { status: 400 })
    }

    // Generate a unique 6-digit entry password
    let entryPassword = ''
    let isUnique = false
    while (!isUnique) {
      entryPassword = Math.floor(100000 + Math.random() * 900000).toString()
      const existing = await prisma.quiz.findUnique({ where: { entryPassword } })
      if (!existing) isUnique = true
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description: description || null,
        type: type || 'MultipleChoice',
        wordIds: JSON.stringify(wordIds),
        entryPassword,
        isActive: true,
        createdById: auth.id,
      },
    })

    return NextResponse.json({ 
      success: true, 
      quiz: { ...quiz, wordIds: JSON.parse(quiz.wordIds) } 
    })
  } catch (error) {
    console.error('Create quiz error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuth(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = auth.role?.toLowerCase()
    if (role !== 'admin' && role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 })
    }

    const quiz = await prisma.quiz.findUnique({ where: { id } })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Authorization: Admin or Owner only
    const isOwner = quiz.createdById === auth.id
    const isAdmin = auth.role?.toLowerCase() === 'admin'
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own quizzes' }, { status: 403 })
    }

    // Delete related quiz attempts first
    await prisma.quizAttempt.deleteMany({ where: { quizId: id } })
    await prisma.quiz.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete quiz error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
