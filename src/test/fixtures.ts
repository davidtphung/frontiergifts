/**
 * Synthetic participant fixtures for the gifts inventory. None are real people.
 */
import { screens } from '../content/questions';
import { GIFT_IDS, type GiftId } from '../content/types';
import type { Answers } from '../engine/types';

export interface ProfileSpec {
  /** Rating 0..4 per gift for every statement (default 1), or null for "Not sure". */
  ratings: Partial<Record<GiftId, number | null>>;
  /** Gifts chosen in scenarios, cycled in order (default: highest-rated gift). */
  picks?: GiftId[];
  /** Screen ids to leave unanswered. */
  skip?: string[];
}

export function answersFrom(spec: ProfileSpec): Answers {
  const answers: Answers = {};
  const top = [...GIFT_IDS].sort((a, b) => (spec.ratings[b] ?? 1) - (spec.ratings[a] ?? 1))[0];
  const picks = spec.picks ?? [top];
  let n = 0;
  for (const s of screens) {
    if (spec.skip?.includes(s.id)) {
      answers[s.id] = { kind: 'skipped' };
      continue;
    }
    if (s.kind === 'ratings') {
      answers[s.id] = {
        kind: 'ratings',
        values: Object.fromEntries(s.items.map((it) => [it.id, it.gift in spec.ratings ? spec.ratings[it.gift]! : 1])),
      };
    } else {
      const g = picks[n++ % picks.length];
      answers[s.id] = { kind: 'choice', optionId: s.options.find((o) => o.gift === g)!.id };
    }
  }
  return answers;
}

export const personas = {
  compassionateListener: answersFrom({ ratings: { mercy: 4, encouragement: 3, prophecy: 2 }, picks: ['mercy', 'mercy', 'encouragement', 'mercy'] }),
  practicalOrganizer: answersFrom({ ratings: { serving: 4, leadership: 3 }, picks: ['serving', 'leadership', 'serving'] }),
  scriptureExplainer: answersFrom({ ratings: { teaching: 4, encouragement: 3, mercy: 2 }, picks: ['teaching', 'teaching', 'encouragement'] }),
  attentiveToGod: answersFrom({ ratings: { prophecy: 4, encouragement: 3 }, picks: ['prophecy', 'prophecy', 'encouragement'] }),
  generousHost: answersFrom({ ratings: { giving: 4, encouragement: 3, mercy: 2 }, picks: ['giving', 'encouragement', 'giving'] }),
  everythingSometimes: answersFrom({
    ratings: Object.fromEntries(GIFT_IDS.map((g) => [g, 2])) as Record<GiftId, number>,
    picks: ['serving', 'serving', 'leadership', 'serving'],
  }),
  skippedAll: Object.fromEntries(screens.map((s) => [s.id, { kind: 'skipped' as const }])) as Answers,
  allNotSure: answersFrom({ ratings: Object.fromEntries(GIFT_IDS.map((g) => [g, null])) as Record<GiftId, null>, skip: screens.filter((s) => s.kind === 'scenario').map((s) => s.id) }),
};
