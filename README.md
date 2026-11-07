# 🎓 Scholarship Hunter

**Agent-Native Hackathon entry (Builder.io) — built 7 Nov 2026.**

An agent that matches a student's profile to **real, verified scholarship
programmes**, tracks their deadlines, and drafts application material with
the Agent-Native agent. No mock data presented as real: every programme in
the catalogue is a real programme, verified on 7 Nov 2026, and anything
unverified is labelled "Unverified" in the UI and the data.

## What it does

| Feature | How it works |
| --- | --- |
| **Profile** | Level (Bachelor's / Master's / PhD / Postdoc), field, home country, target destinations, graduation year. Saved per browser — no account needed (anonymous viewer id in localStorage; signed-in users get their email). |
| **Matching engine** | Deterministic 0–100 score: level +40, field +30, destination +15, timing +15. Closed/overdue programmes are capped at 30 so they never outrank open ones. Every score carries plain-language reasons. |
| **Deadline tracker** | Countdowns (days left) + urgency (urgent ≤14d / soon ≤45d / later / rolling / closed / overdue) on every list, with a "Closing soon" strip on the home page. |
| **Tracking** | Track any programme as interested → shortlisted → applied → submitted → won / rejected, or remove it. Nearest deadline first. |
| **Application checklist** | Per programme: real requirements, preparation steps, and a personalised **template** essay outline (structure only — hook, 4 points, closing, word target). |
| **Agent drafting** | "Ask the agent to draft" / "Ask the agent to find matches" hand the task to the agent chat with full context; the agent uses the same actions, then writes the full draft. Gemini powers the agent chat (see below). |
| **Browse** | All 17 programmes with level / status / text filters. |

## The data

17 real programmes, seeded from `server/db/seed-scholarships.ts` (verified
7 Nov 2026): Chevening, Gates Cambridge, Erasmus Mundus, Yenching Academy,
ETH Zurich Excellence (ESOP), Commonwealth Shared, Türkiye Burslari, DAAD
EPOS, Fulbright USEFP, MEXT, KAUST Fellowship, TU Delft van Effen, France
Excellence Eiffel, KTH, Swiss Government Excellence, Open Doors, EPFL
Excellence Fellowship. Two are flagged **unverified** (Open Doors, EPFL —
deadline dates not confirmed) and the UI says so.

## Actions (the contract the UI, agent, HTTP, MCP and CLI share)

| Action | Method | What it does |
| --- | --- | --- |
| `list-scholarships` | GET | List programmes, filter by level / field / status / query; open first, nearest deadline first |
| `get-scholarship` | GET | Full detail of one programme by slug |
| `match-scholarships` | GET | Rank all programmes against a profile (saved or explicit); fails `profile_required` without one |
| `get-profile` | GET | Saved profile, or null |
| `save-profile` | POST | Create/update the profile |
| `track-scholarship` | POST | Track a programme (upsert) |
| `update-tracking` | POST | Change a tracked status; `removed` deletes it |
| `list-tracked` | GET | Tracked programmes, nearest deadline first |
| `get-application-checklist` | GET | Requirements + prep steps + template outline (`needsProfile: true` without a profile) |

## Run locally

```bash
cd scholarship-hunter
pnpm install
pnpm dev        # http://localhost:8080 — home is the Hunter dashboard
```

Useful commands:

```bash
pnpm test                 # vitest — matching / deadline / outline logic
pnpm typecheck            # agent-native typecheck
pnpm agent-native:doctor  # framework guard checks (must be clean)
pnpm action <name> '{"arg":"value"}'   # call any action from the CLI
```

Sign-in: the app uses the Agent-Native shared sign-in (magic link / Google).
The Hunter itself works without signing in (anonymous browser viewer id),
but the framework requires a session for HTTP action calls, so sign in to
use the UI in the browser.

## Deploy (Vercel)

The app is a standard Agent-Native app (Vite + React Router + Nitro server).

1. Push this folder to a GitHub repo.
2. In Vercel: **Import Project** → select the repo → set the **Root
   Directory** to `scholarship-hunter` (or wherever this folder lands).
3. Framework preset: Vite (or leave auto-detected). Build command:
   `pnpm build`. Install command: `pnpm install`.
4. Environment variables:
   - `DATABASE_URL` — Postgres connection string (Vercel Postgres, Neon,
     or Supabase free tier). **Required in production** — the local PGlite
     store does not persist on serverless.
   - `GEMINI_API_KEY` — required for the agent chat to generate drafts.
     Set it in the Vercel dashboard; **never commit a key value**.
5. Deploy. On first boot the migration `scholarship-hunter-tables` runs and
   the 17-programme seed loads automatically when the catalogue is first
   read.

## How the agent uses it

The agent chat plugin (`server/plugins/agent-chat.ts`) starts with all nine
Hunter actions in its tool list and a system prompt that makes it a
Scholarship Hunter agent: it matches via `match-scholarships`, drafts from
`get-application-checklist`, tracks via `track-scholarship` /
`update-tracking`, and always reads back what it wrote. It never invents a
scholarship, deadline, or amount, and it tells the user to double-check
unverified entries on the official site.

## Tests

`server/lib/matching.test.ts` — 21 tests, all passing: deadline math
(future / past / null / invalid), urgency bands, scoring (perfect match =
100, level / field / destination penalties, closed cap at 30, `all`-fields
programmes), essay-outline shape, and the unverified-entry warning in prep
steps.

## Notes / honest limits

- The in-app terminal needs `node-pty`, whose native build fails in
  sandboxed environments (fchown EPERM during node-gyp header extraction).
  The dev server runs fine without it; only the terminal panel is affected.
  Vercel's build environment compiles native modules normally.
- `pnpm install` may need `--ignore-scripts` in restricted sandboxes for
  the same node-pty reason.
- Demo video + submission form are still to do (see the hackathon brief):
  record the app in use, publish the clip publicly, and submit the form
  before **Mon 9 Nov 2026, 11:59 PM PT**.
