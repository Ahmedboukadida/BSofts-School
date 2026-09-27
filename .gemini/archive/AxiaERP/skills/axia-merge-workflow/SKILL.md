---
name: axia-merge-workflow
description: "Use whenever syncing erp-front or erp-back with the default branch, or resolving merge conflicts, in the AxiaERP repos. Trigger on requests like 'merge develop into my branch', 'fix the conflicts', 'push my changes to ahmed/Ahmed', or 'check what's changed on develop'. Encodes this repo's exact branch names, known git gotchas, and the hard rule that only the human developer performs the final merge into develop/Develop."
---

# AxiaERP git merge workflow

## Branch names (exact, case-sensitive, differs per repo)

| Repo | Personal branch | Default branch |
|---|---|---|
| erp-back | `Ahmed` | `develop` (lowercase) |
| erp-front | `ahmed` | `Develop` (capitalized) |

## Steps

1. `git fetch origin` — no slash. **Do not** run `git fetch origin/develop` or `git fetch origin/Develop`: git parses the slash as a single (invalid) remote name and fails with "does not appear to be a git repository." Fetch the whole remote, or use two separate arguments (`git fetch origin develop`).
2. Create a backup branch at the current tip before merging: `git branch <personal>-backup-YYYY-MM-DD`.
3. Merge the fetched default branch into the personal branch locally: `git merge origin/<default-branch>`.
4. Resolve conflicts. For each conflicted file, understand *why* it conflicts (often a semantic issue, like a function moved to a new location on one side — check the surrounding context, not just the marker region) before picking a side or combining both.
5. Verify clean:
   - `git status --short | grep "^UU"` should be empty.
   - Grep every touched file for `^<<<<<<<` / `^=======` / `^>>>>>>>` — zero hits.
   - Run the syntax-check pass from `qa-build-verifier` (babel-parse for JS/JSX; brace/duplicate-declaration check for C#).
6. Commit the merge, then push **only to the personal branch** (`git push origin Ahmed` or `git push origin ahmed`).
7. Stop there. Do **not** open or complete a merge into `develop`/`Develop` — that is the human developer's step, along with the actual `dotnet build`/`npm run build` verification.

## Conflict-detection gotcha

If dry-running with `git merge-tree <merge-base> <branch1> <branch2>` (old 3-arg form) to predict conflicts before committing to a real merge, don't rely on a naive `grep -c "^<<<<<<<"` against its output — some real conflicts show up only as a `changed in both` section header without inline markers in the exact spot a simple grep checks, producing false "0 conflicts" readings. For ground truth, use the real `git merge`'s own reported conflict list, or `git merge-file <ours> <base> <theirs>` for a single file (writes nothing to the repo; exit code 0/1/2 = clean/warning/conflict).

## If a merge times out or gets killed mid-way

This has happened on erp-back specifically: git's object-database writes are slow enough on this repo's mount that a large merge (touching many directories in a big .NET solution) can exceed a single command's time budget with **zero incremental progress** — retrying the identical command will not help.

If this leaves the working tree in a patchwork state (some files merged, others stuck):
1. `git ls-files --others --exclude-standard` — get the real untracked-file list (raw git error output can truncate filenames mid-string, don't trust it).
2. Manually check that list for anything legitimate and not yet committed (e.g. hand-written manual_sql scripts, diagnostic queries) — do NOT blanket `git clean` before doing this check.
3. Delete only confirmed garbage, via explicit named `rm`, one file at a time — never a wildcard delete without listing what will be removed first.
4. `git reset --hard HEAD` to snap all tracked files back to the last known-good commit.
5. Verify clean, then retry the merge.

## Hard rule

Never push to, or merge into, the default branch (`develop`/`Develop`) from an agent. The workflow ends at: locally merged, conflicts resolved, verified clean, pushed to the personal branch, and reported to the user as ready for them (and the team) to take from there.
