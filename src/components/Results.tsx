import { useState, type RefObject } from 'react';
import { site } from '../content/site';
import { giftById, giftTeamWeights, teamById, teams } from '../content/teams';
import type { GiftId, Level, TeamId } from '../content/types';
import type { Feedback, FeedbackMap, Recommendation, Results as R } from '../engine/types';

interface Props {
  results: R;
  feedback: FeedbackMap;
  saveOnDevice: boolean;
  headingRef: RefObject<HTMLHeadingElement>;
  onFeedback: (team: TeamId, value: Feedback | null) => void;
  onReviewAnswers: () => void;
  onToggleSave: (on: boolean) => void;
  onRestart: () => void;
}

const LEVEL_LABEL: Record<Level, string> = { strong: 'Strong', present: 'Present', emerging: 'Emerging' };
const LEVEL_NOTE: Record<Level, string> = {
  strong: 'A clear theme across your answers.',
  present: 'Shows up meaningfully in your answers.',
  emerging: 'Less evident right now—gifts can grow and become clearer as you serve.',
};

const FEEDBACK: { id: Feedback; label: string }[] = [
  { id: 'feels_like_me', label: 'This feels like me' },
  { id: 'curious', label: 'I’m curious' },
  { id: 'not_for_me', label: 'Not for me right now' },
];

const names = (gs: GiftId[]) => gs.map((g) => giftById[g].name.toLowerCase());
const joinAnd = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

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

