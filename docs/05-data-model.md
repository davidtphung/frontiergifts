# F. Data model & configuration

The prototype has **no database**. Content is versioned TypeScript config, and answers live in React state. The target relational model is [`db/schema.sql`](../db/schema.sql). The types in `src/content/types.ts` mirror it.

| Entity | Purpose | Prototype location |
|---|---|---|
| AssessmentVersion | Pins the item bank + scoring config | `QUESTION_BANK_VERSION`, `scoringConfig.version` |
| GiftCategory | Seven Romans 12 gifts with reference, paraphrase, "in practice" | `src/content/teams.ts` → `gifts` |
| MinistryArea | Six teams with descriptions and requirements | `teams.ts` → `teams` |
| GiftTeamWeight | Gift → team relevance (0–1) | `teams.ts` → `giftTeamWeights` |
| MinistryOpportunity | Real configured openings (none yet) | `team.configuredOpportunities` |
| Screen | A rating block or scenario, in order | `src/content/questions.ts` → `screens` |
| GiftItem | Rated statement: one gift, self/others perspective | `questions.ts` → `items` |
| ScenarioOption | One response per gift per scenario | `screens[].options` |
| AssessmentSession | One run-through | React state |
| ItemResponse / ScenarioResponse | Answers (rating 0–4 or null for "Not sure"; chosen option) | `Answers` map |
| GiftScore | Score, level, evidence | `Results.gifts` |
| TeamRecommendation | Fit, tier, driver gifts | `Results.recommendations` / `teams` |
| ParticipantFeedback | Feels like me / curious / not for me | `FeedbackMap` |

The inventory collects no identifying data. Device storage (opt-in) keeps only answers, feedback, and position.
