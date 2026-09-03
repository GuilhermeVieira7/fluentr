/* FLUENTR — curriculum.js
   The Path: 8 units, each with 2 lessons + a Challenge (dynamically
   assembled review of that unit's own exercises — no separate authoring
   needed). Exercises live in lessons.js, tagged unit/lesson. */

window.WL_CURRICULUM = [
  { id: 'u1', name: 'Speak Naturally', tagline: 'The basics, without the textbook feel.', lessons: [
    { id: 'u1-l1', name: 'Introductions & greetings' },
    { id: 'u1-l2', name: 'Small talk basics' }
  ], challenge: { id: 'u1-c', name: 'Speak Naturally Review' } },

  { id: 'u2', name: 'Everyday Work', tagline: 'The English you need before 9am.', lessons: [
    { id: 'u2-l1', name: 'Asking for help' },
    { id: 'u2-l2', name: 'Giving quick updates' }
  ], challenge: { id: 'u2-c', name: 'Everyday Work Review' } },

  { id: 'u3', name: 'Meetings', tagline: 'Join, contribute, and close with confidence.', lessons: [
    { id: 'u3-l1', name: 'Joining & giving updates' },
    { id: 'u3-l2', name: 'Disagreeing & closing politely' }
  ], challenge: { id: 'u3-c', name: 'Meeting Simulation', kind: 'simulator', simulatorId: 'sim-weekly-meeting' } },

  { id: 'u4', name: 'Professional Writing', tagline: 'Emails and messages that land well.', lessons: [
    { id: 'u4-l1', name: 'Professional emails' },
    { id: 'u4-l2', name: 'Instant messages' }
  ], challenge: { id: 'u4-c', name: 'Professional Writing Review' } },

  { id: 'u5', name: 'Handling Problems', tagline: 'Delays, disagreements, and difficult moments.', lessons: [
    { id: 'u5-l1', name: 'Explaining delays' },
    { id: 'u5-l2', name: 'Escalating & disagreeing' }
  ], challenge: { id: 'u5-c', name: 'Handling Problems Review' } },

  { id: 'u6', name: 'Interviews', tagline: 'Walk in ready.', lessons: [
    { id: 'u6-l1', name: 'Tell me about yourself' },
    { id: 'u6-l2', name: 'Strengths, weaknesses & goals' }
  ], challenge: { id: 'u6-c', name: 'Interview Simulation', kind: 'simulator', simulatorId: 'sim-interview-general' } },

  { id: 'u7', name: 'Technology', tagline: 'Support, infra & cloud, in English.', lessons: [
    { id: 'u7-l1', name: 'Service Desk essentials' },
    { id: 'u7-l2', name: 'Cloud & incidents' }
  ], challenge: { id: 'u7-c', name: 'Technology Review' } },

  { id: 'u8', name: 'Advanced Communication', tagline: 'Negotiation, tone, and executive presence.', lessons: [
    { id: 'u8-l1', name: 'Negotiation & deadlines' },
    { id: 'u8-l2', name: 'Tone & presentations' }
  ], challenge: { id: 'u8-c', name: 'Advanced Communication Review' } },

  { id: 'u9', name: 'Travel & Emergencies', tagline: 'Airports, hotels, and asking for help abroad.', lessons: [
    { id: 'u9-l1', name: 'At the airport & hotel' },
    { id: 'u9-l2', name: 'Emergencies & asking for help' }
  ], challenge: { id: 'u9-c', name: 'Travel & Emergencies Review' } }
];
