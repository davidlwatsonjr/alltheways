import { describe, expect, it } from 'vitest';
import { brailleFor, courses, morseMap, translateText, unicodeBraille } from './courses';
describe('curriculum', () => {
  it('includes 26 ASL letters and correct dynamic J/Z guidance', () => {
    expect(courses[0].cards).toHaveLength(26);
    expect(courses[0].cards.find(card => card.label === 'J')?.motion).toBeTruthy();
    expect(courses[0].cards.find(card => card.label === 'Z')?.motion).toBeTruthy();
  });
  it('encodes grade 1 braille and number prefix', () => {
    expect(unicodeBraille([1])).toBe('⠁');
    expect(translateText('braille', 'ab')).toBe('⠁⠃');
    expect(brailleFor('1')).toEqual([[3,4,5,6],[1]]);
    expect(translateText('braille', '1')).toBe('⠼⠁');
  });
  it('has international morse for A to Z and 0 to 9', () => {
    expect(courses[2].cards.filter(c => c.group === 'letters')).toHaveLength(26);
    expect(courses[2].cards.filter(c => c.group === 'numbers')).toHaveLength(10);
    expect(morseMap.S).toBe('...');
    expect(morseMap.O).toBe('---');
    expect(translateText('morse', 'SOS')).toBe('... --- ...');
  });
});
