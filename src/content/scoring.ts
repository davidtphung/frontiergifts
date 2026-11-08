import type { ScoringConfig } from './types';

/**
 * Scoring configuration. Internal heuristics—not a validated psychometric
 * instrument until piloted. See docs/04-scoring-spec.md.
 */
export const scoringConfig: ScoringConfig = {
  version: 'score-2026.11-v2',
  scale: ['Not like me', 'A little', 'Somewhat', 'Mostly', 'Very like me'],
  ratingWeight: 0.65,
  scenarioWeight: 0.35,
  scenarioSaturation: 3,
  strongAt: 0.65,
  presentAt: 0.42,
  minRatedItems: 2,
  minGiftsForRecommendations: 4,
  flatProfileRange: 0.12,
  alsoAt: 0.5,
  tieEpsilon: 0.02,
  feedbackFeelsLikeMe: 0.3,
  feedbackCurious: 0.1,
};
