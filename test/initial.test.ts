import { describe, it, expect } from 'vitest';

describe('Initial Setup Test', () => {
  it('should pass this basic test to verify vitest is working', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have access to global variables if configured', () => {
    expect(vi).toBeDefined();
  });
});
