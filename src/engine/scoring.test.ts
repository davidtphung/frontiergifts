import { describe, expect, it } from 'vitest';
import { matchingWeights } from '../content/signals';
import { TEAM_IDS, type TeamId } from '../content/types';
import { choice, noTextPersona, personas, prefs, scale, skipped, text } from '../test/fixtures';
import { buildResults } from './scoring';
import { getSequence } from './sequence';
import { buildSharePayload } from './summary';
import type { Answers, FeedbackMap } from './types';

function run(answers: Answers, opts: { deeper?: boolean; feedback?: FeedbackMap } = {}) {
  return buildResults(answers, getSequence(answers, { deeper: opts.deeper }), opts.feedback ?? {});
}
const invited = (r: ReturnType<typeof run>) => r.invitations.map((i) => i.team);

describe('synthetic personas', () => {
  it('1. technically curious beginner is invited to Tech, not disqualified', () => {
    const r = run(personas.techBeginner.answers);
    expect(invited(r)[0]).toBe('tech');
    const tech = r.invitations.find((i) => i.team === 'tech')!;
    expect(tech.firstStep).toMatch(/curious beginners are welcome/i);
    expect(tech.firstStep).toMatch(/training/i);
    expect(tech.reasons.length).toBeGreaterThan(0);
  });

  it('2. experienced musician who opts out of platform ministry is not sent to Worship', () => {
    const r = run(personas.musicianOffPlatform.answers);
    expect(invited(r)).not.toContain('worship');
    expect(r.teamScores.worship.excluded).toBe(true);
    // musical skill is recorded as a skill, not a gift
    expect(r.evidence.some((e) => e.layer === 'skill' && e.skill === 'music')).toBe(true);
    expect(invited(r)).toContain('tech');
  });

  it('3. quiet one-to-one welcomer is invited to Welcome without picking "meeting new people"', () => {
    const r = run(personas.quietWelcomer.answers);
    expect(invited(r)[0]).toBe('welcome');
    expect(r.invitations[0].firstStep).toMatch(/observe first/i);
  });

  it('4. organizer with no heavy lifting still fits Setup; first step adapts', () => {
    const r = run(personas.organizerNoLifting.answers, { deeper: true });
    expect(invited(r)[0]).toBe('setup');
    expect(r.invitations[0].firstStep).toMatch(/no heavy lifting/i);
    // accommodation does not reduce fit
    const withoutSupport = { ...personas.organizerNoLifting.answers, d_support: skipped, f_setup: choice('signage', 'coordinate') };
    const r2 = run(withoutSupport, { deeper: true });
    expect(r.teamScores.setup.fit).toBeGreaterThanOrEqual(r2.teamScores.setup.fit - 1e-9);
  });

  it('5. adult teacher is not recommended Kids Ministry; teaching is reflected', () => {
    const r = run(personas.adultTeacher.answers);
    expect(invited(r)).not.toContain('kids');
    expect(r.teamScores.kids.excluded).toBe(true);
    expect(r.gifts.map((g) => g.gift)).toContain('teaching');
  });

  it('6. kids enthusiast is invited to Kids with safeguarding requirements shown', () => {
    const r = run(personas.kidsEnthusiast.answers);
    expect(invited(r)[0]).toBe('kids');
    expect(r.invitations[0].requirements).toMatch(/safeguarding/i);
  });

  it('7. private intercessor is invited to Prayer Ministry', () => {
    const r = run(personas.privateIntercessor.answers);
    expect(invited(r)[0]).toBe('prayer');
    expect(r.invitations[0].firstStep).toMatch(/intercession/i);
  });

  it('8. giving is reflected; limited availability changes neither gifts nor fit', () => {
    const r = run(personas.generousLimited.answers);
    expect(r.gifts.map((g) => g.gift)).toContain('giving');
    const weekly = run({ ...personas.generousLimited.answers, c5_frequency: choice('weekly') });
    expect(weekly.gifts).toEqual(r.gifts);
    for (const t of TEAM_IDS) expect(weekly.teamScores[t].fit).toBeCloseTo(r.teamScores[t].fit, 10);
    // the giving gift is never inferred from team vocabulary alone
    expect(r.evidence.filter((e) => e.gift === 'giving').every((e) => e.layer === 'pattern')).toBe(true);
  });

  it('9. broad interest is recognized', () => {
    const r = run(personas.multiInterest.answers);
    expect(r.mode).toBe('broad');
    expect(r.invitations.length).toBeGreaterThanOrEqual(2);
  });

  it('10. unsure observer gets exploration, not a forced ranking', () => {
    const r = run(personas.unsureObserver.answers);
    expect(r.mode).toBe('explore');
    expect(r.invitations).toHaveLength(0);
    expect(r.readiness).toBe('observe_first');
  });

  it('11. skipping all open text still produces results', () => {
    const r = run(noTextPersona);
    expect(invited(r)[0]).toBe('tech');
  });

  it('12. long answers do not outweigh concise ones', () => {
    const base: Answers = { ...personas.quietWelcomer.answers, c5_explore: prefs({ tech: 'maybe' }) };
    const concise = run({ ...base, c4_story: text('I ran sound once.') });
    const long = run({
      ...base,
      c4_story: text(
        'I ran sound for a conference. The sound was tricky and I adjusted the sound all day. I love sound, audio, mixing, microphones, livestream, video, slides, cables, the sound desk, and sound design. Sound sound sound. '.repeat(3),
      ),
    });
    expect(long.teamScores.tech.text).toBeLessThanOrEqual(matchingWeights.textMaxTotal + 1e-9);
    expect(long.teamScores.tech.fit - concise.teamScores.tech.fit).toBeLessThanOrEqual(matchingWeights.textWeightPerQuestion + 1e-9);
  });

  it('13. negation: "I do not enjoy troubleshooting" counts against, not for, Tech', () => {
    const base: Answers = { ...personas.techBeginner.answers, c3_useful: skipped };
    const r = run({ ...base, c4_story: text('I do not enjoy troubleshooting.') });
    const neutral = run(base);
    expect(r.teamScores.tech.text).toBeLessThan(0);
    expect(r.teamScores.tech.fit).toBeLessThan(neutral.teamScores.tech.fit);
    expect(r.teamScores.tech.excluded).toBe(false); // a dislike is not an opt-out
  });

  it('14. growth: "no audio experience, but I would love to learn" is learning interest', () => {
    const base: Answers = { ...personas.quietWelcomer.answers, c5_explore: prefs({ tech: 'maybe' }) };
    const r = run({ ...base, c4_story: text('I have no audio experience, but I would love to learn.') });
    expect(r.teamScores.tech.learning).toBeGreaterThan(0);
    expect(r.evidence.some((e) => e.layer === 'text' && e.interpretation.startsWith('growth'))).toBe(true);
  });

  it('15. historical: "used to lead worship…something different" does not boost Worship', () => {
    const base = personas.quietWelcomer.answers;
    const r = run({ ...base, c4_story: text('I used to lead worship, but I want to explore something different.') });
    const neutral = run(base);
    expect(r.teamScores.worship.fit).toBeLessThanOrEqual(neutral.teamScores.worship.fit);
    expect(invited(r)).not.toContain('worship');
  });

  it('16. third-person: "My spouse loves working with children" is not attributed', () => {
    const base = personas.quietWelcomer.answers;
    const r = run({ ...base, c4_story: text('My spouse loves working with children.') });
    const neutral = run(base);
    expect(r.teamScores.kids.fit).toBeCloseTo(neutral.teamScores.kids.fit, 10);
    expect(r.evidence.find((e) => e.team === 'kids' && e.layer === 'text')?.counted).toBe(false);
  });

  it('17. participant corrections update recommendations', () => {
    const before = run(personas.techBeginner.answers);
    const top = before.invitations[0].team;
    const after = run(personas.techBeginner.answers, { feedback: { [top]: 'not_for_me', kids: 'feels_like_me' } as FeedbackMap });
    expect(invited(after)).not.toContain(top);
    expect(invited(after)).toContain('kids');
  });

  it('18. declining follow-up still yields results and shares no contact details', () => {
    const r = run(personas.techBeginner.answers);
    expect(r.invitations.length).toBeGreaterThan(0);
    const payload = buildSharePayload(r, personas.techBeginner.answers, {}, { preferredName: 'Sam', email: 'sam@example.com', contactMethod: 'email' }, {
      shareSummary: true,
      requestFollowUp: false,
      includeGifts: true,
      includeWritten: false,
      exploringOnly: true,
      teams: ['tech'],
    });
    expect(payload.contact).toBeNull();
    expect(payload.assessment.writtenAnswers).toEqual([]);
  });
});

