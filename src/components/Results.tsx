import { useState, type RefObject } from 'react';
import { site } from '../content/site';
import { giftById, teamById, teams } from '../content/teams';
import type { TeamId } from '../content/types';
import type { Feedback, FeedbackMap, Invitation, Results as R } from '../engine/types';

interface Props {
  results: R;
  feedback: FeedbackMap;
  isNewcomer: boolean;
  deeperDone: boolean;
  saveOnDevice: boolean;
  headingRef: RefObject<HTMLHeadingElement>;
  onFeedback: (team: TeamId, value: Feedback | null) => void;
  onDeeper: () => void;
  onShare: () => void;
  onReviewAnswers: () => void;
  onToggleSave: (on: boolean) => void;
  onRestart: () => void;
}

const FEEDBACK: { id: Feedback; label: string }[] = [
  { id: 'feels_like_me', label: 'This feels like me' },
  { id: 'curious', label: 'I’m curious' },
  { id: 'not_for_me', label: 'Not for me right now' },
];

function joinReasons(rs: string[]): string {
  if (rs.length === 0) return '';
  if (rs.length === 1) return rs[0];
  return `${rs.slice(0, -1).join(', ')}, and ${rs[rs.length - 1]}`;
}

function FeedbackControls({ team, value, onFeedback }: { team: TeamId; value?: Feedback; onFeedback: Props['onFeedback'] }) {
  return (
    <div className="feedback" role="group" aria-label={`Your response to ${teamById[team].name}`}>
      {FEEDBACK.map((f) => (
        <button
          key={f.id}
          className={`chip ${value === f.id ? 'is-on' : ''}`}
          aria-pressed={value === f.id}
          onClick={() => onFeedback(team, value === f.id ? null : f.id)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

function InvitationCard({ inv, onFeedback }: { inv: Invitation; onFeedback: Props['onFeedback'] }) {
  const team = teamById[inv.team];
  return (
    <article className={`card card--${inv.tier}`} aria-labelledby={`card-${inv.team}`}>
      <p className="eyebrow">{inv.tier === 'strong' ? (inv.tied ? 'A place to explore · equally supported' : 'A place to explore') : 'You might also enjoy'}</p>
      <h3 id={`card-${inv.team}`} className="display display--card">{team.name}</h3>
      <p className="card__heart">{team.heart}</p>

      <h4 className="card__label">Why it may fit</h4>
      <p>
        {inv.reasons.length
          ? `You shared that ${joinReasons(inv.reasons)}.`
          : 'You marked this as something you’d like to explore.'}
      </p>

      <h4 className="card__label">Possible gift connections</h4>
      <p>
        {inv.giftConnections.length
          ? `${inv.giftConnections.map((g) => giftById[g].name).join(' and ')} may be worth exploring here.`
          : `Many gifts contribute here—${team.giftConnections.map((g) => giftById[g].name.toLowerCase()).join(', ')}, and more. Worth discerning together.`}
      </p>

      <h4 className="card__label">A place to begin</h4>
      <p>{inv.firstStep}</p>
      {inv.requirements && <p className="card__note">{inv.requirements}</p>}

      <FeedbackControls team={inv.team} value={inv.userFeedback} onFeedback={onFeedback} />
    </article>
  );
}

export function Results(props: Props) {
  const { results, feedback } = props;
  const [browse, setBrowse] = useState(false);
  const [why, setWhy] = useState(false);
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());

  const announce =
    results.mode === 'explore'
      ? 'We don’t have enough to suggest a team yet. Browse every team below.'
      : `Showing ${results.invitations.length} suggestions.`;

  return (
    <div className="results">
      <section className="results__head">
        <p className="eyebrow eyebrow--light">Chapter 6 · A place to begin</p>
        <h1 ref={props.headingRef} tabIndex={-1} className="display display--hero">
          Here are a few places your story could connect.
        </h1>
        <p className="hero__sub">Your answers are a starting point for a conversation—not a label or a final assignment.</p>
      </section>

      <div className="results__body">
        <p className="visually-hidden" aria-live="polite">{announce}</p>

        {results.mode === 'broad' && (
          <p className="callout">You showed interest in several teams. That’s a gift in itself—observing a Sunday behind the scenes could help you choose where to begin.</p>
        )}
        {results.mode === 'explore' && (
          <div className="callout">
            <p><strong>We don’t want to guess.</strong> You haven’t shared quite enough for us to suggest a team with confidence—and that’s completely fine.</p>
            <p>Browse every team below, mark the ones you’re curious about, or explore a little deeper.</p>
          </div>
        )}

        {results.invitations.length > 0 && (
          <section aria-labelledby="inv-h">
            <h2 id="inv-h" className="visually-hidden">Suggested teams</h2>
            <div className="cards">
              {results.invitations.map((inv) => (
                <InvitationCard key={inv.team} inv={inv} onFeedback={props.onFeedback} />
              ))}
            </div>
          </section>
        )}

        {results.toReview.length > 0 && (
          <section className="review" aria-labelledby="review-h">
            <h2 id="review-h" className="display display--section">Did we read this right?</h2>
            <p>You wrote a few things we didn’t want to guess about. Tell us if any of these are worth exploring.</p>
            <ul className="review__list">
              {results.toReview.map((f, i) =>
                reviewed.has(i) ? null : (
                  <li key={i}>
                    <span>
                      “{f.phrase}” {f.team ? `→ ${teamById[f.team].name}?` : f.gift ? `→ ${giftById[f.gift].name}?` : ''}
                    </span>
                    {f.team && (
                      <span className="review__actions">
                        <button className="chip" onClick={() => { props.onFeedback(f.team!, 'curious'); setReviewed(new Set(reviewed).add(i)); }}>Yes, I’m curious</button>
                        <button className="chip" onClick={() => setReviewed(new Set(reviewed).add(i))}>No</button>
                      </span>
                    )}
                    {!f.team && (
                      <button className="chip" onClick={() => setReviewed(new Set(reviewed).add(i))}>Noted</button>
                    )}
                  </li>
                ),
              )}
            </ul>
          </section>
        )}

        <section className="gifts" aria-labelledby="gifts-h">
          <h2 id="gifts-h" className="display display--section">Gifts you might explore</h2>
          {results.gifts.length > 0 ? (
            <>
              <p>Your answers suggest a few of the gifts named in Romans 12:6–8 may be worth exploring. These are reflections to discern with others—not a diagnosis.</p>
              <ul className="gifts__list">
                {results.gifts.map((g) => (
                  <li key={g.gift}>
                    <span className="gifts__name">{giftById[g.gift].name}</span>
                    <span className="gifts__ref">{giftById[g.gift].reference} · {giftById[g.gift].paraphrase}</span>
                    <span className="gifts__why">
                      {g.distinctQuestions >= 2 ? 'A theme across your answers' : 'Something you mentioned'}
                      {g.reasons.length ? `: ${g.reasons.join('; ')}.` : '.'}
                    </span>
                    {g.gift === 'giving' && <span className="gifts__why">{giftById.giving.acrossTeams}</span>}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>Not enough to reflect on yet—and that’s okay. Gifts often become clearer as you serve alongside others.</p>
          )}
          <p className="hint">{site.scriptureNote}</p>
          {props.isNewcomer && (
            <p className="hint">New to church language? Romans is a letter in the Bible. Chapter 12 describes how people in a church community bring different gifts to serve one another.</p>
          )}
        </section>

        <section className="explain">
          <button className="btn btn--text" aria-expanded={why} onClick={() => setWhy(!why)}>
            {why ? 'Hide' : 'How did we come up with this?'}
          </button>
          {why && (
            <div className="explain__body">
              <p>We look for themes across your answers, give the most weight to what you told us directly, treat skipped questions as unanswered (not negative), and use anything you wrote only as supporting evidence. Experience and availability shape the suggested first step—never whether a team fits. No one on staff has seen these answers.</p>
              <ul>
                {results.evidence
                  .filter((e) => e.counted && e.weight !== 0 && e.because && (e.team || e.gift))
                  .slice(0, 14)
                  .map((e, i) => (
                    <li key={i}>
                      {e.team ? teamById[e.team].name : giftById[e.gift!].name}: {e.because}
                      {e.weight < 0 ? ' (counts against)' : ''}
                    </li>
                  ))}
              </ul>
              <p className="hint">Rules {results.versions.questionBank} · {results.versions.signals} · {results.versions.matching}</p>
            </div>
          )}
        </section>

        <section className="browse" aria-labelledby="browse-h">
          <div className="browse__head">
            <h2 id="browse-h" className="display display--section">Every team</h2>
            <button className="btn btn--ghost" aria-expanded={browse || results.mode === 'explore'} onClick={() => setBrowse(!browse)}>
              {browse || results.mode === 'explore' ? 'Hide other teams' : 'Show me other teams'}
            </button>
          </div>
          {(browse || results.mode === 'explore') && (
            <ul className="browse__list">
              {teams.map((t) => {
                const ts = results.teamScores[t.id];
                return (
                  <li key={t.id} className="browse__item">
                    <h3 className="display display--card">{t.name}</h3>
                    <p>{t.shortDescription}</p>
                    <p className="hint">Often draws on: {t.giftConnections.map((g) => giftById[g].name).join(', ')}.</p>
                    {t.distinctions.map((d) => (
                      <p key={d} className="hint">{d}</p>
                    ))}
                    {ts.excluded && <p className="card__note">{ts.excludedReason}—so we didn’t suggest it. Change your mind any time.</p>}
                    <FeedbackControls team={t.id} value={feedback[t.id]} onFeedback={props.onFeedback} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="next">
          <h2 className="display display--section">What now?</h2>
          <div className="actions actions--stack">
            <button className="btn btn--primary" onClick={props.onShare}>Share with Frontier (optional)</button>
            {!props.deeperDone && (
              <button className="btn btn--ghost" onClick={props.onDeeper}>Explore a little deeper</button>
            )}
            <button className="btn btn--ghost" onClick={props.onReviewAnswers}>Review my answers</button>
            <button className="btn btn--text" onClick={props.onRestart}>Start over</button>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={props.saveOnDevice} onChange={(e) => props.onToggleSave(e.target.checked)} />
            <span>Save my answers on this device only (turning this off erases them)</span>
          </label>
          <p className="hint">Seeing your results never requires contact details. Nothing leaves this page unless you choose to share.</p>
        </section>
      </div>
    </div>
  );
}
