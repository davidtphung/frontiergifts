import { QUESTION_BANK_VERSION, allItems, scenarios, screens } from '../content/questions';
import { scoringConfig } from '../content/scoring';
import { giftTeamWeights, teamById } from '../content/teams';
import { GIFT_IDS, TEAM_IDS, type GiftId, type Level, type ScoringConfig, type TeamId } from '../content/types';
import type { Answers, FeedbackMap, GiftEvidence, GiftResult, Recommendation, Results, TeamResult } from './types';

/**
 * Gift scoring (see docs/04-scoring-spec.md):
 *   ratingMean  = mean(rating / 4) over answered statements for the gift
 *   scenario    = min(1, picks / saturation), saturation scaled to scenarios answered
 *   score       = 0.65·ratingMean + 0.35·scenario   (whichever parts exist)
 * "Not sure" and skipped answers are missing, never negative.
 */
export function scoreGifts(answers: Answers, cfg: ScoringConfig = scoringConfig): GiftResult[] {
  const ratings = Object.fromEntries(GIFT_IDS.map((g) => [g, [] as number[]])) as Record<GiftId, number[]>;
  const picks = Object.fromEntries(GIFT_IDS.map((g) => [g, 0])) as Record<GiftId, number>;
  const evidence = Object.fromEntries(GIFT_IDS.map((g) => [g, [] as GiftEvidence[]])) as Record<GiftId, GiftEvidence[]>;
  let answeredScenarios = 0;

  for (const screen of screens) {
    const a = answers[screen.id];
    if (!a || a.kind === 'skipped') continue;
    if (screen.kind === 'ratings' && a.kind === 'ratings') {
      for (const it of screen.items) {
        const v = a.values[it.id];
        if (v === null || v === undefined) continue;
        ratings[it.gift].push(v / 4);
        if (v >= 3)
          evidence[it.gift].push({
            kind: 'rating',
            screenId: screen.id,
            itemId: it.id,
            weight: v / 4,
            text: `You rated “${it.text.replace(/\.$/, '')}” as ${cfg.scale[v].toLowerCase()}.`,
          });
      }
    } else if (screen.kind === 'scenario' && a.kind === 'choice') {
      const opt = screen.options.find((o) => o.id === a.optionId);
      if (!opt) continue;
      answeredScenarios += 1;
      picks[opt.gift] += 1;
      evidence[opt.gift].push({
        kind: 'scenario',
        screenId: screen.id,
        optionId: opt.id,
        weight: 1,
        text: `${(screen.storyLine ?? screen.prompt).replace(/\.$/, '')}: you chose “${opt.label.replace(/[“”]/g, '')}”.`,
      });
    }
  }

  const saturation = Math.max(1, (cfg.scenarioSaturation * answeredScenarios) / scenarios.length);
  return GIFT_IDS.map((g) => {
    const r = ratings[g];
    const ratingMean = r.length ? r.reduce((x, y) => x + y, 0) / r.length : null;
    const scenario = answeredScenarios ? Math.min(1, picks[g] / saturation) : null;
    const enough = r.length >= cfg.minRatedItems || (r.length === 0 && answeredScenarios >= 4);
    let score: number | null = null;
    if (enough) {
      if (ratingMean !== null && scenario !== null) score = cfg.ratingWeight * ratingMean + cfg.scenarioWeight * scenario;
      else if (ratingMean !== null) score = ratingMean;
      else score = scenario;
    }
    const level: Level | null =
      score === null ? null : score >= cfg.strongAt ? 'strong' : score >= cfg.presentAt ? 'present' : 'emerging';
    return {
      gift: g,
      score,
      level,
      ratingMean,
      ratedItems: r.length,
      scenarioPicks: picks[g],
      evidence: evidence[g].sort((a, b) => b.weight - a.weight),
    };
  });
}

