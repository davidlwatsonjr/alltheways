import type { CourseId } from '../data/courses';
export interface CardProgress { seen: number; correct: number; again: number; last: number; mastered: boolean; }
export type Progress = Record<string, CardProgress>;
export interface Preferences { course: CourseId; starred: string[]; progress: Progress; }
export const storageKey = 'alltheways:state:v1';
export const initialPreferences: Preferences = { course: 'asl', starred: [], progress: {} };
export function readPreferences(): Preferences {
  if (typeof localStorage === 'undefined') return initialPreferences;
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
    if (!parsed || typeof parsed !== 'object') return initialPreferences;
    const data = parsed as Partial<Preferences>;
    return {
      course: ['asl','braille','morse'].includes(data.course ?? '') ? data.course! : 'asl',
      starred: Array.isArray(data.starred) ? data.starred.filter(x => typeof x === 'string') : [],
      progress: data.progress && typeof data.progress === 'object' && !Array.isArray(data.progress) ? data.progress : {}
    };
  } catch { return initialPreferences; }
}
export function rateCard(progress: Progress, id: string, correct: boolean): Progress {
  const prev = progress[id] ?? {seen: 0, correct: 0, again: 0, last: 0, mastered: false};
  const next = {
    seen: prev.seen + 1,
    correct: prev.correct + Number(correct),
    again: prev.again + Number(!correct),
    last: Date.now(),
    mastered: correct ? prev.correct + 1 >= 2 : false
  };
  return {...progress, [id]: next};
}
