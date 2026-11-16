import { describe, expect, it } from 'vitest';
import { rateCard } from './storage';
describe('progress', () => {
  it('masters after two correct reviews and resets on an incorrect review', () => {
    const p1 = rateCard({}, 'asl:A', true);
    expect(p1['asl:A'].mastered).toBe(false);
    const p2 = rateCard(p1, 'asl:A', true);
    expect(p2['asl:A'].mastered).toBe(true);
    expect(rateCard(p2, 'asl:A', false)['asl:A'].mastered).toBe(false);
  });
});
