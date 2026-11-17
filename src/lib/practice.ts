import { brailleFor, courseById, morseMap, unicodeBraille, type CourseId, type SymbolCard } from '../data/courses';

export type TestUnit = 'letter' | 'word';
export type TestDirection = 'decode' | 'encode';
export type TestLength = '10' | '60' | '180';
export interface Question {
  id: string;
  answer: string;
  options: string[];
  unit: TestUnit;
  direction: TestDirection;
}
export interface Attempt { correct: boolean; milliseconds: number; characters: number; }
export interface Metrics {
  answered: number; correct: number; accuracy: number; averageSeconds: number;
  itemsPerMinute: number; correctPerMinute: number; charactersPerMinute: number;
}
export const wordBank = [
  'ACE','ACT','AGE','AIR','ANT','ARM','ART','ASK','BAD','BAG','BAR','BAT',
  'BED','BEE','BET','BIG','BIT','BOAT','BOOK','BOX','BUS','BUT','CAN','CAP',
  'CAR','CAT','CUP','CUT','DAY','DEN','DID','DIG','DOG','DOT','DRY','EAR',
  'EAT','EEL','EGG','END','FAN','FAR','FAST','FAT','FEAR','FEED','FEET',
  'FELL','FELT','FIND','FIRE','FISH','FIT','FIX','FLAG','FLAT','FLEW',
  'FLOW','FLY','FOAM','FOOD','FOOT','FOR','FROG','FULL','FUN','FUR','GAP',
  'GAS','GATE','GET','GIFT','GIRL','GIVE','GLAD','GLOW','GO','GOAT','GOD',
  'GOLD','GOOD','GOT','GROW','GUM','GUN','GUY','HAD','HAM','HAND','HANG',
  'HARD','HAT','HAVE','HAY','HE','HEAD','HEAR','HEAT','HELD','HELP','HEN',
  'HER','HERO','HIDE','HIGH','HILL','HIM','HIP','HIS','HIT','HOLD','HOME',
  'HOPE','HOP','HOT','HOW','HUG','HUM','HUNT','HURT','ICE','ICY','IDEA',
  'IF','ILL','IN','INK','INTO','IRON','IS','IT','ITEM','IVY','KEY','KID',
  'KING','KITE','KNEE','KNOW','LAB','LAD','LADY','LAKE','LAMB','LAMP',
  'LAND','LAP','LATE','LAW','LAY','LEAF','LEFT','LEG','LESS','LET','LIE',
  'LIFE','LIFT','LIKE','LILY','LIME','LIMP','LINE','LION','LIP','LIST',
  'LIT','LIVE','LOAD','LOAF','LOAN','LOG','LONG','LOOK','LOOP','LOSE',
  'LOSS','LOST','LOT','LOUD','LOVE','LOW','LUCK','LUNG','MADE','MAIL',
  'MAIN','MAKE','MALL','MAN','MAP','MARCH','MARK','MASS','MAT','MAY',
  'ME','MEAL','MEAN','MEAT','MELT','MEN','MEND','MESH','MET','MID','MILD',
  'MILE','MILK','MILL','MIND','MINE','MINT','MISS','MIST','MOOD','MOON',
  'MORE','MOST','MOTH','MOVE','MOW','MUD','MULE','MUST','MY','NAME','NAP',
  'NEAR','NEAT','NECK','NEED','NEST','NET','NEW','NICE','NIGHT','NINE',
  'NO','NODE','NONE','NOON','NORTH','NOSE','NOT','NOTE','NOW','NUT','OAK',
  'OAR','OAT','ODD','OFF','OIL','OLD','ON','ONCE','ONE','ONLY','OPEN',
  'OR','OUR','OUT','OVAL','OVEN','OVER','OWL','OWN','PACK','PAD','PAGE',
  'PAID','PAIN','PAIR','PAL','PALE','PAN','PARK','PART','PASS','PAST',
  'PAT','PATH','PAY','PEA','PEAK','PEAR','PEN','PENNY','PET','PICK',
  'PIE','PIG','PILE','PILL','PINE','PINK','PIN','PIPE','PIT','PLAN',
  'PLAY','PLOT','PLUG','PLUM','PLUS','POD','POEM','POET','POLE','POLL',
  'POND','POOL','POOR','POP','PORT','POST','POT','POUR','PULL','PUMP',
  'PURE','PUSH','PUT','RACE','RACK','RAGE','RAG','RAIL','RAIN','RAN',
  'RANG','RANK','RAP','RARE','RASH','RAT','RATE','RAW','RAY','READ',
  'REAL','RED','REED','RELY','RENT','REST','RICE','RICH','RIDE','RIG',
  'RIM','RING','RIPE','RISE','RISK','ROAD','ROAM','ROAR','ROBE','ROCK',
  'ROLE','ROLL','ROOF','ROOM','ROOT','ROPE','ROSE','ROT','ROW','RUB',
  'RUG','RULE','RUN','RUSH','RUST','SAD','SAFE','SAG','SAID','SAIL',
  'SALE','SALT','SAME','SAND','SANG','SAP','SAT','SAVE','SAW','SAY',
  'SEA','SEAL','SEAM','SEAT','SEE','SEED','SEEK','SEEM','SEEN','SELF',
  'SELL','SEND','SENT','SET','SEW','SHADE','SHAKE','SHAME','SHAPE','SHARE',
  'SHARK','SHE','SHED','SHEEP','SHELF','SHELL','SHIP','SHOE','SHOP',
  'SHORT','SHOW','SHUT','SICK','SIDE','SIGH','SIGN','SILK','SILL',
  'SING','SINK','SIP','SIR','SIT','SIX','SKI','SKIN','SKIP','SKY',
  'SLAM','SLAP','SLID','SLIM','SLIP','SLOW','SMALL','SMELL','SMILE',
  'SMOKE','SNACK','SNAIL','SNAKE','SNAP','SNOW','SO','SOAP','SOAR',
  'SOCK','SODA','SOFT','SOIL','SOLD','SOLE','SOME','SON','SONG','SOON',
  'SORE','SORT','SOUL','SOUP','SOUR','SOUTH','SOW','SPACE','SPARE',
  'SPEAK','SPEED','SPEND','SPIN','SPOT','SPRAY','SPY','STAR','STAY',
  'STEP','STEW','STICK','STILL','STIR','STOP','STORE','STORM','STORY',
  'STOVE','STRAW','STRIP','STUDY','STUN','SUCH','SUGAR','SUIT','SUM',
  'SUN','SUNG','SURE','SURF','SWAM','SWAN','SWAP','SWAY','SWIM','SWING',
  'SWIRL','SWITCH','SWORD','TABLE','TAIL','TAKE','TALE','TALK','TALL',
  'TAME','TANK','TAP','TAPE','TASK','TAX','TEA','TEAM','TEAR','TEASE',
  'TELL','TEN','TENT','TERM','TEST','TEXT','THAN','THANK','THAT',
  'THE','THEM','THEN','THERE','THESE','THEY','THIN','THING','THINK',
  'THIS','THOSE','THREE','THREW','THROW','TICK','TIDE','TIDY','TIE',
  'TIGER','TILL','TIME','TIN','TINY','TIP','TIRE','TO','TOAD','TOE',
  'TOLD','TOLL','TONE','TOO','TOOK','TOOL','TOP','TORN','TOSS','TOTAL',
  'TOUR','TOWN','TOY','TRACK','TRAIL','TRAIN','TRAP','TRAY','TREE',
  'TRICK','TRIED','TRIM','TRIP','TRUE','TRUST','TRY','TUB','TUCK',
  'TUG','TULIP','TUNE','TURF','TURN','TWIN','TWO','TYPE','UNIT','UP',
  'UPON','URGE','US','USE','USED','USER','VAN','VARY','VASE','VAST',
  'VAT','VEAL','VEIL','VENT','VERY','VEST','VET','VIA','VIBE',
  'VICE','VIEW','VINE','VOTE','VOW','WAGE','WAGON','WAIT','WAKE','WALK',
  'WALL','WAND','WANT','WAR','WARM','WARN','WART','WAS','WASH','WASTE',
  'WATCH','WATER','WAVE','WAX','WAY','WE','WEAK','WEAR','WEB',
  'WEEK','WELL','WENT','WERE','WEST','WET','WHALE','WHAT','WHEAT',
  'WHEEL','WHEN','WHERE','WHICH','WHILE','WHIP','WHITE','WHO','WHOLE',
  'WHY','WIDE','WIFE','WILD','WILL','WIN','WIND','WINE','WING','WINK',
  'WIPE','WIRE','WISE','WISH','WITH','WOLF','WOMAN','WON','WOOD',
  'WOOL','WORD','WORK','WORM','WORN','WORRY','WORTH','WOULD','WOVE',
  'WRAP','WREN','WRIST','WRITE','WRONG','WROTE','YARD','YARN','YAWN',
  'YEAH','YEAR','YELL','YES','YET','YIELD','YOGA','YOKE','YOU','YOUNG',
  'YOUR','YOUTH','YUM'
].filter(word => word.length >= 3 && word.length <= 5 && !/[JZ]/.test(word));

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const j = Math.floor(random() * (index + 1));
    [result[index], result[j]] = [result[j], result[index]];
  }
  return result;
}

