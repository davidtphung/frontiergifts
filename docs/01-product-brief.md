# A. Product brief: Find Your Place at Frontier

*Alternative title: "Your Part in the Story". Both are configurable in `src/content/site.ts`.*

## Purpose
A short, story-framed **spiritual-gifts inventory**. It assesses a person's gifting across the seven gifts named in Romans 12:6–8. It then maps that gift profile to the Frontier teams where those gifts are most central, so the person can be recommended where they are likely to flourish and build up the Body.

## Core design decision (v2)
Questions are about **the person, not the roles**. No question names a team, describes a team's tasks, asks about interest in a role, or asks about experience in one. The engine alone connects gifts to teams, using a configurable gift-to-team weight map. *(v1 asked about roles and interests directly. That approach was retired at Frontier's direction.)*

## What it does
1. Introduces Frontier's shared heart through brief story transitions.
2. Presents **21 rated statements**: 3 per gift, two about how the person sees themselves and one about what others observe. They are spread across six screens.
3. Presents **7 everyday scenarios**. Each offers exactly one response per gift, which forces a choice between equally honorable responses.
4. Scores each gift and shows all seven **ranked, with words**: Strong / Present / Emerging. No numbers are shown. Each gift has a "What pointed to this?" link that lists the participant's own answers.
5. **Recommends 2 teams**, or 3 when there's a tie or a strong third, and names the gifts behind each one ("Your gifts of mercy and encouragement are central here").
6. Lets the person respond to each team ("This feels like me / I'm curious / Not for me right now") and browse every team.

## What it doesn't do
It doesn't ask about roles, interests, experience, availability, or readiness, and it doesn't collect contact details or share anything. Follow-up happens in person.

## Prototype scope
A static React + TypeScript app. There is no backend, analytics, or external AI. Answers live in the browser tab. Device storage only happens if the participant opts in.

## Psychometric status
The instrument follows standard inventory construction: balanced items per construct, mixed self and observer perspectives, forced-choice scenarios to reduce "everything is like me", missing data treated as missing, and a deterministic, documented scoring formula. It **has not been validated**. Reliability per gift, item quality, and thresholds should be checked with a pilot before the results are treated as more than a discernment aid. See `04-scoring-spec.md`.

---

# B. Journey map

Thread: **You arrive → You notice → You respond → You help make room.**

| # | Chapter | Screens |
|---|---|---|
| 1 | **You belong in the story** | Welcome: title, invitation, path motif, "Why we serve", what to expect |
| 2 | **What do you notice?** | Chapter card → rating block (4) → scenario: at a gathering → rating block (3) → scenario: new neighbors |
| 3 | **What brings you to life?** | Chapter card → rating block (4) → scenario: a free Saturday → rating block (3) |
| 4 | **How do you care?** | Chapter card → scenario: a friend's hard week → scenario: a stalled group → scenario: a passage that stands out |
| 5 | **How do others see you?** | Chapter card → "others" rating block (4) → scenario: words of thanks → "others" rating block (3) |
| 6 | **A place to begin** | Gift profile (ranked, Strong/Present/Emerging, evidence) → recommended teams → how this works → every team → what now |

There are 13 answer screens. Each has Back, Skip, Continue, the chapter progress bar, and "Step n of 13".
