import { prisma } from '@/lib/db'

/**
 * Retrieves or creates a DailySession for the current user for today.
 * Normalizes the date to midnight UTC to ensure one session per day.
 */
export async function getOrCreateSession(userId: string) {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  return prisma.dailySession.upsert({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    create: {
      userId,
      date: today,
      learnCount: 0,
      practiceCount: 0,
      learnCorrect: 0,
      practiceCorrect: 0,
      xpEarned: 0,
    },
    update: {},
  })
}

/**
 * Increments counters on the current daily session.
 * Used after each activity to keep progress in sync.
 */
export async function incrementSessionCounters(
  sessionId: string,
  fields: {
    learnCount?: number
    practiceCount?: number
    learnCorrect?: number
    practiceCorrect?: number
    xpEarned?: number
  }
) {
  return prisma.dailySession.update({
    where: { id: sessionId },
    data: {
      learnCount: { increment: fields.learnCount || 0 },
      practiceCount: { increment: fields.practiceCount || 0 },
      learnCorrect: { increment: fields.learnCorrect || 0 },
      practiceCorrect: { increment: fields.practiceCorrect || 0 },
      xpEarned: { increment: fields.xpEarned || 0 },
    },
  })
}

/**
 * Marks the session as completed.
 */
export async function completeSession(sessionId: string) {
  return prisma.dailySession.update({
    where: { id: sessionId },
    data: { completedAt: new Date() },
  })
}
