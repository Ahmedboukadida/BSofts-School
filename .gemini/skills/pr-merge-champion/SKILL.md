---
name: pr-merge-champion
description: "Optimize pull requests for quick approval and merging by ensuring clean diffs, comprehensive self-reviews, and structured documentation."
category: workflow
risk: safe
source: self
source_type: self
date_added: "2026-06-16"
author: himanshu-2l
tags: [git, github, pull-request, code-review, workflow]
tools: [claude, cursor, gemini, antigravity]
---

# PR Merge Champion

## Overview

A systematic playbook for preparing, reviewing, and documenting pull requests to ensure they are high-quality, free of common oversights, and optimized for instant maintainer approval and merging.

## When to Use This Skill

- Use when preparing to open a new pull request on GitHub or any Git hosting platform.
- Use when self-auditing a feature or bug-fix branch for code cleanliness and consistency.
- Use when trying to minimize review cycles and speed up the integration of your changes.

## How It Works

### Step 1: Pre-Flight Clean Up & Rebase

Before presenting your code to reviewers, clean up any workspace noise and ensure your branch is up to date:
1. Rebase your feature branch on top of the latest target branch (e.g., `main` or `master`) to resolve conflicts early.
2. Clean up untracked, temp, or swap files from your repository.
3. Run local linters, formatters, and compilers to ensure no stylistic or syntax errors exist.

### Step 2: Critical Self-Review

Review your own diff line-by-line as if you were the reviewer. Look out for:
1. Leftover debugging statements (e.g., `console.log`, `print`, breakpoints, or custom debug flags).
2. Unnecessary changes, white-space only diffs, or commented-out code blocks.
3. Incomplete `TODO` comments that should be resolved or turned into tracked issues.
4. Correctness of error handling and edge cases.

### Step 3: Local Verification & Test Suite

Verify that all changes work as expected:
1. Run the project's automated test suite locally to verify no regressions are introduced.
2. Check test coverage for any new code blocks you added.
3. Manually test the critical paths and edge cases of your feature or bug fix.

### Step 4: Crafting the Pull Request Description

Write a high-signal, structured PR description. A great description tells the story of the changes:
1. **Summary**: A concise explanation of the changes.
2. **Context / Why**: Why this change is necessary and what problem it solves.
3. **Verification**: Explicit details on how you tested it (test commands, screenshots, or step-by-step reproduction).
4. **Checklist**: Conform to the repository's contributing guidelines and checklist requirements.

## Examples

### Example 1: Creating a Clean PR Description

```markdown
# Pull Request: Implement Rate Limiting on Authentication Endpoint

## Summary
Introduces an IP-based rate limiter on the `/api/v1/auth/login` endpoint using Redis to prevent brute-force attacks.

## Why
We identified a high volume of login attempts targeting single accounts. This rate limiting window slows down attackers while keeping the system responsive for genuine users.

## Verification
- Ran unit tests: `npm run test tests/auth.test.js` (all green)
- Manually verified using Postman: sending 15 requests in under 60 seconds returns `429 Too Many Requests`.

## Checklist
- [x] Code follows the style guide
- [x] Unit tests added/updated
- [x] Documentation updated
```

### Example 2: Self-Review Clean Up Commands

Before committing, run these commands to inspect the diff for accidental additions:

```bash
# Check the names of files changed to ensure no unwanted files are staged
git status --porcelain

# Review the actual diff for any leftover print statements or debuggers
git diff | grep -E "(console\.log|debugger|print\(|var_dump|binding\.pry)"
```

## Best Practices

- ✅ **Keep PRs Small and Focused**: A PR with fewer than 200 lines of changes gets reviewed and merged significantly faster than a large one.
- ✅ **Perform a Self-Review first**: Finding your own bugs and formatting issues first builds trust with the maintainers.
- ✅ **Respect Repository Guidelines**: Check the project's `CONTRIBUTING.md` and pull request templates, and adhere to them strictly.
- ❌ **Do Not Bundle Unrelated Changes**: Avoid sneaking refactoring or unrelated bug fixes into a feature PR. Create separate PRs instead.
- ❌ **Do Not Ignore CI Failures**: Always fix failing tests, linters, or security scans on your branch before requesting a review.

## Limitations

- This skill does not replace project-specific CI/CD validation, automated testing, or domain-expert reviews.
- It assumes a standard Git and GitHub-like environment, though the core principles apply to GitLab, Bitbucket, and other platforms.

## Common Pitfalls

- **Problem:** A PR is left open for a long time due to minor formatting or style comments.
  **Solution:** Always run the repository's local formatter (e.g., Prettier, ESLint, Black) before committing.
- **Problem:** Merge conflicts occur immediately after opening the PR.
  **Solution:** Pull the latest main branch and rebase or merge it into your branch daily.

## Related Skills

- `@pr-writer` - For Sentry-specific PR writing guidelines.
- `@clean-code` - To ensure code quality before submitting.


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
