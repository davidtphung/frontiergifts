import type { Gift, GiftId, Team, TeamId } from './types';

/** Ministry source of truth for this project. Edit descriptions here. */
export const teams: Team[] = [
  {
    id: 'tech',
    name: 'Tech and AV',
    heart: 'Serve the church through thoughtful technology, sound, media, and production.',
    shortDescription:
      'Help reveal Jesus through thoughtful sound, media, and production. Bring a heart for software, hardware, and equipment, along with a willingness to learn and grow. Help create a seamless, high-quality church experience for those gathering in person and joining through the livestream.',
    includes: [
      'Software and hardware',
      'Care for equipment',
      'Sound quality and sound design',
      'Media and slides',
      'Livestreaming',
      'Thoughtful troubleshooting',
      'Supporting people in the room and online',
      'Collaborating with Worship and other teams',
      'Keeping people, not technology, at the center',
    ],
    giftConnections: ['serving', 'leadership', 'encouragement'],
    distinctions: [
      'Technical interest and technical experience are separate signals. Curious beginners are welcome.',
    ],
    defaultFirstStep: 'Connect with the team to explore a first step—like watching a sound check or a livestream run.',
    configuredOpportunities: [],
  },
  {
    id: 'welcome',
    name: 'Welcome Team',
    heart: 'Be a personal expression of Frontier’s hospitality.',
    shortDescription:
      'Be an expression of Frontier’s hospitality. Welcome people warmly, offer practical help, and build connections so that every person feels seen and invited into the life of our church.',
    includes: [
      'Warm greetings and genuine interest',
      'Noticing newcomers and caring for regulars',
      'Noticing people who seem uncertain or alone',
      'Helping people navigate the campus',
      'Connecting families with Kids Ministry',
      'Moving beyond greeting toward belonging',
      'Welcoming without overwhelming',
    ],
    giftConnections: ['encouragement', 'mercy', 'serving', 'leadership'],
    distinctions: [
      'Hospitality is not the same as extroversion. Quiet, attentive people can be excellent at welcoming.',
    ],
    defaultFirstStep: 'Connect with the team to explore a first step—like shadowing a welcomer for one Sunday.',
    configuredOpportunities: [],
  },
  {
    id: 'setup',
    name: 'Setup and Breakdown Team',
    heart: 'Care for the campus and prepare the spaces where the church gathers.',
    shortDescription:
      'Prepare the space, care for the campus, and help make Sundays seamless. Serve the Body of Christ through the practical details that make Frontier welcoming, ready, and cared for—from setup to breakdown.',
    includes: [
      'Setup and breakdown',
      'Furniture, signage, and equipment',
      'Preparing ministry spaces',
      'Orderly, welcoming environments',
      'Campus care and shared-space stewardship',
      'Coordinating with other teams for smooth transitions',
      'Restoring spaces after gatherings',
    ],
    giftConnections: ['serving', 'leadership'],
    distinctions: [
      'Not every role requires heavy lifting—organization, signage, coordination, and prep matter too.',
    ],
    defaultFirstStep: 'Connect with the team to explore a first step—there are roles that don’t involve heavy lifting.',
    configuredOpportunities: [],
  },
  {
    id: 'worship',
    name: 'Worship',
    heart: 'Help lead the church in worship that is rooted in the Word of God and attentive to the Lord.',
    shortDescription:
      'Help lead the church in worship that is rooted in God’s Word and attentive to His presence. Bring musical preparation, a servant’s heart, and a willingness to listen to the Lord and grow in prophetic sensitivity under pastoral guidance.',
    includes: [
      'Musical and spiritual preparation',
      'Scripture and prayer',
      'Listening to the Lord',
      'Growing in prophetic sensitivity under pastoral guidance',
      'Encouraging congregational participation',
      'Serving rather than centering the platform',
      'Teamwork, humility, and musical growth',
      'Collaborating with Tech and AV',
    ],
    giftConnections: ['encouragement', 'serving', 'leadership', 'teaching', 'prophecy'],
    distinctions: [
      'Musical skill is tracked separately; it is not one of the Romans 12 gifts.',
      'This tool cannot verify a prophetic gift or certify anyone for worship leadership.',
    ],
    defaultFirstStep: 'Connect with the worship leaders to explore a first step and talk through how the team prepares.',
    placementRequirements:
      'Joining the worship team follows Frontier’s pastoral guidance and team process. [Frontier to confirm wording]',
    configuredOpportunities: [],
  },
  {
    id: 'kids',
    name: 'Kids Ministry',
    heart: 'We believe there is no junior Holy Spirit.',
    shortDescription:
      'We believe there is no junior Holy Spirit. Help children know Jesus, become rooted in God’s Word, listen to the Lord, and grow in their spiritual gifts. Through teaching, worship, prayer, and caring relationships, partner with families to build a safe, welcoming environment where children belong and actively participate in the Body of Christ.',
    includes: [
      'Helping children build a faith of their own',
      'Age-appropriate biblical teaching',
      'Worship, prayer, and listening to the Lord with children',
      'Recognizing and growing in spiritual gifts',
      'Patient care, encouragement, and meaningful relationships',
      'Partnering with parents and families',
      'Safe, welcoming environments',
    ],
    giftConnections: ['teaching', 'encouragement', 'mercy', 'serving', 'leadership', 'prophecy'],
    distinctions: [
      'Children are part of the church today, not only the church of tomorrow.',
      'A suggestion here is not approval to work with children.',
    ],
    defaultFirstStep: 'Connect with the Kids Ministry team to learn about first steps.',
    placementRequirements:
      'Serving with children follows Frontier’s safeguarding, screening, and training process before any placement. [Frontier to confirm the exact requirements]',
    configuredOpportunities: [],
  },
  {
    id: 'prayer',
    name: 'Prayer Ministry',
    heart: 'Care for the Body of Christ through compassionate listening, prayer, and encouragement.',
    shortDescription:
      'Care for the Body of Christ through prayer, compassionate listening, and encouragement. Listen to the Lord, remain grounded in His Word, and help people bring their needs before God in a welcoming, caring environment.',
    includes: [
      'Listening with patience and respect',
      'Prayer grounded in Scripture',
      'Encouragement without pressure',
      'Prophetic sensitivity under pastoral guidance',
      'Respecting boundaries and confidentiality',
      'Connecting people with pastoral support',
      'Behind-the-scenes intercession',
    ],
    giftConnections: ['mercy', 'encouragement', 'serving', 'prophecy'],
    distinctions: [
      'Praying aloud confidently is not a measure of maturity. Quiet, faithful intercession is meaningful service.',
    ],
    defaultFirstStep: 'Connect with the prayer team to explore a first step—including behind-the-scenes intercession.',
    placementRequirements:
      'Praying with others follows Frontier’s prayer-team guidance on confidentiality and pastoral care. [Frontier to confirm]',
    configuredOpportunities: [],
  },
];

