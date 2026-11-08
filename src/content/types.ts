/**
 * Content + configuration types for the spiritual-gifts inventory. These mirror
 * db/schema.sql so the static config can move into a database later.
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

export type ChapterId = 'belong' | 'notice' | 'alive' | 'care' | 'others' | 'begin';

export interface Chapter {
  id: ChapterId;
  number: number;
  title: string;
  /** Thread line: "You arrive. You notice. You respond. You help make room." */
  thread: string;
  /** Short narrative transition shown before the chapter's first screen. */
  transition: string;
}

export interface Team {
  id: TeamId;
  name: string;
  heart: string;
  shortDescription: string;
  includes: string[];
  /** Notes the product must honor (shown when browsing teams). */
  distinctions: string[];
  /** Default first step when Frontier hasn't configured an opportunity. */
  defaultFirstStep: string;
  /** Requirements before any real placement (configurable, Frontier-owned). */
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
  /** What this gift tends to look like in everyday life (results copy). */
  inPractice: string;
}

/** A rated statement. Exactly one gift per item; no role or team content. */
export interface GiftItem {
  id: string;
  gift: GiftId;
  text: string;
  /** 'self' = how I see myself; 'others' = what others observe in me. */
  perspective: 'self' | 'others';
}

export interface ScenarioOption {
  id: string;
  gift: GiftId;
  label: string;
}

export type Screen =
  | {
      id: string;
      kind: 'ratings';
      chapter: ChapterId;
      prompt: string;
      helper?: string;
      items: GiftItem[];
    }
  | {
      id: string;
      kind: 'scenario';
      chapter: ChapterId;
      storyLine?: string;
      prompt: string;
      helper?: string;
      /** One option per gift, in a deliberately varied order. */
      options: ScenarioOption[];
    };

export type Level = 'strong' | 'present' | 'emerging';

export interface ScoringConfig {
  version: string;
  /** Rating scale labels, 0..4. */
  scale: [string, string, string, string, string];
  ratingWeight: number;
  scenarioWeight: number;
  /** Scenario picks for a gift that count as "full" scenario evidence. */
  scenarioSaturation: number;
  strongAt: number;
  presentAt: number;
  /** Minimum rated items for a gift before it gets a level. */
  minRatedItems: number;
  /** If fewer gifts than this have a level, show explore mode. */
  minGiftsForRecommendations: number;
  /** Max - min below this → "flat profile" note. */
  flatProfileRange: number;
  /** Third team shown only if its fit is at least this. */
  alsoAt: number;
  tieEpsilon: number;
  feedbackFeelsLikeMe: number;
  feedbackCurious: number;
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
  retentionNote: string;
  estimatedMinutes: string;
}
