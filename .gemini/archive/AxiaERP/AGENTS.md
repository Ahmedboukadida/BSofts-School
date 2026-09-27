# Agent Rules for AxiaERP

## Build Rules
- **DO NOT** execute build commands (`dotnet build`, `npm run build`, `npm run start`, etc.) directly.
- Always ask the user to run builds manually and provide terminal reports. If there are errors, resolve them; otherwise, assume everything compiles correctly and proceed.

## Git Rules
- Always pull from the default branch (e.g., `develop`) to stay synchronized.
- Resolve any merge conflicts locally.
- Stage, commit, and push updates directly to personal developer branches (`Ahmed` in `erp-back`, `ahmed` in `erp-front`).
- Leave final merges to the developer to perform manually.

## Project Rules
- Avoid making assumptions about the project structure or dependencies.
- Project is team work so make sure to coordinate with all solutions by asking the user.

## Request-Handling Workflow

For every request in this project, not only large ones:

0. **Brief first.** Route the raw request through `prompt-architect` before anything else. It turns a short prompt into a working brief: the actual intent, what the codebase already says, every assumption paired with how it will be checked, the skills to load by name, and a definition of done someone else could verify. A plan drafted from a literal reading of a three-line prompt inherits every gap in that prompt, and `chief-architect` then reviews a plan aimed at the wrong target — reviewing the aim is cheaper than reviewing the shot.
1. **Clarify first.** `prompt-architect` returns the open questions it could not settle from the codebase. Put those to the user — every time, and only those. Present real options rather than silently picking one on the user's behalf.
2. **Forge the plan under attack.** `plan-forge` drafts, sends every draft to `plan-adversary`, repairs what lands, and repeats until the attack stops landing or three rounds are spent. The critic is a separate agent on purpose: the context that produced a plan is the worst available judge of it, because assumptions are what you think with, not what you think about. Before any task is assigned, `plan-forge` routes missing or stale agents and skills to `roster-smith` — mandatory, not conditional.
3. **Decompose, then assign.** `chief-architect` takes the surviving plan, gives it a final review, and produces the task breakdown: organized by Clean Architecture layer (Domain/Application/Infrastructure/API, plus Frontend and cross-cutting concerns like security, git, and verification), each task assigned to the correct specialist agent in the roster below.
3b. **User review gate.** `plan-forge` returns three things to the user, separately: the plan with its critique history (what was objected to, repaired, or rejected and why), the task list so they can add/cut/reorder, and the remaining open questions. Nothing is executed before all three have been seen. This gate is not a formality — it is where the choices that are genuinely the user's get made by the user.
4. **Execute and track.** Delegate tasks to their assigned agents; log and communicate progress through `product-stakeholder-coordinator` so nothing goes stale across sessions.
5. **Keep improving.** The roster and its skills are expected to evolve. `chief-architect` and `product-stakeholder-coordinator` both carry a standing mandate to flag gaps — a missing agent, a missing skill, a recurring blind spot in how plans get reviewed — rather than let the same mistake repeat silently.

The point of steps 1 and 2 together: no plan reaches "final" without both the user's input on the choices that are genuinely theirs to make, and `chief-architect`'s review against everything the roster already knows about this codebase.

## Specialized Agent Roster

Sixteen specialized agents live in this folder, one file each, grouped into four tiers (an Orchestrator sitting above three categories). Each file documents that agent's scope, the specific AxiaERP architecture facts and known gotchas it should know, hard rules, and which other agents it hands off to. Each also has a matching, shorter operational file under `.claude/agents/<name>.md` (frontmatter + pointer back here) so it's directly invokable as a Claude Code / Cowork subagent — this file is the canonical, human-readable spec; the `.claude/agents/` copy is the machine-loaded entry point that tells the agent to read this one first.

**Front door and plan loop** (run before the orchestrator, in this order):
- `prompt-architect` — turns the raw request into a brief: real intent, existing codebase facts, assumptions with their verification method, skills to load, specialists to involve, checkable definition of done, and the questions that are genuinely the user's to answer. Does not plan or implement. Exists because two failures kept recurring: the unstated assumption that turns out to be the whole problem (a seed loaded on company 1 for an account on company 3 — every screen empty, the data fine), and the verification that verifies nothing (a checker matching only quoted identifiers against files that wrote them bare, reporting "0 problems" on files it never inspected).

- `plan-forge` — owns the plan from first draft to the version the user reviews. Runs the critique loop with `plan-adversary`, repairs the roster through `roster-smith` before relying on it, hands the surviving plan to `chief-architect`, then returns plan, tasks and open questions for review. Writes plans; never judges its own, never starts work.
- `plan-adversary` — attacks plans, writes none. Gets the plan and the brief but deliberately not the author's reasoning, and returns the single strongest objection with evidence, or an explicit "nothing material". Never proposes the fix: naming a flaw and repairing it are different jobs.
- `roster-smith` — creates the agents and skills the roster is missing, and updates those that have gone stale, **before** they are used rather than after they fail. Writes definitions only, never project code. An agent working from a stale file produces confidently wrong work, and wrong work arrives wearing the same confidence as right work.

