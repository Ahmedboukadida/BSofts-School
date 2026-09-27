---
name: gitops-workflow
description: "Complete guide to implementing GitOps workflows with ArgoCD and Flux for automated Kubernetes deployments."
risk: critical
source: community
date_added: "2026-02-27"
---

# GitOps Workflow

Complete guide to implementing GitOps workflows with ArgoCD and Flux for automated Kubernetes deployments.

## Purpose

Implement declarative, Git-based continuous delivery for Kubernetes using ArgoCD or Flux CD, following OpenGitOps principles.

## Use this skill when

- Set up GitOps for Kubernetes clusters
- Automate application deployments from Git
- Implement progressive delivery strategies
- Manage multi-cluster deployments
- Configure automated sync policies
- Set up secret management in GitOps

## Do not use this skill when

- You need a one-off manual deployment
- You cannot manage cluster access or repo permissions
- You are not deploying to Kubernetes

## Instructions

1. Define repo layout and desired-state conventions.
2. Install ArgoCD or Flux and connect clusters.
3. Configure sync policies, environments, and promotion flow.
4. Validate rollbacks and secret handling.

## Safety

- Avoid auto-sync to production without approvals.
- Keep secrets out of Git and use sealed or external secret managers.

## OpenGitOps Principles

1. **Declarative** - Entire system described declaratively
2. **Versioned and Immutable** - Desired state stored in Git
3. **Pulled Automatically** - Software agents pull desired state
4. **Continuously Reconciled** - Agents reconcile actual vs desired state

## ArgoCD Setup

### 1. Installation

```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

**Reference:** See `references/argocd-setup.md` for detailed setup

### 2. Repository Structure

```
gitops-repo/
├── apps/
│   ├── production/
│   │   ├── app1/
│   │   │   ├── kustomization.yaml
│   │   │   └── deployment.yaml
│   │   └── app2/
│   └── staging/
├── infrastructure/
│   ├── ingress-nginx/
│   ├── cert-manager/
│   └── monitoring/
└── argocd/
    ├── applications/
    └── projects/
```

### 3. Create Application

```yaml
# argocd/applications/my-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/org/gitops-repo
    targetRevision: main
    path: apps/production/my-app
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

### 4. App of Apps Pattern

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: applications
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/org/gitops-repo
    targetRevision: main
    path: argocd/applications
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated: {}
```

## Flux CD Setup

### 1. Installation

```bash
# Install Flux CLI
brew install fluxcd/tap/flux

# Alternative: download the official installer, inspect it, then execute it
tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT
curl -fsSLo "$tmpdir/flux-install.sh" https://fluxcd.io/install.sh
cat "$tmpdir/flux-install.sh"  # review the full installer before sudo
sudo bash "$tmpdir/flux-install.sh"

# Bootstrap Flux
flux bootstrap github \
  --owner=org \
  --repository=gitops-repo \
  --branch=main \
  --path=clusters/production \
  --personal
```

### 2. Create GitRepository

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: my-app
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/org/my-app
  ref:
    branch: main
```

### 3. Create Kustomization

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: my-app
  namespace: flux-system
spec:
  interval: 5m
  path: ./deploy
  prune: true
  sourceRef:
    kind: GitRepository
    name: my-app
```

## Sync Policies

### Auto-Sync Configuration

**ArgoCD:**
```yaml
syncPolicy:
  automated:
    prune: true      # Delete resources not in Git
    selfHeal: true   # Reconcile manual changes
    allowEmpty: false
  retry:
    limit: 5
    backoff:
      duration: 5s
      factor: 2
      maxDuration: 3m
```

**Flux:**
```yaml
spec:
  interval: 1m
  prune: true
  wait: true
  timeout: 5m
```

**Reference:** See `references/sync-policies.md`

## Progressive Delivery

### Canary Deployment with ArgoCD Rollouts

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: my-app
spec:
  replicas: 5
  strategy:
    canary:
      steps:
      - setWeight: 20
      - pause: {duration: 1m}
      - setWeight: 50
      - pause: {duration: 2m}
      - setWeight: 100
```

### Blue-Green Deployment

```yaml
strategy:
  blueGreen:
    activeService: my-app
    previewService: my-app-preview
    autoPromotionEnabled: false
```

## Secret Management

### External Secrets Operator

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: db-credentials
  data:
  - secretKey: password
    remoteRef:
      key: prod/db/password
```

### Sealed Secrets

```bash
# Encrypt secret
kubeseal --format yaml < secret.yaml > sealed-secret.yaml

# Commit sealed-secret.yaml to Git
```

## Best Practices

1. **Use separate repos or branches** for different environments
2. **Implement RBAC** for Git repositories
3. **Enable notifications** for sync failures
4. **Use health checks** for custom resources
5. **Implement approval gates** for production
6. **Keep secrets out of Git** (use External Secrets)
7. **Use App of Apps pattern** for organization
8. **Tag releases** for easy rollback
9. **Monitor sync status** with alerts
10. **Test changes** in staging first

## Troubleshooting

**Sync failures:**
```bash
argocd app get my-app
argocd app sync my-app --prune
```

**Out of sync status:**
```bash
argocd app diff my-app
argocd app sync my-app --force
```

## Related Skills

- `k8s-manifest-generator` - For creating manifests
- `helm-chart-scaffolding` - For packaging applications

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.


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
