/**
 * Synthetic participant fixtures. None of these are real people.
 */
import type { TeamId } from '../content/types';
import type { AnswerValue, Answers, FeedbackMap, TeamPref } from '../engine/types';

export const choice = (...ids: string[]): AnswerValue => ({ kind: 'choice', ids });
export const scale = (value: number | null): AnswerValue => ({ kind: 'scale', value });
export const text = (t: string): AnswerValue => ({ kind: 'text', text: t });
export const prefs = (p: Partial<Record<TeamId, TeamPref>>): AnswerValue => ({ kind: 'teamPrefs', prefs: p });
export const skipped: AnswerValue = { kind: 'skipped' };

export interface Persona {
  id: number;
  name: string;
  answers: Answers;
  deeper?: boolean;
  feedback?: FeedbackMap;
}

export const personas: Record<string, Persona> = {
  techBeginner: {
    id: 1,
    name: 'Technically curious beginner with no experience',
    answers: {
      c1_familiarity: choice('few'),
      c2_arrive: choice('mic', 'ask'),
      c2_notice: choice('sound'),
      c3_energy: choice('fixing', 'software', 'quiet_work'),
      c3_tech_curiosity: scale(4),
      c3_useful: text('figure out how things work'),
      c4_friend: choice('practical'),
      c4_gifts: choice('serving'),
      f_tech_comfort: scale(0),
      c5_explore: prefs({ tech: 'curious' }),
      c5_readiness: choice('training'),
      c5_frequency: choice('twice'),
    },
  },
  musicianOffPlatform: {
    id: 2,
    name: 'Experienced musician who does not want platform ministry',
    answers: {
      c1_familiarity: choice('home'),
      c2_arrive: choice('song', 'room'),
      c2_notice: choice('sound'),
      c3_energy: choice('music', 'organizing'),
      c3_tech_curiosity: scale(2),
      c4_friend: choice('encourage'),
      c4_gifts: choice('encouragement', 'serving'),
      f_music: choice('instrument', 'off_platform', 'sound'),
      c5_explore: prefs({ tech: 'maybe', setup: 'maybe' }),
      c5_readiness: choice('ready'),
      c5_frequency: choice('monthly'),
    },
  },
  quietWelcomer: {
    id: 3,
    name: 'Quiet person who enjoys one-to-one hospitality',
    answers: {
      c2_arrive: choice('unsure'),
      c2_notice: choice('alone'),
      c3_energy: choice('one_on_one', 'quiet_work'),
      c3_tech_curiosity: scale(0),
      c4_friend: choice('listen'),
      c4_gifts: choice('mercy', 'encouragement'),
      f_welcome: choice('quiet'),
      c5_readiness: choice('observe'),
      c5_frequency: choice('monthly'),
    },
  },
  organizerNoLifting: {
    id: 4,
    name: 'Likes organization but cannot do heavy lifting',
    deeper: true,
    answers: {
      c2_arrive: choice('room', 'ask'),
      c2_notice: choice('details'),
      c3_energy: choice('organizing'),
      c3_tech_curiosity: scale(1),
      c4_friend: choice('rally'),
      c4_gifts: choice('leadership', 'serving'),
      f_setup: choice('signage', 'coordinate', 'light'),
      c5_readiness: choice('ready'),
      c5_frequency: choice('weekly'),
      d_support: choice('no_lifting', 'seated'),
    },
  },
  adultTeacher: {
    id: 5,
    name: 'Drawn to teaching adults but not working with children',
    answers: {
      c2_arrive: choice('song', 'ask'),
      c2_notice: choice('engaged'),
      c3_energy: choice('explaining', 'one_on_one'),
      c3_tech_curiosity: scale(1),
      c4_friend: choice('scripture'),
      c4_gifts: choice('teaching', 'encouragement'),
      c4_story: text('I love teaching adults in a Bible study, not working with kids.'),
      c5_readiness: choice('ready'),
    },
  },
  kidsEnthusiast: {
    id: 6,
    name: 'Excited to help children pray and understand Scripture',
    answers: {
      c2_arrive: choice('child', 'pray'),
      c2_notice: choice('kids'),
      c3_energy: choice('kids_play', 'explaining', 'praying'),
      c3_tech_curiosity: scale(0),
      c3_useful: text('help kids understand the Bible'),
      c4_friend: choice('scripture'),
      c4_gifts: choice('teaching', 'encouragement'),
      c4_story: text('I love helping children pray and understand Scripture.'),
      f_kids: choice('bible', 'worship_prayer'),
      c5_explore: prefs({ kids: 'curious' }),
      c5_readiness: choice('training'),
    },
  },
  privateIntercessor: {
    id: 7,
    name: 'Prefers private intercession to praying aloud',
    answers: {
      c2_arrive: choice('pray'),
      c2_notice: choice('hurting'),
      c3_energy: choice('praying', 'quiet_work'),
      c3_tech_curiosity: scale(0),
      c4_friend: choice('pray'),
      c4_gifts: choice('mercy'),
      f_prayer: choice('private'),
      c5_readiness: choice('ready'),
    },
  },
  generousLimited: {
    id: 8,
    name: 'Generous with resources, limited Sunday availability',
    answers: {
      c2_arrive: choice('ask', 'room'),
      c2_notice: choice('details'),
      c3_energy: choice('organizing'),
      c3_tech_curiosity: scale(null),
      c4_friend: choice('provide'),
      c4_gifts: choice('giving', 'serving'),
      f_giving: choice('meet_need'),
      c5_readiness: choice('ready'),
      c5_frequency: choice('occasional'),
    },
  },
  multiInterest: {
    id: 9,
    name: 'Interested in several teams',
    answers: {
      c2_arrive: choice('unsure', 'mic'),
      c2_notice: choice('engaged'),
      c3_energy: choice('music', 'meeting', 'organizing'),
      c3_tech_curiosity: scale(3),
      c4_friend: choice('encourage'),
      c4_gifts: choice('encouragement', 'serving', 'leadership'),
      c5_explore: prefs({ tech: 'curious', welcome: 'curious', setup: 'curious', worship: 'curious', prayer: 'maybe' }),
      c5_readiness: choice('ready'),
    },
  },
  unsureObserver: {
    id: 10,
    name: 'Unsure and wants to observe first',
    answers: {
      c1_familiarity: choice('new'),
      c2_arrive: choice('observe'),
      c2_notice: choice('taking_in'),
      c3_tech_curiosity: scale(null),
      c4_gifts: choice('unsure'),
      f_clarify: choice('observe'),
      c5_readiness: choice('observe'),
      c5_frequency: choice('unsure'),
    },
  },
};

/** Persona 11: same as tech beginner but every open-text question skipped. */
export const noTextPersona: Answers = Object.fromEntries(
  Object.entries(personas.techBeginner.answers).map(([k, v]) => [k, v.kind === 'text' ? skipped : v]),
);
