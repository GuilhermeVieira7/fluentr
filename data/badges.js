/* FLUENTR — Badge definitions.
   check(stats, profile, ctx) — stats from gamification.buildStats(profile);
   ctx carries couple-derived signals when relevant: { coupleStreak, bothPerfectToday }. */

window.WL_BADGES = [
  // ---- Consistency ----
  { id: 'first-step', name: 'First Step', description: 'Complete your first lesson.', icon: 'footprints', rarity: 'common', check: (s, p) => p.counters.lessonsCompleted >= 1 },
  { id: 'on-fire', name: 'On Fire', description: 'Reach a 7-day streak.', icon: 'flame', rarity: 'common', check: (s) => s.bestStreak >= 7 },
  { id: 'unstoppable', name: 'Unstoppable', description: 'Reach a 30-day streak.', icon: 'flame', rarity: 'rare', check: (s) => s.bestStreak >= 30 },
  { id: 'century', name: 'Century', description: 'Study on 100 different days.', icon: 'calendar', rarity: 'epic', check: (s, p) => p.streak.activeDates.length >= 100 },

  // ---- Business ----
  // NOTE: unit ids match data/curriculum.js (u1..u8) — u3 is "Meetings", u4 is "Professional Writing".
  { id: 'meeting-ready', name: 'Meeting Ready', description: 'Complete 20 activities in the Meetings unit.', icon: 'users', rarity: 'common', check: (s, p) => (p.unitActivity['u3'] || 0) >= 20 },
  { id: 'professional-communicator', name: 'Professional Communicator', description: 'Complete 60 Business English activities (Meetings + Professional Writing).', icon: 'briefcase', rarity: 'rare', check: (s, p) => ((p.unitActivity['u3'] || 0) + (p.unitActivity['u4'] || 0)) >= 60 },
  { id: 'inbox-zero', name: 'Inbox Zero', description: 'Complete 30 Write Better exercises.', icon: 'mail', rarity: 'rare', check: (s, p) => p.pillarActivity.writing >= 30 },

  // ---- Technology ----
  // u7 ("Technology") is the only Path unit covering IT — lesson-level tracking doesn't
  // exist in the data model, so these three are staggered thresholds on the same unit.
  { id: 'tech-talker', name: 'Tech Talker', description: 'Complete 30 Technical English scenarios.', icon: 'terminal', rarity: 'common', check: (s, p) => p.pillarActivity.technical >= 30 },
  { id: 'troubleshooter', name: 'Troubleshooter', description: 'Complete 15 Technology unit activities.', icon: 'wrench', rarity: 'rare', check: (s, p) => (p.unitActivity['u7'] || 0) >= 15 },
  { id: 'cloud-speaker', name: 'Cloud Speaker', description: 'Complete 25 Technology unit activities.', icon: 'cloud', rarity: 'rare', check: (s, p) => (p.unitActivity['u7'] || 0) >= 25 },
  { id: 'incident-commander', name: 'Incident Commander', description: 'Complete 20 Technical English scenarios and 10 Technology unit activities.', icon: 'alert', rarity: 'epic', check: (s, p) => p.pillarActivity.technical >= 20 && (p.unitActivity['u7'] || 0) >= 10 },

  // ---- Brazilian Traps ----
  { id: 'no-more-doubts', name: 'No More Doubts', description: 'Review the "question vs. doubt" trap.', icon: 'check', rarity: 'common', check: (s, p) => !!p.exerciseStats['trap-002'] },
  { id: 'stop-translating', name: 'Stop Translating', description: 'Review 40 Brazilian English Traps.', icon: 'languages', rarity: 'rare', check: (s, p) => p.pillarActivity.traps >= 40 },
  { id: 'natural-speaker', name: 'Natural Speaker', description: 'Review 80 Brazilian English Traps.', icon: 'spark', rarity: 'epic', check: (s, p) => p.pillarActivity.traps >= 80 },

  // ---- SOS / Say / general ----
  { id: 'sos-ready', name: 'SOS Ready', description: 'Complete your first English SOS pack.', icon: 'bolt', rarity: 'common', check: (s, p) => p.pillarActivity.sos >= 1 },
  { id: 'always-ready', name: 'Always Ready', description: 'Complete 15 English SOS packs.', icon: 'bolt', rarity: 'rare', check: (s, p) => p.pillarActivity.sos >= 15 },
  { id: 'quick-thinker', name: 'Quick Thinker', description: 'Look up 25 "What Should I Say?" situations.', icon: 'message', rarity: 'common', check: (s, p) => p.pillarActivity.say >= 25 },

  // ---- Progression ----
  { id: 'level-10', name: 'Double Digits', description: 'Reach Level 10.', icon: 'trending-up', rarity: 'common', check: (s) => s.level >= 10 },
  { id: 'level-25', name: 'Deep Focus', description: 'Reach Level 25.', icon: 'trending-up', rarity: 'rare', check: (s) => s.level >= 25 },
  { id: 'level-40', name: 'Fluent Momentum', description: 'Reach Level 40.', icon: 'trending-up', rarity: 'epic', check: (s) => s.level >= 40 },
  { id: 'hundred-words', name: '100 Words Learned', description: 'Save 100 phrases to your Phrasebook.', icon: 'book', rarity: 'rare', check: (s) => s.vocabCount >= 100 },
  { id: 'perfect-lesson', name: 'Perfect Lesson', description: 'Complete a lesson with 100% accuracy.', icon: 'target', rarity: 'common', check: (s, p) => p.counters.perfectLessons >= 1 },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Complete 10 lessons with 100% accuracy.', icon: 'target', rarity: 'epic', check: (s, p) => p.counters.perfectLessons >= 10 },
  { id: 'interview-ready', name: 'Interview Ready', description: 'Complete 32 activities in the Interviews unit.', icon: 'mic', rarity: 'rare', check: (s, p) => (p.unitActivity['u6'] || 0) >= 32 },
  { id: 'sharp-mind', name: 'Sharp Mind', description: 'Reach 90% accuracy over at least 80 answers.', icon: 'target', rarity: 'epic', check: (s) => s.totalAnswered >= 80 && s.accuracy >= 0.9 },

  // ---- Couple ----
  { id: 'first-duel', name: 'First Duel', description: 'Complete your first Duel.', icon: 'swords', rarity: 'common', check: (s, p) => p.counters.duelsPlayed >= 1 },
  { id: 'champion', name: 'Champion', description: 'Win your first Weekly Duel.', icon: 'trophy', rarity: 'rare', check: (s, p) => p.counters.duelsWon >= 1 },
  { id: 'dominating', name: 'Dominating', description: 'Win 3 duels.', icon: 'trophy', rarity: 'epic', check: (s, p) => p.counters.duelsWon >= 3 },
  { id: 'power-couple', name: 'Power Couple', description: 'Reach a 14-day Couple Streak.', icon: 'heart', rarity: 'epic', check: (s, p, ctx) => (ctx.coupleStreak || 0) >= 14 },
  { id: 'english-duo', name: 'English Duo', description: 'Complete 100 combined lessons as a couple.', icon: 'users', rarity: 'rare', check: (s, p, ctx) => (ctx.combinedLessons || 0) >= 100 },
  { id: 'perfect-match', name: 'Perfect Match', description: 'Both score 100% on the same Daily Couple Challenge.', icon: 'heart', rarity: 'legendary', check: (s, p, ctx) => !!ctx.bothPerfectToday }
];
