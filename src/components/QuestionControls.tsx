import { useId } from 'react';
import { teams } from '../content/teams';
import type { Question, TeamId } from '../content/types';
import type { AnswerValue, TeamPref } from '../engine/types';

interface Props {
  q: Question;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  onSubmit: () => void;
  labelledBy: string;
}

export function QuestionControls(props: Props) {
  switch (props.q.format) {
    case 'single':
    case 'paired':
      return <ChoiceGroup {...props} multi={false} />;
    case 'scenario':
      return <ChoiceGroup {...props} multi={(props.q.maxSelections ?? 1) > 1} />;
    case 'multi':
      return <ChoiceGroup {...props} multi />;
    case 'barometer':
      return <Barometer {...props} />;
    case 'fill':
      return <FillBlank {...props} />;
    case 'text':
      return <OpenText {...props} />;
    case 'teamPrefs':
      return <TeamPrefs {...props} />;
  }
}

function ChoiceGroup({ q, value, onChange, labelledBy, multi }: Props & { multi: boolean }) {
  const name = useId();
  const selected = value?.kind === 'choice' ? value.ids : [];
  const max = multi ? q.maxSelections ?? q.options!.length : 1;
  const atMax = multi && selected.length >= max;
  const toggle = (id: string) => {
    if (!multi) return onChange({ kind: 'choice', ids: [id] });
    const opt = q.options!.find((o) => o.id === id)!;
    if (selected.includes(id)) return onChange({ kind: 'choice', ids: selected.filter((x) => x !== id) });
    // Neutral "not sure" options are exclusive.
    if (opt.neutral) return onChange({ kind: 'choice', ids: [id] });
    const withoutNeutral = selected.filter((x) => {
      const o = q.options!.find((oo) => oo.id === x);
      return !o?.neutral;
    });
    if (withoutNeutral.length >= max) return;
    onChange({ kind: 'choice', ids: [...withoutNeutral, id] });
  };
  return (
    <div
      role={multi ? 'group' : 'radiogroup'}
      aria-labelledby={labelledBy}
      className={`choices ${q.format === 'paired' ? 'choices--paired' : ''}`}
    >
      {multi && (
        <p className="choices__count" aria-live="polite">
          {selected.length} of {max} chosen{atMax ? ' — deselect one to change your choice.' : ''}
        </p>
      )}
      {q.options!.map((o) => {
        const checked = selected.includes(o.id);
        const disabled = multi && atMax && !checked && !o.neutral;
        return (
          <label key={o.id} className={`choice ${checked ? 'is-checked' : ''} ${disabled ? 'is-disabled' : ''}`}>
            <input
              type={multi ? 'checkbox' : 'radio'}
              name={name}
              value={o.id}
              checked={checked}
              disabled={disabled}
              onChange={() => toggle(o.id)}
            />
            <span className="choice__mark" aria-hidden="true" />
            <span className="choice__label">{o.label}</span>
          </label>
        );
      })}
    </div>
  );
}

/**
 * Anchored barometer built from native radio buttons: arrow keys move along
 * the scale, any point can be tapped (no dragging), and "Not sure" is always
 * available. Neither end is presented as better.
 */
function Barometer({ q, value, onChange, labelledBy }: Props) {
  const name = useId();
  const b = q.barometer!;
  const v = value?.kind === 'scale' ? value.value : undefined;
  const steps = b.steps ?? [b.anchors[0], '', b.anchors[1], '', b.anchors[2]];
  return (
    <div className="barometer">
      <div role="radiogroup" aria-labelledby={labelledBy} className="barometer__track">
        <span className="barometer__line" aria-hidden="true" />
        {[0, 1, 2, 3, 4].map((i) => (
          <label key={i} className={`barometer__stop ${v === i ? 'is-checked' : ''}`}>
            <input
              type="radio"
              name={name}
              value={i}
              checked={v === i}
              onChange={() => onChange({ kind: 'scale', value: i })}
              aria-label={steps[i] || `${i + 1} of 5`}
            />
            <span className="barometer__dot" aria-hidden="true" />
            <span className={`barometer__label ${i % 2 === 1 ? 'barometer__label--minor' : ''}`} aria-hidden="true">
              {i % 2 === 0 ? b.anchors[i / 2] : ''}
            </span>
          </label>
        ))}
      </div>
      <label className={`choice choice--inline ${v === null ? 'is-checked' : ''}`}>
        <input
          type="radio"
          name={name}
          checked={v === null}
          onChange={() => onChange({ kind: 'scale', value: null })}
        />
        <span className="choice__mark" aria-hidden="true" />
        <span className="choice__label">Not sure</span>
      </label>
      <p className="barometer__readout" aria-live="polite">
        {v === undefined ? 'Tap a point on the line, or use the arrow keys.' : v === null ? 'Not sure — that’s fine.' : `You chose: ${steps[v]}`}
      </p>
    </div>
  );
}

function FillBlank({ q, value, onChange, onSubmit, labelledBy }: Props) {
  const id = useId();
  const text = value?.kind === 'text' ? value.text : '';
  return (
    <div className="fill">
      <label htmlFor={id} className="fill__sentence">
        <span>{q.blank!.before}</span>
      </label>
      <div className="fill__row">
        <input
          id={id}
          className="fill__input"
          type="text"
          value={text}
          maxLength={q.maxLength}
          placeholder={q.placeholder}
          aria-describedby={labelledBy}
          autoComplete="off"
          onChange={(e) => onChange({ kind: 'text', text: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit();
          }}
        />
        <span aria-hidden="true">{q.blank!.after}</span>
      </div>
      <p className="hint">{text.length}/{q.maxLength} characters</p>
    </div>
  );
}

function OpenText({ q, value, onChange, labelledBy }: Props) {
  const text = value?.kind === 'text' ? value.text : '';
  return (
    <div className="opentext">
      <textarea
        aria-labelledby={labelledBy}
        value={text}
        rows={4}
        maxLength={q.maxLength}
        placeholder={q.placeholder}
        onChange={(e) => onChange({ kind: 'text', text: e.target.value })}
      />
      <p className="hint">
        {text.length}/{q.maxLength} characters · Please leave out private details—they aren’t needed.
      </p>
    </div>
  );
}

const PREF_LABELS: Record<TeamPref, string> = { curious: 'Curious', maybe: 'Maybe', not_now: 'Not right now' };

function TeamPrefs({ value, onChange, labelledBy }: Props) {
  const prefs = value?.kind === 'teamPrefs' ? value.prefs : {};
  const base = useId();
  const set = (t: TeamId, p: TeamPref) => {
    const next = { ...prefs };
    if (next[t] === p) delete next[t];
    else next[t] = p;
    onChange({ kind: 'teamPrefs', prefs: next });
  };
  return (
    <div className="teamprefs" role="group" aria-labelledby={labelledBy}>
      {teams.map((t) => (
        <fieldset key={t.id} className="teamprefs__row">
          <legend>
            <span className="teamprefs__name">{t.name}</span>
            <span className="teamprefs__heart">{t.heart}</span>
          </legend>
          <div className="segmented">
            {(Object.keys(PREF_LABELS) as TeamPref[]).map((p) => (
              <label key={p} className={`segmented__opt ${prefs[t.id] === p ? 'is-checked' : ''}`}>
                <input
                  type="radio"
                  name={`${base}-${t.id}`}
                  checked={prefs[t.id] === p}
                  onChange={() => set(t.id, p)}
                  onClick={() => prefs[t.id] === p && set(t.id, p)}
                />
                {PREF_LABELS[p]}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
