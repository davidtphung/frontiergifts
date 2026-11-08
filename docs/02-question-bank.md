# C. Question bank

Generated from `src/content/questions.ts` (qb-2026.11-v1). Do not edit by hand — run `npm run docs:questions`.

Tiers: **core** (12, everyone), **followup** (max 4 shown, after chapter 4, ranked by relevance), **deeper** (optional path after results).

## Summary

| ID | Tier | Chapter | Format | Prompt | Skippable |
|---|---|---|---|---|---|
| `c1_familiarity` | core | belong | single | First, where are you with Frontier? | yes |
| `c2_arrive` | core | notice | scenario (max 2) | A few things are happening as you walk in. Which two would you feel most drawn to help with? | yes |
| `c2_notice` | core | notice | single | In a full room, what do you tend to notice first? | yes |
| `c3_energy` | core | alive | multi (max 3) | Which of these tend to give you energy? | yes |
| `c3_tech_curiosity` | core | alive | barometer | How curious are you about helping create sound, media, or livestream experiences? | yes |
| `c3_useful` | core | alive | fill | Finish the sentence. | yes |
| `c4_friend` | core | care | scenario (max 1) | What’s your most natural first response? | yes |
| `c4_gifts` | core | care | multi (max 3) | Which of these sound like you on a good day? | yes |
| `c4_story` | core | care | text | Tell us about a time you helped someone or contributed to a group. What part felt meaningful to you? | yes |
| `f_tech_comfort` | followup | alive | barometer | How comfortable do you currently feel using unfamiliar technology? | yes |
| `f_music` | followup | alive | multi (max 3) | Which parts of music and worship would you enjoy exploring? | yes |
| `f_kids` | followup | care | multi (max 3) | Which parts of helping children grow would you enjoy exploring? | yes |
| `f_welcome` | followup | care | single | When you welcome someone, what feels most natural? | yes |
| `f_prayer` | followup | care | single | How do you most naturally pray for others? | yes |
| `f_setup` | followup | alive | multi (max 3) | Which practical tasks sound good to you? | yes |
| `f_giving` | followup | care | single | When generosity comes naturally to you, what does it usually look like? | yes |
| `f_clarify` | followup | next | single | What would help you most right now? | yes |
| `c5_explore` | core | next | teamPrefs | Which teams would you like to explore? | yes |
| `c5_readiness` | core | next | single | Where are you with serving right now? | yes |
| `c5_frequency` | core | next | single | How often could you imagine serving? | yes |
| `d_people_tasks` | deeper | alive | paired | Which sounds more like you? | yes |
| `d_stall` | deeper | care | scenario (max 1) | What do you find yourself doing? | yes |
| `d_scripture` | deeper | care | barometer | How much do you enjoy studying Scripture and helping others understand it? | yes |
| `d_learning` | deeper | next | single | How do you like to learn something new? | yes |
| `d_schedule` | deeper | next | multi (max 5) | Which times could work for you? | yes |
| `d_support` | deeper | next | multi (max 5) | Anything that would help you serve comfortably? | yes |
| `d_experience` | deeper | next | single | Have you served on a church or volunteer team before? | yes |
| `d_hopes` | deeper | next | text | Is there anything you’d love to learn or try at Frontier? | yes |

## `c1_familiarity` — First, where are you with Frontier?

- **Tier / chapter / format:** core / belong / single
- **Helper:** This just helps us explain things clearly. Everyone is welcome here.
- **Why we ask:** Avoids assuming attendance or church vocabulary; lets copy explain terms for newcomers.
- **What it does NOT prove:** Nothing about fit, gifts, or readiness. It has no scoring effect.
- **Ambiguity / bias:** Newcomers might feel they need to belong before serving; copy reinforces that they are welcome.
- **Branching:** always shown

| Option | Signals | Notes |
|---|---|---|
| I’m new or just visiting | — | neutral (missing, not negative) |
| I’ve been a few times | — | neutral (missing, not negative) |
| Frontier is my church home | — | neutral (missing, not negative) |
| I’d rather not say | — | neutral (missing, not negative) |

## `c2_arrive` — A few things are happening as you walk in. Which two would you feel most drawn to help with?

