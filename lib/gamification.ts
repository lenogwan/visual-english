/**
 * Gamification Logic
 * Handles XP calculation, Level thresholds, and Streak updates.
 */

// Level Thresholds: Cumulative XP required to reach the level
export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'Explorer' },
  { level: 2, xp: 200, title: 'Observer' },
  { level: 3, xp: 500, title: 'Apprentice' },
  { level: 4, xp: 1000, title: 'Builder' },
  { level: 5, xp: 2000, title: 'Navigator' },
  { level: 6, xp: 4000, title: 'Specialist' },
  { level: 7, xp: 7000, title: 'Master' },
  { level: 8, xp: 12000, title: 'Sage' },
  { level: 9, xp: 20000, title: 'Luminary' },
  { level: 10, xp: 35000, title: 'Transcendent' },
]

/**
 * Calculates the user's level based on total XP.
 */
export function calculateLevel(xp: number): { level: number; title: string; nextLevelXp: number; currentLevelXp: number } {
  let currentLevel = 1
  let nextLevelXp = LEVEL_THRESHOLDS[1].xp
  let currentLevelXp = 0

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      currentLevel = LEVEL_THRESHOLDS[i].level
      currentLevelXp = LEVEL_THRESHOLDS[i].xp
      nextLevelXp = LEVEL_THRESHOLDS[i + 1] ? LEVEL_THRESHOLDS[i + 1].xp : LEVEL_THRESHOLDS[i].xp
    } else {
      break
    }
  }

  return {
    level: currentLevel,
    title: LEVEL_THRESHOLDS[currentLevel - 1].title,
    nextLevelXp,
    currentLevelXp,
  }
}

/**
 * Calculates XP progress percentage for the current level.
 */
export function getLevelProgress(xp: number): number {
  const { currentLevelXp, nextLevelXp } = calculateLevel(xp)
  if (nextLevelXp === currentLevelXp) return 100 // Max level
  const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
  return Math.min(100, Math.max(0, progress))
}

/**
 * Updates streak based on last active date.
 * Returns the new streak count and whether a freeze was used.
 */
export function updateStreak(
  currentStreak: number,
  lastActiveDate: Date | null,
  streakFreezes: number
): { newStreak: number; newFreezes: number; usedFreeze: boolean } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  if (!lastActiveDate) {
    return { newStreak: 1, newFreezes: streakFreezes, usedFreeze: false }
  }

  const lastActive = new Date(lastActiveDate)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Check if last active was today or yesterday
  const isToday = lastActive.toDateString() === today.toDateString()
  const isYesterday = lastActive.toDateString() === yesterday.toDateString()

  if (isToday) {
    // Already active today, no change
    return { newStreak: currentStreak, newFreezes: streakFreezes, usedFreeze: false }
  }

  if (isYesterday) {
    // Active yesterday, increment streak
    return { newStreak: currentStreak + 1, newFreezes: streakFreezes, usedFreeze: false }
  }

  // Missed a day
  if (streakFreezes > 0) {
    // Use a freeze
    return { newStreak: currentStreak, newFreezes: streakFreezes - 1, usedFreeze: true }
  }

  // No freeze, reset streak
  return { newStreak: 1, newFreezes: 0, usedFreeze: false }
}

/**
 * Awards XP for SRS grading.
 */
export function awardSrsXP(quality: number): number {
  switch (quality) {
    case 1: return 5  // Again
    case 2: return 8  // Hard
    case 3: return 12 // Good
    case 4: return 15 // Easy
    case 5: return 20 // Perfect
    default: return 5
  }
}

/**
 * Awards XP for Practice answer.
 */
export function awardPracticeXP(isCorrect: boolean, mode: string): number {
  if (isCorrect) {
    switch (mode) {
      case 'spelling': return 20
      case 'scenario': return 10
      default: return 15 // meaning
    }
  }
  return 2 // Effort XP
}
