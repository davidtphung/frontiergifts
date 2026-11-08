import { QUESTION_BANK_VERSION, questionById } from '../content/questions';
import { matchingWeights, signalLibrary } from '../content/signals';
import { teamById } from '../content/teams';
import {
  GIFT_IDS,
  TEAM_IDS,
  type GiftId,
  type MatchingWeights,
  type Readiness,
  type SignalBundle,
  type SkillId,
  type TeamId,
} from '../content/types';
import { interpretText } from './text';
import type {
  Answers,
  Evidence,
  FeedbackMap,
  GiftReflection,
  Invitation,
  Results,
  TeamScore,
  TextFinding,
} from './types';

const zeroTeams = () => Object.fromEntries(TEAM_IDS.map((t) => [t, 0])) as Record<TeamId, number>;
const zeroGifts = () => Object.fromEntries(GIFT_IDS.map((g) => [g, 0])) as Record<GiftId, number>;
const setTeams = () => Object.fromEntries(TEAM_IDS.map((t) => [t, new Set<string>()])) as Record<TeamId, Set<string>>;
const setGifts = () => Object.fromEntries(GIFT_IDS.map((g) => [g, new Set<string>()])) as Record<GiftId, Set<string>>;

function answeredNonEmpty(a: Answers[string] | undefined): boolean {
  if (!a || a.kind === 'skipped') return false;
  if (a.kind === 'choice') return a.ids.length > 0;
  if (a.kind === 'text') return a.text.trim().length > 0;
  if (a.kind === 'teamPrefs') return Object.keys(a.prefs).length > 0;
  return true;
}

export interface ScoreState {
  teamScores: Record<TeamId, TeamScore>;
  giftScores: Record<GiftId, number>;
  giftDistinct: Record<GiftId, Set<string>>;
  evidence: Evidence[];
  toReview: TextFinding[];
  intentReadiness: Readiness | null;
  experienceReadiness: Readiness | null;
  teamReadiness: Partial<Record<TeamId, Readiness>>;
  practical: string[];
  answeredCount: number;
}

/**
 * Baseline scoring. See docs/04-matching-spec.md for the formula.
 * Only questions in `activeIds` (what the participant was actually shown)
 * contribute; skipped / "not sure" answers are treated as missing.
 */
