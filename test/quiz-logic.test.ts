import { describe, it, expect, vi } from 'vitest';

// Mock simple version of the logic we implemented in routes
function generatePassword() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

describe('Quiz System Logic', () => {
  it('should generate a valid 6-digit string password', () => {
    const pwd = generatePassword();
    expect(pwd).toHaveLength(6);
    expect(/^\d{6}$/.test(pwd)).toBe(true);
  });

  it('should generate unique passwords (probabilistic)', () => {
    const pwds = new Set();
    for(let i = 0; i < 100; i++) {
      pwds.add(generatePassword());
    }
    expect(pwds.size).toBe(100);
  });

  it('should calculate student average correctly', () => {
    const attempts = [
      { score: 8, total: 10 },
      { score: 6, total: 10 },
      { score: 10, total: 10 }
    ];
    const avg = (attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length).toFixed(1);
    expect(avg).toBe("8.0");
  });

  it('should identify the hardest word from attempts', () => {
    const attempts = [
      { details: [{ wordId: 'w1', word: 'apple', correct: false }, { wordId: 'w2', word: 'banana', correct: true }] },
      { details: [{ wordId: 'w1', word: 'apple', correct: false }, { wordId: 'w2', word: 'banana', correct: false }] }
    ];
    
    const wordAnalysis: any = {};
    attempts.forEach(attempt => {
      attempt.details.forEach(d => {
        if (!wordAnalysis[d.wordId]) wordAnalysis[d.wordId] = { correct: 0, total: 0 };
        wordAnalysis[d.wordId].total++;
        if (d.correct) wordAnalysis[d.wordId].correct++;
      });
    });

    const hardest = Object.keys(wordAnalysis).sort((a, b) => (wordAnalysis[a].correct / wordAnalysis[a].total) - (wordAnalysis[b].correct / wordAnalysis[b].total))[0];
    expect(hardest).toBe('w1'); // Apple was missed twice
  });
});