export const gifts: Gift[] = [
  {
    id: 'prophecy',
    name: 'Prophecy',
    reference: 'Romans 12:6',
    paraphrase: 'Sharing what God may be saying, in proportion to faith.',
    acrossTeams: 'Often grows through prayer and Scripture, and is tested under pastoral guidance.',
  },
  {
    id: 'serving',
    name: 'Serving',
    reference: 'Romans 12:7',
    paraphrase: 'Meeting practical needs so the Body can flourish.',
    acrossTeams: 'Shows up on every team—often in the details no one sees.',
  },
  {
    id: 'teaching',
    name: 'Teaching',
    reference: 'Romans 12:7',
    paraphrase: 'Helping others understand and live God’s truth.',
    acrossTeams: 'Can serve children, new team members, and the wider church.',
  },
  {
    id: 'encouragement',
    name: 'Encouragement',
    reference: 'Romans 12:8',
    paraphrase: 'Strengthening and urging others on in faith.',
    acrossTeams: 'Lifts teams and congregations alike.',
  },
  {
    id: 'giving',
    name: 'Giving',
    reference: 'Romans 12:8',
    paraphrase: 'Sharing generously and with sincerity.',
    acrossTeams:
      'Not tied to income or to one team. Generosity of time, home, skill, and resources can strengthen every area.',
  },
  {
    id: 'leadership',
    name: 'Leadership',
    reference: 'Romans 12:8',
    paraphrase: 'Leading with diligence and care for others.',
    acrossTeams: 'Helps teams coordinate, grow, and serve well together.',
  },
  {
    id: 'mercy',
    name: 'Mercy',
    reference: 'Romans 12:8',
    paraphrase: 'Showing compassion, with cheerfulness.',
    acrossTeams: 'Notices and stays with people who are hurting or alone.',
  },
];

export const teamById = Object.fromEntries(teams.map((t) => [t.id, t])) as Record<TeamId, Team>;
export const giftById = Object.fromEntries(gifts.map((g) => [g.id, g])) as Record<GiftId, Gift>;