- **Tier / chapter / format:** core / notice / scenario, max 2
- **Helper:** Pick up to two. Every option here is a real way of serving.
- **Story line:** It’s Sunday. You arrive a little early.
- **Why we ask:** A concrete, Frontier-specific scenario surfaces natural inclinations without church jargon.
- **What it does NOT prove:** A first instinct on one morning is not a calling. "Observe first" is a valid, honored answer.
- **Ambiguity / bias:** Options may read as more or less "spiritual"; all are presented as equally honorable and in neutral order.
- **Branching:** always shown

| Option | Signals | Notes |
|---|---|---|
| Help someone who looks unsure where to go | team: welcome 1; skill: conversation 0.5 | — |
| Help prepare the room | team: setup 1; gift: serving 0.3; skill: campus_care 0.5 | — |
| Check why a microphone isn’t working | team: tech 1; skill: troubleshooting 0.5, audio 0.5 | — |
| Help a child feel included | team: kids 1; skill: children 0.5 | — |
| Join someone who would appreciate prayer | team: prayer 1; skill: prayer 0.5 | — |
| Help prepare a song or Scripture moment | team: worship 1; skill: music 0.3 | — |
| Ask the team where help is needed | team: setup 0.3, welcome 0.3; gift: serving 0.5 | — |
| I’d like to observe first | readiness: observe_first | neutral (missing, not negative) |

## `c2_notice` — In a full room, what do you tend to notice first?

- **Tier / chapter / format:** core / notice / single
- **Why we ask:** Attention patterns hint at where someone may already be serving informally.
- **What it does NOT prove:** Noticing is not the same as wanting to serve there, nor a gift.
- **Ambiguity / bias:** "Taking it in" may reflect newness, introversion, or overwhelm—never treated as a negative.
- **Branching:** always shown

| Option | Signals | Notes |
|---|---|---|
| The person standing on their own | team: welcome 1, prayer 0.3; gift: mercy 0.3 | — |
| What needs tidying, fixing, or setting right | team: setup 1, tech 0.3 | — |
| How it sounds and looks | team: tech 1, worship 0.3; skill: audio 0.3 | — |
| Whether people are engaged and joining in | team: worship 0.5, welcome 0.3; gift: encouragement 0.3 | — |
| Kids and families | team: kids 1 | — |
| Someone who might be having a hard day | team: prayer 1, welcome 0.3; gift: mercy 0.3 | — |
| Honestly, I’m usually just taking it in | — | neutral (missing, not negative) |

## `c3_energy` — Which of these tend to give you energy?

- **Tier / chapter / format:** core / alive / multi, max 3
- **Helper:** Choose up to three.
- **Why we ask:** Separates what energizes someone from what they think they should do.
- **What it does NOT prove:** Energy is not skill or gift. Liking music says nothing about worship leadership readiness.
- **Ambiguity / bias:** "Explaining ideas" is mapped lightly to Kids because teaching adults is equally valid; adults-only teachers are not pushed toward Kids.
- **Branching:** always shown

| Option | Signals | Notes |
|---|---|---|
| Figuring out how things work | team: tech 1; skill: hardware 0.5, troubleshooting 0.5 | — |
| Software, media, or design tools | team: tech 1; skill: software 0.5, media 0.5 | — |
| Making music or singing | team: worship 1; skill: music 1 | — |
| Meeting new people | team: welcome 1; skill: conversation 0.5 | — |
| Unhurried one-on-one conversation | team: welcome 0.5, prayer 0.5; skill: conversation 0.5 | — |
| Organizing a space or a plan | team: setup 1; skill: organization 1 | — |
| Explaining ideas so they click | team: kids 0.5; skill: teaching_skill 1 | — |
| Playing, creating, or learning with kids | team: kids 1; skill: children 1 | — |
| Quiet, focused work behind the scenes | team: setup 0.5, tech 0.5, prayer 0.3 | — |
| Time in prayer | team: prayer 1; skill: prayer 1 | — |

## `c3_tech_curiosity` — How curious are you about helping create sound, media, or livestream experiences?

