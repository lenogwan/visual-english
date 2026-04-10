/**
 * Visual English - Advanced SRS Engine (Anki-inspired SM-2)
 * Handles spaced repetition logic with improved granularity.
 */

export type SRSQuality = 1 | 2 | 3 | 4 | 5; // 1: Again, 2: Hard, 3: Good, 4: Easy, 5: Perfect (custom mapping)

export interface SRSState {
  interval: number;      // Days until next review
  easeFactor: number;    // Multiplier for interval
  masteryLevel: number;  // 0-5 visualization level
  timesReviewed: number;
}

export interface SRSResult extends SRSState {
  nextReviewDate: Date;
}

export function calculateSRS(
  quality: SRSQuality,
  current: SRSState = { interval: 0, easeFactor: 2.5, masteryLevel: 0, timesReviewed: 0 }
): SRSResult {
  let { interval, easeFactor, masteryLevel, timesReviewed } = current;

  // 1. Handle "Again" or "Incorrect" (Quality < 3)
  if (quality < 3) {
    interval = 0; // Review again in the same session (0 days)
    easeFactor = Math.max(1.3, easeFactor - 0.2); // Penalize ease factor
    masteryLevel = Math.max(0, masteryLevel - 1);
  } 
  // 2. Handle Correct Responses (Quality >= 3)
  else {
    if (timesReviewed === 0) {
      // First time seeing the word correctly
      if (quality === 3) interval = 1;      // Hard -> 1 day
      else if (quality === 4) interval = 3; // Good -> 3 days
      else interval = 4;                    // Easy -> 4 days
    } else if (interval === 0) {
      // Was forgotten, now relearned
      interval = 1;
    } else {
      // Normal SM-2 progression with Anki-style adjustments
      const multipliers: Record<number, number> = {
        3: 1.2,           // Hard: just a small nudge
        4: easeFactor,    // Good: standard progression
        5: easeFactor * 1.3 // Easy: bonus leap
      };
      
      const multiplier = multipliers[quality] || easeFactor;
      interval = Math.ceil(interval * multiplier);
      
      // Update Ease Factor: EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
      // Standard SM-2 formula but with a floor of 1.3
      easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      easeFactor = Math.max(1.3, easeFactor);
    }
    
    // Increment mastery on correct answers (quality 3=Hard gets slower progress)
    masteryLevel = Math.min(5, Math.floor(masteryLevel + (quality >= 4 ? 1 : quality === 3 ? 0.5 : 0)));
  }

  // 3. Prevent stagnation
  if (interval > 365) interval = 365; // Max 1 year

  // 4. Calculate date
  const nextReviewDate = new Date();
  
  // If interval is 0, set to 10 minutes from now (for same-session review)
  if (interval === 0) {
    nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 10);
  } else {
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);
    nextReviewDate.setHours(4, 0, 0, 0); // Always set to 4 AM for consistent daily resets
  }

  return {
    interval,
    easeFactor,
    masteryLevel,
    timesReviewed: timesReviewed + 1,
    nextReviewDate
  };
}
