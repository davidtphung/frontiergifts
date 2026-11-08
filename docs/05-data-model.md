# F. Data model & configuration

The prototype has **no database**. All content lives in versioned TypeScript config, and participant data lives in React state for the current tab. The relational target model is in [`db/schema.sql`](../db/schema.sql). The TypeScript types in `src/content/types.ts` mirror it one-to-one.

| Entity | Purpose | Prototype location | Key relationships / versioning |
|---|---|---|---|
| AssessmentVersion | Pins the question bank, signal library, and weights so results are reproducible | `QUESTION_BANK_VERSION`, `signalLibrary.version`, `matchingWeights.version` | Every session references one |
| Question | Prompt, format, constraints, and design rationale (why / not-proves / ambiguity) | `src/content/questions.ts` | (id, version). The stable id never changes meaning. |
| AnswerOption | Label, `because` explanation, neutral flag, opt-out | inline in `questions.ts` | belongs to Question |
| SignalMapping | option → team/gift/skill/learning/readiness/practical weights | `options[].signals` | belongs to AnswerOption |
| BranchRule | Follow-up trigger conditions | `question.trigger` | belongs to Question |
| GiftCategory | Seven Romans 12 gifts with reference + paraphrase | `src/content/teams.ts` → `gifts` | — |
| MinistryArea | Six teams with descriptions, distinctions, requirements | `teams.ts` → `teams` | ↔ GiftCategory (proposed applications) |
| MinistryOpportunity | Real, Frontier-configured openings | `team.configuredOpportunities` (empty) | belongs to MinistryArea |
| SignalRule | Free-text lexicon | `src/content/signals.ts` | (id, signal_version) |
| AssessmentSession | One run-through | React state (`App.tsx`) | — |
| Response | One answer | `Answers` map | session × question |
| DerivedSignal | Scored evidence with provenance | `Results.evidence` | session |
| MatchResult | Invitations + per-team scores | `Results.invitations`, `teamScores` | session × team |
| ParticipantFeedback | Feels like me / curious / not for me | `FeedbackMap` | session × team |
| ConsentRecord | What the participant agreed to share | `ShareChoices` → `payload.consent` | session |
| ContactRequest | Name / email / method, **only** if follow-up is requested | `payload.contact` | session. Kept separate from assessment data. |

## Share payload shape (what a future endpoint would receive)
```json
{
  "consent": { "shareSummary": true, "requestFollowUp": false, "recordedAt": "…" },
  "contact": null,
  "assessment": {
    "versions": { "questionBank": "qb-2026.11-v1", "signals": "sig-2026.11-v1", "matching": "match-2026.11-v1" },
    "exploringNotCommitting": true,
    "teamsOfInterest": [{ "team": "Tech and AV", "participantFeedback": "curious" }],
    "giftReflections": ["Serving"],
    "readiness": "wants_training",
    "frequency": "A couple of times a month",
    "practicalNotes": ["no_heavy_lifting"],
    "writtenAnswers": []
  }
}
```
Written answers are included only if the participant ticks "Include what I wrote". Raw scores are never included.

## Retention (to be set by Frontier)
`assessment_session.delete_after` and `contact_request.delete_after` exist so they can be retained separately. The prototype stores nothing server-side. Device storage is opt-in and erased when the participant turns it off.