- **Tier / chapter / format:** core / alive / barometer
- **Helper:** Curiosity, not experience. There’s no better end of this scale.
- **Why we ask:** Measures interest independently from current technical comfort (asked separately).
- **What it does NOT prove:** Curiosity does not imply ability; low curiosity is not a negative judgment.
- **Ambiguity / bias:** People may under-report curiosity if they assume experience is required—helper text addresses this.
- **Branching:** always shown
- **Anchors:** Not really my thing → A little curious → Very curious (0–4, plus “Not sure”)
- **Scoring:** signals × value/4 → team: tech 1; learn: tech 0.5

## `c3_useful` — Finish the sentence.

- **Tier / chapter / format:** core / alive / fill, ≤120 chars
- **Helper:** A few words is perfect. Skip if nothing comes to mind.
- **Why we ask:** Gives people their own words; supports (never drives) matching.
- **What it does NOT prove:** A phrase is supporting evidence only. It cannot move a recommendation on its own.
- **Ambiguity / bias:** Short text is easy to misread; negation, third-person, and past-tense phrasing are handled explicitly.
- **Branching:** always shown
- **Scoring:** free-text interpreter (Layer 5, supporting evidence only; see matching spec).

## `c4_friend` — What’s your most natural first response?

- **Tier / chapter / format:** core / care / scenario, max 1
- **Helper:** Each of these is a good way to care.
- **Story line:** A friend tells you they’re having a hard week.
- **Why we ask:** A relational scenario where each Romans 12 gift has an honorable, equal response.
- **What it does NOT prove:** One instinct does not confirm a spiritual gift; gift reflections need repeated themes and community discernment.
- **Ambiguity / bias:** Prophecy is phrased as asking and sharing gently, never as certainty; "listen" alone maps to mercy, not prophecy.
- **Branching:** always shown

| Option | Signals | Notes |
|---|---|---|
| Listen, and stay with them in it | team: prayer 0.3, welcome 0.3; gift: mercy 1 | — |
| Pray with them or for them | team: prayer 1; skill: prayer 0.5 | — |
| Remind them of hope and cheer them on | gift: encouragement 1 | — |
| Do something practical—a meal, an errand | gift: serving 1 | — |
| Share something from Scripture that helped you | gift: teaching 0.7, encouragement 0.3 | — |
| Quietly provide something they need | gift: giving 1 | — |
| Help them make a plan and rally support | gift: leadership 1 | — |
| Ask the Lord how to encourage them, then share it gently | gift: prophecy 0.6, encouragement 0.4 | — |

## `c4_gifts` — Which of these sound like you on a good day?

- **Tier / chapter / format:** core / care / multi, max 3
- **Helper:** Choose up to three—or “not sure yet.” These loosely reflect the gifts named in Romans 12:6–8.
- **Why we ask:** Direct, gentle self-reflection on each Romans 12 gift, in everyday language.
- **What it does NOT prove:** Self-description is a starting point for discernment, not confirmation of a gift.
- **Ambiguity / bias:** "What I have" is deliberately not about money; giving is never inferred from income.
- **Branching:** always shown

| Option | Signals | Notes |
|---|---|---|
| I sometimes sense what God may be saying, and want to share it carefully | gift: prophecy 1 | — |
| I’m happiest meeting practical needs, often unnoticed | gift: serving 1 | — |
| I love helping people understand Scripture or ideas | gift: teaching 1 | — |
| I find myself cheering people on to keep going | gift: encouragement 1 | — |
| I like sharing what I have so others are provided for | gift: giving 1 | — |
| I see where a group needs to go and help get it there | gift: leadership 1 | — |
| I’m drawn to people who are hurting | gift: mercy 1 | — |
| Not sure yet | — | neutral (missing, not negative) |

## `c4_story` — Tell us about a time you helped someone or contributed to a group. What part felt meaningful to you?

- **Tier / chapter / format:** core / care / text, ≤600 chars
- **Helper:** A sentence or two is enough. Everyday examples count. Optional.
- **Why we ask:** Lets people describe meaning in their own words; used only as supporting evidence.
- **What it does NOT prove:** Length and eloquence are not weighed. Stories about other people’s skills are not attributed to the participant.
- **Ambiguity / bias:** Free text may mention past roles the person no longer wants—historical phrasing is detected and down-weighted.
- **Branching:** always shown
- **Scoring:** free-text interpreter (Layer 5, supporting evidence only; see matching spec).

