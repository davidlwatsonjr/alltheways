import { describe, expect, it } from 'vitest';
import { calculateMetrics, cardsFor, decodeBraille, decodeMorse, generateQuestions, matchesAnswer, wordBank } from './practice';
import { brailleFor, unicodeBraille } from '../data/courses';

describe('testing engine', () => {
  it('creates bidirectional letter and word questions for every system', () => {
    for (const course of ['asl','braille','morse'] as const) for (const unit of ['letter','word'] as const) for (const direction of ['encode','decode'] as const) {
      const questions = generateQuestions(course, unit, direction, 14);
      expect(questions).toHaveLength(14);
      for (const question of questions) {
        expect(question.options).toHaveLength(4);
        expect(new Set(question.options).size).toBe(4);
        expect(question.options).toContain(question.answer);
        expect(cardsFor(course, question.answer)).toHaveLength(question.answer.length);
      }
    }
  });
  it('excludes ASL letters that require motion from static tests', () => {
    expect(generateQuestions('asl','letter','decode',60).every(q => !['J','Z'].includes(q.answer))).toBe(true);
  });
  it('keeps word prompts compatible with ASL fingerspelling references', () => {
    expect(wordBank.every(w => !/[JZ]/.test(w) && /^[A-Z]{3,5}$/.test(w))).toBe(true);
  });
  it('computes time, accuracy, and speed with zero-safe bounds', () => {
    expect(calculateMetrics([{correct:true,milliseconds:1400,characters:4},{correct:false,milliseconds:2600,characters:3}],60))
      .toEqual({answered:2,correct:1,accuracy:50,averageSeconds:2,itemsPerMinute:2,correctPerMinute:1,charactersPerMinute:4});
    expect(calculateMetrics([],0).accuracy).toBe(0);
  });
  it('accepts case and whitespace consistently', () => {
    expect(matchesAnswer('  moon ', 'MOON')).toBe(true);
    expect(matchesAnswer('MOO', 'MOON')).toBe(false);
  });
  it('decodes Morse words and Braille letters and numbers', () => {
    expect(decodeMorse('.... . .-.. .-.. --- / .-- --- .-. .-.. -..')).toBe('HELLO WORLD');
    const braille = unicodeBraille(brailleFor('A')![0]) + ' ' + brailleFor('3')!.map(unicodeBraille).join('');
    expect(decodeBraille(braille)).toBe('a 3');
  });
});
