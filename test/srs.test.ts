import { describe, it, expect } from 'vitest';
import { calculateSRS } from '@/lib/srs';

describe('SRS Algorithm Logic (Anki-style SM-2)', () => {
  it('should set 10-min review for "Again" (quality < 3)', () => {
    const result = calculateSRS(1); // Again
    expect(result.interval).toBe(0);
    const now = new Date();
    // Should be around 10 minutes from now
    expect(result.nextReviewDate.getTime()).toBeGreaterThan(now.getTime());
    expect(result.nextReviewDate.getMinutes()).toBeCloseTo((now.getMinutes() + 10) % 60, -1);
  });

  it('should set graduated intervals for new words', () => {
    const hard = calculateSRS(3, { interval: 0, easeFactor: 2.5, masteryLevel: 0, timesReviewed: 0 });
    const good = calculateSRS(4, { interval: 0, easeFactor: 2.5, masteryLevel: 0, timesReviewed: 0 });
    const easy = calculateSRS(5, { interval: 0, easeFactor: 2.5, masteryLevel: 0, timesReviewed: 0 });

    expect(hard.interval).toBe(1);
    expect(good.interval).toBe(3);
    expect(easy.interval).toBe(4);
  });

  it('should correctly increase interval for "Good" response', () => {
    const current = { interval: 6, easeFactor: 2.5, masteryLevel: 2, timesReviewed: 3 };
    const result = calculateSRS(4, current);
    
    // 6 * 2.5 = 15
    expect(result.interval).toBe(15);
    expect(result.easeFactor).toBe(2.5); // 4 (Good) doesn't change EF in SM-2
  });

  it('should penalize Ease Factor for "Hard" response', () => {
    const current = { interval: 10, easeFactor: 2.5, masteryLevel: 3, timesReviewed: 5 };
    const result = calculateSRS(3, current);
    
    // 10 * 1.2 = 12 (Hard multiplier is 1.2)
    expect(result.interval).toBe(12);
    expect(result.easeFactor).toBeLessThan(2.5);
  });

  it('should reward "Easy" response with interval bonus', () => {
    const current = { interval: 10, easeFactor: 2.0, masteryLevel: 3, timesReviewed: 5 };
    const result = calculateSRS(5, current);
    
    // 10 * (2.0 * 1.3) = 26
    expect(result.interval).toBe(26);
    expect(result.easeFactor).toBeGreaterThan(2.0);
  });
});