## `f_tech_comfort` — How comfortable do you currently feel using unfamiliar technology?

- **Tier / chapter / format:** followup / alive / barometer
- **Helper:** This is about where you are today. Beginners are welcome on every team.
- **Why we ask:** Separates current comfort from curiosity so beginners are invited, not filtered out.
- **What it does NOT prove:** Comfort shapes the suggested first step only. It never changes team fit.
- **Ambiguity / bias:** Self-rated comfort varies by confidence; it is used only for next-step wording.
- **Branching:** shown if c3_tech_curiosity ≥ 2 OR c2_arrive ∈ {mic} OR c3_energy ∈ {fixing, software}; ranked by tech relevance
- **Anchors:** New to me → Comfortable exploring → Very comfortable (0–4, plus “Not sure”)
- **Scoring:** signals × value/4 → skill: software 0.5, hardware 0.5; readiness by value: curious_beginner, curious_beginner, some_experience, some_experience, experienced

## `f_music` — Which parts of music and worship would you enjoy exploring?

- **Tier / chapter / format:** followup / alive / multi, max 3
- **Why we ask:** Distinguishes musical interest from platform ministry, and connects musicians to Tech where relevant.
- **What it does NOT prove:** Musical skill is not a Romans 12 gift and does not certify anyone for worship leading.
- **Ambiguity / bias:** Musicians may feel obligated to serve on Worship; the off-platform option removes that pressure.
- **Branching:** shown if c3_energy ∈ {music} OR c2_arrive ∈ {song}; ranked by worship relevance

| Option | Signals | Notes |
|---|---|---|
| Singing | team: worship 1; skill: vocals 1 | — |
| Playing an instrument | team: worship 1; skill: music 1 | — |
| Preparing Scripture and prayer moments | team: worship 1; gift: teaching 0.3 | — |
| Rehearsing and growing with a team | team: worship 0.5; learn: worship 1 | — |
| Helping the music sound great from the sound desk | team: tech 1; skill: audio 1 | — |
| I make music, but I’d rather not be on the platform right now | skill: music 1 | explicit opt-out: worship |

## `f_kids` — Which parts of helping children grow would you enjoy exploring?

- **Tier / chapter / format:** followup / care / multi, max 3
- **Story line:** At Frontier, children are not waiting for a future invitation into the Body of Christ. They belong now.
- **Why we ask:** Shows the spiritual heart of Kids Ministry and lets people opt out clearly.
- **What it does NOT prove:** Interest is not approval to work with children; safeguarding and screening come first.
- **Ambiguity / bias:** “Not now” is treated as an explicit opt-out for Kids, overriding any inferred signal.
- **Branching:** shown if c2_arrive ∈ {child} OR c2_notice ∈ {kids} OR c3_energy ∈ {kids_play, explaining}; ranked by kids relevance

| Option | Signals | Notes |
|---|---|---|
| Explaining a Bible story | team: kids 1; gift: teaching 0.3; skill: teaching_skill 0.5 | — |
| Helping a child feel safe and included | team: kids 1; gift: mercy 0.3 | — |
| Worship and prayer with children | team: kids 1; skill: prayer 0.3 | — |
| Preparing activities or materials | team: kids 0.5, setup 0.3; gift: serving 0.3 | — |
| Supporting parents and the team | team: kids 0.5, welcome 0.3 | — |
| I’m curious but would need training | team: kids 0.3; learn: kids 1 | — |
| This isn’t an area I want to explore right now | — | neutral (missing, not negative); explicit opt-out: kids |

## `f_welcome` — When you welcome someone, what feels most natural?

- **Tier / chapter / format:** followup / care / single
- **Helper:** Quiet welcomes are just as real as loud ones.
- **Why we ask:** Shows that hospitality takes many forms, including quiet and one-to-one.
- **What it does NOT prove:** Style preference is not a ranking of hospitality.
- **Ambiguity / bias:** Avoids equating hospitality with extroversion.
- **Branching:** shown if c2_arrive ∈ {unsure} OR c2_notice ∈ {alone} OR c3_energy ∈ {meeting, one_on_one}; ranked by welcome relevance

