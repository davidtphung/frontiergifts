# A. Product brief: Find Your Place at Frontier

*Alternative title: “Your Part in the Story”. Both are configurable in `src/content/site.ts`.*

## Purpose
A short, story-driven conversation that helps someone feel known, understand Frontier's heart for serving, and discover a few places to begin. It offers **invitations, not labels**.

> Core principle: help people feel known before asking them to commit.

## Who it's for
- Newcomers who may not know church vocabulary. We don't assume attendance, and terms are explained.
- Regular attenders who have never served, or who want a change.
- Ministry leaders, who get a consent-based summary to start a personal conversation. Nothing is shared without the participant's explicit action.

## What it does
1. Introduces Frontier's shared heart through brief story transitions, not sermons.
2. Asks 12 core questions plus up to 4 adaptive follow-ups, using seven formats: single choice, multi-select, scenario, paired preference, fill-in-the-blank, open text, and anchored barometer.
3. Keeps separate dimensions apart: **team interest, practical skills, learning interest, Romans 12 gift reflections, readiness, and availability**.
4. Offers 1–2 exploration invitations, plus an optional "you might also enjoy". Each invitation explains its reasons from the person's actual answers, suggests tentative gift connections, and gives a beginner-friendly first step.
5. Lets the person correct the results ("This feels like me / I'm curious / Not for me right now"), browse every team, and optionally go deeper with 8 more questions.
6. Offers an optional **review-and-share** step, with separate consent for sharing a summary and for requesting follow-up.

## What it is not
It isn't an exam, a job application, a personality diagnosis, a spiritual ranking, or a way to fill staffing gaps. It never claims to know what God has called someone to do, and it never shows gift percentages.

## Prototype scope (this repo)
- A static React + TypeScript app (Vite). There is no backend, database, account system, analytics, or external AI.
- Answers live in memory for the browser tab. Device storage happens only if the participant opts in, and turning it off erases what was saved.
- Sharing produces a reviewable summary. **No submission endpoint is configured**, so nothing is ever transmitted. The participant can download or copy their summary.

## Why this stack
The repo was empty. A static single-page app is the smallest thing that keeps responses session-local by default and can be hosted anywhere. Content, rules, and weights are plain versioned TypeScript config, so they can move into the relational schema (`db/schema.sql`) once Frontier wants persistence and a leader view.

## Success criteria
The acceptance criteria are in the original brief. Each is backed by a test in `src/**/*.test.ts` or a documented design choice. See `06-implementation-guide.md` → "What needs Frontier's review".

---

# B. Journey map

Thread: **You arrive → You notice → You respond → You help make room.**

| # | Chapter | Screens | Values woven in (one line, no sermon) |
|---|---|---|---|
| 1 | **You belong in the story** | Welcome hero (title, invitation, path motif) → "Why we serve" (shared heart + together list) → privacy notice → `c1_familiarity` | "This isn't a test, and there are no wrong answers." |
| 2 | **What do you notice?** | Chapter card → `c2_arrive` (Sunday-arrival scenario, pick 2) → `c2_notice` | "Sometimes hospitality begins before anyone reaches the door." |
| 3 | **What brings you to life?** | Chapter card → `c3_energy` (pick 3) → `c3_tech_curiosity` (barometer) → `c3_useful` (fill-in) | "A clear microphone, a prepared room, and a warm welcome can all help make space for someone else." |
| 4 | **How do you care?** | Chapter card → `c4_friend` (scenario) → `c4_gifts` (Romans 12 self-reflection) → `c4_story` (optional open text) → **up to 4 follow-ups** (tech comfort, music, kids, welcome style, prayer style, practical tasks, generosity) | "Listening can be a way of serving." Kids follow-up: "Children… belong now." |
| 5 | **What could your next step look like?** | Chapter card → [`f_clarify` if uncertain] → `c5_explore` (per-team Curious / Maybe / Not right now) → `c5_readiness` → `c5_frequency` | "No commitment here." |
| 6 | **A place to begin** | Results: invitations → "Did we read this right?" → gift reflections → "How did we come up with this?" → every team → What now (share, go deeper, review answers, save on device, start over) | "Your answers are a starting point for a conversation, not a label." |
| + | **Going deeper** (optional) | Intro card → 8 questions → back to updated results | |
| + | **Share** (optional) | Age check → consents + what to include → exact review → finish (local copy only in prototype) | |

Every question screen has one primary task, a visible Back button, Skip (where allowed), chapter progress (6 segments plus a text label), and "Question n of N" in the header.
