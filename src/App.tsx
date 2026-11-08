import { useEffect, useMemo, useReducer, useRef } from 'react';
import { screens } from './content/questions';
import { chapters, site } from './content/site';
import type { ChapterId, Screen } from './content/types';
import { buildResults } from './engine/scoring';
import { clearSaved, loadSaved, save } from './engine/storage';
import type { AnswerValue, Answers, Feedback, FeedbackMap } from './engine/types';
import { QuestionControls } from './components/QuestionControls';
import { ChapterCard, Header, PathProgress, Welcome } from './components/Chrome';
import { Results } from './components/Results';
import type { TeamId } from './content/types';

export type Step = { type: 'chapter'; chapter: ChapterId } | { type: 'screen'; screen: Screen };

/** Screens in order, with a chapter card before each new chapter. */
export function buildSteps(list: Screen[] = screens): Step[] {
  const steps: Step[] = [];
  let last: ChapterId | null = null;
  for (const s of list) {
    if (s.chapter !== last) steps.push({ type: 'chapter', chapter: s.chapter });
    last = s.chapter;
    steps.push({ type: 'screen', screen: s });
  }
  return steps;
}
const STEPS = buildSteps();
const SCREEN_STEPS = STEPS.filter((s) => s.type === 'screen');

/** A screen is complete when every statement has a rating or "Not sure", or a scenario has a choice. */
export function isComplete(screen: Screen, a: AnswerValue | undefined): boolean {
  if (!a || a.kind === 'skipped') return false;
  if (screen.kind === 'scenario') return a.kind === 'choice';
  return a.kind === 'ratings' && screen.items.every((it) => it.id in a.values);
}

type View = 'welcome' | 'flow' | 'results';
interface State {
  view: View;
  step: number;
  answers: Answers;
  feedback: FeedbackMap;
  saveOnDevice: boolean;
  error: string | null;
}
type Action =
  | { type: 'start' }
  | { type: 'resume'; state: Partial<State> }
  | { type: 'answer'; id: string; value: AnswerValue }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'error'; message: string | null }
  | { type: 'feedback'; team: TeamId; value: Feedback | null }
  | { type: 'view'; view: View }
  | { type: 'save'; on: boolean }
  | { type: 'restart' };

const initial: State = { view: 'welcome', step: 0, answers: {}, feedback: {}, saveOnDevice: false, error: null };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'start':
      return { ...s, view: 'flow', step: 0, error: null };
    case 'resume':
      return { ...s, ...a.state, view: 'flow', error: null };
    case 'answer':
      return { ...s, answers: { ...s.answers, [a.id]: a.value }, error: null };
    case 'next':
      return s.step + 1 >= STEPS.length ? { ...s, view: 'results', error: null } : { ...s, step: s.step + 1, error: null };
    case 'back':
      return s.step === 0 ? { ...s, view: 'welcome', error: null } : { ...s, step: s.step - 1, error: null };
    case 'error':
      return { ...s, error: a.message };
    case 'feedback': {
      const feedback = { ...s.feedback };
      if (a.value) feedback[a.team] = a.value;
      else delete feedback[a.team];
      return { ...s, feedback };
    }
    case 'view':
      return { ...s, view: a.view, error: null };
    case 'save':
      return { ...s, saveOnDevice: a.on };
    case 'restart':
      return { ...initial, saveOnDevice: s.saveOnDevice };
  }
}