| Option | Signals | Notes |
|---|---|---|
| A warm hello at the door | team: welcome 1; skill: conversation 0.5 | — |
| Helping someone find their way | team: welcome 1, setup 0.3 | — |
| Sitting with someone new so they’re not alone | team: welcome 1; gift: mercy 0.3 | — |
| Remembering names and following up | team: welcome 1; gift: encouragement 0.3 | — |
| Helping families find Kids Ministry | team: welcome 1, kids 0.3 | — |
| Quietly, one person at a time | team: welcome 1 | — |

## `f_prayer` — How do you most naturally pray for others?

- **Tier / chapter / format:** followup / care / single
- **Helper:** Quiet, faithful intercession is meaningful service.
- **Why we ask:** Honors private intercession equally with praying aloud.
- **What it does NOT prove:** Confidence praying aloud is not spiritual maturity.
- **Ambiguity / bias:** No sensitive prayer content is requested.
- **Branching:** shown if c4_friend ∈ {pray} OR c2_arrive ∈ {pray} OR c3_energy ∈ {praying} OR c2_notice ∈ {hurting}; ranked by prayer relevance

| Option | Signals | Notes |
|---|---|---|
| Quietly, on my own | team: prayer 1; skill: prayer 0.5 | — |
| With someone, one-on-one | team: prayer 1; gift: mercy 0.3 | — |
| With a group or team | team: prayer 1 | — |
| I’m still learning to pray for others | team: prayer 0.3; learn: prayer 1 | — |
| Not sure | — | neutral (missing, not negative) |

## `f_setup` — Which practical tasks sound good to you?

- **Tier / chapter / format:** followup / alive / multi, max 3
- **Helper:** Choose up to three. Plenty of roles don’t involve heavy lifting.
- **Why we ask:** Matches Setup interest around organization, signage, and coordination—not just lifting.
- **What it does NOT prove:** Choosing lighter tasks never reduces fit; it shapes the first step.
- **Ambiguity / bias:** Physical limits are voluntary and never asked for reasons.
- **Branching:** shown if c2_arrive ∈ {room, ask} OR c2_notice ∈ {details} OR c3_energy ∈ {organizing, quiet_work}; ranked by setup relevance

| Option | Signals | Notes |
|---|---|---|
| Setting out chairs and furniture | team: setup 1; skill: physical_tasks 1 | — |
| Signage and wayfinding | team: setup 1, welcome 0.3; skill: organization 0.5 | — |
| Preparing ministry rooms | team: setup 1; skill: campus_care 1 | — |
| Coordinating timing between teams | team: setup 1; gift: leadership 0.3; skill: coordination 1 | — |
| Resetting the space afterwards | team: setup 1; skill: campus_care 0.5 | — |
| Caring for equipment | team: setup 0.5, tech 0.5; skill: hardware 0.5 | — |
| Lighter tasks only, please | team: setup 0.5; practical: no_heavy_lifting | — |

## `f_giving` — When generosity comes naturally to you, what does it usually look like?

- **Tier / chapter / format:** followup / care / single
- **Helper:** Nothing here is about amounts. Generosity isn’t measured by income.
- **Why we ask:** Represents the gift of giving meaningfully even though it doesn’t map to one team.
- **What it does NOT prove:** No financial capacity is asked or inferred. This is distinct from the broader idea of "giving back."
- **Ambiguity / bias:** Hosting is linked lightly to Welcome because hospitality and generosity overlap in practice.
- **Branching:** shown if c4_gifts ∈ {giving} OR c4_friend ∈ {provide}

| Option | Signals | Notes |
|---|---|---|
| Noticing a need and quietly meeting it | gift: giving 1, serving 0.3 | — |
| Sharing my time and skills | gift: giving 0.7, serving 0.3 | — |
| Opening my home or sharing a meal | team: welcome 0.5; gift: giving 0.7 | — |
| Supporting the church’s work generously | gift: giving 1 | — |
| It’s something I’m growing in | gift: giving 0.3 | — |

## `f_clarify` — What would help you most right now?

