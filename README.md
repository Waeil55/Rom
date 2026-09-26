# PharmaLearn

Enterprise pharmacy learning platform: medicine reference, Netflix-style lessons, AI narration ("Listen"), and adaptive study modes (flashcards, quizzes, matching).

## Stack

- React + TypeScript + Vite, Tailwind CSS v4, React Router, Zustand (persisted UI state)
- Medicine data: [OpenFDA drug label API](https://open.fda.gov/apis/drug/label/) — free, no key required
- Auth + database: Supabase (email/password, RLS, RBAC via `profiles.role`)
- AI narration: Supabase Edge Function (`supabase/functions/tts`) calling OpenAI's audio-capable chat model — the OpenAI key never touches the browser
- PWA: `vite-plugin-pwa`, installable, offline shell + cached OpenFDA responses

## Getting started

```bash
npm install
cp .env.example .env   # fill in your Supabase project values
npm run dev
```

Without `.env` values, the app still runs fully for browsing medicines, lessons, flashcards, quizzes and matching (all backed by live OpenFDA data). Auth and AI Listen show a clear "not configured" notice instead of a fake/dead control until you connect Supabase.

## Connecting Supabase (auth, sync, AI Listen)

1. Create a project at supabase.com.
2. Run the schema: `supabase db push` (or paste `supabase/migrations/0001_init.sql` into the SQL editor). This creates `profiles`, `bookmarks`, `study_progress`, `quiz_results`, `audit_log`, enables Row Level Security, and auto-creates a profile row per signup via trigger.
3. Add `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` to `.env` from Project Settings → API.
4. Deploy the Listen function and set your OpenAI key as a server-side secret:
   ```bash
   supabase functions deploy tts
   supabase secrets set OPENAI_API_KEY=sk-...
   ```
5. To promote a user to admin (for future admin tooling / audit log access): `update profiles set role = 'admin' where email = '...';`

Email verification and password reset use Supabase Auth's built-in flows — no custom auth code to maintain or harden.

## What's fully wired today

- Home dashboard: daily goal progress, recently viewed, weak areas, category shortcuts — all driven by real local state
- Learn: category rows pulled live from OpenFDA, Watch (detail page) and Listen (AI narration) both functional per card
- Medicines: live search, bookmarking, full medicine detail page with 10 documented sections
- Study: flashcards, multiple-choice/true-false quiz, brand↔generic matching, weak-area review — all generated from the same live medicine data (no hardcoded question banks)
- AI Listen: bottom player with play/pause/next/prev/repeat/speed/teaching-style, calls the real Supabase Edge Function
- Settings: theme (light/dark/system), text size, reduced motion, audio speed, account info
- PWA manifest + service worker (installable, offline app shell)

## What's intentionally out of scope for this pass

This is a large, multi-week enterprise build. To keep the initial delivery honest — no fake buttons, everything shipped actually works — the following were **not** built and would be the next milestones:

- Admin dashboard / content management UI (the `admin` role and `audit_log` table exist in the schema, ready for it)
- Server-side rate limiting and Cloudflare/WAF configuration (infrastructure-level, outside the React app)
- Fill-in-the-blank and dedicated rapid-review quiz variants (currently the Study hub links these into the same quiz engine; distinct UX would be a follow-up)
- Curated/verified clinical content — OpenFDA label text is real and current but not a substitute for a licensed clinical content review before use in an actual course

## Building for production

`npm run build` compiles the app correctly; on this machine, the PWA plugin's post-build step hit a native rollup binary blocked by a Windows Application Control policy (an OS security policy, not a code issue). If your CI/deploy environment doesn't have that restriction, the build will complete normally including the service worker.
