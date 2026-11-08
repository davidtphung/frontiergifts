import type { GiftId, GiftItem, Screen } from './types';

/**
 * Spiritual-gifts inventory v2.
 *
 *  - 21 rated statements: 3 per gift (2 "self", 1 "others"), interleaved so no
 *    screen is about one gift.
 *  - 7 scenarios: every scenario offers exactly one response per gift, in a
 *    varied order, so a pick is a forced choice between gifts.
 *  - No item mentions a team, role, task type, or prior experience in a role.
 *
 * Design rationale per item lives in docs/02-question-bank.md (generated).
 */
export const QUESTION_BANK_VERSION = 'gifts-2026.11-v2';

const item = (id: string, gift: GiftId, text: string, perspective: 'self' | 'others' = 'self'): GiftItem => ({
  id,
  gift,
  text,
  perspective,
});

export const items: Record<string, GiftItem> = Object.fromEntries(
  [
    // Prophecy
    item('pro1', 'prophecy', 'I often sense that God is highlighting something specific about a person or situation.'),
    item('pro2', 'prophecy', 'When I pray, I sometimes receive a picture, phrase, or impression I believe is meant to strengthen someone else.'),
    item('pro3', 'prophecy', 'People have told me that something I sensed and shared helped them hear from God.', 'others'),
    // Serving
    item('ser1', 'serving', 'I notice practical things that need doing and do them without being asked.'),
    item('ser2', 'serving', 'I feel satisfied when something gets done well, even if no one knows I did it.'),
    item('ser3', 'serving', 'Friends often come to me when they need a hand with something practical.', 'others'),
    // Teaching
    item('tea1', 'teaching', 'I enjoy digging into a passage of Scripture until I understand what it really means.'),
    item('tea2', 'teaching', 'When someone is confused, I like finding a clearer way to explain it.'),
    item('tea3', 'teaching', 'People tell me I helped them understand something they had struggled with.', 'others'),
    // Encouragement
    item('enc1', 'encouragement', 'I find myself urging people to keep going when they feel like giving up.'),
    item('enc2', 'encouragement', 'I look for what is good in people and make sure they hear it.'),
    item('enc3', 'encouragement', 'People seek me out when they need hope or perspective.', 'others'),
    // Giving
    item('giv1', 'giving', 'When I see a need, my first instinct is to share what I have—time, belongings, or resources.'),
    item('giv2', 'giving', 'I find deep joy in providing for others, often without anyone knowing.'),
    item('giv3', 'giving', 'Others describe me as generous with my time, home, or belongings.', 'others'),
    // Leadership
    item('lea1', 'leadership', 'When a group lacks direction, I naturally help set a plan and get people moving.'),
    item('lea2', 'leadership', 'I can see how different people’s strengths fit together toward a shared goal.'),
    item('lea3', 'leadership', 'People tend to look to me to guide or organize a group.', 'others'),
    // Mercy
    item('mer1', 'mercy', 'I’m drawn to people who are hurting, lonely, or overlooked.'),
    item('mer2', 'mercy', 'I can stay with someone in their pain without needing to fix it.'),
    item('mer3', 'mercy', 'People often open up to me about what they are going through.', 'others'),
  ].map((i) => [i.id, i]),
);

const rate = (...ids: string[]) => ids.map((id) => items[id]);

