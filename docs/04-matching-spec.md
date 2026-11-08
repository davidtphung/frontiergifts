# E. Matching specification

`match-2026.11-v1` · code: `src/engine/scoring.ts` · weights: `src/content/signals.ts` (`matchingWeights`)

Internal scores are **implementation heuristics**. They are not validated spiritual assessments or probabilities, and they are never shown to participants as numbers.

## Layers

| Layer | Source | Effect |
|---|---|---|
| 1 Explicit preference | `c5_explore`, options with `optOut`, text opt-outs ("I don't want to work with children"), results feedback | Curious **+0.35**, Maybe **+0.15**, Not right now / opt-out = **excluded**. Results feedback: feels like me **+0.30** (always shown), curious **+0.10**, not for me = excluded. The latest feedback overrides earlier opt-outs. |
| 2 Structured patterns | Option/barometer `teams` signals | `pattern = Σ min(1, contribution per question) / (Σ opportunity + 1)` |
| 3 Skills | Option `skills` | Recorded for leaders and used to de-duplicate text. **No direct fit effect.** |
| 4 Learning & readiness | `learning`, `readiness`, comfort barometer | `+0.15 × min(1, learning)`. Readiness only changes first-step wording. |
| 5 Free text | `c3_useful`, `c4_story`, `d_hopes` | ≤ **0.15** per question per team, ≤ **0.25** total, gated (see below) |
| 6 Practical fit | Frequency, schedule, support needs | **No score effect.** Shapes the first step only (e.g. "no heavy lifting" → signage/coordination roles). |

`fit = pattern + explicit + 0.15·learning + text + feedback`

### Normalization
- **Opportunity** for a team in a question is the strongest signal any option of that question could give it (capped at 1). A light 0.3 mention costs a team less than a question squarely about it.
- **Shrinkage** (+1 in the denominator) keeps a single answer from producing a near-maximal score.
- **Skipped and "Not sure" answers** are missing data. They add neither raw score nor opportunity.
- **Per-question cap**: picking three Tech options in one multi-select counts as one question's worth.
- **Adaptive follow-ups** only appear when earlier answers trigger them, so they are confirmatory. Each still adds its own opportunity, so a weak follow-up answer lowers rather than inflates that team.

## Evidence requirements
- **Strong invitation**: fit ≥ **0.30** AND positive evidence from **≥ 2 distinct questions**, or explicit Curious plus ≥ 1 other question. "Feels like me" always qualifies.
- **"You might also enjoy"**: the next eligible team with fit ≥ **0.18** and ≥ 1 question.
- **Up to 2 strong** invitations. A third is added if it is tied (within **0.02**) with the second. Tied cards are labeled "equally supported".
- **Broad interest**: ≥ 4 teams qualify as strong → the participant sees a "you showed interest in several teams" message suggesting observation.
- **Not enough information**: fewer than 4 answered questions and no explicit interest, or nothing qualifies → **explore mode**. No ranking is shown, every team is browsable, and the deeper path is offered.
- **Gift reflections**: gift score ≥ 0.30, top 3. The wording differs for a theme across ≥ 2 questions ("A theme across your answers") versus a single source ("Something you mentioned"). There are no percentages.

## Free-text interpretation (`src/engine/text.ts`, library `sig-2026.11-v1`)
1. Normalize the text (lowercase, curly quotes, contractions).
2. Split it into sentences, then into clauses on contrast markers (*but, however, though, although, yet, except*, ", not").
3. Match versioned rules per clause, with the longest phrases first. Multiword expressions beat single words. One hit per rule per clause.
4. Classify each hit:

| Interpretation | Trigger | Effect |
|---|---|---|
| `current` | default | Counts (gated) |
| `growth` | growth phrase, or a no-experience clause followed by "…but I'd love to learn" | Half text weight **+ learning** |
| `no_experience` | "never done", "no experience" without growth | Not counted. Never negative. |
| `negated` | negation before the hit ("I do not enjoy troubleshooting") | −0.15 (a dislike, not an opt-out) |
| `opt_out` | negation + preference verb + team-core term ("I don't want to work with children") | Team excluded, unless the participant explicitly marked it Curious/Maybe; then it is flagged for review |
| `historical` | "used to", "previously" | Not counted |
| `moving_on` | historical + "something different" | −0.10 |
| `third_party` | subject is someone else ("My spouse loves…") | Not counted |
| `uncertain` | maybe / might / not sure | Half weight |

5. **Gating**: positive text for a team counts only if that team has explicit interest, structured evidence from another question, or text support in ≥ 2 distinct text questions. Otherwise it goes to **"Did we read this right?"** for the participant to confirm. Gifts are gated the same way.
6. **No double counting**: if a text hit's skill was already given by a structured answer, the hit is recorded as corroboration with weight 0.
7. **Verbosity**: dedupe per question per team plus caps, so 10 mentions of "sound" equal 1.
8. **Order**: answer order is never weighted. A later answer is not treated as more authentic. Only *explicit* results feedback (the participant correcting us) takes precedence, because it is a direct statement, not because it came later.

Excluded single words: **give, listen, lead**. Third-party pronouns and relations are listed in `thirdParty`.

## Contradiction handling
| Conflict | Resolution |
|---|---|
| Explicit Curious + text opt-out | Keep the team and show the text in "Did we read this right?" |
| Text interest + explicit Not right now | Explicit wins. Text is ignored for that team. |
| Opt-out earlier + "Feels like me / I'm curious" on the results | The participant's latest explicit feedback wins. |
| Kids follow-up "not right now" + kid-related scenario picks | Opt-out wins. |

## Provenance
Every contribution is recorded as `Evidence { layer, questionId, optionId | phrase, ruleId, team | gift | skill, weight, interpretation, counted, note }`, together with the three version strings. The "How did we come up with this?" panel renders this list.

## Limitations
- Keyword rules miss paraphrase, sarcasm, and complex grammar. Unclear text is routed to participant review rather than guessed.
- The thresholds are hand-set and have not yet been tested with real participants. Calibrate them with Frontier leaders using synthetic and consenting pilot data.
- English only.
- Self-report reflects confidence and familiarity. Newcomers may under-report.
- Any future language-model analysis must be opt-in, privacy-reviewed, and explicitly enabled. It is not present.
