import { useMemo, useState, type RefObject } from 'react';
import { site } from '../content/site';
import { teamById, teams } from '../content/teams';
import type { TeamId } from '../content/types';
import { buildSharePayload, payloadToText, type ContactDetails, type ShareChoices } from '../engine/summary';
import type { Answers, FeedbackMap, Results } from '../engine/types';

interface Props {
  results: Results;
  answers: Answers;
  feedback: FeedbackMap;
  headingRef: RefObject<HTMLHeadingElement>;
  onBack: () => void;
}

type Stage = 'age' | 'minor' | 'form' | 'review' | 'done';

/**
 * Review-and-share flow. Nothing is transmitted until the participant presses
 * the final button, and with no configured endpoint nothing is transmitted
 * at all—the participant gets a local copy instead.
 */
export function Share({ results, answers, feedback, headingRef, onBack }: Props) {
  const [stage, setStage] = useState<Stage>(site.askAgeBeforeContact ? 'age' : 'form');
  const [contact, setContact] = useState<ContactDetails>({ preferredName: '', email: '', contactMethod: '' });
  const defaultTeams = useMemo(() => {
    const ids = new Set<TeamId>(results.invitations.filter((i) => i.userFeedback !== 'not_for_me').map((i) => i.team));
    for (const [t, f] of Object.entries(feedback)) if (f !== 'not_for_me') ids.add(t as TeamId);
    return [...ids];
  }, [results, feedback]);
  const [choices, setChoices] = useState<ShareChoices>({
    shareSummary: false,
    requestFollowUp: false,
    includeGifts: true,
    includeWritten: false,
    exploringOnly: false,
    teams: defaultTeams,
  });
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'local' | 'failed'>('idle');

  const payload = buildSharePayload(results, answers, feedback, contact, choices);
  const text = payloadToText(payload);

  const toReview = () => {
    if (!choices.shareSummary) return setError('Tick “Share my summary with Frontier” to continue, or go back to your results.');
    if (choices.requestFollowUp && contact.contactMethod === 'email' && !/^\S+@\S+\.\S+$/.test(contact.email))
      return setError('Please enter a valid email address, or choose a different way to connect.');
    setError('');
    setStage('review');
  };

  const submit = async () => {
    if (!site.submissionEndpoint) {
      setStatus('local');
      setStage('done');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(site.submissionEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? 'sent' : 'failed');
    } catch {
      setStatus('failed');
    }
    setStage('done');
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'frontier-serving-summary.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="share">
      <section className="share__card">
        <p className="eyebrow">Optional</p>
        <h1 ref={headingRef} tabIndex={-1} className="display display--section">Share with Frontier</h1>

        {stage === 'age' && (
          <>
            <p>Before we ask for any contact details: are you 18 or older?</p>
            <div className="actions">
              <button className="btn btn--primary" onClick={() => setStage('form')}>Yes, I’m 18 or older</button>
              <button className="btn btn--ghost" onClick={() => setStage('minor')}>No, I’m under 18</button>
            </div>
          </>
        )}

        {stage === 'minor' && <p className="callout">{site.minorContactMessage}</p>}

        {stage === 'form' && (
          <form
            className="form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              toReview();
            }}
          >
            <fieldset>
              <legend className="card__label">What you’re agreeing to</legend>
              <label className="toggle">
                <input type="checkbox" checked={choices.shareSummary} onChange={(e) => setChoices({ ...choices, shareSummary: e.target.checked })} />
                <span>Share my summary with Frontier’s serving team</span>
              </label>
              <label className="toggle">
                <input type="checkbox" checked={choices.requestFollowUp} onChange={(e) => setChoices({ ...choices, requestFollowUp: e.target.checked })} />
                <span>I’d like someone to follow up with me</span>
              </label>
              <label className="toggle">
                <input type="checkbox" checked={choices.exploringOnly} onChange={(e) => setChoices({ ...choices, exploringOnly: e.target.checked })} />
                <span>I’m exploring, not ready to commit</span>
              </label>
            </fieldset>

            {choices.requestFollowUp && (
              <fieldset>
                <legend className="card__label">How to reach you</legend>
                <label className="field">
                  <span>Preferred name (optional)</span>
                  <input type="text" autoComplete="given-name" value={contact.preferredName} onChange={(e) => setContact({ ...contact, preferredName: e.target.value })} />
                </label>
                <label className="field">
                  <span>Best way to connect</span>
                  <select value={contact.contactMethod} onChange={(e) => setContact({ ...contact, contactMethod: e.target.value as ContactDetails['contactMethod'] })}>
                    <option value="">No preference</option>
                    <option value="email">Email</option>
                    <option value="sunday">Find me on a Sunday</option>
                  </select>
                </label>
                {contact.contactMethod === 'email' && (
                  <label className="field">
                    <span>Email</span>
                    <input type="email" autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                  </label>
                )}
              </fieldset>
            )}

            <fieldset>
              <legend className="card__label">What to include</legend>
              {teams.map((t) => (
                <label key={t.id} className="toggle">
                  <input
                    type="checkbox"
                    checked={choices.teams.includes(t.id)}
                    onChange={(e) =>
                      setChoices({ ...choices, teams: e.target.checked ? [...choices.teams, t.id] : choices.teams.filter((x) => x !== t.id) })
                    }
                  />
                  <span>{t.name}</span>
                </label>
              ))}
              <label className="toggle">
                <input type="checkbox" checked={choices.includeGifts} onChange={(e) => setChoices({ ...choices, includeGifts: e.target.checked })} />
                <span>Include gift reflections</span>
              </label>
              <label className="toggle">
                <input type="checkbox" checked={choices.includeWritten} onChange={(e) => setChoices({ ...choices, includeWritten: e.target.checked })} />
                <span>Include what I wrote in my own words</span>
              </label>
            </fieldset>

            <p className="error" role="alert">{error}</p>
            <div className="actions">
              <button type="button" className="btn btn--ghost" onClick={onBack}>Back to results</button>
              <button type="submit" className="btn btn--primary">Review what I’ll share</button>
            </div>
          </form>
        )}

        {stage === 'review' && (
          <>
            <p>This is exactly what would be shared. Nothing has been sent.</p>
            <pre className="summary" tabIndex={0} aria-label="Summary to be shared">{text}</pre>
            <div className="actions">
              <button className="btn btn--ghost" onClick={() => setStage('form')}>Edit</button>
              <button className="btn btn--primary" onClick={submit} disabled={status === 'sending'}>
                {site.submissionEndpoint ? 'Share with Frontier' : 'Finish'}
              </button>
            </div>
          </>
        )}

        {stage === 'done' && (
          <div aria-live="polite">
            {status === 'local' && (
              <>
                <p className="callout">
                  This prototype isn’t connected to Frontier yet, so <strong>nothing was sent</strong>. You can keep a copy of your summary and bring it to a conversation with a ministry leader.
                </p>
                <div className="actions">
                  <button className="btn btn--primary" onClick={download}>Download summary</button>
                  <button className="btn btn--ghost" onClick={() => navigator.clipboard?.writeText(text)}>Copy to clipboard</button>
                </div>
              </>
            )}
            {status === 'sent' && <p className="callout">Thank you. Your summary was shared{payload.contact ? ' and someone will be in touch' : ''}.</p>}
            {status === 'failed' && <p className="callout">Something went wrong and your summary wasn’t shared. Your results are still here.</p>}
            <button className="btn btn--ghost" onClick={onBack}>Back to results</button>
          </div>
        )}
        {stage !== 'form' && stage !== 'done' && stage !== 'review' && (
          <button className="btn btn--text" onClick={onBack}>Back to results</button>
        )}
      </section>
      <p className="hint share__teams">Teams included: {choices.teams.map((t) => teamById[t].name).join(', ') || 'none'}</p>
    </div>
  );
}
