/* FLUENTR — core/profiles.js
   Onboarding options and small profile-related helpers shared by ui.js/app.js. */

const FL_GOAL_OPTIONS = [
  { id: 'work', label: 'Work', icon: 'briefcase' },
  { id: 'travel', label: 'Travel', icon: 'plane' },
  { id: 'career', label: 'Career', icon: 'trending-up' },
  { id: 'technology', label: 'Technology', icon: 'terminal' },
  { id: 'confidence', label: 'Confidence', icon: 'spark' }
];

const FL_CEFR_LABELS = { A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate', B2: 'Upper-Intermediate', C1: 'Advanced' };

function flApplyGuilhermeDefaults(profile) {
  profile.goal = 'work';
  profile.focusAreas = ['business', 'technology', 'meetings', 'interviews'];
}

function flInitials(name) {
  return (name || '?').trim().charAt(0).toUpperCase();
}
