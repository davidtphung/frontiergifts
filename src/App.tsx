import { useEffect, useMemo, useReducer, useRef } from 'react';
import { questionById } from './content/questions';
import { chapters, site } from './content/site';
import type { ChapterId, TeamId } from './content/types';
import { buildResults } from './engine/scoring';
import { getSequence, isAnswered } from './engine/sequence';
import { clearSaved, loadSaved, save } from './engine/storage';
import type { AnswerValue, Answers, Feedback, FeedbackMap } from './engine/types';
import { QuestionControls } from './components/QuestionControls';
import { ChapterCard, Header, PathProgress, Welcome } from './components/Chrome';
import { Results } from './components/Results';
import { Share } from './components/Share';

export type Step =
  | { type: 'chapter'; chapter: ChapterId }
  | { type: 'deeperIntro' }
  | { type: 'question'; id: string };

type View = 'welcome' | 'flow' | 'results' | 'share';

interface State {
  view: View;
  step: number;
  answers: Answers;
  feedback: FeedbackMap;
  deeper: boolean;
  saveOnDevice: boolean;
  error: string | null;
}

type Action =
  | { type: 'start' }
  | { type: 'resume'; state: Partial<State> }
  | { type: 'answer'; id: string; value: AnswerValue }
  | { type: 'next'; total: number }
  | { type: 'back' }
  | { type: 'error'; message: string | null }
  | { type: 'goDeeper'; firstDeeperStep: number }
  | { type: 'feedback'; team: TeamId; value: Feedback | null }
  | { type: 'view'; view: View }
  | { type: 'save'; on: boolean }
  | { type: 'restart' };

