import type { RefObject } from 'react';
import { chapters, site } from '../content/site';
import type { Chapter, ChapterId } from '../content/types';

export function Wordmark({ small }: { small?: boolean }) {
  return (
    <span className={`wordmark ${small ? 'wordmark--small' : ''}`} aria-label={site.wordmark.replace('Ø', 'O')}>
      {site.wordmark.split('').join(' ')}
    </span>
  );
}

export function Header({ status, onHome }: { status?: string; onHome: () => void }) {
  return (
    <header className="header">
      <button className="header__home" onClick={onHome} aria-label="Back to the start">
        <Wordmark />
      </button>
      {status && <span className="header__status">{status}</span>}
    </header>
  );
}

const THREAD = ['Arrive', 'Notice', 'Respond', 'Make room'];

/** Subtle journey motif: a thin path with four waypoints. */
export function PathMotif({ active = -1 }: { active?: number }) {
  return (
    <div className="pathmotif" aria-hidden="true">
      <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="pathmotif__svg">
        <path d="M4 28 C 80 4, 120 36, 200 20 S 330 6, 396 22" fill="none" stroke="currentColor" strokeWidth="1.25" strokeDasharray="2 5" />
      </svg>
      <ol className="pathmotif__stops">
        {THREAD.map((t, i) => (
          <li key={t} className={i <= active ? 'is-on' : ''}>{t}</li>
        ))}
      </ol>
    </div>
  );
}

export function PathProgress({ current }: { current: ChapterId }) {
  const idx = chapters.findIndex((c) => c.id === current);
  const ch = chapters[idx];
  return (
    <div className="progress">
      <p className="progress__text">
        <span className="eyebrow">Chapter {ch.number} of {chapters.length}</span>
        <span className="progress__title">{ch.title}</span>
      </p>
      <ol className="progress__track" aria-label={`Chapter ${ch.number} of ${chapters.length}: ${ch.title}`}>
        {chapters.map((c, i) => (
          <li
            key={c.id}
            className={`progress__node ${i < idx ? 'is-done' : ''} ${i === idx ? 'is-current' : ''}`}
            aria-current={i === idx ? 'step' : undefined}
          >
            <span className="visually-hidden">
              {c.title}
              {i < idx ? ' (done)' : i === idx ? ' (current)' : ''}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Welcome({
  onStart,
  onResume,
  canResume,
  headingRef,
}: {
  onStart: () => void;
  onResume: () => void;
  canResume: boolean;
  headingRef: RefObject<HTMLHeadingElement>;
}) {
  return (
    <div className="welcome">
      <section className="hero">
        <p className="eyebrow eyebrow--light">Chapter 1 · You belong in the story</p>
        <h1 ref={headingRef} tabIndex={-1} className="display display--hero">{site.title}</h1>
        <p className="hero__sub">{site.closingInvitation}</p>
        <PathMotif />
        <div className="actions actions--center">
          <button className="btn btn--light" onClick={onStart}>Begin</button>
          {canResume && (
            <button className="btn btn--ghost-light" onClick={onResume}>Continue where you left off</button>
          )}
        </div>
        <p className="hero__meta">{site.estimatedMinutes} · 21 statements and 7 everyday moments</p>
      </section>

      <section className="welcome__body">
        <h2 className="display display--section">Why we serve</h2>
        <p className="lede">{site.sharedHeart}</p>
        <ul className="together" aria-label="Together, we">
          {site.together.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="notice" role="note" aria-labelledby="privacy-h">
          <h2 id="privacy-h" className="eyebrow">Before you begin</h2>
          <ul>
            {site.privacyNotice.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="hint">Your results describe gifts to keep discerning with others—they’re a starting point, not a final word.</p>
        </div>
      </section>
    </div>
  );
}

export function ChapterCard({
  chapter,
  onNext,
  onBack,
  headingRef,
}: {
  chapter: Chapter;
  onNext: () => void;
  onBack: () => void;
  headingRef: RefObject<HTMLHeadingElement>;
}) {
  const threadIdx = ['You arrive.', 'You notice.', 'You respond.', 'You help make room.'].indexOf(chapter.thread);
  return (
    <section className="chapter">
      <p className="eyebrow eyebrow--light">Chapter {String(chapter.number).padStart(2, '0')}</p>
      <h1 ref={headingRef} tabIndex={-1} className="display">{chapter.title}</h1>
      <p className="chapter__transition">{chapter.transition}</p>
      <PathMotif active={threadIdx} />
      <p className="chapter__thread">{chapter.thread}</p>
      <div className="actions actions--center">
        <button className="btn btn--ghost-light" onClick={onBack}>Back</button>
        <button className="btn btn--light" onClick={onNext}>Continue</button>
      </div>
    </section>
  );
}