**Orchestrator** (final review of the forged plan, then assigns the work below):
- `chief-architect` — judges and improves any draft plan (surfacing open questions rather than guessing at them), then decomposes the finalized plan into Clean-Architecture-layer tasks assigned to the specialists below. No plan should be treated as final, and no implementation should start, without going through this agent.

**Technical experts** (solution/stack architecture):
- `dotnet-backend-architect` — erp-back, all 5 .NET solutions, CQRS/MediatR, EF Core.
- `react-frontend-architect` — erp-front, React 19, Redux, routing, shared components.
- `postgres-schema-specialist` — schema design and manual SQL migrations across Structure/Subscription/Identitydb.

**Domain experts** (business/data meaning, not code mechanics):
- `erp-accounting-domain-expert` — Tunisian fiscal rules (TVA/FODEC/Timbre), GL accounts, the fiscal-correctness side of numbering.
- `saas-provisioning-domain-expert` — Subscription solution: Packs/Modules/approval/provisioning, hosting topology, the SaaS package-permission model.
- `vente-sales-domain-expert` — Vente solution: sales-document lifecycle (BonCommande/Devis/Facture), statuses, conversions, numbering workflow.
- `structure-masterdata-domain-expert` — Structure solution: what Company/Article/Tiers/Devise and the Souche/StatutDocument/DoccurentPiece catalogs mean and how they relate; the settings-vs-master-data-vs-workflow judgment call.
- `identity-security-specialist` — Authentification solution (users/roles/JWT) plus the cross-cutting multi-tenancy/security scoping audit mandate across every solution.

**Jobs experts** (process/workflow, cross-cutting):
- `git-release-specialist` — fetch/merge/conflict-resolution/push workflow for both repos.
- `qa-build-verifier` — static verification (syntax, conflict sweeps, consistency, feature-wiring, scoping) and honest "what still needs a real build" handoffs.
- `product-stakeholder-coordinator` — turns every other agent's findings into tracked backlog items and stakeholder-ready updates/specs/roadmap entries, so audits stop going stale the moment the conversation moves on.

Domain-expert scope is deliberately narrow and cross-referencing: a sales invoice touches `vente-sales-domain-expert` (workflow), `erp-accounting-domain-expert` (fiscal content), and `structure-masterdata-domain-expert` (the client/article/currency data on it) all at once — each file's "Scope boundary" section says explicitly what it does and doesn't own so the three don't silently duplicate or contradict each other. Read the relevant boundary section before assuming one agent's domain extends further than it does.

Beyond these, a general library of roughly 1 800 skills is mounted at `E:\ToDo\.agents\skills` and registered — invoke any by exact name. `prompt-architect` selects from it per request; naming three relevant skills beats listing twelve plausible ones. Directly useful to this stack: `dotnet-backend-patterns`, `csharp-pro`, `database-migrations-sql-migrations`, `database-architect`, `react-best-practices`, `007`.

Five project-specific skills, under `.claude/skills/`:
- `axia-sql-migration` — idempotent manual_sql authoring for Structure/Subscription.
- `axia-merge-workflow` — this repo's exact git branch/conflict playbook.
- `axia-add-settings-key` — end-to-end recipe for adding a companies_settings catalog key.
- `axia-verify-feature-wiring` — codifies the "is this actually called by anything" check that found 4 confirmed dead/unwired features this project (GL-account defaults, article numbering, client numbering, Vente document numbering). Use before describing any existing code as "already handling" something.
- `axia-scoping-audit` — codifies the "is this properly isolated per company" check that found 3 confirmed cross-tenant scoping bugs (SouchesClient's missing company column, Devise.DevIsBase's unscoped consumers, salesDevisRefs.js's unscoped endpoint calls). Use proactively on any new per-company entity or endpoint, not just when a bug is suspected.

Beyond these five, the roster also draws on already-installed generic skills where relevant — `write-spec`, `roadmap-update`, `stakeholder-update`, `sprint-planning`, `synthesize-research` (product-management), and `task-management`/`memory-management` (productivity) — mainly through `product-stakeholder-coordinator`, so technical and domain findings actually turn into tracked, communicated decisions instead of one-off documents.

Update the relevant `.agents/<name>.md` file whenever a new architecture fact, bug, or convention is confirmed — these files are meant to accumulate real project knowledge across sessions, not just describe the roster once and go stale. `product-stakeholder-coordinator` exists partly to make sure that upkeep actually happens.