const initial: State = {
  view: 'welcome',
  step: 0,
  answers: {},
  feedback: {},
  deeper: false,
  saveOnDevice: false,
  error: null,
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'start':
      return { ...s, view: 'flow', step: 0, error: null };
    case 'resume':
      return { ...s, ...a.state, view: 'flow', error: null };
    case 'answer':
      return { ...s, answers: { ...s.answers, [a.id]: a.value }, error: null };
    case 'next':
      return s.step + 1 >= a.total ? { ...s, view: 'results', error: null } : { ...s, step: s.step + 1, error: null };
    case 'back':
      return s.step === 0 ? { ...s, view: 'welcome', error: null } : { ...s, step: s.step - 1, error: null };
    case 'error':
      return { ...s, error: a.message };
    case 'goDeeper':
      return { ...s, deeper: true, view: 'flow', step: a.firstDeeperStep, error: null };
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

/** Follow-ups sit inside chapter 4 visually; deeper questions get one intro card. */
function displayChapter(id: string): ChapterId {
  const q = questionById[id];
  if (q.tier === 'followup' && q.chapter !== 'next') return 'care';
  return q.chapter;
}

export function buildSteps(sequence: string[]): Step[] {
  const steps: Step[] = [];
  let last: ChapterId | null = null;
  let inDeeper = false;
  for (const id of sequence) {
    const q = questionById[id];
    if (q.tier === 'deeper') {
      if (!inDeeper) steps.push({ type: 'deeperIntro' });
      inDeeper = true;
    } else {
      const ch = displayChapter(id);
      if (ch !== last && ch !== 'belong') steps.push({ type: 'chapter', chapter: ch });
      last = ch;
    }
    steps.push({ type: 'question', id });
  }
  return steps;
}

export default function App() {
  const [s, dispatch] = useReducer(reducer, initial);
  const saved = useMemo(() => loadSaved(), []);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const sequence = useMemo(() => getSequence(s.answers, { deeper: s.deeper }), [s.answers, s.deeper]);
  const steps = useMemo(() => buildSteps(sequence), [sequence]);
  const results = useMemo(() => buildResults(s.answers, sequence, s.feedback), [s.answers, sequence, s.feedback]);

  // Opt-in device persistence only.
  useEffect(() => {
    if (s.saveOnDevice) save({ answers: s.answers, feedback: s.feedback, deeper: s.deeper, step: s.step });
  }, [s.saveOnDevice, s.answers, s.feedback, s.deeper, s.step]);

  // Move focus to the new screen's heading for keyboard + screen-reader users.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo?.({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [s.view, s.step]);

  const step = steps[Math.min(s.step, steps.length - 1)];
  const currentQuestion = step?.type === 'question' ? questionById[step.id] : null;

  const goNext = () => {
    if (currentQuestion && !isAnswered(s.answers, currentQuestion.id)) {
      dispatch({ type: 'error', message: currentQuestion.skippable ? 'Choose an answer, or select “Skip” to move on.' : 'Please choose an answer to continue.' });
      return;
    }
    dispatch({ type: 'next', total: steps.length });
  };
  const skip = () => {
    if (currentQuestion) dispatch({ type: 'answer', id: currentQuestion.id, value: { kind: 'skipped' } });
    dispatch({ type: 'next', total: steps.length });
  };

  const questionSteps = steps.filter((x) => x.type === 'question');
  const qIndex = step?.type === 'question' ? questionSteps.findIndex((x) => x.type === 'question' && x.id === step.id) : -1;
  const chapterNow = step?.type === 'chapter' ? step.chapter : step?.type === 'question' ? displayChapter(step.id) : 'belong';
  const isNewcomer = s.answers['c1_familiarity']?.kind === 'choice' && s.answers['c1_familiarity'].ids[0] === 'new';

  return (
    <div className="app">
      <a className="skiplink" href="#main">Skip to content</a>
      <Header
        onHome={() => dispatch({ type: 'view', view: 'welcome' })}
        status={s.view === 'flow' && qIndex >= 0 ? `${currentQuestion?.tier === 'deeper' ? 'Going deeper · ' : ''}Question ${qIndex + 1} of ${questionSteps.length}` : undefined}
      />
      <main id="main" className={`main main--${s.view}${step?.type !== 'question' && s.view === 'flow' ? ' main--dark' : ''}`}>
        {s.view === 'welcome' && (
          <Welcome
            headingRef={headingRef}
            onStart={() => dispatch({ type: 'start' })}
            canResume={!!saved && Object.keys(saved.answers).length > 0}
            onResume={() =>
              saved &&
              dispatch({ type: 'resume', state: { answers: saved.answers, feedback: saved.feedback, deeper: saved.deeper, step: saved.step, saveOnDevice: true } })
            }
          />
        )}

        {s.view === 'flow' && step && (
          <div className="flow" key={s.step}>
            {step.type !== 'deeperIntro' && <PathProgress current={chapterNow} />}
            {step.type === 'chapter' && (
              <ChapterCard
                headingRef={headingRef}
                chapter={chapters.find((c) => c.id === step.chapter)!}
                onNext={() => dispatch({ type: 'next', total: steps.length })}
                onBack={() => dispatch({ type: 'back' })}
              />
            )}
            {step.type === 'deeperIntro' && (
              <section className="chapter">
                <p className="eyebrow">Optional</p>
                <h1 ref={headingRef} tabIndex={-1} className="display">Going a little deeper</h1>
                <p className="chapter__transition">Eight short questions. Skip any of them, and stop whenever you like—your results update as you go.</p>
                <div className="actions">
                  <button className="btn btn--ghost-light" onClick={() => dispatch({ type: 'view', view: 'results' })}>Back to results</button>
                  <button className="btn btn--light" onClick={() => dispatch({ type: 'next', total: steps.length })}>Continue</button>
                </div>
              </section>
            )}
            {currentQuestion && (
              <section className="question" aria-describedby={currentQuestion.helper ? `${currentQuestion.id}-help` : undefined}>
                {currentQuestion.storyLine && <p className="story">{currentQuestion.storyLine}</p>}
                <h1 ref={headingRef} tabIndex={-1} id={`${currentQuestion.id}-prompt`} className="question__prompt">
                  {currentQuestion.prompt}
                </h1>
                {currentQuestion.helper && (
                  <p id={`${currentQuestion.id}-help`} className="question__helper">{currentQuestion.helper}</p>
                )}
                <QuestionControls
                  q={currentQuestion}
                  value={s.answers[currentQuestion.id]}
                  labelledBy={`${currentQuestion.id}-prompt`}
                  onChange={(v) => dispatch({ type: 'answer', id: currentQuestion.id, value: v })}
                  onSubmit={goNext}
                />
                <p className="error" role="alert">{s.error ?? ''}</p>
                <nav className="actions actions--question" aria-label="Question navigation">
                  <button className="btn btn--ghost" onClick={() => dispatch({ type: 'back' })}>Back</button>
                  <span className="actions__spacer" />
                  {currentQuestion.skippable && (
                    <button className="btn btn--text" onClick={skip}>Skip</button>
                  )}
                  <button className="btn btn--primary" onClick={goNext}>
                    {s.step + 1 >= steps.length ? 'See my results' : 'Continue'}
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
            isNewcomer={isNewcomer}
            deeperDone={s.deeper}
            saveOnDevice={s.saveOnDevice}
            onFeedback={(team, value) => dispatch({ type: 'feedback', team, value })}
            onDeeper={() => {
              const deeperSteps = buildSteps(getSequence(s.answers, { deeper: true }));
              dispatch({ type: 'goDeeper', firstDeeperStep: deeperSteps.findIndex((x) => x.type === 'deeperIntro') });
            }}
            onShare={() => dispatch({ type: 'view', view: 'share' })}
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

        {s.view === 'share' && (
          <Share
            headingRef={headingRef}
            results={results}
            answers={s.answers}
            feedback={s.feedback}
            onBack={() => dispatch({ type: 'view', view: 'results' })}
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
