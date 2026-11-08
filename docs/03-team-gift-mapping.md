# D. Gift → team mapping

The engine recommends teams **only** from the gift profile, using these weights (`giftTeamWeights` in `src/content/teams.ts`). A weight of 1 means the gift is central to how the team serves. A blank means the gift is not weighted for that team, though it can still contribute in practice. These are **proposed ministry applications** for Frontier to confirm, not scriptural assignments.

| Team | Prophecy | Serving | Teaching | Encouragement | Giving | Leadership | Mercy |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Tech and AV | | **1.0** | | 0.3 | 0.2 | 0.6 | |
| Welcome Team | | 0.5 | | **1.0** | 0.4 | 0.3 | 0.8 |
| Setup and Breakdown | | **1.0** | | | 0.3 | 0.7 | |
| Worship | 0.9 | 0.4 | 0.5 | 0.8 | | 0.5 | |
| Kids Ministry | 0.3 | 0.4 | **1.0** | 0.7 | | 0.4 | 0.6 |
| Prayer Ministry | 0.9 | 0.3 | | 0.7 | | | **1.0** |

## Rationale
- **Tech and AV:** serving through quiet excellence in the details. Leadership helps coordinate during live moments. Encouragement keeps people at the center.
- **Welcome:** encouragement and mercy are the heart of making people feel seen. Giving reflects hospitality's generosity.
- **Setup and Breakdown:** serving and leadership (planning, coordinating teams, smooth transitions).
- **Worship:** prophetic sensitivity and encouragement lead the congregation, teaching roots worship in Scripture, and leadership guides the team. Prophecy applies under pastoral guidance.
- **Kids Ministry:** teaching (Scripture for children), encouragement, and mercy (patient care). Prophecy has a lighter weight, applied with age-appropriate care.
- **Prayer:** mercy (compassionate listening), prophecy (attentiveness to the Lord, under pastoral guidance), and encouragement.

## Giving
Giving is measured like any other gift. Its items concern time, home, and belongings, and **never money or income**. Because generosity strengthens every area, it carries modest weight on Welcome (hospitality), Setup, and Tech. A participant with a strong Giving gift sees it ranked in their profile even when it isn't the main driver of a team recommendation. Whether Frontier wants a Giving-specific next step is an open decision.

## Coverage checks (tested)
- Every team draws on at least two gifts.
- Every gift is weighted on at least one team.
