import {
  MAX_FOLLOWUPS,
  coreQuestions,
  deeperQuestions,
  followupQuestions,
  questionById,
} from '../content/questions';
import type { Condition, Question } from '../content/types';
import { scoreAnswers } from './scoring';
import type { Answers } from './types';

/** Follow-ups are inserted after this core question (end of chapter 4). */
export const FOLLOWUP_ANCHOR = 'c4_story';

export function isAnswered(answers: Answers, qid: string): boolean {
  const a = answers[qid];
  if (!a || a.kind === 'skipped') return false;
  if (a.kind === 'choice') return a.ids.length > 0;
  if (a.kind === 'text') return a.text.trim().length > 0;
  if (a.kind === 'scale') return true;
  if (a.kind === 'teamPrefs') return Object.keys(a.prefs).length > 0;
  return false;
}

export function evaluate(cond: Condition, answers: Answers): boolean {
  if ('anyOf' in cond) return cond.anyOf.some((c) => evaluate(c, answers));
  if ('allOf' in cond) return cond.allOf.every((c) => evaluate(c, answers));
  const a = answers[cond.q];
  if (!a) return false;
  if ('includesAny' in cond) return a.kind === 'choice' && a.ids.some((id) => cond.includesAny.includes(id));
  if ('atLeast' in cond) return a.kind === 'scale' && a.value !== null && a.value >= cond.atLeast;
  return false;
}

/**
 * Choose up to MAX_FOLLOWUPS triggered follow-ups. Relevance is computed from
 * core answers only, so the selection is stable while follow-ups are answered.
 * Ties fall back to bank order. Returned in bank order.
 */
export function selectFollowups(answers: Answers): Question[] {
  const triggered = followupQuestions.filter((q) => q.trigger && evaluate(q.trigger, answers));
  if (triggered.length <= MAX_FOLLOWUPS) return triggered;

  const coreOnly: Answers = {};
  for (const q of coreQuestions) if (answers[q.id]) coreOnly[q.id] = answers[q.id];
  const scored = scoreAnswers(coreOnly, coreQuestions.map((q) => q.id));
  const maxFit = Math.max(0, ...Object.values(scored.teamScores).map((t) => t.fit));

  const relevance = (q: Question): number => {
    if (q.followupTeam) return scored.teamScores[q.followupTeam].fit;
    if (q.id === 'f_giving') return scored.giftScores.giving ?? 0;
    if (q.id === 'f_clarify') return 1 - maxFit; // more useful when signals are thin
    return 0;
  };
  const ranked = triggered
    .map((q, i) => ({ q, i, r: relevance(q) }))
    .sort((a, b) => b.r - a.r || a.i - b.i)
    .slice(0, MAX_FOLLOWUPS);
  const keep = new Set(ranked.map((x) => x.q.id));
  return triggered.filter((q) => keep.has(q.id));
}

/** The ordered list of question IDs this participant sees. */
export function getSequence(answers: Answers, opts: { deeper?: boolean } = {}): string[] {
  const ids: string[] = [];
  const followups = selectFollowups(answers).map((q) => q.id);
  for (const q of coreQuestions) {
    ids.push(q.id);
    if (q.id === FOLLOWUP_ANCHOR) ids.push(...followups);
  }
  if (opts.deeper) ids.push(...deeperQuestions.map((q) => q.id));
  return ids;
}

export function chapterOf(qid: string) {
  return questionById[qid]?.chapter;
}
