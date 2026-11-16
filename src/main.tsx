import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, CheckCheck, ChevronDown, CircleHelp, Copy, Flame, Grid2X2, Hand, Headphones, Heart, Keyboard, Layers3, Menu, MoreHorizontal, RotateCcw, Shuffle, Sparkles, Star, Trophy, Volume2, X } from 'lucide-react';
import { BrailleCell, SymbolVisual } from './components/SymbolVisual';
import { brailleFor, courseById, courses, translateText, type CourseId, type Group, type SymbolCard } from './data/courses';
import { playMorse } from './lib/audio';
import { initialPreferences, rateCard, readPreferences, storageKey } from './lib/storage';
import './style.css';

type Mode = 'flashcards' | 'quiz' | 'translator';
type Filter = 'all' | Group | 'starred' | 'review';
const reverseOptions = ['Symbol → Letter', 'Letter → Symbol'] as const;
const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
function createQuestions(pool: SymbolCard[], all: SymbolCard[]) {
  return shuffle(pool).slice(0, 10).map(card => ({
    card, options: shuffle([card.label, ...shuffle(all.filter(item => item.label !== card.label)).slice(0, 3).map(item => item.label)])
  }));
}

function App() {
  const [prefs, setPrefs] = useState(readPreferences);
  const [mode, setMode] = useState<Mode>('flashcards');
  const [filter, setFilter] = useState<Filter>('letters');
  const [reverse, setReverse] = useState(false);
  const [random, setRandom] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quizSeed, setQuizSeed] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [typing, setTyping] = useState('HELLO WORLD');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [copied, setCopied] = useState(false);
  const course = courseById[prefs.course];
  const cards = course.cards;
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(prefs)); } catch { /* storage unavailable */ }
  }, [prefs]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLButtonElement || event.target instanceof HTMLSelectElement || event.altKey || event.metaKey || event.ctrlKey) return;
      if (mode === 'flashcards') {
        if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); setFlipped(v => !v); }
        if (event.key === 'ArrowRight') { event.preventDefault(); navigate(1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(-1); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const mastered = cards.filter(card => prefs.progress[card.id]?.mastered).length;
  const studied = cards.filter(card => (prefs.progress[card.id]?.seen ?? 0) > 0).length;
  const totalMastered = courses.reduce((sum, c) => sum + c.cards.filter(card => prefs.progress[card.id]?.mastered).length, 0);
  const totalSeen = Object.values(prefs.progress).reduce((sum, p) => sum + p.seen, 0);
  const deck = useMemo(() => {
    const result = cards.filter(card => {
      if (filter === 'starred') return prefs.starred.includes(card.id);
      if (filter === 'review') return (prefs.progress[card.id]?.seen ?? 0) > 0 && !prefs.progress[card.id]?.mastered;
      return filter === 'all' || card.group === filter;
    });
    return random ? shuffle(result) : result;
    // deck reorders only when the explicit shuffle switch changes, not on progress updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, filter, random, prefs.starred, filter === 'review' ? prefs.progress : undefined]);
  const safeIndex = deck.length ? ((index % deck.length) + deck.length) % deck.length : 0;
  const card = deck[safeIndex];
  const questions = useMemo(() => {
    const pool = filter === 'letters' || filter === 'numbers' || filter === 'punctuation' ? cards.filter(c => c.group === filter) : cards;
    return createQuestions(pool, cards);
  }, [filter, cards, quizSeed]);
  const question = questions[quizIndex];
  const quizFinished = quizIndex >= questions.length;
  const translated = translateText(prefs.course, typing);

  function changeCourse(id: CourseId) {
    setPrefs(p => ({...p, course: id})); setFilter('letters'); setMode('flashcards');
    setIndex(0); setFlipped(false); setQuizSeed(n => n + 1); setQuizIndex(0); setQuizAnswer(null); setQuizScore(0); setMenuOpen(false);
  }
  function changeMode(value: Mode) {
    setMode(value); setMenuOpen(false);
    if (value === 'quiz') restartQuiz();
  }
  function changeFilter(value: Filter) { setFilter(value); setIndex(0); setFlipped(false); restartQuiz(); }
  function navigate(delta: number) { setIndex(i => deck.length ? (i + delta + deck.length) % deck.length : 0); setFlipped(false); }
  function rate(correct: boolean) {
    if (!card) return;
    const id = card.id;
    const willLeaveReviewDeck = filter === 'review' && rateCard(prefs.progress, id, correct)[id].mastered;
    setPrefs(p => ({...p, progress: rateCard(p.progress, id, correct)}));
    if (willLeaveReviewDeck) setFlipped(false);
    else navigate(1);
  }
  function toggleStar(id: string) {
    setPrefs(p => ({...p, starred: p.starred.includes(id) ? p.starred.filter(x => x !== id) : [...p.starred, id]}));
  }
  function restartQuiz() { setQuizSeed(n => n + 1); setQuizIndex(0); setQuizAnswer(null); setQuizScore(0); }
  function answerQuiz(answer: string) {
    if (!question || quizAnswer) return;
    setQuizAnswer(answer);
    const correct = answer === question.card.label;
    if (correct) setQuizScore(score => score + 1);
    setPrefs(p => ({...p, progress: rateCard(p.progress, question.card.id, correct)}));
  }
  async function copyOutput() {
    try { await navigator.clipboard.writeText(translated); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
    catch { setCopied(false); }
  }
  function clearData() {
    if (!window.confirm('Reset all saved study progress and favorites on this device?')) return;
    setPrefs({...initialPreferences, course: prefs.course}); setShowAbout(false); setIndex(0); restartQuiz();
  }

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
      <div className="sidebar-top">
        <button className="brand" onClick={() => {changeCourse('asl'); setMode('flashcards');}} aria-label="All the Ways home">
          <img src="/icons/icon-192.png" alt="" /><span>all the <span className="brand-accent">ways</span><small>A WORLD OF WAYS TO COMMUNICATE</small></span>
        </button>
        <button className="sidebar-close icon-only" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X size={22}/></button>
      </div>
      <p className="sidebar-caption">YOUR CLASSROOM</p>
      <nav className="course-navigation" aria-label="Learning systems">
        {courses.map((entry, i) => {
          const courseMastered = entry.cards.filter(c => prefs.progress[c.id]?.mastered).length;
          return <button key={entry.id} onClick={() => changeCourse(entry.id)} className={`course-link ${prefs.course === entry.id ? 'active' : ''}`}>
            <span className={`course-icon course-icon-${entry.id}`} aria-hidden="true">{entry.id === 'asl' ? <Hand size={20}/> : entry.id === 'braille' ? <span className="mini-braille">⠿</span> : <span className="mini-morse">·−</span>}</span>
            <span className="course-link-label"><strong>{entry.name}</strong><small>{entry.lessons}</small></span>
            {prefs.course === entry.id ? <span className="active-chevron"><ArrowUpRight size={17}/></span> : <span className="course-progress">{courseMastered}</span>}
            {i === 2 && null}
          </button>;
        })}
      </nav>
      <p className="sidebar-caption mode-caption">PRACTICE MODES</p>
      <nav className="mode-navigation" aria-label="Practice modes">
        <button className={mode === 'flashcards' ? 'active' : ''} onClick={() => changeMode('flashcards')}><Layers3 size={19}/> Flashcards</button>
        <button className={mode === 'quiz' ? 'active' : ''} onClick={() => changeMode('quiz')}><CircleHelp size={19}/> Quick quiz</button>
        <button className={mode === 'translator' ? 'active' : ''} onClick={() => changeMode('translator')}><Keyboard size={19}/> Type & translate</button>
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-score"><span className="score-icon"><Trophy size={21}/></span><div><strong>{totalMastered} <small>mastered</small></strong><p>{totalSeen} practice reviews</p></div></div>
        <button className="about-link" onClick={() => {setShowAbout(true); setMenuOpen(false);}}><MoreHorizontal size={19}/> About & settings <ArrowRight size={16}/></button>
      </div>
    </aside>
    {menuOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <main className="content">
      <header className="topbar">
        <div className="mobile-brand"><button className="icon-only" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={23}/></button><img src="/icons/icon-192.png" alt=""/><span>signal<strong>lab</strong></span></div>
        <span className="breadcrumbs"><span>Learn</span><ArrowRight size={14}/><strong>{course.name}</strong></span>
        <div className="topbar-actions"><span className="online-marker"><span/> Saved on this device</span><button className="small-round" onClick={() => setShowAbout(true)} aria-label="About All the Ways"><CircleHelp size={19}/></button></div>
      </header>
      <div className="main-container">
        <div className="intro"><div><div className="eyebrow"><Sparkles size={15}/> YOUR LEARNING SPACE</div><h1>Every new language <span>opens a door.</span></h1><p>Learn to communicate in a whole new way, one symbol at a time.</p></div><div className="decorative-orbit" aria-hidden="true"><span>⠿</span><span>· − ·</span><Hand size={44} strokeWidth={1.4} /></div></div>
        <div className="stats-row">
          <div className="stat"><div className="stat-icon teal"><BookOpen size={20}/></div><div><span>Symbols explored</span><strong>{studied}<small> / {cards.length}</small></strong></div></div>
          <div className="stat"><div className="stat-icon amber"><Trophy size={20}/></div><div><span>Mastered</span><strong>{mastered}<small> / {cards.length}</small></strong></div></div>
          <div className="stat"><div className="stat-icon violet"><Flame size={20}/></div><div><span>Practice reviews</span><strong>{cards.reduce((sum, c) => sum + (prefs.progress[c.id]?.seen || 0), 0)}</strong></div></div>
        </div>
        <section className="workspace" aria-label={`${course.name} practice`}>
          <div className="workspace-heading"><div><div className="eyebrow course-eyebrow">{course.id === 'asl' ? '01 · HANDS' : course.id === 'braille' ? '02 · TOUCH' : '03 · SOUND'}<span className={`eyebrow-dot ${course.id}`} /></div><h2>{course.name}</h2><p>{course.description}</p></div><span className={`course-tag tag-${course.id}`}>{course.lessons}</span></div>
          <div className="mode-tabs" role="tablist" aria-label="Study mode">
            <button role="tab" aria-selected={mode === 'flashcards'} className={mode === 'flashcards' ? 'selected' : ''} onClick={() => changeMode('flashcards')}><Layers3 size={18}/> Flashcards</button>
            <button role="tab" aria-selected={mode === 'quiz'} className={mode === 'quiz' ? 'selected' : ''} onClick={() => changeMode('quiz')}><Grid2X2 size={18}/> Quiz</button>
            <button role="tab" aria-selected={mode === 'translator'} className={mode === 'translator' ? 'selected' : ''} onClick={() => changeMode('translator')}><Keyboard size={18}/> Translator</button>
          </div>
          {mode === 'flashcards' && <div className="study-panel">
            <div className="study-toolbar"><div className="toolbar-left"><label htmlFor="deck-filter">Study set</label><div className="select-wrap"><select id="deck-filter" value={filter} onChange={e => changeFilter(e.target.value as Filter)}><option value="letters">Letters A–Z</option>{course.id !== 'asl' && <option value="numbers">Numbers 0–9</option>}{course.id === 'morse' && <option value="punctuation">Punctuation</option>}<option value="all">All symbols</option><option value="starred">Saved cards</option><option value="review">Needs review</option></select><ChevronDown size={16}/></div></div><div className="toolbar-right"><button className={`toolbar-button ${random ? 'on' : ''}`} onClick={() => {setRandom(v => !v); setIndex(0); setFlipped(false);}} aria-pressed={random} title="Shuffle cards"><Shuffle size={17}/> <span>Shuffle</span></button><button className="toolbar-button" onClick={() => {setReverse(v => !v); setFlipped(false);}} title="Switch card sides"><RotateCcw size={17}/> <span>Reverse</span></button></div></div>
            {card ? <>
              <div className="progress-heading"><div><span className="caps">FLASHCARD DECK</span><span className="deck-position">{safeIndex + 1} <small>/ {deck.length}</small></span></div><span>{reverseOptions[Number(reverse)]}</span></div>
              <div className="deck-meter" aria-label={`Card ${safeIndex + 1} of ${deck.length}`}><div style={{width: `${(safeIndex + 1) / deck.length * 100}%`}} /></div>
              <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={event => {
                if (!(event.target as HTMLElement).closest('button')) setFlipped(v => !v);
              }}>
                <div className="flashcard-top"><span>{flipped ? 'ANSWER' : 'WHAT DOES THIS MEAN?'}</span><button aria-label={prefs.starred.includes(card.id) ? 'Remove from saved cards' : 'Save card'} aria-pressed={prefs.starred.includes(card.id)} className={`favorite ${prefs.starred.includes(card.id) ? 'saved' : ''}`} onClick={() => toggleStar(card.id)}><Star size={20} fill={prefs.starred.includes(card.id) ? 'currentColor' : 'none'} /></button></div>
                <div className="flashcard-body">
                  {(!flipped && reverse) || (flipped && !reverse) ? <div className="answer-letter"><span className="answer-big">{card.label}</span><span className="answer-title">{flipped ? 'That’s the answer' : 'Visualize the symbol'}</span></div> : <SymbolVisual key={card.id} course={course.id} card={card} />}
                  {flipped && card.note && <p className="card-note">{card.note}</p>}
                </div>
                <div className="flashcard-bottom"><span><Heart size={15} /> Learn by repetition</span><button className="flip-control" onClick={() => setFlipped(v => !v)}><RotateCcw size={17}/> {flipped ? 'Show front' : 'Reveal answer'}</button></div>
              </div>
              <div className="card-controls"><button className="nav-button" aria-label="Previous card" onClick={() => navigate(-1)}><ArrowLeft size={20}/></button><div className="rating-buttons">{flipped ? <><button className="rating-again" onClick={() => rate(false)}><RotateCcw size={18}/> Study again</button><button className="rating-know" onClick={() => rate(true)}><Check size={19}/> Got it!</button></> : <p>Reveal the card, then rate how well you knew it.</p>}</div><button className="nav-button" aria-label="Next card" onClick={() => navigate(1)}><ArrowRight size={20}/></button></div>
              <div className="keyboard-help"><Keyboard size={15}/> <span>Space to flip · ← → to navigate</span></div>
            </> : <div className="empty-state"><Star size={35}/><h3>No cards here yet</h3><p>{filter === 'starred' ? 'Tap the star on a flashcard to save it for later.' : 'Review some cards first, or choose a different study set.'}</p><button onClick={() => changeFilter('letters')}>Study all letters <ArrowRight size={16}/></button></div>}
          </div>}
          {mode === 'quiz' && <div className="study-panel quiz-panel">
            {!quizFinished && question ? <>
              <div className="quiz-meta"><span className="caps">QUICK CHECK · 10 QUESTIONS</span><strong>{quizIndex + 1} / {questions.length}</strong></div><div className="deck-meter"><div style={{width: `${(quizIndex + 1) / questions.length * 100}%`}}/></div>
              <h3>Which character matches this symbol?</h3><div className="quiz-symbol"><SymbolVisual key={question.card.id} course={course.id} card={question.card}/></div>
              <div className="answer-options">{question.options.map(option => <button disabled={quizAnswer !== null} onClick={() => answerQuiz(option)} key={option} className={`${quizAnswer && option === question.card.label ? 'correct' : ''} ${quizAnswer === option && option !== question.card.label ? 'incorrect' : ''}`}><span>{option}</span>{quizAnswer && option === question.card.label && <Check size={20}/>} {quizAnswer === option && option !== question.card.label && <X size={20}/>}</button>)}</div>
              {quizAnswer && <div className="quiz-feedback" aria-live="polite"><span>{quizAnswer === question.card.label ? 'Nice work — that’s correct!' : `Not quite. The answer is ${question.card.label}.`}</span><button onClick={() => {setQuizIndex(v => v + 1); setQuizAnswer(null);}}>{quizIndex + 1 === questions.length ? 'See results' : 'Next question'} <ArrowRight size={17}/></button></div>}
            </> : <div className="quiz-finished"><span className="trophy-hero"><Trophy size={47}/></span><span className="caps">SESSION COMPLETE</span><h3>{quizScore} / {questions.length}</h3><p>{quizScore >= 8 ? 'Excellent work. Keep that momentum going.' : 'Every review makes the next one easier.'}</p><button className="primary-action" onClick={restartQuiz}>Try another quiz <ArrowRight size={19}/></button></div>}
          </div>}
          {mode === 'translator' && <div className="study-panel translator-panel"><div className="translator-title"><div><span className="caps">FREE PRACTICE</span><h3>Type something. See it differently.</h3><p>{course.id === 'asl' ? 'Spell a word with ASL alphabet handshapes.' : course.id === 'braille' ? 'Convert letters and numbers to uncontracted Braille cells.' : 'Turn words into International Morse code.'}</p></div></div>
            <label className="input-label" htmlFor="translator-input">YOUR TEXT</label><textarea id="translator-input" maxLength={120} rows={3} value={typing} onChange={event => setTyping(event.target.value)} placeholder="Type your message…" spellCheck={false}/><div className="char-counter">{typing.length} / 120</div>
            <div className="translation-output"><div className="translation-output-top"><span className="caps">TRANSLATED OUTPUT</span><button onClick={() => void copyOutput()}><Copy size={16}/>{copied ? 'Copied' : 'Copy text'}</button></div>
              {course.id === 'asl' ? <div className="asl-sequence">{[...typing.toUpperCase()].filter(char => /^[A-Z ]$/.test(char)).slice(0, 44).map((letter, i) => letter === ' ' ? <span key={i} className="word-space"/> : <span key={i} className="asl-sequence-card"><SymbolVisual compact course="asl" card={courseById.asl.cards.find(c => c.label === letter)!}/><b>{letter}</b></span>)}</div> : course.id === 'braille' ? <div className="braille-sequence">{[...typing].slice(0, 70).map((letter, i) => letter === ' ' ? <span key={i} className="word-space"/> : <span className="braille-sequence-unit" key={i}>{brailleFor(letter)?.map((dots,j) => <BrailleCell key={j} dots={dots}/>) ?? <span className="unknown-symbol">·</span>}</span>)}</div> : <pre className="translated-morse">{translated.replaceAll('.', '·').replaceAll('-', '−')}</pre>}
              {course.id === 'morse' && <button className="play-translation" onClick={() => void playMorse(typing)}><Headphones size={18}/> Play message <Volume2 size={17}/></button>}
            </div>
            <p className="translator-tip"><CircleHelp size={16}/>{course.id === 'braille' ? 'Visual Braille teaches dot patterns but cannot replace tactile Braille instruction. This version does not support contractions or capitalization indicators.' : course.id === 'asl' ? 'ASL is a complete language with its own grammar; this tool teaches fingerspelling, not ASL vocabulary or syntax. J and Z require movement.' : 'Audio is generated in your browser. Unsupported characters are skipped.'}</p>
          </div>}
        </section>
        <section className="journey"><div><span className="eyebrow">YOUR NEXT CHAPTER</span><h2>Three ways to connect.</h2><p>Switch systems whenever you like. Your progress stays on this device.</p></div><div className="journey-cards">{courses.map(c => <button onClick={() => changeCourse(c.id)} key={c.id} className={`journey-card ${c.id === prefs.course ? 'current' : ''}`}><span className={`journey-icon ${c.id}`}>{c.id === 'asl' ? <Hand size={28}/> : c.id === 'braille' ? '⠿' : '·−·'}</span><strong>{c.name}</strong><small>{c.subtitle}</small><div className="journey-progress"><span style={{width: `${100 * c.cards.filter(card => prefs.progress[card.id]?.mastered).length / c.cards.length}%`}}/></div><span className="journey-footer">{c.cards.filter(card => prefs.progress[card.id]?.mastered).length} / {c.cards.length} mastered <ArrowUpRight size={16}/></span></button>)}</div></section>
        <footer className="footer"><span>© {new Date().getFullYear()} All the Ways · Made for curious minds.</span><span>Offline-first learning · No accounts · No tracking</span></footer>
      </div>
    </main>
    {showAbout && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => {if (e.target === e.currentTarget) setShowAbout(false);}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="about-title"><div className="modal-top"><img src="/icons/icon-192.png" alt=""/><button className="icon-only" onClick={() => setShowAbout(false)} aria-label="Close"><X size={22}/></button></div><h2 id="about-title">About All the Ways</h2><p>Learn ASL fingerspelling, six-dot uncontracted English Braille, and International Morse code. Flashcards, quizzes, and typing practice work without a server or account.</p><div className="modal-info"><div><CheckCheck size={19}/><span>Progress saved to localStorage on this device only</span></div><div><Sparkles size={19}/><span>ASL artwork from Wikimedia Commons (public domain), via the open-source Spellhand project</span></div><div><Volume2 size={19}/><span>Morse playback synthesized locally — no audio downloads</span></div></div><button className="danger-action" onClick={clearData}>Reset my progress</button><p className="modal-footnote">v0.1 · Designed for learning and experimentation. Braille displays are visual, not tactile, and ASL flashcards cover only fingerspelling.</p></section></div>}
  </div>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(console.warn));
}
