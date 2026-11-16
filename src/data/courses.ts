export type CourseId = 'asl' | 'braille' | 'morse';
export type Group = 'letters' | 'numbers' | 'punctuation';
export interface SymbolCard {
  id: string;
  label: string;
  group: Group;
  code: string;
  dots?: number[][];
  motion?: string;
  note?: string;
}
export interface Course {
  id: CourseId;
  name: string;
  subtitle: string;
  description: string;
  color: string;
  lessons: string;
  cards: SymbolCard[];
}

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const brailleDots: Record<string, number[]> = {
  A:[1], B:[1,2], C:[1,4], D:[1,4,5], E:[1,5], F:[1,2,4],
  G:[1,2,4,5], H:[1,2,5], I:[2,4], J:[2,4,5], K:[1,3],
  L:[1,2,3], M:[1,3,4], N:[1,3,4,5], O:[1,3,5], P:[1,2,3,4],
  Q:[1,2,3,4,5], R:[1,2,3,5], S:[2,3,4], T:[2,3,4,5],
  U:[1,3,6], V:[1,2,3,6], W:[2,4,5,6], X:[1,3,4,6],
  Y:[1,3,4,5,6], Z:[1,3,5,6]
};
export const numberSign = [3,4,5,6];
const brailleNumbers: Record<string, string> = {
  '1':'A', '2':'B', '3':'C', '4':'D', '5':'E',
  '6':'F', '7':'G', '8':'H', '9':'I', '0':'J'
};
export const morseMap: Record<string, string> = {
  A:'.-', B:'-...', C:'-.-.', D:'-..', E:'.', F:'..-.', G:'--.',
  H:'....', I:'..', J:'.---', K:'-.-', L:'.-..', M:'--', N:'-.',
  O:'---', P:'.--.', Q:'--.-', R:'.-.', S:'...', T:'-', U:'..-',
  V:'...-', W:'.--', X:'-..-', Y:'-.--', Z:'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-',
  '5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',
  '.':'.-.-.-', ',':'--..--', '?':'..--..', '/':'-..-.', '@':'.--.-.'
};

export const courses: Course[] = [
  {
    id: 'asl', name: 'ASL Alphabet', subtitle: 'Speak with your hands',
    description: 'Learn the American Sign Language fingerspelling alphabet.',
    color: '#9d91f8', lessons: '26 letters',
    cards: alphabet.map(letter => ({
      id: `asl:${letter}`, label: letter, group: 'letters', code: letter,
      ...(letter === 'J' ? {motion: 'Trace a J-shaped curve in the air with your raised pinky.', note: 'J is a moving sign, not a static handshape.'} : {}),
      ...(letter === 'Z' ? {motion: 'Draw the shape of a Z in the air with your extended index finger.', note: 'Z is a moving sign, not a static handshape.'} : {})
    }))
  },
  {
    id: 'braille', name: 'Braille', subtitle: 'Read by touch',
    description: 'Explore uncontracted (Grade 1) English Braille using six-dot cells.',
    color: '#f3b65f', lessons: 'Letters + numbers',
    cards: [
      ...alphabet.map(letter => ({id:`braille:${letter}`, label:letter, group:'letters' as const, code: letter, dots:[brailleDots[letter]]})),
      ...'1234567890'.split('').map(digit => ({
        id:`braille:${digit}`, label:digit, group:'numbers' as const, code:digit,
        dots:[numberSign, brailleDots[brailleNumbers[digit]]],
        note:'The number sign comes first. Digits 1–0 use the shapes of letters A–J.'
      }))
    ]
  },
  {
    id: 'morse', name: 'Morse Code', subtitle: 'Every dot counts',
    description: 'Decode and transmit letters, digits and common punctuation.',
    color: '#54d9cf', lessons: 'Letters + numbers + symbols',
    cards: [
      ...alphabet.map(letter => ({id:`morse:${letter}`, label:letter, group:'letters' as const, code:morseMap[letter]})),
      ...'1234567890'.split('').map(digit => ({id:`morse:${digit}`, label:digit, group:'numbers' as const, code:morseMap[digit]})),
      ...['.', ',', '?', '/', '@'].map(symbol => ({id:`morse:${symbol}`, label:symbol, group:'punctuation' as const, code:morseMap[symbol]}))
    ]
  }
];
export const courseById = Object.fromEntries(courses.map(course => [course.id, course])) as Record<CourseId, Course>;
export const brailleFor = (letter: string): number[][] | null => {
  const upper = letter.toUpperCase();
  if (brailleDots[upper]) return [brailleDots[upper]];
  if (brailleNumbers[letter]) return [numberSign, brailleDots[brailleNumbers[letter]]];
  return null;
};
export const unicodeBraille = (dots: number[]): string => {
  const offset = dots.reduce((bits, dot) => bits | (1 << (dot - 1)), 0);
  return String.fromCodePoint(0x2800 + offset);
};
export const translateText = (course: CourseId, input: string): string => {
  if (course === 'asl') return input.toUpperCase().replace(/[^A-Z\s]/g, '');
  if (course === 'braille') return [...input].map(ch => {
    if (ch === ' ') return ' ';
    return brailleFor(ch)?.map(unicodeBraille).join('') ?? '·';
  }).join('');
  return input.toUpperCase().split(' ').map(word => [...word].map(c => morseMap[c] ?? '').filter(Boolean).join(' ')).join(' / ');
};
