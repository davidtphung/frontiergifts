/**
 * Regenerates docs/02-question-bank.md from src/content/questions.ts so the
 * item bank documentation never drifts from the live configuration.
 *   npm run docs:questions
 */
import { writeFileSync } from 'node:fs';
import { QUESTION_BANK_VERSION, allItems, screens } from '../src/content/questions';
import { scoringConfig } from '../src/content/scoring';
import { gifts } from '../src/content/teams';

const esc = (s: string) => s.replace(/\|/g, '\\|');
const out: string[] = [
  '# C. Question bank (spiritual-gifts inventory)',
  '',
  `Generated from \`src/content/questions.ts\` (${QUESTION_BANK_VERSION}). Do not edit by hand — run \`npm run docs:questions\`.`,
  '',
  'Every participant sees the same 13 screens in the same order: 6 rating blocks (21 statements) and 7 scenarios. There is no branching. No item mentions a team, role, task type, interest in a role, or experience in a role; a test enforces this.',
  '',
  `Rating scale (0–4): ${scoringConfig.scale.map((s, i) => `${i} = ${s}`).join(' · ')} · plus “Not sure” (treated as missing).`,
  '',
  '## Statements by gift',
  '',
  'Three per gift: two self-perception statements and one “others observe” statement. Statements are interleaved across screens so no screen is about a single gift.',
  '',
];
for (const g of gifts) {
  out.push(`### ${g.name} (${g.reference})`, '', '| ID | Perspective | Statement | Screen |', '|---|---|---|---|');
  for (const it of allItems.filter((i) => i.gift === g.id)) {
    const s = screens.find((sc) => sc.kind === 'ratings' && sc.items.some((x) => x.id === it.id))!;
    out.push(`| \`${it.id}\` | ${it.perspective} | ${esc(it.text)} | \`${s.id}\` (${s.chapter}) |`);
  }
  out.push('');
}

out.push('## Screens in order', '');
for (const s of screens) {
  if (s.kind === 'ratings') {
    out.push(`### \`${s.id}\` — rating block (${s.chapter})`, '', `**${esc(s.prompt)}**${s.helper ? ` — ${esc(s.helper)}` : ''}`, '');
    for (const it of s.items) out.push(`- ${esc(it.text)} → *${it.gift}*`);
  } else {
    out.push(`### \`${s.id}\` — scenario (${s.chapter})`, '', `*${esc(s.storyLine ?? '')}* **${esc(s.prompt)}**`, '', '| Option | Gift |', '|---|---|');
    for (const o of s.options) out.push(`| ${esc(o.label)} | ${o.gift} |`);
  }
  out.push('');
}

out.push(
  '## Design notes',
  '',
  '- **Why scenarios:** rating scales invite “everything is very like me.” Scenarios force a choice between seven equally honorable responses, which separates gifts that ratings alone can’t.',
  '- **Why “others” statements:** gifts are often clearest to the people around us; one observer-perspective item per gift balances self-image.',
  '- **What an item does NOT prove:** no single answer establishes a gift. Levels come from all three statements plus all scenario choices, and are meant to be discerned with others.',
  '- **Prophecy wording** is framed as “sense… believe… shared,” never certainty, and is tested under pastoral guidance.',
  '- **Giving** items concern time, home, and belongings. Nothing asks about money or income.',
  '- **Known limitations:** three items per gift is short. Expect modest reliability per gift until piloted (see the scoring spec).',
  '',
);

writeFileSync(new URL('../docs/02-question-bank.md', import.meta.url), out.join('\n'));
console.log(`Wrote docs/02-question-bank.md (${allItems.length} statements, ${screens.length} screens)`);
