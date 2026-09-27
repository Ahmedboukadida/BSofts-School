---
name: vps-server-management
description: "Manage authorized VPS hosts and server-side agents through cautious SSH and operations workflows."
category: operations
risk: critical
source: community
source_repo: davidondrej/skills
source_type: community
date_added: "2026-07-07"
author: davidondrej
tags: [vps, ssh, server-management]
tools: [claude, codex]
license: "MIT"
license_source: "https://github.com/davidondrej/skills/blob/main/LICENSE"
---

# VPS Server Management

## When to Use

- Use when the user asks to operate an authorized VPS or agent running on a remote host.
- Use when SSH, deployment, restart, status, or log inspection is needed with explicit permission.

Source of truth: `library/infrastructure.md` (read it for the latest — IPs/expirations change).

## Servers (Hostinger VPS) — 3 total

| Hostname | IP | OS | Purpose | Expires |
|---|---|---|---|---|
| openclaw-server | <IP> | Ubuntu 24.04 (Dokploy) | OpenClaw — personal instance | <expiry> |
| n8n-server | <IP> | Ubuntu 24.04 (n8n) | All n8n workflow automations (primary) | <expiry> |
| hermes-server | <IP> | Ubuntu 24.04 | Hermes Agent — Discord gateway (Vilnius, LT) | <expiry> |

SSH as `root@<IP>`.

## Access levels (never share higher than needed)

1. **App login** — e.g. `app.example.hstgr.cloud`. Build/edit workflows, no server access. Safest to share.
2. **VPS SSH** — `root@<IP>`. Docker, files, system config. Trusted technical people only.
3. **Hostinger hPanel** — `hpanel.hostinger.com`. Billing, reboot, OS reinstall. Exposes SSH creds + browser terminal, so it grants server access too. The user only.

## Managing a VPS via an agent

For multi-step or exploratory work, **SSH into the box first and launch the agent ON the VPS** (e.g. `codex --yolo`), then talk to that local-on-server agent — it has full filesystem/process context and avoids fragile SSH round-trips. For short command sequences (update, config change, restart), driving an existing SSH session directly (e.g. via a cmux pane) is fine.

When checking on a remote/on-box agent, send the user one concise status line each time: what it is doing and whether it is on track.

Claude Code cmux note: after Claude finishes, it may prefill a predicted next user message; that draft is Claude, not the user speaking.

## Agents on servers

- **OpenClaw** → openclaw-server (managed via Dokploy).
- **Hermes** → hermes-server (Discord gateway). Setup/config docs in `library/hermes/`.
- **n8n** → n8n-server.

## Hermes ops (on hermes-server)

```bash
hermes --version            # shows version + commits behind
hermes update               # auto-snapshots, updates deps, rebuilds web UI, restarts gateway itself
hermes gateway status|restart
journalctl --user -u hermes-gateway --since '5 min ago' --no-pager   # gateway logs (systemd USER service)
```

- **Default model** lives in `~/.hermes/config.yaml` under `model.provider` + `model.default` — NOT in `.env`. Change via `hermes model` (interactive) or edit the yaml directly, then `hermes gateway restart` to propagate to gateways.
- npm `EBADENGINE` warnings during update (deps want Node >=24, box runs v22) are non-blocking — do not "fix" them.
- Deeper docs (Discord/Slack/WhatsApp setup, file structure, vision config): `library/hermes/`.

## Limitations

- Adapted from `davidondrej/skills`; verify local paths, tools, credentials, and agent features before acting.
- For commands, remote access, scheduling, browser automation, or file-changing workflows, get explicit user approval and confirm the target environment first.


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
