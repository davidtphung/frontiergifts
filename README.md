# frontiergifts
To unveil the beauty of Jesus and reveal your giftings

## Find Your Place at Frontier
A short, story-framed **spiritual-gifts inventory** for Frontier Church. Participants rate 21 statements and choose responses in 7 everyday scenarios. The tool ranks their gifts across the seven gifts named in Romans 12 (Strong / Present / Emerging), then maps that profile to the teams where those gifts matter most: Tech and AV, Welcome, Setup and Breakdown, Worship, Kids Ministry, and Prayer Ministry. No question asks about teams or roles; the engine makes that connection.

**Prototype status:** a static web app. Answers stay in the browser. Nothing is sent anywhere, and there are no accounts, analytics, or external AI. Not yet validated with a pilot.

```bash
npm install
npm run dev     # http://localhost:5173
npm test
```

## Docs
- [A–B. Product brief & journey map](docs/01-product-brief.md)
- [C. Question bank](docs/02-question-bank.md) (generated from config)
- [D. Gift → team mapping](docs/03-team-gift-mapping.md)
- [E. Scoring specification](docs/04-scoring-spec.md)
- [F. Data model](docs/05-data-model.md) · [schema](db/schema.sql)
- [I. Implementation guide](docs/06-implementation-guide.md) (how to run and edit, privacy, launch review)
- [J. Open decisions](docs/07-open-decisions.md)