export function cardsFor(courseId: CourseId, text: string): SymbolCard[] {
  const cards = courseById[courseId].cards;
  return [...text.toUpperCase()].map(letter => cards.find(c => c.label === letter)).filter((card): card is SymbolCard => Boolean(card));
}

export function generateQuestions(courseId: CourseId, unit: TestUnit, direction: TestDirection, amount = 120, random: () => number = Math.random): Question[] {
  const values = unit === 'letter'
    ? courseById[courseId].cards.filter(c => c.group === 'letters').map(c => c.label)
    : wordBank;
  if (values.length < 4) return [];
  const result: Question[] = [];
  let batch: string[] = [];
  for (let i = 0; i < amount; i++) {
    if (!batch.length) batch = shuffle(values, random);
    const answer = batch.pop()!;
    const distractors = shuffle(values.filter(v => v !== answer && (unit === 'letter' || Math.abs(v.length - answer.length) <= 1)), random).slice(0, 3);
    result.push({
      id: `${courseId}:${unit}:${direction}:${i}`,
      answer,
      options: shuffle([answer, ...distractors], random),
      unit,
      direction
    });
  }
  return result;
}

export function matchesAnswer(input: string, expected: string): boolean {
  return input.toUpperCase().trim().replace(/\s+/g, ' ') === expected.toUpperCase().trim();
}

