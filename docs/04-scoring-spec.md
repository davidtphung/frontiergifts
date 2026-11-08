# E. Scoring specification

`score-2026.11-v2` · code: `src/engine/scoring.ts` · config: `src/content/scoring.ts`

## Gift scores
For each gift *g*:

| Component | Formula |
|---|---|
| Rating mean | mean(rating / 4) over the gift's answered statements (0–1). "Not sure" and skipped statements are excluded. |
| Scenario score | min(1, picks_g / saturation), where saturation = 3 × (scenarios answered / 7), minimum 1. Picking a gift in 3 of 7 scenarios counts as full scenario evidence. |
| **Gift score** | **0.65 × rating mean + 0.35 × scenario score**. If only one component exists, that component is used. |
| Minimum evidence | ≥ 2 rated statements for the gift, or no ratings at all but ≥ 4 scenarios answered. Otherwise the gift shows "Not enough answers". |

**Levels:** Strong ≥ 0.65 · Present ≥ 0.42 · Emerging below that. All seven gifts are shown ranked. Numbers are never shown.

**Flat profile:** if the gift scores span less than 0.12, the participant sees a note that their ratings were similar and that conversation will sharpen the picture.

## Team recommendations
`fit_t = Σ_g (w_tg × score_g) / Σ_g w_tg`, summed over the gifts that have a score. The weights are in `03-team-gift-mapping.md`.

- Requires ≥ 4 gifts with a level. Otherwise the result is **explore mode**: no recommendations, and the participant is invited to review their answers or browse teams.
- The **top 2 teams are recommended**. A third is added as *Recommended (equally strong)* if within 0.02 of the second, or as *Also a good fit* if its fit is ≥ 0.50.
- The "why" names up to 2 **driver gifts**: the gifts at Strong or Present level contributing most (w × score) to that team.
- **Participant feedback:** "Feels like me" = +0.30 and always included. "I'm curious" = +0.10. "Not for me right now" = excluded.

## Why this design
- **Separating gifts:** a rating scale alone suffers from acquiescence ("very like me" to everything). The forced-choice scenarios contribute 35%, so a person who rates every gift the same still gets a differentiated profile when their choices differ.
- **Equal measurement:** every gift has exactly 3 statements and appears exactly once in every scenario, so no gift has more chances to score.
- **Missing ≠ low:** skipping or answering "Not sure" never lowers a gift.
- **Determinism:** the same answers and the same version always give the same result.

## Limitations and validation plan
- **Three statements per gift is short.** Internal consistency per gift will be modest. If a pilot shows α < 0.7 for a gift, add items, and consider the ~35-item variant.
- **Thresholds and weights are hand-set.** Calibrate them against leader discernment in a pilot.
- **Self-report bias:** the "others" items help, but they are still answered by the participant. A future version could invite a friend to rate the same statements.
- **Mixed format:** ratings are normative and scenarios are ipsative. They are blended for practicality, so treat the scores as ordinal.
- **The results are a discernment aid.** They are not a determination of calling, and the copy says so.

## Provenance
Each gift result carries an `evidence` list: rated statements at "Mostly" or "Very like me", and the scenario choices made. It is shown under "What pointed to this?". Results also carry the question-bank and scoring version strings.
