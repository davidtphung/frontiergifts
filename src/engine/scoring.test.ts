import { describe, expect, it } from 'vitest';
import { allItems, scenarios, screens } from '../content/questions';
import { giftTeamWeights, teams } from '../content/teams';
import { GIFT_IDS, TEAM_IDS, type TeamId } from '../content/types';
import { answersFrom, personas } from '../test/fixtures';
import { buildResults } from './scoring';
import type { FeedbackMap } from './types';

const recommended = (r: ReturnType<typeof buildResults>) => r.recommendations.map((x) => x.team);
const top2Gifts = (r: ReturnType<typeof buildResults>) => r.gifts.slice(0, 2).map((g) => g.gift);
const levelOf = (r: ReturnType<typeof buildResults>, g: string) => r.gifts.find((x) => x.gift === g)!.level;

describe('instrument design', () => {
  it('has 21 statements: exactly 3 per gift, 2 self + 1 others', () => {
    expect(allItems).toHaveLength(21);
    for (const g of GIFT_IDS) {
      const its = allItems.filter((i) => i.gift === g);
      expect(its, g).toHaveLength(3);
      expect(its.filter((i) => i.perspective === 'others'), g).toHaveLength(1);
    }
    // every statement appears on exactly one screen
    const onScreens = screens.flatMap((s) => (s.kind === 'ratings' ? s.items.map((i) => i.id) : []));
    expect(new Set(onScreens).size).toBe(21);
    expect(onScreens).toHaveLength(21);
  });

  it('has 7 scenarios, each offering exactly one response per gift', () => {
    expect(scenarios).toHaveLength(7);
    for (const s of scenarios) expect(s.options.map((o) => o.gift).sort(), s.id).toEqual([...GIFT_IDS].sort());
  });

  it('varies option order so no gift always sits in the same position', () => {
    for (const g of GIFT_IDS) {
      const positions = new Set(scenarios.map((s) => s.options.findIndex((o) => o.gift === g)));
      expect(positions.size, g).toBeGreaterThan(2);
    }
  });

  it('no rating screen is about a single gift', () => {
    for (const s of screens) if (s.kind === 'ratings') expect(new Set(s.items.map((i) => i.gift)).size).toBe(s.items.length);
  });

  it('never asks about teams, roles, interest in roles, or experience', () => {
    const roleWords = [
      ...teams.map((t) => t.name),
      'tech', 'sound', 'audio', 'microphone', 'livestream', 'video', 'slides', 'media',
      'welcome team', 'greet', 'greeting', 'greeter', 'usher', 'setup', 'set up', 'breakdown', 'chairs',
      'worship team', 'band', 'instrument', 'sing', 'music', 'kids', 'children', 'child',
      'prayer team', 'intercession', 'volunteer', 'team', 'ministry', 'role', 'experience', 'serve on',
      'money', 'income', 'tithe', 'donate', 'donation', 'salary',
    ];
    const texts = [
      ...allItems.map((i) => i.text),
      ...screens.map((s) => `${s.prompt} ${s.helper ?? ''} ${s.kind === 'scenario' ? s.storyLine ?? '' : ''}`),
      ...scenarios.flatMap((s) => s.options.map((o) => o.label)),
    ];
    const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    for (const t of texts) {
      expect(t, `"${t}" mentions money`).not.toContain('$');
      for (const w of roleWords) expect(t, `"${t}" mentions "${w}"`).not.toMatch(new RegExp(`\\b${esc(w)}\\b`, 'i'));
    }
  });

  it('every team maps to at least two gifts, and every gift maps to at least one team', () => {
    for (const t of TEAM_IDS) expect(Object.keys(giftTeamWeights[t]).length, t).toBeGreaterThanOrEqual(2);
    for (const g of GIFT_IDS) expect(TEAM_IDS.some((t) => (giftTeamWeights[t][g] ?? 0) > 0), g).toBe(true);
  });
});

