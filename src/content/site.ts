import type { Chapter, SiteConfig } from './types';

/**
 * Identity language is project-provided ministry copy, not independently
 * verified official quotations. Edit freely; nothing in the engine depends
 * on the wording here.
 */
export const site: SiteConfig = {
  title: 'Find Your Place at Frontier',
  alternativeTitle: 'Your Part in the Story',
  wordmark: 'FRØNTIER',
  tagline: 'Revealing the beauty of Jesus at the frontiers of culture.',
  sharedHeart:
    'We serve because we belong to one another in Christ. Every welcome, prepared space, sound check, song, lesson, and prayer is an opportunity to give back to His Body. Together, we practice hospitality, make room for God’s presence, and serve Frontier’s calling: revealing the beauty of Jesus at the frontiers of culture.',
  together: [
    'Practice hospitality',
    'Welcome others',
    'Care for the Body of Christ',
    'Make room for people to belong and participate',
    'Bring skills, gifts, generosity, and a willingness to learn',
    'Serve, seen or behind the scenes',
  ],
  closingInvitation:
    'You have a story. You have something to bring. You do not have to have everything figured out. Let’s discover a meaningful place to begin, together.',
  thread: 'You arrive. You notice. You respond. You help make room.',
  scriptureNote:
    'Gift names follow Romans 12:6–8. Descriptions are paraphrases, not quotations.',
  privacyNotice: [
    'Your answers stay in this browser tab. Nothing is sent anywhere.',
    'Answer from your everyday life—not who you think you should be.',
    'You can skip any statement or question.',
    'No name or contact details are asked for.',
  ],
  retentionNote:
    'Prototype: nothing is stored on a server. “Save on this device” keeps answers only in this browser until you clear them.',
  estimatedMinutes: 'About 6–8 minutes (estimate, not yet measured)',
};

export const chapters: Chapter[] = [
  {
    id: 'belong',
    number: 1,
    title: 'You belong in the story',
    thread: 'You arrive.',
    transition:
      'This isn’t a test, and there are no wrong answers. It’s a short reflection on how God has shaped you to build up His Body.',
  },
  {
    id: 'notice',
    number: 2,
    title: 'What do you notice?',
    thread: 'You notice.',
    transition: 'Sometimes hospitality begins before anyone reaches the door. Start with what you tend to see.',
  },
  {
    id: 'alive',
    number: 3,
    title: 'What brings you to life?',
    thread: 'You notice.',
    transition: 'The things that energize you often point to how God has gifted you.',
  },
  {
    id: 'care',
    number: 4,
    title: 'How do you care?',
    thread: 'You respond.',
    transition: 'A few everyday moments. Pick the response that comes most naturally—not the one that sounds best.',
  },
  {
    id: 'others',
    number: 5,
    title: 'How do others see you?',
    thread: 'You help make room.',
    transition: 'Gifts are often clearest to the people around us. Think about what friends and family would say.',
  },
  {
    id: 'begin',
    number: 6,
    title: 'A place to begin',
    thread: 'You help make room.',
    transition: 'Here is how your gifts could build up the Body at Frontier.',
  },
];
