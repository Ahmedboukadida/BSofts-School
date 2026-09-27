---
name: smart-git-automation
version: 1.0.0
description: "Smart change detection, auto branch naming, and streamlined commit/PR workflow"
risk: critical
source: community
source_type: community
source_repo: mskadu/opencode-agent-skills
license: MIT
license_source: "https://github.com/mskadu/opencode-agent-skills/blob/main/LICENSE"
date_added: "2026-06-05"
---

## What I do
- Intelligently detect and group related changes
- Auto-generate descriptive branch names from changes
- Streamlined workflow: scan → branch → commit → push → PR with fewer prompts

## When to Use
Use this when you want a faster, smarter git workflow that groups changes logically and reduces manual confirmation overhead.

## Workflow Steps

### 1. Smart Detection & Grouping
Run in parallel:
- `git status` - check what's changed
- `git diff --stat` - see file modification summary
- `git diff --name-only` - list changed files only
- `git diff --staged --stat` - see what's already staged

Analyze changes to group them logically:
- Files in the same module/directory → likely related
- Files that were modified together in recent edits → likely related
- New files that complement each other → likely related

Present grouped changes in a clear format, e.g.:
```
📁 Group 1: UI Components
  - src/components/Button.tsx (modified)
  - src/components/Button.test.tsx (modified)

📁 Group 2: API Layer
  - src/api/client.ts (new)
  - src/api/types.ts (modified)
```

### 2. Auto Branch Name Generation
Generate branch name from dominant change pattern:
- Use format: `<type>/<short-description>`
- Types: `feature`, `fix`, `refactor`, `docs`, `test`, `chore`
- Derive description from most significant changed file/feature
- Convert to kebab-case, max 50 chars
- Examples:
  - `feature/add-user-auth` (from auth-related files)
  - `fix/login-validation` (from validation changes)
  - `refactor/api-cleanup` (from API refactoring)

Show the proposed branch name and ask for one-word confirmation (or type alternative).

### 3. Streamlined Branch & Commit
- If not on main/master: check if current branch matches proposed name
  - If yes: stay on it
  - If no: ask to switch or create new
- Create branch only after validating the branch name, then use `git checkout -b "$branch_name"`
- Stage explicit pathspecs only: `git add -- path/to/file ...`
  - If file paths are generated, keep them NUL-delimited (`git diff -z --name-only`) and pass them as pathspec arguments.
  - Never concatenate untrusted filenames into a shell command and never run the placeholder text literally.
- Auto-generate commit message from changes:
  - First line: `<type>: <short description>` (max 72 chars)
  - Body: grouped file changes with brief descriptions
- Commit with generated message, show preview first
- Ask for one-word confirmation to proceed

### 4. Push & Optional PR
- After commit, ask: "Push to remote? (yes/no/abort)"
- If yes: `git push -u origin <branch-name>`
- Then ask: "Create PR? (yes/no)"
- If yes:
  - Check remote: `git remote -v`
  - If fork: use fork's remote (e.g., `mskadu/repo-name`)
  - Auto-generate PR description from commit messages
  - Use `gh pr create` with:
    - Title from branch name
    - Body: summary of changes + file breakdown + follow-up notes

## Key Rules
- Group related files automatically, but allow user to adjust
- Generate branch names from actual changes, don't ask user to name them
- Reduce confirmations: ask for one-word answers or single confirmation points
- Never commit secrets, credentials, or large binaries
- Check if GitHub repo exists before PR creation
- Skip PR step if user says "no" at any point
- If branch already exists with changes, offer to amend or add new commit

## Limitations

- Do not bypass repository-specific maintainer rules, branch policies, or required review gates.
- Confirm destructive or publishing actions explicitly; this skill should streamline routine Git flow, not remove accountability.


---

## 🛠️ Mandatory Workspace & Governance Directives (Upgraded Standards)

1. **Project Root & Paths**: Primary project workspace is E:\ToDo\BSofts.
2. **Auxiliary Workspace Directory Layout (.agents/bonus/)**:
   - **Scratch**: E:\ToDo\BSofts\.agents\bonus\Scratch — Scripting directory for creating temporary JS/TS scripts to inspect, verify, extract, or audit database & API components.
   - **Output**: E:\ToDo\BSofts\.agents\bonus\Scratch\Output — Deliverable directory for exported reports, data dumps, and persistent deliverables.
   - **Vault**: E:\ToDo\BSofts\.agents\bonus\Vault — Persistent memory vault directory holding state files (README.md, STATUS.md, PROGRESS.md, DECISIONS.md, DECLARATIONS.md, PROJECT.md).
3. **Autonomous Execution Loop (Rule #12)**:
   [1. Receive Goal] ➔ [2. Work & Implement] ➔ [3. Check & Verify (tsc --noEmit)] ➔ [4. Re-work if not complete] ➔ [5. Deliver Result] ➔ [6. Update Vault Memos].
4. **Autonomous Execution Permissions (Rule #13)**: Full permission to read, write, create, move files, and execute scripts/commands under E:\ToDo\BSofts without asking for permission.
5. **Mandatory Deletion Confirmation Guard (Rule #14)**: MUST ALWAYS ask user for explicit confirmation before deleting any file, folder, or database table.
6. **Zero Database Data Loss Guard (Rule #15)**: NEVER run commands that accept database data loss (such as prisma db push --accept-data-loss or forced table drops).


---

## 👥 BSOFT 5-Actor Role Architecture & Permanent Deletion Governance

1. **Developer (System Developer / Me)**:
   - Full platform god-mode access across all companies, tenants, endpoints, and system settings.
   - **Exclusive Permanent Deletion Authority**: Hard permanent deletes can ONLY be executed by Developer users. Non-developer delete requests default to soft-delete or throw ForbiddenException.
2. **Super Admin (Subscription Buyer & Owner)**:
   - Buyer of the SaaS subscription for his company/companies.
   - Full administrative control and feature configuration for his own company/companies only.
3. **Admin (Company Administrator)**:
   - Highest operational authority in a specific company right after Super Admin.
   - Manages day-to-day operations, employees, inventory, sales, and finance within his assigned company.
4. **Employees (Company Staff)**:
   - Operational staff members (Sales Agent, Accountant, Warehouse Manager) with role-restricted permissions.
5. **Third Parties (Clients & Providers / Suppliers)**:
   - External Customers (CLIENT) and Suppliers (FOURNISSEUR) operating in **Spectator Mode** — consult-only access restricted strictly to their own related records.

7. **Permanent Recursive File System Access Guarantee (Rule #16)**: Permanent, unrestricted, recursive read, write, create, and move permissions across all files, directories, subdirectories, and nested paths under E:\ToDo\BSofts at all times without asking for confirmation.
