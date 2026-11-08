import type { Gift, GiftId, Team, TeamId } from './types';

/**
 * Gift → team relevance weights (0–1). These are proposed ministry
 * applications agreed by the team, NOT scriptural assignments. Every gift can
 * contribute anywhere; the weights say where a gift is most central.
 */
export const giftTeamWeights: Record<TeamId, Partial<Record<GiftId, number>>> = {
  tech: { serving: 1, leadership: 0.6, encouragement: 0.3, giving: 0.2 },
  welcome: { encouragement: 1, mercy: 0.8, serving: 0.5, giving: 0.4, leadership: 0.3 },
  setup: { serving: 1, leadership: 0.7, giving: 0.3 },
  worship: { prophecy: 0.9, encouragement: 0.8, teaching: 0.5, leadership: 0.5, serving: 0.4 },
  kids: { teaching: 1, encouragement: 0.7, mercy: 0.6, serving: 0.4, leadership: 0.4, prophecy: 0.3 },
  prayer: { mercy: 1, prophecy: 0.9, encouragement: 0.7, serving: 0.3 },
};

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
    inPractice: 'Attentive to the Lord; often senses what God is highlighting and shares it to strengthen others—tested and grown under pastoral guidance.',
  },
  {
    id: 'serving',
    name: 'Serving',
    reference: 'Romans 12:7',
    paraphrase: 'Meeting practical needs so the Body can flourish.',
    inPractice: 'Notices what needs doing and quietly does it; finds joy in the details others overlook.',
  },
  {
    id: 'teaching',
    name: 'Teaching',
    reference: 'Romans 12:7',
    paraphrase: 'Helping others understand and live God’s truth.',
    inPractice: 'Loves digging into Scripture and making it clear, so others understand and grow.',
  },
  {
    id: 'encouragement',
    name: 'Encouragement',
    reference: 'Romans 12:8',
    paraphrase: 'Strengthening and urging others on in faith.',
    inPractice: 'Sees the good in people, speaks hope, and helps others keep going.',
  },
  {
    id: 'giving',
    name: 'Giving',
    reference: 'Romans 12:8',
    paraphrase: 'Sharing generously and with sincerity.',
    inPractice: 'Quick to share time, home, and resources so others are provided for. Not about the size of a gift or income.',
  },
  {
    id: 'leadership',
    name: 'Leadership',
    reference: 'Romans 12:8',
    paraphrase: 'Leading with diligence and care for others.',
    inPractice: 'Sees where a group needs to go and helps people move there together.',
  },
  {
    id: 'mercy',
    name: 'Mercy',
    reference: 'Romans 12:8',
    paraphrase: 'Showing compassion, with cheerfulness.',
    inPractice: 'Drawn to people who are hurting or overlooked, and able to stay with them in it.',
  },
];

export const teamById = Object.fromEntries(teams.map((t) => [t.id, t])) as Record<TeamId, Team>;
export const giftById = Object.fromEntries(gifts.map((g) => [g.id, g])) as Record<GiftId, Gift>;