export function scoreAnswers(
  answers: Answers,
  activeIds: string[],
  feedback: FeedbackMap = {},
  w: MatchingWeights = matchingWeights,
): ScoreState {
  const evidence: Evidence[] = [];
  const toReview: TextFinding[] = [];
  const teamRaw = zeroTeams();
  const teamOpp = zeroTeams();
  const teamQs = setTeams();
  const giftRaw = zeroGifts();
  const giftOpp = zeroGifts();
  const giftQs = setGifts();
  const learningRaw = zeroTeams();
  const explicit = zeroTeams();
  const explicitPref: Partial<Record<TeamId, string>> = {};
  const optOuts = new Map<TeamId, string>();
  const skillsPresent = new Set<SkillId>();
  const teamReadiness: Partial<Record<TeamId, Readiness>> = {};
  const readinessBy: Record<string, Readiness> = {};
  const practical = new Set<string>();
  const textFindings: TextFinding[] = [];
  let answeredCount = 0;

  const applyBundle = (
    qid: string,
    bundle: SignalBundle,
    scale: number,
    perTeam: Record<TeamId, number>,
    perGift: Record<GiftId, number>,
    because: string | undefined,
    optionId?: string,
  ) => {
    for (const [t, v] of Object.entries(bundle.teams ?? {}) as [TeamId, number][]) {
      const wt = v * scale;
      if (wt <= 0) continue;
      perTeam[t] += wt;
      evidence.push({ layer: 'pattern', questionId: qid, optionId, ruleId: `${qid}:${optionId ?? 'scale'}`, team: t, weight: wt, interpretation: 'structured answer', because, counted: true });
    }
    for (const [g, v] of Object.entries(bundle.gifts ?? {}) as [GiftId, number][]) {
      const wt = v * scale;
      if (wt <= 0) continue;
      perGift[g] += wt;
      evidence.push({ layer: 'pattern', questionId: qid, optionId, ruleId: `${qid}:${optionId ?? 'scale'}`, gift: g, weight: wt, interpretation: 'structured answer', because, counted: true });
    }
    for (const [s, v] of Object.entries(bundle.skills ?? {}) as [SkillId, number][]) {
      if (v * scale <= 0) continue;
      skillsPresent.add(s);
      evidence.push({ layer: 'skill', questionId: qid, optionId, ruleId: `${qid}:${optionId ?? 'scale'}`, skill: s, weight: v * scale, interpretation: 'practical interest/skill', counted: true });
    }
    for (const [t, v] of Object.entries(bundle.learning ?? {}) as [TeamId, number][]) {
      if (v * scale <= 0) continue;
      learningRaw[t] += v * scale;
      evidence.push({ layer: 'learning', questionId: qid, optionId, ruleId: `${qid}:${optionId ?? 'scale'}`, team: t, weight: v * scale, interpretation: 'wants to learn/grow', because, counted: true });
    }
    for (const p of bundle.practical ?? []) practical.add(p);
    if (bundle.readiness) readinessBy[qid] = bundle.readiness;
  };

  /**
   * Opportunity = the strongest signal this question could have given the
   * team/gift (capped). A light 0.3 mention shouldn't penalize a team as much
   * as a question that is squarely about it.
   */
  const commit = (qid: string, offeredTeams: Map<TeamId, number>, offeredGifts: Map<GiftId, number>, perTeam: Record<TeamId, number>, perGift: Record<GiftId, number>) => {
    for (const [t, maxW] of offeredTeams) {
      teamOpp[t] += Math.min(w.perQuestionCap, maxW);
      const c = Math.min(w.perQuestionCap, perTeam[t]);
      if (c > 0) {
        teamRaw[t] += c;
        teamQs[t].add(qid);
      }
    }
    for (const [g, maxW] of offeredGifts) {
      giftOpp[g] += Math.min(w.perQuestionCap, maxW);
      const c = Math.min(w.perQuestionCap, perGift[g]);
      if (c > 0) {
        giftRaw[g] += c;
        giftQs[g].add(qid);
      }
    }
  };

  const maxOf = <K extends string>(m: Map<K, number>, rec: Partial<Record<K, number>> | undefined, scale = 1) => {
    for (const [k, v] of Object.entries(rec ?? {}) as [K, number][]) m.set(k, Math.max(m.get(k) ?? 0, v * scale));
  };

  for (const qid of activeIds) {
    const q = questionById[qid];
    const a = answers[qid];
    if (!q || !answeredNonEmpty(a) || !a) continue;
    answeredCount += 1;
    const perTeam = zeroTeams();
    const perGift = zeroGifts();

    if (a.kind === 'choice' && q.options) {
      const selected = q.options.filter((o) => a.ids.includes(o.id));
      for (const o of selected) {
        if (o.optOut) optOuts.set(o.optOut, `You chose “${o.label}”`);
        if (o.signals) applyBundle(qid, o.signals, 1, perTeam, perGift, o.because, o.id);
      }
      if (selected.some((o) => !o.neutral)) {
        const offeredTeams = new Map<TeamId, number>();
        const offeredGifts = new Map<GiftId, number>();
        for (const o of q.options) {
          maxOf(offeredTeams, o.signals?.teams);
          maxOf(offeredGifts, o.signals?.gifts);
        }
        commit(qid, offeredTeams, offeredGifts, perTeam, perGift);
      }
    } else if (a.kind === 'scale' && q.barometer) {
      if (a.value === null) continue; // "not sure" = missing
      const b = q.barometer;
      const scale = a.value / 4;
      applyBundle(qid, b.scaled, scale, perTeam, perGift, a.value >= 3 ? b.becauseHigh : undefined);
      if (b.readinessByValue && q.followupTeam) teamReadiness[q.followupTeam] = b.readinessByValue[a.value];
      const offeredTeams = new Map<TeamId, number>();
      const offeredGifts = new Map<GiftId, number>();
      maxOf(offeredTeams, b.scaled.teams);
      maxOf(offeredGifts, b.scaled.gifts);
      commit(qid, offeredTeams, offeredGifts, perTeam, perGift);
    } else if (a.kind === 'teamPrefs') {
      for (const [t, pref] of Object.entries(a.prefs) as [TeamId, string][]) {
        if (pref === 'not_now') {
          optOuts.set(t, 'You said “not right now”');
        } else {
          explicit[t] = pref === 'curious' ? w.explicitCurious : w.explicitMaybe;
          explicitPref[t] = pref;
          teamQs[t].add(qid);
          evidence.push({ layer: 'explicit', questionId: qid, ruleId: `${qid}:${t}`, team: t, weight: explicit[t], interpretation: `explicit: ${pref}`, because: pref === 'curious' ? `you said you’re curious about ${teamById[t].name}` : `you said “maybe” to ${teamById[t].name}`, counted: true });
        }
      }
    } else if (a.kind === 'text') {
      textFindings.push(...interpretText(qid, a.text, { isFill: q.format === 'fill' }));
    }
  }

  // ── Layer 5: free text (supporting evidence only)
  const textTeamQs = setTeams();
  const textGiftQs = setGifts();
  for (const f of textFindings) {
    if (['current', 'growth', 'uncertain'].includes(f.interpretation)) {
      if (f.team) textTeamQs[f.team].add(f.questionId);
      if (f.gift) textGiftQs[f.gift].add(f.questionId);
    }
  }
  const textTeamPerQ: Record<string, number> = {};
  const textGiftPerQ: Record<string, number> = {};
  const textTeam = zeroTeams();
  const textGift = zeroGifts();
  const textCountedQs = setTeams();
  const textCountedGiftQs = setGifts();
  const base = (f: TextFinding): Omit<Evidence, 'weight' | 'counted' | 'interpretation'> => ({
    layer: 'text', questionId: f.questionId, phrase: f.phrase, ruleId: f.ruleId, team: f.team, gift: f.gift, skill: f.skill, uncertain: f.uncertain,
  });

  for (const f of textFindings) {
    const interp = f.interpretation;
    if (interp === 'third_party' || interp === 'historical' || interp === 'no_experience') {
      evidence.push({ ...base(f), weight: 0, interpretation: interp, counted: false, note: interp === 'third_party' ? 'about someone else' : interp === 'historical' ? 'past experience, not a current preference' : 'no current experience (not a negative)' });
      continue;
    }
    if (interp === 'opt_out' && f.team) {
      if (explicitPref[f.team]) {
        toReview.push(f);
        evidence.push({ ...base(f), weight: 0, interpretation: 'opt_out (conflicts with explicit interest—kept for review)', counted: false });
      } else {
        optOuts.set(f.team, `You wrote “${f.phrase}” alongside “not”`);
        evidence.push({ ...base(f), weight: 0, interpretation: 'explicit opt-out in text', counted: true });
      }
      continue;
    }
    if (interp === 'negated' || interp === 'moving_on' || interp === 'opt_out') {
      const neg = interp === 'moving_on' ? -0.1 : -w.textWeightPerQuestion;
      if (f.team) textTeam[f.team] += neg;
      if (f.gift) textGift[f.gift] += neg;
      evidence.push({ ...base(f), weight: neg, interpretation: interp, counted: true });
      continue;
    }
    // positive: current / growth / uncertain
    const mult = interp === 'current' ? 1 : 0.5;
    if (f.team) {
      const t = f.team;
      if (interp === 'growth') learningRaw[t] += 0.5;
      const restated = !!f.skill && skillsPresent.has(f.skill) && interp !== 'growth';
      const gated = explicit[t] > 0 || teamQs[t].size >= 1 || textTeamQs[t].size >= 2;
      if (restated) {
        evidence.push({ ...base(f), weight: 0, interpretation: `${interp} (restates a structured answer—not double-counted)`, counted: false });
      } else if (!gated) {
        toReview.push(f);
        evidence.push({ ...base(f), weight: 0, interpretation: `${interp} (needs support from another answer)`, counted: false });
      } else {
        const key = `${f.questionId}:${t}`;
        const add = Math.min(w.textWeightPerQuestion, f.weight * w.textWeightPerQuestion * mult);
        const prev = textTeamPerQ[key] ?? 0;
        if (add > prev) {
          textTeam[t] += add - prev;
          textTeamPerQ[key] = add;
        }
        textCountedQs[t].add(f.questionId);
        evidence.push({ ...base(f), weight: add, interpretation: interp, because: `you wrote “${f.phrase}”`, counted: true });
      }
    }
    if (f.gift) {
      const g = f.gift;
      const gated = giftQs[g].size >= 1 || textGiftQs[g].size >= 2;
      if (!gated) {
        if (!f.team) toReview.push(f);
        evidence.push({ ...base(f), team: undefined, weight: 0, interpretation: `${interp} (gift theme needs support from another answer)`, counted: false });
      } else {
        const key = `${f.questionId}:${g}`;
        const add = Math.min(w.textWeightPerQuestion, f.weight * w.textWeightPerQuestion * mult);
        const prev = textGiftPerQ[key] ?? 0;
        if (add > prev) {
          textGift[g] += add - prev;
          textGiftPerQ[key] = add;
        }
        textCountedGiftQs[g].add(f.questionId);
        evidence.push({ ...base(f), team: undefined, weight: add, interpretation: interp, because: `you wrote “${f.phrase}”`, counted: true });
      }
    }
  }

  // ── Combine
  const teamScores = {} as Record<TeamId, TeamScore>;
  for (const t of TEAM_IDS) {
    const pattern = teamRaw[t] / (teamOpp[t] + w.shrinkage);
    const learning = Math.min(1, learningRaw[t]);
    const text = Math.max(-w.textMaxTotal, Math.min(w.textMaxTotal, textTeam[t]));
    const fb = feedback[t];
    const feedbackBoost = fb === 'feels_like_me' ? w.feedbackFeelsLikeMe : fb === 'curious' ? w.feedbackCurious : 0;
    const fit = pattern + explicit[t] + w.learningWeight * learning + text + feedbackBoost;
    const distinct = new Set([...teamQs[t], ...textCountedQs[t]]).size + (fb === 'feels_like_me' || fb === 'curious' ? 1 : 0);
    // Participant feedback on the results is the most recent explicit word and wins.
    const excludedReason =
      fb === 'not_for_me'
        ? 'You said “not for me right now”'
        : fb === 'feels_like_me' || fb === 'curious'
          ? undefined
          : optOuts.get(t);
    teamScores[t] = {
      team: t,
      pattern,
      explicit: explicit[t],
      learning,
      text,
      feedback: feedbackBoost,
      fit,
      distinctQuestions: distinct,
      excluded: !!excludedReason,
      excludedReason,
    };
  }

  const giftScores = zeroGifts();
  const giftDistinct = setGifts();
  for (const g of GIFT_IDS) {
    giftScores[g] = giftRaw[g] / (giftOpp[g] + w.shrinkage) + Math.max(-w.textMaxTotal, Math.min(w.textMaxTotal, textGift[g]));
    giftDistinct[g] = new Set([...giftQs[g], ...textCountedGiftQs[g]]);
  }

  const intentReadiness =
    readinessBy['c5_readiness'] ?? readinessBy['f_clarify'] ?? readinessBy['c2_arrive'] ?? null;
  const experienceReadiness = readinessBy['d_experience'] ?? null;

  return {
    teamScores,
    giftScores,
    giftDistinct,
    evidence,
    toReview,
    intentReadiness,
    experienceReadiness,
    teamReadiness,
    practical: [...practical],
    answeredCount,
  };
}

