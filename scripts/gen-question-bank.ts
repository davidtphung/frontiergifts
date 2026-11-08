/**
 * Regenerates docs/02-question-bank.md from src/content/questions.ts so the
 * matrix never drifts from the live configuration.
 *   npm run docs:questions
 */
import { writeFileSync } from 'node:fs';
import { QUESTION_BANK_VERSION, questions } from '../src/content/questions';
import type { Condition, SignalBundle } from '../src/content/types';

const fmtBundle = (b?: SignalBundle) => {
  if (!b) return '—';
  const parts: string[] = [];
  const add = (label: string, rec?: Record<string, number | undefined>) => {
    const e = Object.entries(rec ?? {});
    if (e.length) parts.push(`${label}: ${e.map(([k, v]) => `${k} ${v}`).join(', ')}`);
  };
  add('team', b.teams);
  add('gift', b.gifts);
  add('skill', b.skills);
  add('learn', b.learning);
  if (b.readiness) parts.push(`readiness: ${b.readiness}`);
  if (b.practical?.length) parts.push(`practical: ${b.practical.join(', ')}`);
  return parts.join('; ') || '—';
};
const fmtCond = (c: Condition): string =>
  'anyOf' in c
    ? c.anyOf.map(fmtCond).join(' OR ')
    : 'allOf' in c
      ? c.allOf.map(fmtCond).join(' AND ')
      : 'includesAny' in c
        ? `${c.q} ∈ {${c.includesAny.join(', ')}}`
        : `${c.q} ≥ ${c.atLeast}`;
const esc = (s: string) => s.replace(/\|/g, '\\|');

const out: string[] = [
  '# C. Question bank',
  '',
  `Generated from \`src/content/questions.ts\` (${QUESTION_BANK_VERSION}). Do not edit by hand — run \`npm run docs:questions\`.`,
  '',
  'Tiers: **core** (12, everyone), **followup** (max 4 shown, after chapter 4, ranked by relevance), **deeper** (optional path after results).',
  '',
  '## Summary',
  '',
  '| ID | Tier | Chapter | Format | Prompt | Skippable |',
  '|---|---|---|---|---|---|',
  ...questions.map((q) => `| \`${q.id}\` | ${q.tier} | ${q.chapter} | ${q.format}${q.maxSelections ? ` (max ${q.maxSelections})` : ''} | ${esc(q.prompt)} | ${q.skippable ? 'yes' : 'no'} |`),
  '',
];

for (const q of questions) {
  out.push(`## \`${q.id}\` — ${esc(q.prompt)}`, '');
  out.push(`- **Tier / chapter / format:** ${q.tier} / ${q.chapter} / ${q.format}${q.maxSelections ? `, max ${q.maxSelections}` : ''}${q.maxLength ? `, ≤${q.maxLength} chars` : ''}`);
  if (q.helper) out.push(`- **Helper:** ${q.helper}`);
  if (q.storyLine) out.push(`- **Story line:** ${q.storyLine}`);
  out.push(`- **Why we ask:** ${q.why}`);
  out.push(`- **What it does NOT prove:** ${q.notProves}`);
  out.push(`- **Ambiguity / bias:** ${q.ambiguity}`);
  out.push(`- **Branching:** ${q.trigger ? `shown if ${fmtCond(q.trigger)}${q.followupTeam ? `; ranked by ${q.followupTeam} relevance` : ''}` : q.tier === 'deeper' ? 'optional deeper path only' : 'always shown'}`);
  if (q.barometer) {
    out.push(`- **Anchors:** ${q.barometer.anchors.join(' → ')} (0–4, plus “Not sure”)`);
    out.push(`- **Scoring:** signals × value/4 → ${fmtBundle(q.barometer.scaled)}${q.barometer.readinessByValue ? `; readiness by value: ${q.barometer.readinessByValue.join(', ')}` : ''}`);
  }
  if (q.format === 'fill' || q.format === 'text') out.push('- **Scoring:** free-text interpreter (Layer 5, supporting evidence only; see matching spec).');
  if (q.format === 'teamPrefs') out.push('- **Scoring:** Layer 1 explicit preference — curious +0.35, maybe +0.15, not right now = excluded.');
  if (q.options && q.format !== 'teamPrefs') {
    out.push('', '| Option | Signals | Notes |', '|---|---|---|');
    for (const o of q.options) {
      const notes = [o.neutral ? 'neutral (missing, not negative)' : '', o.optOut ? `explicit opt-out: ${o.optOut}` : ''].filter(Boolean).join('; ');
      out.push(`| ${esc(o.label)} | ${fmtBundle(o.signals)} | ${notes || '—'} |`);
    }
  }
  out.push('');
}

writeFileSync(new URL('../docs/02-question-bank.md', import.meta.url), out.join('\n'));
console.log(`Wrote docs/02-question-bank.md (${questions.length} questions)`);