function RecommendationCard({ rec, onFeedback }: { rec: Recommendation; onFeedback: Props['onFeedback'] }) {
  const team = teamById[rec.team];
  const eyebrow = rec.tier === 'also' ? 'Also a good fit' : rec.tied ? 'Recommended · equally strong fit' : 'Recommended for you';
  return (
    <article className={`card card--${rec.tier === 'also' ? 'also' : 'strong'}`} aria-labelledby={`card-${rec.team}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h3 id={`card-${rec.team}`} className="display display--card">{team.name}</h3>
      <p className="card__heart">{team.heart}</p>

      <h4 className="card__label">Why your gifts fit here</h4>
      <p>
        {rec.drivers.length
          ? `Your gift${rec.drivers.length > 1 ? 's' : ''} of ${joinAnd(names(rec.drivers))} ${rec.drivers.length > 1 ? 'are' : 'is'} central to how this team builds up the Body.`
          : 'Several of your gifts contribute here.'}
      </p>
      <p className="hint">{team.shortDescription}</p>

      <h4 className="card__label">A place to begin</h4>
      <p>{rec.firstStep}</p>
      {rec.requirements && <p className="card__note">{rec.requirements}</p>}

      <FeedbackControls team={rec.team} value={rec.userFeedback} onFeedback={onFeedback} />
    </article>
  );
}

export function Results(props: Props) {
  const { results, feedback } = props;
  const [browse, setBrowse] = useState(false);
  const [why, setWhy] = useState<GiftId | null>(null);
  const explore = results.mode === 'explore';

  return (
    <div className="results">
      <section className="results__head">
        <p className="eyebrow eyebrow--light">Chapter 6 · A place to begin</p>
        <h1 ref={props.headingRef} tabIndex={-1} className="display display--hero">Your gifts, and where they could serve</h1>
        <p className="hero__sub">These reflect your answers today. Discern them with people who know you and with Frontier’s leaders.</p>
      </section>

      <div className="results__body">
        <p className="visually-hidden" aria-live="polite">
          {explore ? 'Not enough answers yet to recommend teams.' : `${results.recommendations.length} teams recommended.`}
        </p>

        <section className="gifts" aria-labelledby="gifts-h">
          <h2 id="gifts-h" className="display display--section">Your gift profile</h2>
          <p>Ranked from your answers to the gifts named in Romans 12:6–8.</p>
          {results.flatProfile && (
            <p className="callout">You rated many gifts similarly. That’s common—your scenario choices helped separate them, and conversations with others will sharpen the picture.</p>
          )}
          <ol className="gifts__list">
            {results.gifts.map((g) => {
              const gift = giftById[g.gift];
              return (
                <li key={g.gift} className={`gift gift--${g.level ?? 'unknown'}`}>
                  <div className="gift__head">
                    <span className="gifts__name">{gift.name}</span>
                    <span className={`level level--${g.level ?? 'unknown'}`}>{g.level ? LEVEL_LABEL[g.level] : 'Not enough answers'}</span>
                  </div>
                  <span className="gifts__ref">{gift.reference} · {gift.paraphrase}</span>
                  {g.level && g.level !== 'emerging' && <span className="gifts__why">{gift.inPractice}</span>}
                  {g.level && <span className="hint">{LEVEL_NOTE[g.level]}</span>}
                  {g.evidence.length > 0 && (
                    <>
                      <button className="btn btn--text btn--small" aria-expanded={why === g.gift} onClick={() => setWhy(why === g.gift ? null : g.gift)}>
                        {why === g.gift ? 'Hide' : 'What pointed to this?'}
                      </button>
                      {why === g.gift && (
                        <ul className="evidence">
                          {g.evidence.slice(0, 4).map((e, i) => (
                            <li key={i}>{e.text}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ol>
          <p className="hint">{site.scriptureNote} Romans is a letter in the Bible; chapter 12 describes how members of one Body bring different gifts to serve one another.</p>
        </section>

        <section aria-labelledby="rec-h">
          <h2 id="rec-h" className="display display--section">Where your gifts could serve</h2>
          {explore ? (
            <div className="callout">
              <p><strong>We need a few more answers.</strong> Too many statements were skipped or marked “Not sure” to recommend teams with confidence.</p>
              <p>You can review your answers, or browse every team below.</p>
            </div>
          ) : (
            <div className="cards">
              {results.recommendations.map((rec) => (
                <RecommendationCard key={rec.team} rec={rec} onFeedback={props.onFeedback} />
              ))}
            </div>
          )}
        </section>

        <section className="explain">
          <h2 className="card__label">How this works</h2>
          <p className="hint">
            Each gift is measured by three statements and seven everyday scenarios. Skipped and “Not sure” answers are left out rather than counted against you. Each team draws on certain gifts more than others; teams are recommended where your strongest gifts matter most. No one has seen your answers.
          </p>
          <p className="hint">Version {results.versions.questionBank} · {results.versions.scoring}</p>
        </section>

        <section className="browse" aria-labelledby="browse-h">
          <div className="browse__head">
            <h2 id="browse-h" className="display display--section">Every team</h2>
            <button className="btn btn--ghost" aria-expanded={browse || explore} onClick={() => setBrowse(!browse)}>
              {browse || explore ? 'Hide other teams' : 'Show me other teams'}
            </button>
          </div>
          {(browse || explore) && (
            <ul className="browse__list">
              {teams.map((t) => {
                const key = (Object.entries(giftTeamWeights[t.id]) as [GiftId, number][])
                  .filter(([, w]) => w >= 0.5)
                  .map(([g]) => giftById[g].name);
                return (
                  <li key={t.id} className="browse__item">
                    <h3 className="display display--card">{t.name}</h3>
                    <p>{t.shortDescription}</p>
                    <p className="hint">Gifts most central here: {key.join(', ')}.</p>
                    {t.distinctions.map((d) => (
                      <p key={d} className="hint">{d}</p>
                    ))}
                    <FeedbackControls team={t.id} value={feedback[t.id]} onFeedback={props.onFeedback} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="next">
          <h2 className="display display--section">What now?</h2>
          <p>Talk with a Frontier leader about your gifts and the teams above. Bring this page with you.</p>
          <div className="actions">
            <button className="btn btn--ghost" onClick={props.onReviewAnswers}>Review my answers</button>
            <button className="btn btn--text" onClick={props.onRestart}>Start over</button>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={props.saveOnDevice} onChange={(e) => props.onToggleSave(e.target.checked)} />
            <span>Save my answers on this device only (turning this off erases them)</span>
          </label>
        </section>
      </div>
    </div>
  );
}