const READINESS_STEP: Partial<Record<Readiness, string>> = {
  observe_first: 'You mentioned wanting to observe first—that’s a great way to begin.',
  wants_training: 'Ask about training. You don’t need to know everything to start.',
  not_now: 'No rush. This invitation is here whenever you’re ready.',
};

function firstStepFor(t: TeamId, s: ScoreState): string {
  const team = teamById[t];
  const parts: string[] = [];
  parts.push(
    team.configuredOpportunities.length
      ? `Current opportunities: ${team.configuredOpportunities.join('; ')}.`
      : team.defaultFirstStep,
  );
  if (s.intentReadiness && READINESS_STEP[s.intentReadiness]) parts.push(READINESS_STEP[s.intentReadiness]!);
  const tr = s.teamReadiness[t] ?? s.experienceReadiness;
  if (tr === 'curious_beginner') parts.push('No experience needed—curious beginners are welcome.');
  if (s.teamScores[t].learning > 0) parts.push('Mention that you’d like to learn and grow here.');
  if (t === 'setup' && s.practical.includes('no_heavy_lifting'))
    parts.push('Ask about roles like signage, room prep, or coordination—no heavy lifting needed.');
  return parts.join(' ');
}

function reasonsFor(t: TeamId, s: ScoreState): string[] {
  const items = s.evidence
    .filter((e) => e.team === t && e.counted && e.weight > 0 && e.because)
    .sort((a, b) => (a.layer === 'explicit' ? -1 : 0) - (b.layer === 'explicit' ? -1 : 0) || b.weight - a.weight);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of items) {
    if (seen.has(e.because!)) continue;
    seen.add(e.because!);
    out.push(e.because!);
    if (out.length === 3) break;
  }
  return out;
}

