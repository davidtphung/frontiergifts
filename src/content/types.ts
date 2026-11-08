/**
 * Content + configuration types. These mirror the relational schema in
 * db/schema.sql so the prototype's static config can later move into a
 * database without changing the engine.
 */

export type TeamId = 'tech' | 'welcome' | 'setup' | 'worship' | 'kids' | 'prayer';
export const TEAM_IDS: TeamId[] = ['tech', 'welcome', 'setup', 'worship', 'kids', 'prayer'];

export type GiftId =
  | 'prophecy'
  | 'serving'
  | 'teaching'
  | 'encouragement'
  | 'giving'
  | 'leadership'
  | 'mercy';
export const GIFT_IDS: GiftId[] = [
  'prophecy',
  'serving',
  'teaching',
  'encouragement',
  'giving',
  'leadership',
  'mercy',
];

/** Practical interests/skills. Tracked separately from gifts and team fit. */
export type SkillId =
  | 'audio'
  | 'software'
  | 'hardware'
  | 'media'
  | 'troubleshooting'
  | 'organization'
  | 'music'
  | 'vocals'
  | 'teaching_skill'
  | 'children'
  | 'conversation'
  | 'prayer'
  | 'campus_care'
  | 'physical_tasks'
  | 'coordination';

export type Readiness =
  | 'curious_beginner'
  | 'some_experience'
  | 'experienced'
  | 'wants_training'
  | 'observe_first'
  | 'not_now'
  | 'ready';

export type ChapterId = 'belong' | 'notice' | 'alive' | 'care' | 'next' | 'begin';

export interface Chapter {
  id: ChapterId;
  number: number;
  title: string;
  /** Thread line: "You arrive. You notice. You respond. You help make room." */
  thread: string;
  /** Short narrative transition shown before the chapter's first question. */
  transition: string;
}

export interface Team {
  id: TeamId;
  name: string;
  heart: string;
  shortDescription: string;
  includes: string[];
  /** Proposed ministry applications, NOT scriptural assignments. */
  giftConnections: GiftId[];
  /** Important distinctions the product must honor. */
  distinctions: string[];
  /** Default first step when Frontier hasn't configured an opportunity. */
  defaultFirstStep: string;
  /** Requirements that must be met before any real placement (configurable). */
  placementRequirements?: string;
  /** Opportunities Frontier has actually configured (empty = none confirmed). */
  configuredOpportunities: string[];
}

export interface Gift {
  id: GiftId;
  name: string;
  reference: string;
  /** Paraphrase, clearly not a quotation. */
  paraphrase: string;
  /** How this gift tends to show up across many teams. */
  acrossTeams: string;
}

/** Signals an answer can contribute. All weights are 0..1 per item. */
export interface SignalBundle {
  teams?: Partial<Record<TeamId, number>>;
  gifts?: Partial<Record<GiftId, number>>;
  skills?: Partial<Record<SkillId, number>>;
  /** Desire to learn/grow in a team area (separate from current skill). */
  learning?: Partial<Record<TeamId, number>>;
  readiness?: Readiness;
  /** Practical fit notes (no effect on gifts). */
  practical?: string[];
}

export interface AnswerOption {
  id: string;
  label: string;
  signals?: SignalBundle;
  /** Plain-language reason used in result explanations: "you'd ___". */
  because?: string;
  /** Marks a neutral/"not sure" option: counted as answered, contributes nothing. */
  neutral?: boolean;
  /** Choosing this option is an explicit opt-out from a team (Layer 1). */
  optOut?: TeamId;
}

export type QuestionFormat =
  | 'single'
  | 'multi'
  | 'scenario'
  | 'paired'
  | 'fill'
  | 'text'
  | 'barometer'
  | 'teamPrefs';

export type Condition =
  | { q: string; includesAny: string[] }
  | { q: string; atLeast: number }
  | { anyOf: Condition[] }
  | { allOf: Condition[] };

export interface BarometerSpec {
  /** 0..4 scale. Anchors at 0, 2, 4. */
  anchors: [string, string, string];
  /** Optional labels for the in-between steps (1 and 3). */
  steps?: [string, string, string, string, string];
  /** Signals scaled by value/4. */
  scaled: SignalBundle;
  /** Readiness inferred from value buckets (current comfort, not fit). */
  readinessByValue?: [Readiness, Readiness, Readiness, Readiness, Readiness];
  /** Explanation fragment when value >= 3. */
  becauseHigh?: string;
}

export interface Question {
  id: string;
  chapter: ChapterId;
  tier: 'core' | 'followup' | 'deeper';
  format: QuestionFormat;
  prompt: string;
  helper?: string;
  options?: AnswerOption[];
  /** For multi/scenario-multi. */
  maxSelections?: number;
  /** For fill/text. */
  maxLength?: number;
  placeholder?: string;
  /** For fill: text before/after the blank. */
  blank?: { before: string; after?: string };
  barometer?: BarometerSpec;
  skippable: boolean;
  /** Design documentation (rendered into docs/02-question-bank.md). */
  why: string;
  notProves: string;
  ambiguity: string;
  /** Follow-ups: shown only when the trigger holds (max 4 selected). */
  trigger?: Condition;
  /** Follow-up relevance: ranked by the participant's score in this team. */
  followupTeam?: TeamId;
  /** Brief value-through-story line shown above the prompt (optional). */
  storyLine?: string;
}

export interface SignalRule {
  id: string;
  /** Words/phrases/synonyms. Matched case-insensitively on word boundaries. */
  patterns: string[];
  team?: TeamId;
  gift?: GiftId;
  skill?: SkillId;
  weight: number;
  /** Rules that are too ambiguous alone (e.g. "listen") must not exist; see docs. */
  note?: string;
}

export interface SignalLibrary {
  version: string;
  rules: SignalRule[];
  negations: string[];
  contrasts: string[];
  historical: string[];
  growth: string[];
  noExperience: string[];
  uncertainty: string[];
  thirdParty: string[];
  /** Phrases that make a negation an explicit opt-out (preference), not a dislike. */
  preferenceVerbs: string[];
}

export interface MatchingWeights {
  version: string;
  /** Bayesian shrinkage constant added to each team's opportunity count. */
  shrinkage: number;
  /** Cap on contribution from a single question to one team/gift. */
  perQuestionCap: number;
  explicitCurious: number;
  explicitMaybe: number;
  learningWeight: number;
  textWeightPerQuestion: number;
  textMaxTotal: number;
  feedbackFeelsLikeMe: number;
  feedbackCurious: number;
  strongThreshold: number;
  alsoThreshold: number;
  tieEpsilon: number;
  minDistinctQuestionsForStrong: number;
  minAnsweredForResults: number;
  broadInterestCount: number;
  giftThreshold: number;
  maxGiftsShown: number;
}

export interface SiteConfig {
  title: string;
  alternativeTitle: string;
  wordmark: string;
  tagline: string;
  sharedHeart: string;
  together: string[];
  closingInvitation: string;
  thread: string;
  scriptureNote: string;
  privacyNotice: string[];
  /** null = no destination; sharing produces a local summary only. */
  submissionEndpoint: string | null;
  /** Ask age before collecting contact details (pending Frontier policy). */
  askAgeBeforeContact: boolean;
  minorContactMessage: string;
  retentionNote: string;
  estimatedMinutes: string;
}
