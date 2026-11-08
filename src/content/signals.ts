import type { MatchingWeights, SignalLibrary } from './types';

/**
 * Versioned signal library for free-text answers.
 *
 * Patterns are matched case-insensitively on word boundaries. A trailing `*`
 * matches any word ending (teach* → teach, teaching, teacher).
 *
 * Deliberately NOT included (too ambiguous on their own):
 *  - "give"   → does not imply the gift of giving
 *  - "listen" → does not imply prophecy
 *  - "lead"   → does not imply the gift of leadership
 */
export const signalLibrary: SignalLibrary = {
  version: 'sig-2026.11-v1',
  rules: [
    // ── Tech and AV
    { id: 'tech.core', patterns: ['tech team', 'av team', 'sound desk', 'sound booth', 'production team'], team: 'tech', weight: 1, note: 'teamCore' },
    { id: 'tech.audio', patterns: ['audio', 'sound', 'mixing', 'mixer', 'microphone*', 'mic', 'mics', 'sound design'], team: 'tech', skill: 'audio', weight: 1 },
    { id: 'tech.stream', patterns: ['livestream*', 'live stream*', 'streaming', 'video', 'camera*', 'filming'], team: 'tech', skill: 'media', weight: 1 },
    { id: 'tech.media', patterns: ['slides', 'media', 'graphics', 'projector', 'lyrics on screen'], team: 'tech', skill: 'media', weight: 1 },
    { id: 'tech.software', patterns: ['software', 'computer*', 'coding', 'programming'], team: 'tech', skill: 'software', weight: 0.7 },
    { id: 'tech.hardware', patterns: ['hardware', 'cables', 'equipment', 'gear', 'electronics'], team: 'tech', skill: 'hardware', weight: 0.7 },
    { id: 'tech.troubleshoot', patterns: ['troubleshoot*', 'fix things', 'fixing things', 'figure out how things work', 'debug*'], team: 'tech', skill: 'troubleshooting', weight: 0.7 },

    // ── Welcome
    { id: 'welcome.core', patterns: ['welcome team', 'greeter*', 'hospitality'], team: 'welcome', weight: 1, note: 'teamCore' },
    { id: 'welcome.greet', patterns: ['welcom*', 'greet*', 'say hello', 'newcomer*', 'new people', 'first time guest*', 'visitors'], team: 'welcome', skill: 'conversation', weight: 1 },
    { id: 'welcome.belong', patterns: ['feel at home', 'feel welcome', 'feel comfortable', 'belong*', 'include*', 'including', 'connect people', 'connecting people', 'feel seen'], team: 'welcome', weight: 0.7 },
    { id: 'welcome.conversation', patterns: ['conversation*', 'chatting', 'talking with people', 'meeting people'], team: 'welcome', skill: 'conversation', weight: 0.5 },

    // ── Setup and Breakdown
    { id: 'setup.core', patterns: ['setup team', 'set up team', 'setup and breakdown', 'breakdown team'], team: 'setup', weight: 1, note: 'teamCore' },
    { id: 'setup.prepare', patterns: ['set up', 'setting up', 'setup', 'prepare the room', 'preparing the room', 'arrange*', 'pack away', 'packing up', 'reset the room', 'tear down', 'teardown'], team: 'setup', skill: 'campus_care', weight: 1 },
    { id: 'setup.organize', patterns: ['organiz*', 'tidy*', 'logistics', 'signage', 'signs', 'checklist*'], team: 'setup', skill: 'organization', weight: 0.7 },
    { id: 'setup.practical', patterns: ['chairs', 'tables', 'furniture', 'moving things', 'campus'], team: 'setup', skill: 'physical_tasks', weight: 0.7 },

    // ── Worship
    { id: 'worship.core', patterns: ['worship team', 'worship ministry', 'lead worship', 'leading worship', 'led worship', 'worship leader', 'worship'], team: 'worship', weight: 1, note: 'teamCore' },
    { id: 'worship.music', patterns: ['music', 'musician', 'song*', 'rehears*', 'band', 'guitar', 'piano', 'keys', 'drums', 'bass', 'violin', 'instrument*'], team: 'worship', skill: 'music', weight: 1 },
    { id: 'worship.vocal', patterns: ['sing', 'singing', 'singer', 'sang', 'vocal', 'vocals', 'choir'], team: 'worship', skill: 'vocals', weight: 1 },

    // ── Kids Ministry
    { id: 'kids.core', patterns: ['kids ministry', 'children’s ministry', "children's ministry", 'sunday school', 'kids', 'children', 'child', 'youth group', 'toddlers', 'little ones'], team: 'kids', skill: 'children', weight: 1, note: 'teamCore' },
    { id: 'kids.story', patterns: ['bible stor*'], team: 'kids', skill: 'teaching_skill', weight: 0.7 },
    { id: 'kids.families', patterns: ['families', 'parents'], team: 'kids', weight: 0.3 },

    // ── Prayer Ministry
    { id: 'prayer.core', patterns: ['prayer team', 'prayer ministry', 'intercession', 'intercede', 'interceding', 'intercessor*'], team: 'prayer', skill: 'prayer', weight: 1, note: 'teamCore' },
    { id: 'prayer.pray', patterns: ['pray*'], team: 'prayer', skill: 'prayer', weight: 1 },

    // ── Gifts (independent from team vocabulary)
    { id: 'gift.prophecy', patterns: ['hear from god', 'hear from the lord', 'hearing from god', 'hearing from the lord', 'what god is saying', 'what god was saying', 'word from the lord', 'prophe*', 'the lord showed me', 'god showed me', 'sense what god'], gift: 'prophecy', weight: 1 },
    { id: 'gift.serving', patterns: ['behind the scenes', 'practical need*', 'help out', 'helped out', 'helping out', 'pitch in', 'pitched in'], gift: 'serving', weight: 0.7 },
    { id: 'gift.teaching', patterns: ['teach*', 'taught', 'explain*', 'bible study', 'help people understand', 'helping people understand'], gift: 'teaching', skill: 'teaching_skill', weight: 0.7 },
    { id: 'gift.encouragement', patterns: ['encourag*', 'cheer people on', 'cheering people on', 'cheer them on', 'build people up', 'building people up', 'uplift*'], gift: 'encouragement', weight: 1 },
    { id: 'gift.giving', patterns: ['generous', 'generosity', 'share what i have', 'sharing what i have', 'provide for', 'providing for', 'donat*'], gift: 'giving', weight: 0.7 },
    { id: 'gift.leadership', patterns: ['organize people', 'organizing people', 'lead a team', 'leading a team', 'led a team', 'took charge', 'take charge', 'set direction', 'rally people', 'rallied people', 'coordinate people', 'coordinating people'], gift: 'leadership', weight: 1 },
    { id: 'gift.mercy', patterns: ['compassion*', 'hurting', 'comfort someone', 'comforting', 'sit with', 'sat with', 'grieving', 'struggling', 'lonely'], gift: 'mercy', weight: 1 },
  ],
  negations: ['not', 'no longer', 'never', 'rather not', 'nor', 'avoid', 'hate', 'dislike'],
  contrasts: ['but', 'however', 'though', 'although', 'yet', 'except'],
  historical: ['used to', 'in the past', 'previously', 'years ago', 'back when', 'once did', 'formerly'],
  growth: ['want to learn', 'would love to learn', 'love to learn', 'like to learn', 'learn', 'learning', 'want to try', 'would love to try', 'like to try', 'grow in', 'get better at', 'want to grow', 'curious about', 'interested in learning'],
  noExperience: ['no experience', 'no audio experience', 'never done', 'have never', 'new to', 'beginner', 'zero experience', 'not experienced', 'no idea how'],
  uncertainty: ['maybe', 'might', 'not sure', 'perhaps', 'i think', 'possibly', 'kind of', 'sort of'],
  thirdParty: ['my spouse', 'my wife', 'my husband', 'my partner', 'my friend', 'my friends', 'my son', 'my daughter', 'my mom', 'my dad', 'my mother', 'my father', 'my sister', 'my brother', 'my roommate', 'he', 'she', 'they', 'his', 'her', 'their'],
  preferenceVerbs: ['want', 'like', 'enjoy', 'love', 'interested', 'drawn', 'explore'],
};

/**
 * Baseline matching weights. Internal heuristics only—not validated spiritual
 * assessments or probabilities. See docs/04-matching-spec.md.
 */
export const matchingWeights: MatchingWeights = {
  version: 'match-2026.11-v1',
  shrinkage: 1,
  perQuestionCap: 1,
  explicitCurious: 0.35,
  explicitMaybe: 0.15,
  learningWeight: 0.15,
  textWeightPerQuestion: 0.15,
  textMaxTotal: 0.25,
  feedbackFeelsLikeMe: 0.3,
  feedbackCurious: 0.1,
  strongThreshold: 0.3,
  alsoThreshold: 0.18,
  tieEpsilon: 0.02,
  minDistinctQuestionsForStrong: 2,
  minAnsweredForResults: 4,
  broadInterestCount: 4,
  giftThreshold: 0.3,
  maxGiftsShown: 3,
};