export const screens: Screen[] = [
  // ── Chapter 2: What do you notice?
  {
    id: 'r1',
    kind: 'ratings',
    chapter: 'notice',
    prompt: 'How much is each of these like you?',
    helper: 'Think about your everyday life, not just church.',
    items: rate('mer1', 'ser1', 'pro1', 'lea2'),
  },
  {
    id: 's_gathering',
    kind: 'scenario',
    chapter: 'notice',
    storyLine: 'You’re at a gathering with people you mostly know.',
    prompt: 'What do you most often find yourself doing?',
    options: [
      { id: 'a', gift: 'serving', label: 'Helping with whatever needs doing' },
      { id: 'b', gift: 'mercy', label: 'Noticing someone alone or hurting and going to them' },
      { id: 'c', gift: 'teaching', label: 'Getting into a deep conversation about ideas or faith' },
      { id: 'd', gift: 'prophecy', label: 'Quietly praying for people and sensing what God might be doing' },
      { id: 'e', gift: 'leadership', label: 'Making sure things run smoothly and people know what’s next' },
      { id: 'f', gift: 'encouragement', label: 'Building people up in conversation' },
      { id: 'g', gift: 'giving', label: 'Making sure everyone has what they need' },
    ],
  },
  {
    id: 'r2',
    kind: 'ratings',
    chapter: 'notice',
    prompt: 'And these?',
    items: rate('enc2', 'giv1', 'tea2'),
  },
  {
    id: 's_neighbors',
    kind: 'scenario',
    chapter: 'notice',
    storyLine: 'A new family moves in next door.',
    prompt: 'What are you most likely to do first?',
    options: [
      { id: 'a', gift: 'giving', label: 'Bring them a meal or something they might need' },
      { id: 'b', gift: 'encouragement', label: 'Welcome them warmly and tell them you’re glad they’re here' },
      { id: 'c', gift: 'leadership', label: 'Rally a few neighbors to help them settle in' },
      { id: 'd', gift: 'mercy', label: 'Ask how they’re really doing with such a big change' },
      { id: 'e', gift: 'prophecy', label: 'Pray for them and share an encouraging word if you sense one' },
      { id: 'f', gift: 'teaching', label: 'Explain how the neighborhood works—where to go, what to know' },
      { id: 'g', gift: 'serving', label: 'Offer to carry boxes or fix something' },
    ],
  },

  // ── Chapter 3: What brings you to life?
  {
    id: 'r3',
    kind: 'ratings',
    chapter: 'alive',
    prompt: 'How much is each of these like you?',
    items: rate('tea1', 'giv2', 'enc1', 'ser2'),
  },
  {
    id: 's_saturday',
    kind: 'scenario',
    chapter: 'alive',
    storyLine: 'You have a free Saturday and want it to count.',
    prompt: 'Which sounds most life-giving?',
    options: [
      { id: 'a', gift: 'teaching', label: 'Studying a book of the Bible and sharing what I learn' },
      { id: 'b', gift: 'prophecy', label: 'Extended time in prayer, listening to God' },
      { id: 'c', gift: 'mercy', label: 'Visiting someone who is lonely or unwell' },
      { id: 'd', gift: 'serving', label: 'Helping someone with a practical project' },
      { id: 'e', gift: 'giving', label: 'Finding a need and meeting it generously' },
      { id: 'f', gift: 'encouragement', label: 'Catching up with friends who need a boost' },
      { id: 'g', gift: 'leadership', label: 'Planning something that brings people together' },
    ],
  },
  {
    id: 'r4',
    kind: 'ratings',
    chapter: 'alive',
    prompt: 'And these?',
    items: rate('lea1', 'pro2', 'mer2'),
  },

  // ── Chapter 4: How do you care?
  {
    id: 's_friend',
    kind: 'scenario',
    chapter: 'care',
    storyLine: 'A friend tells you they’re having a hard week.',
    prompt: 'What’s your most natural first response?',
    helper: 'Each of these is a good way to care.',
    options: [
      { id: 'a', gift: 'encouragement', label: 'Remind them of hope and cheer them on' },
      { id: 'b', gift: 'serving', label: 'Do something practical—a meal, an errand' },
      { id: 'c', gift: 'prophecy', label: 'Ask the Lord how to encourage them, then share it gently' },
      { id: 'd', gift: 'mercy', label: 'Listen, and stay with them in it' },
      { id: 'e', gift: 'leadership', label: 'Help them make a plan and rally support' },
      { id: 'f', gift: 'teaching', label: 'Share something from Scripture that helped you' },
      { id: 'g', gift: 'giving', label: 'Quietly provide something they need' },
    ],
  },
  {
    id: 's_stalled',
    kind: 'scenario',
    chapter: 'care',
    storyLine: 'A group you’re part of has stalled on something important.',
    prompt: 'What do you find yourself doing?',
    options: [
      { id: 'a', gift: 'leadership', label: 'Suggest a plan and help organize people' },
      { id: 'b', gift: 'giving', label: 'Bring whatever is needed so the group can move' },
      { id: 'c', gift: 'teaching', label: 'Explain the goal clearly again' },
      { id: 'd', gift: 'encouragement', label: 'Encourage everyone to keep going' },
      { id: 'e', gift: 'mercy', label: 'Check how people are really doing' },
      { id: 'f', gift: 'prophecy', label: 'Pause to pray and share what you sense God is highlighting' },
      { id: 'g', gift: 'serving', label: 'Pick up the task no one wants' },
    ],
  },
  {
    id: 's_passage',
    kind: 'scenario',
    chapter: 'care',
    storyLine: 'A Bible passage you’re reading really stands out to you.',
    prompt: 'What do you most want to do with it?',
    options: [
      { id: 'a', gift: 'mercy', label: 'Think of someone hurting whom it could comfort' },
      { id: 'b', gift: 'teaching', label: 'Study it more deeply and explain it to someone' },
      { id: 'c', gift: 'serving', label: 'Put it into practice in a concrete way today' },
      { id: 'd', gift: 'prophecy', label: 'Ask what God is saying through it right now, for me or someone else' },
      { id: 'e', gift: 'giving', label: 'Let it shape how I share what I have' },
      { id: 'f', gift: 'encouragement', label: 'Send it to someone who needs it' },
      { id: 'g', gift: 'leadership', label: 'Consider how it could shape the direction of a group I’m part of' },
    ],
  },

  // ── Chapter 5: How do others see you?
  {
    id: 'r5',
    kind: 'ratings',
    chapter: 'others',
    prompt: 'How true are these of you, from others’ point of view?',
    helper: 'If you’re not sure what others would say, choose “Not sure.”',
    items: rate('ser3', 'enc3', 'mer3', 'pro3'),
  },
  {
    id: 's_thanks',
    kind: 'scenario',
    chapter: 'others',
    storyLine: 'Someone thanks you for being part of their life.',
    prompt: 'Which words would mean the most to you?',
    options: [
      { id: 'a', gift: 'mercy', label: '“You made me feel truly cared for.”' },
      { id: 'b', gift: 'leadership', label: '“You helped us get where we needed to go.”' },
      { id: 'c', gift: 'giving', label: '“You were so generous to me.”' },
      { id: 'd', gift: 'teaching', label: '“You helped me finally understand.”' },
      { id: 'e', gift: 'prophecy', label: '“You helped me hear from God.”' },
      { id: 'f', gift: 'serving', label: '“You were there with a helping hand.”' },
      { id: 'g', gift: 'encouragement', label: '“You gave me hope to keep going.”' },
    ],
  },
  {
    id: 'r6',
    kind: 'ratings',
    chapter: 'others',
    prompt: 'And these?',
    items: rate('lea3', 'giv3', 'tea3'),
  },
];

export const screenById = Object.fromEntries(screens.map((s) => [s.id, s])) as Record<string, Screen>;
export const allItems = Object.values(items);
export const scenarios = screens.filter((s): s is Extract<Screen, { kind: 'scenario' }> => s.kind === 'scenario');
