import type { GiftId, Readiness, SkillId, TeamId } from '../content/types';

export type TeamPref = 'curious' | 'maybe' | 'not_now';

export type AnswerValue =
  | { kind: 'choice'; ids: string[] }
  | { kind: 'text'; text: string }
  /** value 0..4, or null for "not sure". */
  | { kind: 'scale'; value: number | null }
  | { kind: 'teamPrefs'; prefs: Partial<Record<TeamId, TeamPref>> }
  | { kind: 'skipped' };

export type Answers = Record<string, AnswerValue>;

export type Feedback = 'feels_like_me' | 'curious' | 'not_for_me';
export type FeedbackMap = Partial<Record<TeamId, Feedback>>;

export type TextInterpretation =
  | 'current'
  | 'growth'
  | 'no_experience'
  | 'negated'
  | 'opt_out'
  | 'historical'
  | 'moving_on'
  | 'third_party'
  | 'uncertain';

export interface TextFinding {
  questionId: string;
  phrase: string;
  ruleId: string;
  team?: TeamId;
  gift?: GiftId;
  skill?: SkillId;
  weight: number;
  interpretation: TextInterpretation;
  uncertain: boolean;
  teamCore: boolean;
  ruleVersion: string;
}

export type EvidenceLayer = 'explicit' | 'pattern' | 'skill' | 'learning' | 'text' | 'practical' | 'feedback';

/** Provenance for every score contribution. */
export interface Evidence {
  layer: EvidenceLayer;
  questionId: string;
  optionId?: string;
  phrase?: string;
  ruleId: string;
  team?: TeamId;
  gift?: GiftId;
  skill?: SkillId;
  weight: number;
  interpretation: string;
  because?: string;
  uncertain?: boolean;
  /** Text evidence that was recorded but not counted (and why). */
  counted: boolean;
  note?: string;
}

export interface TeamScore {
  team: TeamId;
  pattern: number;
  explicit: number;
  learning: number;
  text: number;
  feedback: number;
  fit: number;
  distinctQuestions: number;
  excluded: boolean;
  excludedReason?: string;
}

export interface GiftReflection {
  gift: GiftId;
  score: number;
  distinctQuestions: number;
  reasons: string[];
}

export type ResultMode = 'matched' | 'broad' | 'explore';

export interface Invitation {
  team: TeamId;
  tier: 'strong' | 'also';
  tied: boolean;
  reasons: string[];
  giftConnections: GiftId[];
  firstStep: string;
  requirements?: string;
  userFeedback?: Feedback;
}

export interface Results {
  mode: ResultMode;
  invitations: Invitation[];
  gifts: GiftReflection[];
  teamScores: Record<TeamId, TeamScore>;
  evidence: Evidence[];
  /** Text findings that weren't confident or confirmed—shown for review. */
  toReview: TextFinding[];
  readiness: Readiness | null;
  practical: string[];
  answeredCount: number;
  versions: { questionBank: string; signals: string; matching: string };
}
