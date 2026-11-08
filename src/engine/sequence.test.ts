import { describe, expect, it } from 'vitest';
import { MAX_FOLLOWUPS, coreQuestions, deeperQuestions, questions } from '../content/questions';
import { GIFT_IDS, TEAM_IDS } from '../content/types';
import { choice, scale } from '../test/fixtures';
import { buildSteps } from '../App';
import { getSequence, selectFollowups } from './sequence';

describe('question bank', () => {
  it('has 12 core questions and 24–30 total', () => {
    expect(coreQuestions).toHaveLength(12);
    expect(questions.length).toBeGreaterThanOrEqual(24);
    expect(questions.length).toBeLessThanOrEqual(30);
  });

  it('has unique stable IDs and documents every question', () => {
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    for (const q of questions) {
      expect(q.why, q.id).toBeTruthy();
      expect(q.notProves, q.id).toBeTruthy();
      expect(q.ambiguity, q.id).toBeTruthy();
    }
  });

  it('uses every required format', () => {
    const formats = new Set(questions.map((q) => q.format));
    for (const f of ['single', 'multi', 'fill', 'text', 'barometer', 'scenario', 'paired']) expect(formats.has(f as never), f).toBe(true);
  });

  it('every team and every gift is reachable from structured answers', () => {
    const teams = new Set<string>();
    const gifts = new Set<string>();
    for (const q of questions) {
      for (const o of q.options ?? []) {
        Object.keys(o.signals?.teams ?? {}).forEach((t) => teams.add(t));
        Object.keys(o.signals?.gifts ?? {}).forEach((g) => gifts.add(g));
      }
    }
    for (const t of TEAM_IDS) expect(teams.has(t), t).toBe(true);
    for (const g of GIFT_IDS) expect(gifts.has(g), g).toBe(true);
  });

  it('every multi-select has a clear maximum', () => {
    for (const q of questions.filter((q) => q.format === 'multi')) expect(q.maxSelections, q.id).toBeGreaterThan(0);
  });
});

describe('branching', () => {
  it('shows only core questions when nothing triggers a follow-up', () => {
    expect(getSequence({})).toEqual(coreQuestions.map((q) => q.id));
  });

  it('inserts triggered follow-ups after chapter 4', () => {
    const seq = getSequence({ c2_arrive: choice('mic') });
    expect(seq).toContain('f_tech_comfort');
    expect(seq.indexOf('f_tech_comfort')).toBe(seq.indexOf('c4_story') + 1);
  });

  it('never shows more than 4 follow-ups, and picks the most relevant', () => {
    const answers = {
      c2_arrive: choice('mic', 'child'),
      c2_notice: choice('alone'),
      c3_energy: choice('music', 'praying', 'organizing'),
      c3_tech_curiosity: scale(4),
      c4_friend: choice('provide'),
      c4_gifts: choice('giving'),
    };
    const f = selectFollowups(answers);
    expect(f.length).toBe(MAX_FOLLOWUPS);
    expect(f.map((q) => q.id)).toContain('f_tech_comfort'); // strongest signal
  });

  it('adds the deeper path only when chosen', () => {
    expect(getSequence({}, { deeper: true }).slice(-deeperQuestions.length)).toEqual(deeperQuestions.map((q) => q.id));
  });

  it('builds chapter cards between chapters, but not before chapter 1', () => {
    const steps = buildSteps(getSequence({}));
    expect(steps[0]).toEqual({ type: 'question', id: 'c1_familiarity' });
    expect(steps.filter((s) => s.type === 'chapter').map((s) => (s as { chapter: string }).chapter)).toEqual(['notice', 'alive', 'care', 'next']);
  });
});