export function buildResults(
  answers: Answers,
  activeIds: string[],
  feedback: FeedbackMap = {},
  w: MatchingWeights = matchingWeights,
): Results {
  const s = scoreAnswers(answers, activeIds, feedback, w);
  const order = (a: TeamId, b: TeamId) =>
    s.teamScores[b].fit - s.teamScores[a].fit || TEAM_IDS.indexOf(a) - TEAM_IDS.indexOf(b);
  const eligible = TEAM_IDS.filter((t) => !s.teamScores[t].excluded).sort(order);

  const isStrong = (t: TeamId) => {
    const ts = s.teamScores[t];
    if (feedback[t] === 'feels_like_me') return true;
    return (
      ts.fit >= w.strongThreshold &&
      (ts.distinctQuestions >= w.minDistinctQuestionsForStrong || (ts.explicit >= w.explicitCurious && ts.distinctQuestions >= 1))
    );
  };

  const strong = s.answeredCount >= w.minAnsweredForResults || eligible.some((t) => s.teamScores[t].explicit > 0)
    ? eligible.filter(isStrong)
    : [];
  const picked: { team: TeamId; tier: 'strong' | 'also'; tied: boolean }[] = [];
  strong.slice(0, 2).forEach((t) => picked.push({ team: t, tier: 'strong', tied: false }));
  // Ties at the boundary: include the tied team rather than arbitrarily dropping it.
  if (strong.length > 2 && s.teamScores[strong[1]].fit - s.teamScores[strong[2]].fit <= w.tieEpsilon) {
    picked.push({ team: strong[2], tier: 'strong', tied: true });
    picked[1].tied = true;
  }
  if (picked.length >= 2 && Math.abs(s.teamScores[picked[0].team].fit - s.teamScores[picked[1].team].fit) <= w.tieEpsilon) {
    picked[0].tied = true;
    picked[1].tied = true;
  }
  if (picked.length < 3 && s.answeredCount >= w.minAnsweredForResults) {
    const also = eligible.find(
      (t) => !picked.some((p) => p.team === t) && s.teamScores[t].fit >= w.alsoThreshold && s.teamScores[t].distinctQuestions >= 1,
    );
    if (also) picked.push({ team: also, tier: 'also', tied: false });
  }

  const broad = strong.length >= w.broadInterestCount;
  const mode = picked.length === 0 ? 'explore' : broad ? 'broad' : 'matched';

  const gifts: GiftReflection[] = GIFT_IDS.filter((g) => s.giftScores[g] >= w.giftThreshold)
    .sort((a, b) => s.giftScores[b] - s.giftScores[a] || s.giftDistinct[b].size - s.giftDistinct[a].size || GIFT_IDS.indexOf(a) - GIFT_IDS.indexOf(b))
    .slice(0, w.maxGiftsShown)
    .map((g) => {
      const reasons = [...new Set(s.evidence.filter((e) => e.gift === g && e.counted && e.weight > 0 && e.because).map((e) => e.because!))].slice(0, 2);
      return { gift: g, score: s.giftScores[g], distinctQuestions: s.giftDistinct[g].size, reasons };
    });
  const shownGifts = new Set(gifts.map((g) => g.gift));

  const invitations: Invitation[] = picked.map((p) => ({
    team: p.team,
    tier: p.tier,
    tied: p.tied,
    reasons: reasonsFor(p.team, s),
    giftConnections: teamById[p.team].giftConnections.filter((g) => shownGifts.has(g)),
    firstStep: firstStepFor(p.team, s),
    requirements: teamById[p.team].placementRequirements,
    userFeedback: feedback[p.team],
  }));

  return {
    mode,
    invitations,
    gifts,
    teamScores: s.teamScores,
    evidence: s.evidence,
    toReview: s.toReview,
    readiness: s.intentReadiness,
    practical: s.practical,
    answeredCount: s.answeredCount,
    versions: { questionBank: QUESTION_BANK_VERSION, signals: signalLibrary.version, matching: w.version },
  };
}
