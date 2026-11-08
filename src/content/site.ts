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
    'Gift names follow Romans 12:6–8. Descriptions here are paraphrases, not quotations.',
  privacyNotice: [
    'Your answers stay in this browser tab. Nothing is sent anywhere unless you review it and choose to share.',
    'You can skip any reflective question.',
    'Please don’t share private prayer requests, health details, or anything you’d rather keep personal—none of it is needed.',
    'No contact details are needed to see your results.',
  ],
  submissionEndpoint: null,
  askAgeBeforeContact: true,
  minorContactMessage:
    'Thanks for exploring! If you’re under 18, please talk with a parent or guardian and a Frontier leader about serving—they’ll help you take a next step.',
  retentionNote:
    'Prototype: nothing is stored on a server. “Save on this device” keeps answers only in this browser until you clear them.',
  estimatedMinutes: 'About 5–8 minutes (estimate, not yet measured)',
};

export const chapters: Chapter[] = [
  {
    id: 'belong',
    number: 1,
    title: 'You belong in the story',
    thread: 'You arrive.',
    transition:
      'This isn’t a test, and there are no wrong answers. It’s a short conversation to help you imagine where you might contribute.',
  },
  {
    id: 'notice',
    number: 2,
    title: 'What do you notice?',
    thread: 'You notice.',
    transition: 'Sometimes hospitality begins before anyone reaches the door.',
  },
  {
    id: 'alive',
    number: 3,
    title: 'What brings you to life?',
    thread: 'You notice.',
    transition:
      'A clear microphone, a prepared room, and a warm welcome can all help make space for someone else.',
  },
  {
    id: 'care',
    number: 4,
    title: 'How do you care?',
    thread: 'You respond.',
    transition: 'Listening can be a way of serving. So can a meal, a lesson, or a quiet prayer.',
  },
  {
    id: 'next',
    number: 5,
    title: 'What could your next step look like?',
    thread: 'You help make room.',
    transition: 'No commitment here. Just a few practical questions so the next step fits your life.',
  },
  {
    id: 'begin',
    number: 6,
    title: 'A place to begin',
    thread: 'You help make room.',
    transition: 'Here are a few places your story could connect.',
  },
];
