import { questionById } from '../content/questions';
import { giftById, teamById } from '../content/teams';
import type { TeamId } from '../content/types';
import type { Answers, FeedbackMap, Results } from './types';

export interface ContactDetails {
  preferredName: string;
  email: string;
  contactMethod: 'email' | 'sunday' | 'no_preference' | '';
}

export interface ShareChoices {
  shareSummary: boolean;
  requestFollowUp: boolean;
  includeGifts: boolean;
  includeWritten: boolean;
  exploringOnly: boolean;
  teams: TeamId[];
}

/**
 * The exact payload a participant reviews before sharing. Contact details are
 * kept in a separate object from assessment content so they can be stored
 * apart (see db/schema.sql: contact_request vs assessment_session).
 */
export function buildSharePayload(
  results: Results,
  answers: Answers,
  feedback: FeedbackMap,
  contact: ContactDetails,
  choices: ShareChoices,
) {
  const written = choices.includeWritten
    ? Object.entries(answers)
        .filter(([qid, a]) => a.kind === 'text' && a.text.trim() && questionById[qid])
        .map(([qid, a]) => ({ question: questionById[qid].prompt, answer: (a as { text: string }).text.trim() }))
    : [];
  const frequency = answers['c5_frequency'];
  return {
    consent: {
      shareSummary: choices.shareSummary,
      requestFollowUp: choices.requestFollowUp,
      recordedAt: new Date().toISOString(),
    },
    contact: choices.requestFollowUp
      ? {
          preferredName: contact.preferredName.trim() || null,
          email: contact.email.trim() || null,
          contactMethod: contact.contactMethod || 'no_preference',
        }
      : null,
    assessment: {
      versions: results.versions,
      exploringNotCommitting: choices.exploringOnly,
      teamsOfInterest: choices.teams.map((t) => ({
        team: teamById[t].name,
        participantFeedback: feedback[t] ?? null,
      })),
      giftReflections: choices.includeGifts ? results.gifts.map((g) => giftById[g.gift].name) : [],
      readiness: results.readiness,
      frequency:
        frequency?.kind === 'choice'
          ? questionById['c5_frequency'].options?.find((o) => o.id === frequency.ids[0])?.label ?? null
          : null,
      practicalNotes: results.practical,
      writtenAnswers: written,
    },
  };
}

export type SharePayload = ReturnType<typeof buildSharePayload>;

export function payloadToText(p: SharePayload): string {
  const lines: string[] = ['Find Your Place at Frontier — summary', ''];
  if (p.contact) {
    lines.push(`Name: ${p.contact.preferredName ?? '(not given)'}`);
    lines.push(`Email: ${p.contact.email ?? '(not given)'}`);
    lines.push(`Preferred contact: ${p.contact.contactMethod}`);
    lines.push('');
  }
  if (p.assessment.exploringNotCommitting) lines.push('Exploring, not ready to commit.', '');
  lines.push('Teams of interest:');
  for (const t of p.assessment.teamsOfInterest) lines.push(`  • ${t.team}${t.participantFeedback ? ` (${t.participantFeedback.replace(/_/g, ' ')})` : ''}`);
  if (p.assessment.giftReflections.length) lines.push('', `Possible gift connections to explore: ${p.assessment.giftReflections.join(', ')}`);
  if (p.assessment.frequency) lines.push(`Could serve: ${p.assessment.frequency}`);
  if (p.assessment.readiness) lines.push(`Next-step preference: ${p.assessment.readiness.replace(/_/g, ' ')}`);
  for (const w of p.assessment.writtenAnswers) lines.push('', w.question, `  “${w.answer}”`);
  lines.push('', 'These are conversation starters, not assignments.');
  return lines.join('\n');
}
