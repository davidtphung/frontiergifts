import { useId } from 'react';
import { scoringConfig } from '../content/scoring';
import type { GiftItem, Screen } from '../content/types';
import type { AnswerValue } from '../engine/types';

interface Props {
  screen: Screen;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  labelledBy: string;
}

export function QuestionControls(props: Props) {
  return props.screen.kind === 'ratings' ? <RatingsBlock {...props} /> : <Scenario {...props} />;
}

function Scenario({ screen, value, onChange, labelledBy }: Props) {
  const name = useId();
  if (screen.kind !== 'scenario') return null;
  const selected = value?.kind === 'choice' ? value.optionId : undefined;
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="choices">
      {screen.options.map((o) => (
        <label key={o.id} className={`choice ${selected === o.id ? 'is-checked' : ''}`}>
          <input
            type="radio"
            name={name}
            value={o.id}
            checked={selected === o.id}
            onChange={() => onChange({ kind: 'choice', optionId: o.id })}
          />
          <span className="choice__mark" aria-hidden="true" />
          <span className="choice__label">{o.label}</span>
        </label>
      ))}
    </div>
  );
}

function RatingsBlock({ screen, value, onChange }: Props) {
  if (screen.kind !== 'ratings') return null;
  const values = value?.kind === 'ratings' ? value.values : {};
  return (
    <div className="ratings">
      {screen.items.map((it) => (
        <RatingRow
          key={it.id}
          item={it}
          value={values[it.id]}
          onChange={(v) => onChange({ kind: 'ratings', values: { ...values, [it.id]: v } })}
        />
      ))}
    </div>
  );
}

/**
 * Anchored rating built from native radios: arrow keys move along the scale,
 * any point can be tapped (no dragging), and "Not sure" is always available.
 */
function RatingRow({ item, value, onChange }: { item: GiftItem; value: number | null | undefined; onChange: (v: number | null) => void }) {
  const name = useId();
  const labelId = useId();
  const scale = scoringConfig.scale;
  const anchors = [scale[0], scale[2], scale[4]];
  return (
    <fieldset className="rating">
      <legend id={labelId} className="rating__text">{item.text}</legend>
      <div role="radiogroup" aria-labelledby={labelId} className="barometer__track">
        <span className="barometer__line" aria-hidden="true" />
        {[0, 1, 2, 3, 4].map((i) => (
          <label key={i} className={`barometer__stop ${value === i ? 'is-checked' : ''}`}>
            <input type="radio" name={name} value={i} checked={value === i} onChange={() => onChange(i)} aria-label={scale[i]} />
            <span className="barometer__dot" aria-hidden="true" />
            <span className="barometer__label" aria-hidden="true">{i % 2 === 0 ? anchors[i / 2] : ''}</span>
          </label>
        ))}
      </div>
      <label className={`chip chip--toggle ${value === null ? 'is-on' : ''}`}>
        <input type="radio" name={name} checked={value === null} onChange={() => onChange(null)} />
        Not sure
      </label>
    </fieldset>
  );
}
