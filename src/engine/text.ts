import { signalLibrary } from '../content/signals';
import type { SignalLibrary } from '../content/types';
import type { TextFinding, TextInterpretation } from './types';

/**
 * Deterministic, transparent free-text interpreter.
 *
 * Pipeline: normalize → split into sentences → split sentences into clauses on
 * contrast words → match rules per clause → classify each hit by context
 * (third person, negation, history, growth, uncertainty). Clauses with no hits
 * but with growth / negation markers inherit the topic of the previous clause
 * in the same sentence ("I've never taught kids, but I'd love to learn").
 *
 * No network calls, no language model. Same input + same library version →
 * same output.
 */

const CONTRACTIONS: [RegExp, string][] = [
  [/\bdon't\b/g, 'do not'],
  [/\bdoesn't\b/g, 'does not'],
  [/\bdidn't\b/g, 'did not'],
  [/\bcan't\b/g, 'can not'],
  [/\bcannot\b/g, 'can not'],
  [/\bwon't\b/g, 'will not'],
  [/\bwouldn't\b/g, 'would not'],
  [/\bisn't\b/g, 'is not'],
  [/\baren't\b/g, 'are not'],
  [/\bi'm\b/g, 'i am'],
  [/\bi've\b/g, 'i have'],
  [/\bi'd\b/g, 'i would'],
  [/\bi'll\b/g, 'i will'],
];

export function normalize(text: string): string {
  let t = text.toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
  for (const [re, rep] of CONTRACTIONS) t = t.replace(re, rep);
  return t;
}

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Pattern → regex. Trailing `*` = any word ending. */
export function patternToRegex(p: string): RegExp {
  const star = p.endsWith('*');
  const base = escape(normalize(star ? p.slice(0, -1) : p));
  return new RegExp(`\\b${base}${star ? "[\\w']*" : ''}\\b`, 'g');
}

function containsAny(haystack: string, needles: string[]): string | null {
  for (const n of needles) {
    if (new RegExp(`\\b${escape(n)}\\b`).test(haystack)) return n;
  }
  return null;
}

const FIRST_PERSON = /\b(i|me|my self|myself|we|us)\b/;

interface Clause {
  text: string;
  contrast: boolean;
}

function splitClauses(sentence: string, lib: SignalLibrary): Clause[] {
  const contrastRe = new RegExp(`(?:,\\s*|\\s+)(?=(?:${lib.contrasts.map(escape).join('|')})\\b)|,\\s*(?=not\\b)`, 'g');
  const parts = sentence.split(contrastRe).map((s) => s.trim()).filter(Boolean);
  return parts.map((text, i) => ({ text, contrast: i > 0 }));
}

interface RawHit {
  ruleId: string;
  phrase: string;
  index: number;
  rule: SignalLibrary['rules'][number];
}

function findHits(clause: string, lib: SignalLibrary): RawHit[] {
  const hits: RawHit[] = [];
  const taken: [number, number][] = [];
  // Longest patterns first so multiword expressions win over single words.
  const entries = lib.rules
    .flatMap((rule) => rule.patterns.map((p) => ({ rule, p })))
    .sort((a, b) => b.p.length - a.p.length);
  for (const { rule, p } of entries) {
    const re = patternToRegex(p);
    let m: RegExpExecArray | null;
    while ((m = re.exec(clause))) {
      const start = m.index;
      const end = start + m[0].length;
      const overlaps = taken.some(([s, e]) => start < e && end > s);
      // A gift rule may overlap a team rule (different dimensions), but two
      // rules of the same dimension may not claim the same words.
      const sameDimOverlap = hits.some(
        (h) => !!h.rule.gift === !!rule.gift && start < h.index + h.phrase.length && end > h.index,
      );
      if (overlaps && sameDimOverlap) continue;
      if (hits.some((h) => h.ruleId === rule.id)) continue; // one hit per rule per clause
      hits.push({ ruleId: rule.id, phrase: m[0], index: start, rule });
      taken.push([start, end]);
    }
  }
  return hits.sort((a, b) => a.index - b.index);
}

function classify(clause: string, hitIndex: number, lib: SignalLibrary, isFill: boolean) {
  const before = clause.slice(0, hitIndex);
  let stripped = clause;
  const uncertain = !!containsAny(clause, lib.uncertainty);
  for (const u of lib.uncertainty) stripped = stripped.replace(new RegExp(`\\b${escape(u)}\\b`, 'g'), ' ');

  const thirdParty =
    !FIRST_PERSON.test(before) && !!containsAny(before, lib.thirdParty) && !(isFill && before.trim() === '');
  const historical = !!containsAny(clause, lib.historical);
  const noExperience = !!containsAny(clause, lib.noExperience);
  const growth = !!containsAny(clause, lib.growth);
  const strippedBefore = stripped.slice(0, Math.max(0, hitIndex));
  const negated = !noExperience && !!containsAny(strippedBefore, lib.negations);
  const prefers = !!containsAny(clause, lib.preferenceVerbs);
  return { thirdParty, historical, noExperience, growth, negated, prefers, uncertain };
}

export function interpretText(
  questionId: string,
  text: string,
  opts: { isFill?: boolean; lib?: SignalLibrary } = {},
): TextFinding[] {
  const lib = opts.lib ?? signalLibrary;
  const isFill = !!opts.isFill;
  const findings: TextFinding[] = [];
  if (!text || !text.trim()) return findings;

  const sentences = normalize(text)
    .split(/[.!?;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const sentence of sentences) {
    const clauses = splitClauses(sentence, lib);
    let prev: TextFinding[] = [];
    const sentencePrefers = !!containsAny(sentence, lib.preferenceVerbs);
    for (const clause of clauses) {
      const hits = findHits(clause.text, lib);
      const current: TextFinding[] = [];
      for (const h of hits) {
        const c = classify(clause.text, h.index, lib, isFill);
        let interpretation: TextInterpretation = 'current';
        if (c.thirdParty) interpretation = 'third_party';
        else if (c.historical) interpretation = 'historical';
        else if (c.noExperience && c.growth) interpretation = 'growth';
        else if (c.noExperience) interpretation = 'no_experience';
        else if (c.negated) interpretation = (c.prefers || sentencePrefers) && h.rule.note === 'teamCore' ? 'opt_out' : 'negated';
        else if (c.growth) interpretation = 'growth';
        else if (c.uncertain) interpretation = 'uncertain';
        current.push({
          questionId,
          phrase: h.phrase,
          ruleId: h.ruleId,
          team: h.rule.team,
          gift: h.rule.gift,
          skill: h.rule.skill,
          weight: h.rule.weight,
          interpretation,
          uncertain: c.uncertain,
          teamCore: h.rule.note === 'teamCore',
          ruleVersion: lib.version,
        });
      }

      // Topic carry-over for hit-less clauses ("…, but I'd love to learn").
      if (hits.length === 0 && prev.length > 0) {
        const growth = !!containsAny(clause.text, lib.growth);
        const negated = !!containsAny(clause.text, lib.negations);
        const prefers = !!containsAny(clause.text, lib.preferenceVerbs);
        const different = /\b(different|something else|other things|new direction|change)\b/.test(clause.text);
        for (const f of prev) {
          if (f.interpretation === 'third_party') continue;
          if (growth && (f.interpretation === 'no_experience' || f.interpretation === 'current')) {
            f.interpretation = 'growth';
          } else if (negated && prefers && f.teamCore) {
            f.interpretation = 'opt_out';
          } else if (negated && prefers) {
            f.interpretation = 'negated';
          } else if (f.interpretation === 'historical' && different) {
            f.interpretation = 'moving_on';
          }
        }
      }
      findings.push(...current);
      if (current.length) prev = current;
    }
  }
  return findings;
}