- **Tier / chapter / format:** followup / next / single
- **Helper:** Totally fine to still be figuring it out.
- **Why we ask:** Gives uncertain participants a gentle path instead of forcing a match.
- **What it does NOT prove:** Uncertainty is not a lack of gifting.
- **Ambiguity / bias:** None—no scoring effect except next-step wording.
- **Branching:** shown if c2_arrive ∈ {observe} OR c2_notice ∈ {taking_in} OR c4_gifts ∈ {unsure}

| Option | Signals | Notes |
|---|---|---|
| Seeing what every team does | readiness: observe_first | neutral (missing, not negative) |
| Observing a Sunday behind the scenes | readiness: observe_first | neutral (missing, not negative) |
| A conversation with someone | readiness: wants_training | neutral (missing, not negative) |
| Just trying something small | readiness: ready | neutral (missing, not negative) |

## `c5_explore` — Which teams would you like to explore?

- **Tier / chapter / format:** core / next / teamPrefs
- **Helper:** Your answer here always outweighs our guesses. “Not right now” means we won’t suggest it.
- **Why we ask:** Layer 1 explicit preference: the participant’s own words take priority over inference.
- **What it does NOT prove:** Interest is not a commitment. "Not right now" is respected without judgment.
- **Ambiguity / bias:** Team names may be unfamiliar to newcomers; one-line descriptions are shown.
- **Branching:** always shown
- **Scoring:** Layer 1 explicit preference — curious +0.35, maybe +0.15, not right now = excluded.

## `c5_readiness` — Where are you with serving right now?

- **Tier / chapter / format:** core / next / single
- **Why we ask:** Shapes the suggested first step; never changes gift reflections or team fit.
- **What it does NOT prove:** Readiness is about timing, not spiritual maturity.
- **Ambiguity / bias:** None significant.
- **Branching:** always shown

| Option | Signals | Notes |
|---|---|---|
| Ready to try something | readiness: ready | — |
| I’d like some training first | readiness: wants_training | — |
| I’d like to observe first | readiness: observe_first | — |
| Just exploring, not ready to commit | readiness: not_now | — |

## `c5_frequency` — How often could you imagine serving?

- **Tier / chapter / format:** core / next / single
- **Helper:** An honest guess is great. You can change it any time.
- **Why we ask:** Practical fit for next-step suggestions.
- **What it does NOT prove:** Availability never affects gift reflections or how well a team fits.
- **Ambiguity / bias:** Limited availability is not penalized.
- **Branching:** always shown

| Option | Signals | Notes |
|---|---|---|
| Most weeks | practical: weekly | — |
| A couple of times a month | practical: twice_monthly | — |
| About once a month | practical: monthly | — |
| Occasionally or for special events | practical: occasional | — |
| Not sure yet | — | neutral (missing, not negative) |

## `d_people_tasks` — Which sounds more like you?

- **Tier / chapter / format:** deeper / alive / paired
- **Why we ask:** A light preference check with "both" and "neither" respected.
- **What it does NOT prove:** Not a personality type.
- **Ambiguity / bias:** Many roles mix both; signals are deliberately light.
- **Branching:** optional deeper path only

| Option | Signals | Notes |
|---|---|---|
| Working directly with people | team: welcome 0.5, kids 0.5, prayer 0.3 | — |
| Working with things, spaces, or systems | team: setup 0.5, tech 0.5 | — |
| Both | — | neutral (missing, not negative) |
| Neither—it depends | — | neutral (missing, not negative) |

## `d_stall` — What do you find yourself doing?

- **Tier / chapter / format:** deeper / care / scenario, max 1
- **Story line:** A group project has stalled.
- **Why we ask:** A second, independent gift scenario so gift themes need repetition, not one answer.
- **What it does NOT prove:** One response is not a gift; repeated themes are only worth exploring.
- **Ambiguity / bias:** Prophecy is intentionally not offered here to avoid equating "pausing to pray" with prophecy.
- **Branching:** optional deeper path only

| Option | Signals | Notes |
|---|---|---|
| Suggest a plan and help organize people | gift: leadership 1 | — |
| Encourage people to keep going | gift: encouragement 1 | — |
| Pick up the task no one wants | gift: serving 1 | — |
| Explain the goal clearly again | gift: teaching 1 | — |
| Check how people are really doing | gift: mercy 1 | — |
| Bring what’s needed so the group can move | gift: giving 0.7, serving 0.3 | — |

