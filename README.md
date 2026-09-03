# Fluentr

**English you can actually use.**

A local-first, installable PWA that teaches real-world English — the kind
that gets stuck in your throat during a meeting, an interview, or a message
to a foreign colleague — built first for two specific people: **Guilherme**
and **Rayssa**.

> Alternative names considered during development, if "Fluentr" doesn't
> stick: **Realspeak**, **Sayfluent**, **Unfreeze** (as in "unfreeze when
> you need to speak"). All still on the table — nothing here depends on
> the name.

## The problem

Plenty of people already *know* English — they read it, they understand
it, they've studied vocabulary for years. Then a meeting starts, or a
recruiter asks a question, and they freeze. The gap isn't vocabulary. It's
the translation reflex: reaching for a literal Portuguese-to-English
mapping ("I have a doubt," "I will return to you") instead of the phrase a
native speaker would actually reach for.

Fluentr doesn't teach English from zero. It targets exactly that gap, for
two people who already have a base to build on.

## The five pillars

Everything else in the product supports these:

1. **Brazilian English Traps** — the specific literal-translation mistakes
   Brazilians make, paired with the natural alternative and *why* ("I have
   a doubt" → "I have a question" — "doubt" implies distrust in English).
2. **English SOS** — "I need English now." A meeting in 5 minutes, an
   interview, a customer call: pick the situation, get an instant survival
   kit of essential phrases, a 3-question warm-up, and the questions you're
   likely to be asked.
3. **What Should I Say?** — describe a real situation in Portuguese, get it
   back in three registers (Simple / Natural / Professional), with a note
   on the nuance between them. Has local fuzzy search — no API required.
4. **Write Better** — rough, Brazilian-influenced messages transformed
   into Correct / Natural / Professional versions, across email, Slack,
   and support-ticket writing.
5. **Technical English in Context** — one technical fact, explained three
   ways depending on who's listening: a customer, a manager, an engineer.

Everything else — the Path, XP, streaks, Duels, the Couple League — exists
to keep two people opening the app every day, not to replace these five.

## Couple Mode

Guilherme and Rayssa each get a fully separate profile (XP, streak,
hearts, badges, history), plus shared mechanics that only exist between
the two of them:

- **Couple League** — weekly XP head-to-head, visualized as a single bar.
- **Weekly Duel** — win the week, get the Weekly Champion badge; history
  of the last few weeks is kept.
- **Duel** — a direct 10-question challenge on a chosen topic, same device,
  played sequentially (pass the phone) — architected so a remote version
  (each on their own phone) is a data-layer change, not a rewrite.
- **Daily Couple Challenge** — the same single question, answered
  separately by both; completing it awards Couple XP and extends the
  ❤️🔥 Couple Streak (independent from each person's individual streak).

## Gamification, briefly

- **XP**: +5 correct answer (reduced to +1 if you're re-answering something
  within a 4h cooldown, to prevent farming), +25 lesson complete (+15
  perfect-lesson bonus, first completion only), +30 Daily Challenge, +15
  SOS pack, +20 Technical scenario, +25 Duel win, +10 first activity of
  the day.
- **Levels**: a game-level curve (Level 1, 2, 3…) is kept fully separate
  from CEFR proficiency (A1–C1) — leveling up is about consistency, CEFR
  is about actual ability, and conflating them would make the number
  meaningless.
- **Hearts**: 5 hearts, -1 per wrong answer *inside a Path lesson* (not in
  the low-friction pillars — Traps, SOS, Say, Writing, Technical never
  gate you with hearts). Passive regen (+1 every 4h) plus a **Practice to
  recover hearts** mode that's never a dead end.
- **Streak**: a Mon–Sun dot calendar, individual per profile, plus the
  separate Couple Streak described above.
- **Badges**: 31 badges across Consistency, Business, Technology,
  Brazilian Traps, Progression, and Couple categories, with Common / Rare
  / Epic / Legendary rarity — shown in the Trophy Room, locked ones
  visible as quiet greyscale silhouettes.

## Technology

Zero backend, zero build step, zero paid API. Everything ships as static
files you can open in a browser or install as an app.

- **HTML / CSS / vanilla JavaScript** — no framework, no bundler, no npm
  required to run it.
- **IndexedDB** for everything that matters (profiles, progress, answer
  history, vocabulary, couple state) — see [Data layer](#data-layer)
  below. `localStorage` is used only for the active-profile pointer and
  the theme preference.
- **Service Worker + Web App Manifest** — a real, installable, offline-first
  PWA (see [PWA & Offline](#pwa--offline)).
- Fonts: **Sora** (display) + **Manrope** (body) + **JetBrains Mono**
  (data/code), loaded from Google Fonts with full system-font fallbacks —
  the app still looks intentional with zero internet connection.

## Data layer

Every screen talks to `FluentrData` (`js/core/dataService.js` +
`js/core/dataServiceSelect.js`) — never to IndexedDB or Supabase directly.
The entire app — `app.js`, `ui.js`, `lessonEngine.js` — only ever calls
methods like `getProfile(id)`, `updateProfile(id, mutatorFn)`, `getCouple()`,
`updateCouple(mutatorFn)`. Two implementations exist behind that interface,
picked in `dataServiceSelect.js` based on whether `js/core/config.js` has
Supabase credentials:

- **`LocalDataProvider`** (`js/core/dataService.js`) — IndexedDB via
  `js/core/storage.js`, two object stores (`profiles`, `couple`). No
  network, no accounts — this is what runs when `config.js` is empty.
- **`SupabaseDataProvider`** (`js/core/supabaseDataProvider.js`) — the same
  methods against Supabase Postgres tables (`supabase/schema.sql`), gated by
  Row Level Security scoped to `auth.uid()`. Auth is magic-link email
  (`js/core/supabaseAuth.js`); on first login each person claims one of the
  two `profiles` rows (`guilherme`/`rayssa`) by setting its `owner_id` to
  their own account — after that it's permanently theirs, and RLS lets both
  claimed members read each other's profile (needed for the Couple League)
  but only ever write their own.

### Cloud sync setup

1. Create a Supabase project, then run `supabase/schema.sql` once in its SQL
   Editor (safe to re-run — every statement is idempotent).
2. In **Authentication → URL Configuration**, add every origin you'll open
   the app from (`http://localhost:8123` for local dev, plus your deployed
   URL) to **Redirect URLs** — magic links are rejected otherwise.
3. Put the project's URL and anon key in `js/core/config.js`. The anon key
   is meant to be public; RLS is the actual security boundary, not secrecy
   of that key.
4. Reload the app — the auth gate (email → magic link → "which of you is
   this?") replaces the old profile-picker automatically. Clear
   `SUPABASE_URL` in `config.js` to go back to local-only.

No changes needed in `app.js`, `ui.js`, or `lessonEngine.js` either way —
they only ever see `FluentrData`. This is what unlocks: real accounts,
cross-device sync, and (not yet built) Realtime Couple League updates and
remote Duels.

## PWA & Offline

- `manifest.webmanifest` — name, icons (192/512 + maskable variants),
  `display: standalone`, `theme_color`, `start_url`, and three install
  **shortcuts** (Practice, English SOS, Couple League).
- `service-worker.js` — precaches the full app shell (HTML, CSS, JS, and
  every data file) on install; serves same-origin static assets
  cache-first (refreshing in the background), and navigation requests
  network-first with a cache → `offline.html` fallback chain.
- **What works offline**: Path lessons, all five pillars, XP/streaks/hearts,
  badges, Duels and the Daily Couple Challenge on the same device, the
  Placement test, Phrasebook, Progress — essentially the entire V1, since
  all content lives in `data/*.js` and all state lives in IndexedDB.
- Install icons were generated locally (`assets/icons/`) — no external
  asset pipeline involved.

## How to run

Just open `index.html` — plain `<script>` tags, no ES modules, so there's
nothing for a browser to block via CORS when opened directly from disk.

For the full PWA experience (installability, the service worker, and
consistent IndexedDB behavior across browsers), serve it locally instead:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` and, on Chrome/Edge/Android, use
"Install app" from the browser menu (or the in-app **Install Fluentr**
button under Settings, once the browser signals it's installable).

## Architecture

```
fluentr/
│
├── index.html
├── offline.html
├── manifest.webmanifest
├── service-worker.js
│
├── css/
│   ├── tokens.css        # color, type, spacing design tokens (light + dark)
│   ├── base.css           # reset, app shell, nav
│   ├── components.css     # every shared component (buttons, path nodes, exercises...)
│   ├── pages.css          # page-specific layout tweaks
│   └── responsive.css     # mobile-first -> tablet -> desktop rail
│
├── js/
│   ├── core/
│   │   ├── storage.js       # raw IndexedDB wrapper (2 object stores)
│   │   ├── dataService.js   # THE persistence interface (LocalDataProvider today)
│   │   ├── gamification.js  # XP, levels, hearts, streaks, badge evaluation
│   │   ├── profiles.js      # onboarding options, CEFR labels
│   │   └── pwa.js           # service worker registration + install prompt
│   ├── lessonEngine.js      # Path state, session builders, Smart Review, Spot the Brazilian
│   ├── ui.js                 # icons + every page's render function (HTML strings)
│   ├── router.js             # minimal hash router for in-app navigation
│   └── app.js                 # boot sequence, session players, all interactivity
│
├── data/
│   ├── curriculum.js     # The Path: 8 units -> lessons -> challenge
│   ├── lessons.js         # 80 Path exercises (mc / fill / reorder / translate / match)
│   ├── traps.js           # 55 Brazilian English Traps
│   ├── say.js              # 28 "What Should I Say?" situations
│   ├── writing.js          # 24 Write Better transformations
│   ├── technical.js        # 24 Technical English "explain it to..." scenarios
│   ├── sos.js               # 8 English SOS packs + Interview SOS categories
│   ├── simulators.js        # Meeting + Interview structured simulations
│   ├── coupleChallenges.js  # 30-item Daily Couple Challenge pool
│   ├── placement.js         # 20-question placement test bank
│   └── badges.js             # 31 badge definitions
│
└── assets/icons/           # generated app icons (192/512, maskable, apple-touch, favicons)
```

**Why this shape:** `core/` is the only part of the app that knows
persistence exists — everything above it (`ui.js`, `app.js`,
`lessonEngine.js`) works against plain JavaScript objects. Data content is
fully separated from logic (per `data/*.js`), so growing the question
banks never means touching application code. `ui.js` renders HTML strings;
`app.js` owns every interaction through one delegated `[data-action]`
click listener, so views never re-attach their own listeners.

### A deliberate simplification

The brief describes several IndexedDB object stores (profiles, progress,
history, answers, badges, duels, vocabulary...). In this V1, each
profile's *entire* state — XP, streak, hearts, badges, exercise stats,
vocabulary, history, path progress — is stored as **one JSON document**
per profile, in a single `profiles` object store (plus one shared `couple`
document). This is a common, robust pattern for offline-first apps and
kept persistence code small and easy to verify correct within this build's
scope, at the cost of not supporting IndexedDB-level queries across
profiles. If that's ever needed, it's a `dataService.js`-only change.

## Content

Curated for quality over raw count, per the product's own rule — a
generated-feeling bank of near-duplicate questions would work against the
goal ("does this teach usable English?"). Current volume:

- 80 Path exercises across 8 units / 16 lessons
- 55 Brazilian English Traps
- 28 "What Should I Say?" situations
- 24 Write Better transformations
- 24 Technical English scenarios
- 8 English SOS packs + a 4-category Interview SOS
- 2 structured simulations (Weekly Meeting, General Interview)
- 30 Daily Couple Challenge items
- 20 placement-test questions
- 31 badges

## Roadmap

**V1 (this build)** — Local-first PWA, Guilherme + Rayssa profiles, the
Path, all five pillars, XP/streak/hearts, badges, Couple League, local
Duels, Daily Couple Challenge, Placement test, Phrasebook, export/import.

**V2** — Supabase (`SupabaseDataProvider`, see "Cloud sync setup" above),
magic-link auth, cross-device sync, cloud backup. Live once
`supabase/schema.sql` is run and `js/core/config.js` has real credentials —
the app then shows an email sign-in gate instead of the free profile picker,
and both profiles sync through Postgres instead of per-device IndexedDB.
Not yet built: Realtime Couple League (today's League still reads on
navigation, not via a live subscription) and remote Duels (Duels still
assume both people are on the same device/session).

**V3** — AI: dynamic conversations, writing correction, an AI-driven
Interview/Meeting simulator, personalized exercise generation.

**V4** — Voice: speech recognition, pronunciation feedback, listening
exercises, real-time spoken conversation practice.

**V5** — Native mobile app.
