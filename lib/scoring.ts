import { UserProgress, PracticeHistory, Word } from '@prisma/client'

interface WordCandidate {
  word: Word
  progress: UserProgress | null
  recentMistakes: number
  daysSincePractice: number
  modeAccuracy: number // Accuracy in the specific requested mode
}

interface WeightConfig {
  srs: number
  retention: number
  practiceGap: number
  difficulty: number
  modeWeakness: number
}

const DEFAULT_WEIGHTS: WeightConfig = {
  srs: 0.30,
  retention: 0.25,
  practiceGap: 0.20,
  difficulty: 0.15,
  modeWeakness: 0.10,
}

/**
 * Calculates a priority score for a word candidate.
 * Higher score = higher priority for practice.
 */
export function scoreCandidate(
  candidate: WordCandidate,
  weights: WeightConfig = DEFAULT_WEIGHTS
): number {
  const { progress, recentMistakes, daysSincePractice, modeAccuracy } = candidate

  // 1. SRS Urgency: Inverse of interval. Short interval (forgotten recently) = higher urgency?
  // Actually, for practice, we want to target words that are *at risk* but not necessarily the ones due *right now* (those are in Learn queue).
  // However, reinforcing words just learned (interval 0) is good.
  // Let's use: 1 / (1 + interval). High for new/forgotten, low for mastered.
  const interval = progress?.interval || 0
  const srsScore = 1 / (1 + interval)

  // 2. Retention Deficit: Based on recent mistakes.
  // More mistakes = higher score.
  const retentionScore = Math.min(1, recentMistakes / 3) // Cap at 3 mistakes

  // 3. Practice Gap: Days since last practice.
  // Longer gap = higher score (spaced repetition).
  const practiceGapScore = Math.min(1, daysSincePractice / 7)

  // 4. Difficulty: Inverse of easeFactor.
  // Low easeFactor = hard word = higher score.
  const easeFactor = progress?.easeFactor || 2.5
  const difficultyScore = Math.max(0, Math.min(1, 1 - (easeFactor / 3.0)))

  // 5. Mode Weakness: Inverse of mode accuracy.
  // Low accuracy = higher score.
  const modeWeaknessScore = 1 - modeAccuracy

  return (
    weights.srs * srsScore +
    weights.retention * retentionScore +
    weights.practiceGap * practiceGapScore +
    weights.difficulty * difficultyScore +
    weights.modeWeakness * modeWeaknessScore
  )
}

/**
 * Sorts candidates by score descending.
 */
export function rankCandidates(
  candidates: WordCandidate[],
  weights?: WeightConfig
): WordCandidate[] {
  return candidates
    .map((c) => ({ ...c, score: scoreCandidate(c, weights) }))
    .sort((a, b) => (b as any).score - (a as any).score)
}
