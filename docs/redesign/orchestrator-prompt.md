You are the orchestrator for KAN-55, the cargo-navis-web redesign to shadcn (base-nova on Base UI, Tailwind 4).
Implement the whole migration: 9 domain PRs, decide what runs in parallel and what in sequence, and execute it with
subagents.

## Read first (absolute paths)
- Plan: /Users/kristijankorac/conductor/workspaces/cargo-navis-web/quebec/docs/redesign/migration-plan.md
- Decisions (source of truth): /Users/kristijankorac/conductor/workspaces/cargo-navis-web/quebec/docs/redesign/DECISIONS.md
- Playground with every decided page and component (the visual reference; READ ONLY, never modify or delete it):
  /Users/kristijankorac/conductor/workspaces/cargo-navis-web/quebec/.context/shadcn-preset
  - decided components: `components/ui/*` (each has a „Decided (KAN-55, …)” header) — copy these into the app
  - tokens: `app/globals.css`; pages: `app/<lab>/page.tsx` (header comment = what was decided)
- Project memory (dense notes, use only to resolve doubts): ~/.claude/projects/-Users-kristijankorac-Desktop-workspace-cargo-navis-cargo-navis-web/memory/shadcn-redesign-decisions.md

## Repo and git
- Repo: /Users/kristijankorac/conductor/workspaces/cargo-navis-web/quebec, integration branch `KAN-55/redesign`
  (base `develop`).
- Permission (granted by the user for this task): the orchestrator AND every subagent may create local branches and
  worktrees, **commit, and merge PR branches into `KAN-55/redesign` without asking the user first** — this overrides
  the usual „never commit unprompted” rule for KAN-55 work. Still NOT allowed: push, opening PRs, force-push, rewriting
  `develop` or any pushed history. The user pushes and opens the PRs.
- Commit messages start with `[KAN-55]`.
- One branch per PR: `KAN-55/redesign-<n>-<slug>` (e.g. `KAN-55/redesign-3-nalozi`). Parallel work only in separate
  git worktrees (one per subagent), never two agents in one working tree. Worktrees: symlink `node_modules` from the main
  checkout to run tsc / lint (see memory „Conductor worktree tooling”).
- Merge finished PR branches into `KAN-55/redesign` yourself, in dependency order, resolving conflicts; keep each PR's
  commits as a coherent unit so the user can review them PR by PR.
- Never run `next dev` in the user's main checkout (it shares `.next`); `next build` / dev only inside your own worktrees.

## The 9 PRs (see plan §4–§5)
1 Platform · 2 Foundations + shell (+ Pretraga, Postavke) · 3 Nalozi (list + detail) · 4 Novi nalog → vozilo (form +
Dodijeli vozilo page) · 5 Prijevozi · 6 Partneri i ljudi · 7 Flota · 8 Pregled (Početna + Analitika) · 9 Vozači +
čišćenje (driver portal + final cleanup).

Dependencies to respect (you decide the exact schedule):
- 1 before everything; 2 before all page PRs (it owns `components/ui`, tokens, `globals.css`, the shell, `lib/flags.ts`,
  the date formatter).
- 3–8 may run in parallel after 2 is merged. Page PRs must not change shared files from PR 2; if one needs a shared
  change, stop, make it in a small follow-up on top of 2, merge it, then rebase the page PRs.
- 4 builds on 3's patterns (Nalog pieces) — prefer 3 merged before 4 is finished.
- 9 last (it deletes what nobody uses any more).

## Rules for every subagent (put these in each brief)
- Implement exactly DECISIONS.md + the named labs. Also carry over features newer than the labs (DECISIONS.md §6b,
  e.g. KAN-112 notification contacts / recipients) in the new look. Don't invent fields the API lacks; where a lab marks something as
  needing the backend, leave it out (or behind a flag) and list it in the PR summary.
- Parked decisions (DECISIONS.md §7): ship today's behaviour in the new look; alternatives behind `lib/flags.ts` only
  where the plan says so (`nalogRouteEntry` is a follow-up, not part of PR 4).
- Icons only via the app's `@/ui` `Icon` — never import `@tabler/icons-react` in app code, never change `Icon.tsx`.
- Tokens, not raw palette classes; Croatian copy exactly as in the lab; no „stanica”; dates `7.11.2026.` / `7.11.`.
- Pages router stays (no App Router move). Keep URLs; add redirects where the plan says (Flota, Postavke).
- Before handing a PR back: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` all green in its worktree;
  then a self-review against the lab (light + dark, phone width where relevant); list anything that differs from the lab.

## Your loop
1. Read the plan and DECISIONS.md; write a short schedule (which PRs in parallel, in which order) and the brief for
   each PR (scope, labs to open, files it owns, files it must not touch, acceptance checks).
2. Run PR 1 and PR 2 yourself or via one subagent each, sequentially; merge into `KAN-55/redesign`.
3. Launch the parallel page PRs (separate worktrees), review each result against its lab before merging (use a fresh
   reviewer subagent that gets the diff + the lab path, not your conclusions), merge in dependency order, re-run the
   full checks on `KAN-55/redesign` after every merge.
4. PR 9 last, then full checks again.
5. Report: per PR — branch, commits, what was built, what was left out (backend / parked), anything that differs from
   the lab, and the commands the user should run to review. Do not push.

If a decision is unclear or two sources disagree, prefer DECISIONS.md, then the lab; if still unclear, skip that piece,
note it, and continue — don't stop the whole run.
