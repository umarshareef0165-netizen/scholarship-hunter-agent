# Chat — Agent Guide

Chat is the minimal chat-first agent-native app. `/` redirects to shared sign-in, then `/home`, the editable Get started page. Chat lives at `/chat`; new chats start there. Actions carry capabilities; screens exist only for durable workflows.

## Skills

Search with `rg --hidden --follow`; read the exact linked guide before deeper work. `.agents/skills/build-an-app/SKILL.md` — start here for vague requests to create a domain app. `.agents/skills/adding-a-feature/SKILL.md` — cross-area feature checklist. Data/integrations: `.agents/skills/actions/SKILL.md`, `.agents/skills/storing-data/SKILL.md`, `.agents/skills/security/SKILL.md`, `.agents/skills/secrets/SKILL.md`, `.agents/skills/sharing/SKILL.md`. UI: `.agents/skills/frontend-design/SKILL.md`, `.agents/skills/shadcn-ui/SKILL.md`, `.agents/skills/client-side-routing/SKILL.md`. Agent context/workflows: `.agents/skills/context-awareness/SKILL.md`, `.agents/skills/real-time-sync/SKILL.md`, `.agents/skills/reliable-mutations/SKILL.md`, `.agents/skills/performance/SKILL.md`, `.agents/skills/delegate-to-agent/SKILL.md`. Framework: `.agents/skills/agent-native-docs/SKILL.md`, `.agents/skills/agent-native-toolkit/SKILL.md`, `.agents/skills/customizing-agent-native/SKILL.md`.

Use local docs only (no web research): `pnpm action docs-search --query "<topic>"`, `pnpm action docs-search --slug "<slug>"`, `pnpm action docs-search --list`, `pnpm action source-search --query "<pattern>"`, `pnpm action source-search --path <path>`, or `pnpm action source-search --list`. For external-agent integrations, read `pnpm action docs-search --slug "external-agents"`.

## Core rules

- UI feedback: target 100 ms, never exceed 400 ms; acknowledge before network work.
- Normal app data must flow through actions. Keep actions deterministic and focused; use agent chat/AgentSidebar for AI work and follow-ups in the same thread. Keep structured state in SQL and large files in configured storage; persist references only.
- For external integrations, inspect the workspace/provider connection catalog first; reuse its scoped resolver. Never hardcode credentials, webhook URLs, or private/customer data.
- Never fabricate. Report failures and recover; verify writes by reading the row or screen. Navigation is in `<current-screen>`; use `view-screen` for fresh visible-record details.

For custom branding, keep `server/plugins/agent-native-email-branding.ts` aligned: `app.name` appears in transactional email and optional `app.logoUrl` must be an absolute HTTPS URL.

## Application state

- `navigation` describes the view and selected ids. Chat is `chat` at `/chat` and `/chat/<threadId>`; the Get started page is `home` at `/home`; `/` opens shared sign-in/signup.
- Use `navigate` when supported and `view-screen` for a fresh read of visible details; basic navigation is already in `<current-screen>`.

## Building a domain app

Choose the primary workflow and route before editing. Add a domain route under `app/routes/` and set `app.homePath` in `server/plugins/agent-native-email-branding.ts` with `defineAppConfig`. The default Get started page lives at `/home`, and Chat stays at `/chat`; edit `app/routes/home.tsx` when replacing that page with a domain-specific home. Add a static link in `app/components/layout/Sidebar.tsx` before `ChatThreadsSection`; `Header.tsx` uses `APP_TITLE` elsewhere. Shared sidebar and AgentInspector remain.

Use `adding-a-feature` for functional parity and `frontend-design` for a user-facing screen. Keep feature guidance here; do not rewrite `README.md` or `DESIGN.md`. After all edits, run one typecheck, one doctor check, and one browser smoke of the primary workflow, including overlap rejection, cancellation freeing the slot, and authenticated landing. Skip production build and extra test suites.

Before building common workspace or agent UI, read `agent-native-toolkit`; for supported customization, read `customizing-agent-native`.

- Guarded verification: run `pnpm agent-native:doctor`; fix findings before done.

## Scholarship Hunter (this app's domain)

Built for the Builder.io Agent-Native Hackathon (deadline Mon 9 Nov 2026,
11:59 PM PT). Home (`/home`) is the Hunter dashboard; `/scholarships` is
browse; `/scholarships/:slug` is detail. Sidebar link "Scholarships" sits
before ChatThreadsSection. Branding: `server/plugins/agent-native-email-branding.ts`
(name "Scholarship Hunter", homePath "/home").

Data: 17 real programmes seeded from `server/db/seed-scholarships.ts`
(verified 7 Nov 2026; Open Doors + EPFL flagged unverified — the UI must
keep showing that badge). Tables: `scholarships` (shared catalogue),
`profiles` (one per viewer), `tracked` (viewer + slug). All three are in
`doctor.dbToolScopingDenylist` in `agent-native.json` with reasons: the
catalogue is shared by design; profiles/tracked are scoped per viewer in
every action via `resolveViewer`. Never add org scoping on top.

Actions (all in `actions/`, one file per action, Zod schema + outputSchema):

| Action | Method | Notes |
| --- | --- | --- |
| `list-scholarships` | GET | Filters level/field/status/query; open first, nearest deadline first |
| `get-scholarship` | GET | Flat scholarship object + daysUntil + urgency; 404 when missing |
| `match-scholarships` | GET | Flat match rows (score + reasons + scholarship fields); fails `profile_required` with no profile |
| `get-profile` | GET | `{ profile }` or null |
| `save-profile` | POST | Upsert; level enum is `bachelors | masters | phd | postdoc` |
| `track-scholarship` | POST | Upsert; returns the stored row id |
| `update-tracking` | POST | Input field is `id` (tracked-row id); `removed` deletes |
| `list-tracked` | GET | Flat joined rows; `trackingStatus` is the user's status, `status` is the programme's |
| `get-application-checklist` | GET | Flat; `steps` (not prepSteps), `outline` (not essayOutline, points are `{heading, detail}`), `needsProfile` |

Core logic lives in `server/lib/matching.ts` (pure, unit-tested in
`matching.test.ts` — 21 tests) and must stay deterministic: level +40,
field +30, destination +15, timing +15; closed/overdue capped at 30.
The essay outline is structure only — never AI prose. Full drafts go
through agent chat (`sendToAgentChat` from `@agent-native/core/client/agent-chat`),
never behind a `generate-*` action. The agent chat plugin starts with all
nine Hunter actions in `INITIAL_TOOL_NAMES` plus a Scholarship Hunter
system prompt.

Viewer identity: `app/lib/viewer-id.ts` (`getViewerId`, localStorage) for
anonymous browsers; signed-in users resolve to `email:<email>`. Never
fabricate a deadline, amount, or programme; never write a real API key —
`GEMINI_API_KEY` is env-var name only, set in Vercel, unset locally.