describe('scoring rules', () => {
  it('explicit opt-out beats inferred text signals', () => {
    const r = run({
      ...personas.kidsEnthusiast.answers,
      c5_explore: prefs({ kids: 'not_now', prayer: 'curious' }),
    });
    expect(invited(r)).not.toContain('kids');
    expect(r.teamScores.kids.excludedReason).toMatch(/not right now/i);
  });

  it('skipped answers are missing, not negative', () => {
    const answered = run({ ...personas.quietWelcomer.answers, c3_tech_curiosity: scale(null) });
    const skippedRun = run({ ...personas.quietWelcomer.answers, c3_tech_curiosity: skipped });
    for (const t of TEAM_IDS) expect(answered.teamScores[t].fit).toBeCloseTo(skippedRun.teamScores[t].fit, 10);
  });

  it('normalizes for unequal opportunities (one extra Tech question at zero lowers Tech, not others)', () => {
    const a: Answers = { c2_arrive: choice('mic', 'unsure'), c2_notice: choice('sound'), c3_energy: choice('fixing', 'meeting'), c4_friend: choice('listen') };
    const b: Answers = { ...a, c3_tech_curiosity: scale(0) };
    const ra = run(a);
    const rb = run(b);
    expect(rb.teamScores.tech.pattern).toBeLessThan(ra.teamScores.tech.pattern);
    expect(rb.teamScores.welcome.pattern).toBeCloseTo(ra.teamScores.welcome.pattern, 10);
  });

  it('a multi-select cannot exceed the per-question cap for one team', () => {
    const r = run({ c3_energy: choice('fixing', 'software', 'quiet_work'), c2_arrive: choice('mic'), c2_notice: choice('sound'), c4_friend: choice('practical') });
    // 3 tech options in one question still count as one question's worth
    expect(r.teamScores.tech.pattern).toBeLessThanOrEqual((3 * matchingWeights.perQuestionCap) / (3 + matchingWeights.shrinkage) + 1e-9);
  });

  it('supports ties without arbitrarily dropping a team', () => {
    const r = run({
      c2_arrive: choice('unsure', 'room'),
      c2_notice: choice('taking_in'),
      c3_energy: choice('meeting', 'organizing'),
      c5_explore: prefs({ welcome: 'curious', setup: 'curious' }),
    });
    const teams = invited(r);
    expect(teams).toEqual(expect.arrayContaining(['welcome', 'setup'] as TeamId[]));
    expect(r.invitations.filter((i) => i.team === 'welcome' || i.team === 'setup').every((i) => i.tied)).toBe(true);
  });

  it('free text alone cannot create a recommendation; it waits for review', () => {
    const r = run({
      c2_arrive: choice('unsure'),
      c2_notice: choice('alone'),
      c3_energy: choice('meeting'),
      c4_friend: choice('listen'),
      c4_story: text('I helped run the livestream at my old church.'),
    });
    expect(invited(r)).not.toContain('tech');
    expect(r.toReview.some((f) => f.team === 'tech')).toBe(true);
  });

  it('does not double-count a structured answer restated in text', () => {
    const base: Answers = { ...personas.techBeginner.answers, c3_useful: skipped };
    const restated = run({ ...base, c4_story: text('I enjoy troubleshooting.') });
    const plain = run(base);
    expect(restated.teamScores.tech.text).toBe(0);
    expect(restated.teamScores.tech.fit).toBeCloseTo(plain.teamScores.tech.fit, 10);
  });

  it('is deterministic for a given version', () => {
    const a = run(personas.multiInterest.answers);
    const b = run(personas.multiInterest.answers);
    expect(JSON.stringify({ ...a, evidence: a.evidence })).toBe(JSON.stringify({ ...b, evidence: b.evidence }));
  });

  it('never exposes percentages in gift reflections', () => {
    const r = run(personas.kidsEnthusiast.answers);
    for (const g of r.gifts) expect(g.reasons.join(' ')).not.toMatch(/%/);
  });
});