describe('gift profiles → team recommendations', () => {
  it('mercy + encouragement → Prayer Ministry and Welcome Team', () => {
    const r = buildResults(personas.compassionateListener);
    expect(top2Gifts(r)).toEqual(['mercy', 'encouragement']);
    expect(levelOf(r, 'mercy')).toBe('strong');
    expect(recommended(r).slice(0, 2).sort()).toEqual(['prayer', 'welcome']);
    expect(r.recommendations.find((x) => x.team === 'prayer')!.drivers[0]).toBe('mercy');
  });

  it('serving + leadership → Setup and Breakdown and Tech and AV', () => {
    const r = buildResults(personas.practicalOrganizer);
    expect(top2Gifts(r)).toEqual(['serving', 'leadership']);
    expect(recommended(r).slice(0, 2).sort()).toEqual(['setup', 'tech']);
  });

  it('teaching + encouragement → Kids Ministry first, with safeguarding requirements', () => {
    const r = buildResults(personas.scriptureExplainer);
    expect(recommended(r)[0]).toBe('kids');
    expect(r.recommendations[0].requirements).toMatch(/safeguarding/i);
  });

  it('prophecy + encouragement → Worship and Prayer Ministry', () => {
    const r = buildResults(personas.attentiveToGod);
    expect(recommended(r).slice(0, 2).sort()).toEqual(['prayer', 'worship']);
  });

  it('giving is measured and contributes (Welcome), without any financial questions', () => {
    const r = buildResults(personas.generousHost);
    expect(r.gifts[0].gift).toBe('giving');
    expect(recommended(r)[0]).toBe('welcome');
  });

  it('flat self-ratings are flagged and scenarios break the tie', () => {
    const r = buildResults(personas.everythingSometimes);
    expect(r.flatProfile).toBe(false); // scenarios separated them…
    expect(r.gifts[0].gift).toBe('serving');
    const flat = buildResults(answersFrom({ ratings: Object.fromEntries(GIFT_IDS.map((g) => [g, 2])), skip: scenarios.map((s) => s.id) }));
    expect(flat.flatProfile).toBe(true); // …but without scenarios the profile is flat
  });
});

describe('missing data, ties, corrections', () => {
  it('everything skipped → explore mode, no recommendations, no levels', () => {
    const r = buildResults(personas.skippedAll);
    expect(r.mode).toBe('explore');
    expect(r.recommendations).toHaveLength(0);
    expect(r.gifts.every((g) => g.level === null)).toBe(true);
  });

  it('"Not sure" everywhere is treated as missing, not low', () => {
    const r = buildResults(personas.allNotSure);
    expect(r.mode).toBe('explore');
    expect(r.gifts.every((g) => g.score === null)).toBe(true);
  });

  it('a "Not sure" rating does not lower a gift', () => {
    const base = answersFrom({ ratings: { mercy: 4 } });
    const withNotSure = structuredClone(base);
    const r1 = withNotSure['r5'];
    if (r1.kind === 'ratings') r1.values['mer3'] = null;
    expect(buildResults(withNotSure).gifts.find((g) => g.gift === 'mercy')!.score).toBeGreaterThanOrEqual(
      buildResults(base).gifts.find((g) => g.gift === 'mercy')!.score! - 1e-9,
    );
  });

  it('participant corrections update recommendations', () => {
    const before = buildResults(personas.compassionateListener);
    const top = before.recommendations[0].team;
    const fb: FeedbackMap = { [top]: 'not_for_me', tech: 'feels_like_me' } as FeedbackMap;
    const after = buildResults(personas.compassionateListener, fb);
    expect(recommended(after)).not.toContain(top);
    expect(recommended(after)).toContain('tech' as TeamId);
  });

  it('is deterministic', () => {
    expect(JSON.stringify(buildResults(personas.generousHost))).toBe(JSON.stringify(buildResults(personas.generousHost)));
  });

  it('never exposes numbers in participant-facing evidence', () => {
    const r = buildResults(personas.compassionateListener);
    for (const g of r.gifts) for (const e of g.evidence) expect(e.text).not.toMatch(/\d|%/);
  });
});
