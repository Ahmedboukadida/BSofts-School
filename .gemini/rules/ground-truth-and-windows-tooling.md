# BSOFTS Operational Rules: Ground Truth & Windows Tooling

> Created 2026-08-23 after the Phase 5.01 audit. These rules exist because
> every one of them was violated at least once and cost real time.

---

## Section 1 — Ground-Truth Metrics

### R1.1 The Verifier Is The Only Source
All counts (Prisma models, endpoints, pages, `any` debt, tests) MUST be
produced by:

```
powershell -ExecutionPolicy Bypass -File .agents\tools\verify-metrics.ps1
```

Never quote from memory. Never copy numbers from older vault entries.

### R1.2 Known Historical Inflations (do not repeat)
| Claimed | Reality | Found |
|---|---|---|
| 1,651 API endpoints | **145** HTTP endpoints / 111 controllers | Phase 5.01 audit |
| 152 Prisma models | **162** | Phase 5.01 audit |
| Zero `any` types | 174 backend + ~484 web at audit time | Phase 5.01 audit |
| Mobile/Desktop in progress | Both folders empty | Phase 5.01 audit |

### R1.3 Doc Drift Repair
When a verified number contradicts any file in `.agents/`, fix the file
in the same session that discovered the contradiction.

---

## Section 2 — Windows / PowerShell 5.1 Reliability

### R2.1 File Writing (BOM Hazard)
PS 5.1 `Set-Content -Encoding UTF8` writes UTF-8 **with BOM**. The Prisma
schema parser rejects BOMs; diffs get polluted.

```powershell
# CORRECT
$enc = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($path, $content, $enc)
```

### R2.2 Native Command stderr
`git add . 2>$null` in PS 5.1 can swallow the whole pipeline (staged: 0
mystery). Use `cmd /c "git ... 2>nul"` for noisy native tools instead.

### R2.3 Git On This Machine
- Full-tree `git add .` exceeds command timeouts (~200k files under
  node_modules + Defender). Always stage in chunks:
  `git add backend/src backend/prisma web/src ...`
- A killed add leaves `.git/index.lock`. Recovery: confirm no git process
  (`Get-Process git`), then delete the lock.
- Global identity: configured (`gstcpt`). Do not modify git config.

### R2.4 Prisma Discipline
- Enum values must be imported from `@prisma/client`
  (`logs_entities.permissions`), never string-cast with `as any`.

### R2.5 Strict No Remote Git Push Policy
- AI agents must NEVER execute `git push` or `git push origin main`.
- All commits must remain strictly local. The repository owner monitors and pushes changes manually.

### R2.6 Strict 5-Color Solid Palette (Zero Gradients)
- No graduation or gradients allowed anywhere in the application.
- Use strictly the 5 solid colors:
  - `#242F40` (Slate Navy / Jet Black)
  - `#363636` (Charcoal)
  - `#CCA43B` (Golden Bronze)
  - `#E5E5E5` (Light Platinum)
  - `#FFFFFF` (Pure White)

### R2.7 Zero-Error Validation & Sanitization Policy
- In `AppValidationPipe`: Maintain `whitelist: true` and `forbidNonWhitelisted: false` so that unexpected client-side auxiliary properties are safely stripped without crashing user forms with 400 Bad Request errors.
- Every legitimate business property sent by frontend forms must be explicitly declared in backend DTOs and persisted in domain services.

  Invalid enum input is rejected by Postgres AFTER your empty catch
  swallows the error — silent data loss of audit trails.
- Schema edits → `npx prisma generate` → plain `npx prisma db push`.
  Never `--accept-data-loss`. Adding enum members is additive & safe.
- Prisma CLI here is v7.x with `prisma.config.js`; generate takes ~90s.

### R2.5 Verification Loop
After ANY code change: `npx tsc --noEmit` in the touched project must
exit 0 before committing. Backend ≈30s, web ≈60s.
