import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserId } from '@/lib/auth-utils'
import { scoreCandidate } from '@/lib/scoring'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'meaning'
    const count = Math.min(parseInt(searchParams.get('count') || '10'), 20)

    // 1. Get candidate words: Learned words, limited to 100 most urgent by SRS
    // We fetch UserProgress with Word data
    const progressRecords = await prisma.userProgress.findMany({
      where: { userId, learned: true },
      include: { word: true },
      orderBy: { nextReviewDate: 'asc' },
      take: 100,
    })

    if (progressRecords.length === 0) {
      return NextResponse.json({ words: [], message: 'No words to practice. Learn some first!' })
    }

    // 2. Batch fetch practice stats for these words
    const wordIds = progressRecords.map((p) => p.wordId)
    
    // Get recent mistakes (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const mistakes = await prisma.practiceHistory.groupBy({
      by: ['wordId'],
      where: {
        userId,
        wordId: { in: wordIds },
        isCorrect: false,
        timestamp: { gte: sevenDaysAgo },
      },
      _count: { _all: true },
    })
    const mistakeMap = new Map(mistakes.map((m) => [m.wordId, m._count._all]))

    // Get last practice date per word
    const lastPractices = await prisma.practiceHistory.findMany({
      where: { userId, wordId: { in: wordIds } },
      orderBy: { timestamp: 'desc' },
      select: { wordId: true, timestamp: true },
    })
    // Deduplicate to get latest per word
    const latestPracticeMap = new Map<string, Date>()
    lastPractices.forEach((p) => {
      if (!latestPracticeMap.has(p.wordId)) {
        latestPracticeMap.set(p.wordId, p.timestamp)
      }
    })

    // Get mode accuracy
    // For simplicity, we'll compute this on the fly or approximate. 
    // A full aggregation might be heavy. Let's approximate modeAccuracy as 0.5 if no data, 
    // or compute from a smaller sample if needed. 
    // For now, let's use a simplified heuristic: if mode is requested, assume we want to target weak spots.
    // We can fetch specific mode stats if performance allows.
    // Let's skip complex mode accuracy for now and rely on general mistakes.
    const modeAccuracyMap = new Map<string, number>() // Default 0.5

    // 3. Score candidates
    const candidates = progressRecords.map((p) => {
      const recentMistakes = mistakeMap.get(p.wordId) || 0
      const lastPractice = latestPracticeMap.get(p.wordId)
      const daysSincePractice = lastPractice
        ? Math.max(0, Math.floor((Date.now() - lastPractice.getTime()) / (1000 * 60 * 60 * 24)))
        : 999 // Never practiced

      return {
        word: p.word,
        progress: p,
        recentMistakes,
        daysSincePractice,
        modeAccuracy: modeAccuracyMap.get(p.wordId) || 0.5,
      }
    })

    // Sort by score
    const ranked = candidates.sort((a, b) => scoreCandidate(b) - scoreCandidate(a))

    // Pick top N
    const selected = ranked.slice(0, count)

    // 4. Format response
    // We need to generate options for multiple choice.
    // For now, return the words and let the frontend handle question generation or 
    // generate simple options here.
    // Generating options here is better for consistency.
    
    const wordsForQuestions = selected.map((c) => c.word)
    
    // Fetch distractors (other words)
    const distractors = await prisma.word.findMany({
      where: { id: { notIn: selected.map((s) => s.word.id) } },
      take: 50, // Pool of distractors
      select: { id: true, meaning: true, word: true },
    })

    const responseWords = selected.map((c) => {
      const correctWord = c.word
      // Generate options
      const options = [correctWord.meaning]
      const pool = distractors.filter((d) => d.meaning && d.meaning !== correctWord.meaning)
      while (options.length < 4 && pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length)
        const opt = pool.splice(idx, 1)[0]
        if (opt.meaning) options.push(opt.meaning)
      }
      // Shuffle options
      options.sort(() => Math.random() - 0.5)

      return {
        wordId: correctWord.id,
        word: correctWord.word,
        correctAnswer: correctWord.meaning,
        options: options.length >= 4 ? options : [...options, 'N/A', 'N/A', 'N/A'].slice(0, 4),
        // Metadata for adaptive logic
        masteryLevel: c.progress.masteryLevel,
        priorityScore: scoreCandidate(c),
      }
    })

    return NextResponse.json({ words: responseWords, mode })
  } catch (error) {
    console.error('Practice Queue error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