export function calculateMetrics(attempts: Attempt[], seconds: number): Metrics {
  const answered = attempts.length;
  const correctAttempts = attempts.filter(a => a.correct);
  const safeSeconds = Math.max(seconds, 1);
  return {
    answered,
    correct: correctAttempts.length,
    accuracy: answered ? Math.round(correctAttempts.length / answered * 100) : 0,
    averageSeconds: answered ? Math.round(attempts.reduce((sum, a) => sum + a.milliseconds, 0) / answered / 100) / 10 : 0,
    itemsPerMinute: Math.round(answered * 60 / safeSeconds * 10) / 10,
    correctPerMinute: Math.round(correctAttempts.length * 60 / safeSeconds * 10) / 10,
    charactersPerMinute: Math.round(correctAttempts.reduce((sum, a) => sum + a.characters, 0) * 60 / safeSeconds * 10) / 10
  };
}

const morseInverse = Object.fromEntries(Object.entries(morseMap).map(([key, value]) => [value, key]));
export function decodeMorse(input: string): string {
  return input.trim().split(/\s*\/\s*|\s{3,}/).map(word =>
    word.trim().split(/\s+/).map(char => morseInverse[char.replaceAll('·', '.').replaceAll('−', '-')] ?? '?').join('')
  ).join(' ').trim();
}

const letterDots = Object.fromEntries(courseById.braille.cards.filter(c => c.group === 'letters')
  .map(card => [unicodeBraille(card.dots![0]), card.label]));
const digitDots: Record<string, string> = Object.fromEntries('1234567890'.split('').map(ch => {
  const cells = brailleFor(ch)!;
  return [unicodeBraille(cells[1]), ch];
}));
const numericIndicator = unicodeBraille([3,4,5,6]);
const capitalIndicator = unicodeBraille([6]);
export function decodeBraille(input: string): string {
  let numbers = false;
  let capital = false;
  let output = '';
  for (const ch of input) {
    if (/\s/.test(ch)) { numbers = false; capital = false; output += ch; continue; }
    if (ch === numericIndicator) { numbers = true; continue; }
    if (ch === capitalIndicator) { capital = true; numbers = false; continue; }
    if (numbers && digitDots[ch]) { output += digitDots[ch]; continue; }
    numbers = false;
    output += (letterDots[ch] ?? '?')[capital ? 'toUpperCase' : 'toLowerCase']();
    capital = false;
  }
  return output;
}
