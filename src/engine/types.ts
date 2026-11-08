import type { GiftId, Level, TeamId } from '../content/types';

export type AnswerValue =
  /** Ratings for a block of statements: 0..4, or null for "Not sure". */
  | { kind: 'ratings'; values: Record<string, number | null> }
  | { kind: 'choice'; optionId: string }
  | { kind: 'skipped' };

/** Keyed by screen id. */
export type Answers = Record<string, AnswerValue>;

export type Feedback = 'feels_like_me' | 'curious' | 'not_for_me';
export type FeedbackMap = Partial<Record<TeamId, Feedback>>;

export interface GiftEvidence {
  kind: 'rating' | 'scenario';
  screenId: string;
  itemId?: string;
  optionId?: string;
  /** Plain-language explanation, quoting what the participant chose. */
  text: string;
  weight: number;
}

export interface GiftResult {
  gift: GiftId;
  /** 0..1 internal heuristic; never shown as a number. null = not enough answers. */
  score: number | null;
  level: Level | null;
  ratingMean: number | null;
  ratedItems: number;
  scenarioPicks: number;
  evidence: GiftEvidence[];
}

export interface TeamResult {
  team: TeamId;
  fit: number;
  /** Gifts that contribute most, strongest first. */
  drivers: GiftId[];
  excluded: boolean;
}

export interface Recommendation {
  team: TeamId;
  tier: 'recommended' | 'also';
  tied: boolean;
  drivers: GiftId[];
  firstStep: string;
  requirements?: string;
  userFeedback?: Feedback;
}

export interface Results {
  mode: 'recommend' | 'explore';
  gifts: GiftResult[];
  teams: TeamResult[];
  recommendations: Recommendation[];
  flatProfile: boolean;
  answeredItems: number;
  answeredScenarios: number;
  versions: { questionBank: string; scoring: string };
}
