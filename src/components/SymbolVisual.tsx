import { useState } from 'react';
import { Hand, MoveUpRight, Volume2 } from 'lucide-react';
import type { CourseId, SymbolCard } from '../data/courses';
import { playMorse } from '../lib/audio';

export function BrailleCell({ dots }: { dots: number[] }) {
  return <span className="braille-cell" aria-hidden="true">
    {[1,4,2,5,3,6].map(number => <span key={number} className={`braille-dot ${dots.includes(number) ? 'filled' : ''}`} />)}
  </span>;
}
export function SymbolVisual({ course, card, compact = false }: { course: CourseId; card: SymbolCard; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (course === 'braille') return <div className={`symbol-visual braille-visual ${compact ? 'compact' : ''}`} role="img" aria-label={`Braille dots ${card.dots?.map(d => d.join(', ')).join(' then ')}`}>
    {card.dots?.map((dots, i) => <BrailleCell key={i} dots={dots} />)}
    {!compact && <small>{card.dots?.map(d => d.join('–')).join(' / ')} {card.group === 'numbers' && '· number sign + digit'}</small>}
  </div>;
  if (course === 'morse') return <div className={`symbol-visual morse-visual ${compact ? 'compact' : ''}`}>
    <div className="morse-marks" role="img" aria-label={`Morse code: ${card.code.replaceAll('.', 'dot ').replaceAll('-', 'dash ')}`}>
      {[...card.code].map((symbol, i) => <span key={i} className={symbol === '-' ? 'dash' : 'dot'} />)}
    </div>
    {!compact && <div className="morse-footer"><span>{card.code.replaceAll('.', '·').replaceAll('-', '−')}</span><button className="audio-button" onClick={(e) => {e.stopPropagation(); void playMorse(card.label);}} aria-label={`Play Morse for ${card.label}`}><Volume2 size={19} /> Listen</button></div>}
  </div>;
  if (card.motion) return <div className={`symbol-visual sign-visual sign-motion ${compact ? 'compact' : ''}`}>
    <Hand className="motion-hand" size={compact ? 43 : 83} strokeWidth={1.4} aria-hidden="true" />
    {!compact && <><span className="motion-title"><MoveUpRight size={17} /> Motion required</span><p>{card.motion}</p><span className="motion-link">Dynamic handshape</span></>}
  </div>;
  return <div className={`symbol-visual sign-visual ${compact ? 'compact' : ''}`}>
    {!failed ? <img loading="lazy" src={`https://raw.githubusercontent.com/luthfidi/spellhand/5a4e1fa8b13be9cba2262a10914e58f2ca3d6fab/public/letters/asl/${card.label.toLowerCase()}.svg`} alt={`ASL fingerspelling handshape for ${card.label}`} onError={() => setFailed(true)} />
      : <div className="sign-fallback" role="status"><Hand size={compact ? 32 : 58} /><small>Handshape unavailable offline. Connect to load the reference.</small></div>}
    {!compact && <small className="art-credit">ASL alphabet artwork · Wikimedia Commons, public domain</small>}
  </div>;
}
