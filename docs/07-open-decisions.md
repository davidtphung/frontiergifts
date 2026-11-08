# J. Open decisions for church leadership

Each is currently handled by a **marked, configurable assumption** so the prototype works.

| # | Decision | Current assumption | Where |
|---|---|---|---|
| 1 | Official tagline wording ("Revealing… at the frontiers of culture" vs. the site's "Renewing… on the frontiers of modern culture") | Uses the brief's wording | `site.tagline` |
| 2 | Final title | "Find Your Place at Frontier" (alt: "Your Part in the Story") | `site.title` |
| 3 | Kids Ministry safeguarding, screening, and training requirements | Placeholder sentence marked [Frontier to confirm] | `teams.ts` → kids |
| 4 | Worship team entry process and pastoral guidance on prophetic sensitivity | Placeholder | `teams.ts` → worship |
| 5 | Prayer team confidentiality and pastoral-care referral guidance | Placeholder | `teams.ts` → prayer |
| 6 | Can minors use the tool? With what consent? | Ask 18+ before any contact field. Under-18s see a "talk with a parent and a leader" message and no fields. | `site.askAgeBeforeContact` |
| 7 | Where shared summaries go, who can see them, and how long they're kept | Nowhere. No endpoint, local copy only. | `site.submissionEndpoint`, `db/schema.sql` |
| 8 | Real first-step opportunities (observe a sound check, shadow a welcomer…) | None configured, so the generic "Connect with the team…" is shown | `team.configuredOpportunities` |
| 9 | How Giving should lead to a next step (e.g. hosting, meals, a non-Sunday opportunity) | Reflection only, no team routing | `docs/03` |
| 10 | Bible translation, if direct quotations are wanted | References and paraphrases only. No quotations. | `teams.ts` → gifts |
| 11 | Brand: official colors, fonts, logo usage | Tokens inspired by the public site. Text wordmark. Google Fonts. | `src/styles/tokens.css` |
| 12 | Matching thresholds after a pilot | Hand-set baseline | `matchingWeights` |
| 13 | Should leaders ever see free-text answers? | Only if the participant ticks "Include what I wrote" | `Share.tsx` |
| 14 | Spanish or other languages | English only | — |