/** Team fit = weighted mean of the participant's gift scores, using giftTeamWeights. */
export function scoreTeams(gifts: GiftResult[], feedback: FeedbackMap = {}, cfg: ScoringConfig = scoringConfig): TeamResult[] {
  const byGift = Object.fromEntries(gifts.map((g) => [g.gift, g])) as Record<GiftId, GiftResult>;
  return TEAM_IDS.map((t) => {
    let num = 0;
    let den = 0;
    const contrib: [GiftId, number][] = [];
    for (const [g, w] of Object.entries(giftTeamWeights[t]) as [GiftId, number][]) {
      const s = byGift[g].score;
      if (s === null) continue;
      num += w * s;
      den += w;
      contrib.push([g, w * s]);
    }
    const fb = feedback[t];
    const boost = fb === 'feels_like_me' ? cfg.feedbackFeelsLikeMe : fb === 'curious' ? cfg.feedbackCurious : 0;
    const drivers = contrib
      .filter(([g]) => byGift[g].level === 'strong' || byGift[g].level === 'present')
      .sort((a, b) => b[1] - a[1] || GIFT_IDS.indexOf(a[0]) - GIFT_IDS.indexOf(b[0]))
      .slice(0, 2)
      .map(([g]) => g);
    return { team: t, fit: (den ? num / den : 0) + boost, drivers, excluded: fb === 'not_for_me' };
  }).sort((a, b) => b.fit - a.fit || TEAM_IDS.indexOf(a.team) - TEAM_IDS.indexOf(b.team));
}

function firstStep(t: TeamId): string {
  const team = teamById[t];
  return team.configuredOpportunities.length
    ? `Current opportunities: ${team.configuredOpportunities.join('; ')}.`
    : team.defaultFirstStep;
}

export function buildResults(answers: Answers, feedback: FeedbackMap = {}, cfg: ScoringConfig = scoringConfig): Results {
  const gifts = scoreGifts(answers, cfg);
  const teams = scoreTeams(gifts, feedback, cfg);
  const levelled = gifts.filter((g) => g.level !== null).length;
  const answeredItems = gifts.reduce((n, g) => n + g.ratedItems, 0);
  const answeredScenarios = scenarios.filter((s) => answers[s.id]?.kind === 'choice').length;

  const known = gifts.filter((g) => g.score !== null).map((g) => g.score!);
  const flatProfile =
    known.length >= cfg.minGiftsForRecommendations && Math.max(...known) - Math.min(...known) < cfg.flatProfileRange;

  const recommendations: Recommendation[] = [];
  if (levelled >= cfg.minGiftsForRecommendations) {
    const eligible = teams.filter((t) => !t.excluded);
    const forced = eligible.filter((t) => feedback[t.team] === 'feels_like_me');
    const ordered = [...forced, ...eligible.filter((t) => !forced.includes(t))];
    const pick: { t: TeamResult; tier: Recommendation['tier']; tied: boolean }[] = ordered
      .slice(0, 2)
      .map((t) => ({ t, tier: 'recommended', tied: false }));
    const third = ordered[2];
    if (third && pick.length === 2) {
      if (pick[1].t.fit - third.fit <= cfg.tieEpsilon) {
        pick.push({ t: third, tier: 'recommended', tied: true });
        pick[1].tied = true;
      } else if (third.fit >= cfg.alsoAt) {
        pick.push({ t: third, tier: 'also', tied: false });
      }
    }
    if (pick.length >= 2 && Math.abs(pick[0].t.fit - pick[1].t.fit) <= cfg.tieEpsilon) {
      pick[0].tied = true;
      pick[1].tied = true;
    }
    for (const p of pick) {
      recommendations.push({
        team: p.t.team,
        tier: p.tier,
        tied: p.tied,
        drivers: p.t.drivers,
        firstStep: firstStep(p.t.team),
        requirements: teamById[p.t.team].placementRequirements,
        userFeedback: feedback[p.t.team],
      });
    }
  }

  const rank = (g: GiftResult) => (g.score === null ? -1 : g.score);
  return {
    mode: recommendations.length ? 'recommend' : 'explore',
    gifts: [...gifts].sort((a, b) => rank(b) - rank(a) || GIFT_IDS.indexOf(a.gift) - GIFT_IDS.indexOf(b.gift)),
    teams,
    recommendations,
    flatProfile,
    answeredItems,
    answeredScenarios,
    versions: { questionBank: QUESTION_BANK_VERSION, scoring: cfg.version },
  };
}

/** Total statements, for progress copy and tests. */
export const TOTAL_ITEMS = allItems.length;
