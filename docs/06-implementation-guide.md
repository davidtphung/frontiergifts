# I. Implementation guide

## Run it
```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 51 tests: engine, text interpreter, branching, UI/consent/keyboard
npm run build      # typecheck + static build in dist/
```
The build is a static site. Host `dist/` anywhere. It needs no server or secrets.

## Project map
```
src/content/      ← everything Frontier edits
  site.ts           title, identity copy, chapters, privacy notice, submission endpoint
  teams.ts          six ministry areas + seven gifts
  questions.ts      question bank (core / follow-up / deeper)
  signals.ts        free-text lexicon + matching weights (both versioned)
  types.ts          shared types (mirror db/schema.sql)
src/engine/       ← pure, deterministic logic (no UI, no network)
  sequence.ts       branching + follow-up selection
  scoring.ts        matching engine + results
  text.ts           free-text interpreter
  summary.ts        share payload / plain-text summary
  storage.ts        opt-in device storage
src/components/   ← UI
src/styles/       tokens.css (brand tokens) + app.css
docs/             design deliverables (02 is generated)
db/schema.sql     target relational model
```

## Edit questions
1. Edit `src/content/questions.ts`. Keep `id`s stable. If a question's meaning changes, give it a new id.
2. Every option's `because` is shown verbatim in results ("You shared that …"). Write it in second person, describing what the person *said*.
3. Weights: 1 = primary, 0.5 = secondary, 0.3 = light. Mark "not sure" options `neutral: true`. Use `optOut: '<team>'` for explicit "not this team" options.
4. Bump `QUESTION_BANK_VERSION`, run `npm run docs:questions`, then run `npm test`. The bank tests check for 12 core questions, 24–30 total, required formats, max selections, and that every team and gift is reachable.

## Edit ministry descriptions
`src/content/teams.ts`. `configuredOpportunities` is empty on purpose. Add real, current openings there and the result cards will say "Current opportunities: …" instead of the generic "Connect with the team…". `placementRequirements` holds safeguarding and pastoral wording. It currently has **[Frontier to confirm]** placeholders.

## Change matching rules
- **Weights and thresholds:** `matchingWeights` in `src/content/signals.ts`. Bump `version`.
- **Free-text vocabulary:** `signalLibrary.rules`. A trailing `*` matches word endings. Mark team-defining terms `note: 'teamCore'` so negations of them become opt-outs. Never add `give`, `listen`, or `lead` alone. Bump `version`.
- The formula and its rationale are in `docs/04-matching-spec.md`. Add a fixture in `src/test/fixtures.ts` for any behavior you change.

## Change the look
`src/styles/tokens.css` holds fonts, colors, border weight, and spacing. The current values are *inspired by* frontierchurch.us: black and white, Bebas Neue for display, letter-spaced Josefin Sans, square 2px outlined buttons, and a teal accent darkened for contrast. They are not Frontier's official brand specs. No logos or photos are used. The wordmark is text and is set in `site.wordmark`.

## Review privacy behavior
| Check | Where |
|---|---|
| No network calls in the participant flow | `App.test.tsx` stubs `fetch` and `sendBeacon` and asserts zero calls through results and share |
| Results without contact details | `App.test.tsx` |
| Consent required before review; nothing sent without an endpoint | `Share.tsx`, `App.test.tsx` |
| Contact separated from assessment | `summary.ts`, `db/schema.sql` |
| Under-18 → no contact fields | `site.askAgeBeforeContact`, `App.test.tsx` |
| Device storage opt-in only, erased when turned off | `storage.ts`, `App.test.tsx` |
| No analytics, trackers, or external AI | none are installed. Only Google Fonts loads externally (see open decisions). |
| No raw answers in logs | the code contains no `console.log` |

To enable real submission later, set `site.submissionEndpoint` to an HTTPS endpoint Frontier controls, after a privacy review. Until then the share step produces a local download or copy only.

## What needs Frontier's review before launch
- Every identity and shared-heart statement, and the tagline. The site currently reads "Renewing the beauty of Jesus on the frontiers of modern culture", while the brief says "Revealing… at the frontiers of culture".
- Team descriptions, first steps, and especially the **Kids Ministry safeguarding** and **Worship/Prayer pastoral-guidance** wording.
- Gift paraphrases and the Romans 12 framing, including the theological review of the prophecy wording.
- The age policy and the minors message.
- Retention periods, who may see shared summaries, and the submission destination.
- Thresholds, after a small pilot.
- Whether self-hosted fonts are preferred over Google Fonts. Google Fonts makes a third-party request on page load.
