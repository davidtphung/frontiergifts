# I. Implementation guide

## Run it
```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 26 tests: instrument design, scoring, mapping, UI, privacy
npm run build      # typecheck + static build in dist/
```
The build is a static site. Host `dist/` anywhere. It needs no server or secrets.

## Project map
```
src/content/      ← what Frontier edits
  site.ts           title, identity copy, chapters, privacy notice
  questions.ts      21 statements + 7 scenarios, grouped into 13 screens
  teams.ts          six teams, seven gifts, gift→team weights
  scoring.ts        scoring weights + thresholds (versioned)
  types.ts          shared types (mirror db/schema.sql)
src/engine/       ← pure, deterministic logic
  scoring.ts        gift scores → levels → team fit → recommendations
  storage.ts        opt-in device storage
src/components/   ← UI (QuestionControls, Results, Chrome)
src/styles/       tokens.css (brand tokens) + app.css
docs/             design deliverables (02 is generated)
```

## Edit the gift statements and scenarios
1. Edit `src/content/questions.ts`.
   - **Keep exactly 3 statements per gift** (2 self, 1 others) and **one option per gift in every scenario**. Tests enforce both, so no gift gets more chances to score.
   - **Never mention a team, role, task type, interest in a role, experience, or money.** A test scans all wording for these.
   - Keep item ids stable. If a statement's meaning changes, give it a new id.
2. Bump `QUESTION_BANK_VERSION`, run `npm run docs:questions`, then `npm test`.

## Edit teams and the gift→team mapping
`src/content/teams.ts`. `giftTeamWeights` decides which gifts lead to which teams; see `docs/03-team-gift-mapping.md` for the rationale. `configuredOpportunities` is empty. Add real openings and the cards will show them instead of the generic first step. `placementRequirements` holds **[Frontier to confirm]** placeholders for Kids, Worship, and Prayer.

## Change scoring
`src/content/scoring.ts`: the rating/scenario blend, level thresholds, minimum evidence, and tie and "also" thresholds. Bump `version`. The formula is in `docs/04-scoring-spec.md`. Fixtures in `src/test/fixtures.ts` build answer sets from a gift profile, which makes it easy to add a test for any change.

## Change the look
`src/styles/tokens.css`. The tokens are inspired by frontierchurch.us. They are not official brand specs.

## Privacy behavior
| Check | Where |
|---|---|
| No network calls during the inventory or results | `App.test.tsx` (stubs `fetch`/`sendBeacon`) and a real-browser check |
| No names, contact details, or team questions anywhere in the flow | `App.test.tsx`, `scoring.test.ts` |
| Device storage opt-in only, erased when turned off | `storage.ts`, `App.test.tsx` |
| No analytics, trackers, or AI. Google Fonts is the only external request. | — |

## Before launch, Frontier should review
- Every statement and scenario, theologically and pastorally, especially the prophecy wording.
- The gift→team weights.
- The Kids safeguarding wording and the Worship/Prayer pastoral-guidance wording.
- A pilot to check reliability per gift and to calibrate thresholds.
- The tagline. The website and the brief differ: "Renewing… modern culture" vs "Revealing… culture".

## Deploy (GitHub Pages)
`.github/workflows/deploy-pages.yml` tests, builds, and deploys on every push to `claw` (or manually from the Actions tab). One-time setup by a repo admin: **Settings → Pages → Build and deployment → Source: GitHub Actions**. The site is then served at `https://davidtphung.github.io/frontiergifts/`.

To share without hosting, run `npm run build:share`, which writes one self-contained `share/frontier-gifts.html`.