export default function App() {
  const [s, dispatch] = useReducer(reducer, initial);
  const saved = useMemo(() => loadSaved(), []);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const results = useMemo(() => buildResults(s.answers, s.feedback), [s.answers, s.feedback]);

  useEffect(() => {
    if (s.saveOnDevice) save({ answers: s.answers, feedback: s.feedback, step: s.step });
  }, [s.saveOnDevice, s.answers, s.feedback, s.step]);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo?.({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [s.view, s.step]);

  const step = STEPS[s.step];
  const screen = step?.type === 'screen' ? step.screen : null;
  const screenIndex = screen ? SCREEN_STEPS.findIndex((x) => x.type === 'screen' && x.screen.id === screen.id) : -1;
  const chapterNow = step?.type === 'chapter' ? step.chapter : screen?.chapter ?? 'belong';

  const goNext = () => {
    if (screen && !isComplete(screen, s.answers[screen.id])) {
      dispatch({
        type: 'error',
        message:
          screen.kind === 'ratings'
            ? 'Rate each statement (or choose “Not sure”), or select “Skip” to move on.'
            : 'Choose the response that fits best, or select “Skip” to move on.',
      });
      return;
    }
    dispatch({ type: 'next' });
  };
  const skip = () => {
    if (screen && !isComplete(screen, s.answers[screen.id])) dispatch({ type: 'answer', id: screen.id, value: { kind: 'skipped' } });
    dispatch({ type: 'next' });
  };

  return (
    <div className="app">
      <a className="skiplink" href="#main">Skip to content</a>
      <Header
        onHome={() => dispatch({ type: 'view', view: 'welcome' })}
        status={s.view === 'flow' && screenIndex >= 0 ? `Step ${screenIndex + 1} of ${SCREEN_STEPS.length}` : undefined}
      />
      <main id="main" className={`main main--${s.view}${step?.type === 'chapter' && s.view === 'flow' ? ' main--dark' : ''}`}>
        {s.view === 'welcome' && (
          <Welcome
            headingRef={headingRef}
            onStart={() => dispatch({ type: 'start' })}
            canResume={!!saved && Object.keys(saved.answers ?? {}).length > 0}
            onResume={() =>
              saved && dispatch({ type: 'resume', state: { answers: saved.answers, feedback: saved.feedback, step: saved.step, saveOnDevice: true } })
            }
          />
        )}

        {s.view === 'flow' && step && (
          <div className="flow" key={s.step}>
            <PathProgress current={chapterNow} />
            {step.type === 'chapter' && (
              <ChapterCard
                headingRef={headingRef}
                chapter={chapters.find((c) => c.id === step.chapter)!}
                onNext={() => dispatch({ type: 'next' })}
                onBack={() => dispatch({ type: 'back' })}
              />
            )}
            {screen && (
              <section className="question">
                {screen.kind === 'scenario' && screen.storyLine && <p className="story">{screen.storyLine}</p>}
                <h1 ref={headingRef} tabIndex={-1} id={`${screen.id}-prompt`} className="question__prompt">
                  {screen.prompt}
                </h1>
                {screen.helper && <p className="question__helper">{screen.helper}</p>}
                <QuestionControls
                  screen={screen}
                  value={s.answers[screen.id]}
                  labelledBy={`${screen.id}-prompt`}
                  onChange={(v) => dispatch({ type: 'answer', id: screen.id, value: v })}
                />
                <p className="error" role="alert">{s.error ?? ''}</p>
                <nav className="actions actions--question" aria-label="Question navigation">
                  <button className="btn btn--ghost" onClick={() => dispatch({ type: 'back' })}>Back</button>
                  <span className="actions__spacer" />
                  <button className="btn btn--text" onClick={skip}>Skip</button>
                  <button className="btn btn--primary" onClick={goNext}>
                    {s.step + 1 >= STEPS.length ? 'See my gifts' : 'Continue'}
                  </button>
                </nav>
              </section>
            )}
          </div>
        )}

        {s.view === 'results' && (
          <Results
            headingRef={headingRef}
            results={results}
            feedback={s.feedback}
            saveOnDevice={s.saveOnDevice}
            onFeedback={(team, value) => dispatch({ type: 'feedback', team, value })}
            onReviewAnswers={() => dispatch({ type: 'resume', state: { step: 0 } })}
            onToggleSave={(on) => {
              if (!on) clearSaved();
              dispatch({ type: 'save', on });
            }}
            onRestart={() => {
              if (!s.saveOnDevice) clearSaved();
              dispatch({ type: 'restart' });
            }}
          />
        )}
      </main>
      <footer className="footer">
        <p className="wordmark wordmark--small" aria-hidden="true">{site.wordmark.split('').join(' ')}</p>
        <p>{site.tagline}</p>
        <p className="footer__fine">{site.retentionNote}</p>
      </footer>
    </div>
  );
}