## `d_scripture` — How much do you enjoy studying Scripture and helping others understand it?

- **Tier / chapter / format:** deeper / care / barometer
- **Why we ask:** Teaching signal independent of any age group.
- **What it does NOT prove:** Enjoyment does not equal teaching readiness, and adults-focused teachers are not routed to Kids.
- **Ambiguity / bias:** No team signal attached on purpose.
- **Branching:** optional deeper path only
- **Anchors:** Not much right now → Somewhat → A lot (0–4, plus “Not sure”)
- **Scoring:** signals × value/4 → gift: teaching 0.6; skill: teaching_skill 0.5

## `d_learning` — How do you like to learn something new?

- **Tier / chapter / format:** deeper / next / single
- **Why we ask:** Helps leaders plan an onboarding conversation.
- **What it does NOT prove:** Nothing about fit.
- **Ambiguity / bias:** None.
- **Branching:** optional deeper path only

| Option | Signals | Notes |
|---|---|---|
| Shadowing someone | practical: learn_shadow | neutral (missing, not negative) |
| A short written guide | practical: learn_guide | neutral (missing, not negative) |
| Trying it and asking questions | practical: learn_try | neutral (missing, not negative) |
| A training session | practical: learn_training | neutral (missing, not negative) |

## `d_schedule` — Which times could work for you?

- **Tier / chapter / format:** deeper / next / multi, max 5
- **Helper:** Choose any. Service times are set by Frontier—this just helps a leader plan.
- **Why we ask:** Practical fit only.
- **What it does NOT prove:** Nothing about gifts or fit.
- **Ambiguity / bias:** None.
- **Branching:** optional deeper path only

| Option | Signals | Notes |
|---|---|---|
| Before the gathering | practical: before | neutral (missing, not negative) |
| During the gathering | practical: during | neutral (missing, not negative) |
| After the gathering | practical: after | neutral (missing, not negative) |
| Weekdays or evenings | practical: weekday | neutral (missing, not negative) |
| Flexible or from home | practical: remote | neutral (missing, not negative) |

## `d_support` — Anything that would help you serve comfortably?

- **Tier / chapter / format:** deeper / next / multi, max 5
- **Helper:** Optional, and no need to explain why.
- **Why we ask:** Voluntary accommodations shape the next step, never the fit.
- **What it does NOT prove:** Nothing. No reasons or medical details are requested.
- **Ambiguity / bias:** Never penalized.
- **Branching:** optional deeper path only

| Option | Signals | Notes |
|---|---|---|
| Shorter shifts | practical: short_shifts | neutral (missing, not negative) |
| Seated tasks | practical: seated | neutral (missing, not negative) |
| Quieter environments | practical: quiet | neutral (missing, not negative) |
| No heavy lifting | practical: no_heavy_lifting | neutral (missing, not negative) |
| Serving alongside a friend | practical: buddy | neutral (missing, not negative) |

## `d_experience` — Have you served on a church or volunteer team before?

- **Tier / chapter / format:** deeper / next / single
- **Why we ask:** Next-step wording only.
- **What it does NOT prove:** Experience never increases fit; beginners receive the same invitations.
- **Ambiguity / bias:** None.
- **Branching:** optional deeper path only

| Option | Signals | Notes |
|---|---|---|
| Not yet | readiness: curious_beginner | — |
| A little | readiness: some_experience | — |
| Quite a bit | readiness: experienced | — |

## `d_hopes` — Is there anything you’d love to learn or try at Frontier?

- **Tier / chapter / format:** deeper / next / text, ≤300 chars
- **Helper:** Optional. A few words is plenty.
- **Why we ask:** Captures growth hopes in the participant’s words.
- **What it does NOT prove:** Supporting evidence only.
- **Ambiguity / bias:** Growth phrasing ("I’d love to learn") is detected as learning interest, not current skill.
- **Branching:** optional deeper path only
- **Scoring:** free-text interpreter (Layer 5, supporting evidence only; see matching spec).
