---
name: devops-deploy
description: "DevOps e deploy de aplicacoes — Docker, CI/CD com GitHub Actions, AWS Lambda, SAM, Terraform, infraestrutura como codigo e monitoramento."
risk: critical
source: community
date_added: '2026-03-06'
author: renat
tags:
- devops
- docker
- ci-cd
- aws
- terraform
- github-actions
tools:
- claude-code
- antigravity
- cursor
- gemini-cli
- codex-cli
---

# DEVOPS-DEPLOY — Da Ideia para Producao

## Overview

DevOps e deploy de aplicacoes — Docker, CI/CD com GitHub Actions, AWS Lambda, SAM, Terraform, infraestrutura como codigo e monitoramento. Ativar para: dockerizar aplicacao, configurar pipeline CI/CD, deploy na AWS, Lambda, ECS, configurar GitHub Actions, Terraform, rollback, blue-green deploy, health checks, alertas.

## When to Use This Skill

- When you need specialized assistance with this domain

## Do Not Use This Skill When

- The task is unrelated to devops deploy
- A simpler, more specific tool can handle the request
- The user needs general-purpose assistance without domain expertise

## How It Works

> "Move fast and don't break things." — Engenharia de elite nao e lenta.
> E rapida e confiavel ao mesmo tempo.

---

## Dockerfile Otimizado (Python)

```dockerfile
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8000/health || exit 1
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Docker Compose (Dev Local)

```yaml
version: "3.9"
services:
  app:
    build: .
    ports: ["8000:8000"]
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - .:/app
    depends_on: [db, redis]
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: auri
      POSTGRES_USER: auri
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
  redis:
    image: redis:7-alpine
volumes:
  pgdata:
```

---

## Sam Template (Serverless)

```yaml

## Template.Yaml

AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Timeout: 30
    Runtime: python3.11
    Environment:
      Variables:
        ANTHROPIC_API_KEY: !Ref AnthropicApiKey
        DYNAMODB_TABLE: !Ref AuriTable

Resources:
  AuriFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/
      Handler: lambda_function.handler
      MemorySize: 512
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref AuriTable

  AuriTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: auri-users
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: userId
          AttributeType: S
      KeySchema:
        - AttributeName: userId
          KeyType: HASH
      TimeToLiveSpecification:
        AttributeName: ttl
        Enabled: true
```

## Deploy Commands

```bash

## Build E Deploy

sam build
sam deploy --guided  # primeira vez
sam deploy           # deploys seguintes

## Deploy Rapido (Sem Confirmacao)

sam deploy --no-confirm-changeset --no-fail-on-empty-changeset

## Ver Logs Em Tempo Real

sam logs -n AuriFunction --tail

## Deletar Stack

sam delete
```

---

## .Github/Workflows/Deploy.Yml

name: Deploy Auri

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: pip install -r requirements.txt
      - run: pytest tests/ -v --cov=src --cov-report=xml
      - uses: codecov/codecov-action@v4

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install bandit safety
      - run: bandit -r src/ -ll
      - run: safety check -r requirements.txt

  deploy:
    needs: [test, security]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/setup-sam@v2
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: sam build
      - run: sam deploy --no-confirm-changeset
      - name: Notify Telegram on Success
        run: |
          curl -s -X POST "https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/sendMessage" \
            -d "chat_id=${{ secrets.TELEGRAM_CHAT_ID }}" \
            -d "text=Auri deployed successfully! Commit: ${{ github.sha }}"
```

---

## Health Check Endpoint

```python
from fastapi import FastAPI
import time, os

app = FastAPI()
START_TIME = time.time()

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "uptime_seconds": time.time() - START_TIME,
        "version": os.environ.get("APP_VERSION", "unknown"),
        "environment": os.environ.get("ENV", "production")
    }
```

## Alertas Cloudwatch

```python
import boto3

def create_error_alarm(function_name: str, sns_topic_arn: str):
    cw = boto3.client("cloudwatch")
    cw.put_metric_alarm(
        AlarmName=f"{function_name}-errors",
        MetricName="Errors",
        Namespace="AWS/Lambda",
        Dimensions=[{"Name": "FunctionName", "Value": function_name}],
        Period=300,
        EvaluationPeriods=1,
        Threshold=5,
        ComparisonOperator="GreaterThanThreshold",
        AlarmActions=[sns_topic_arn],
        TreatMissingData="notBreaching"
    )
```

---

## 5. Checklist De Producao

- [ ] Variaveis de ambiente via Secrets Manager (nunca hardcoded)
- [ ] Health check endpoint respondendo
- [ ] Logs estruturados (JSON) com request_id
- [ ] Rate limiting configurado
- [ ] CORS restrito a dominios autorizados
- [ ] DynamoDB com backup automatico ativado
- [ ] Lambda com timeout adequado (10-30s)
- [ ] CloudWatch alarmes para erros e latencia
- [ ] Rollback plan documentado
- [ ] Load test antes do lancamento

---

## 6. Comandos

| Comando | Acao |
|---------|------|
| `/docker-setup` | Dockeriza a aplicacao |
| `/sam-deploy` | Deploy completo na AWS Lambda |
| `/ci-cd-setup` | Configura GitHub Actions pipeline |
| `/monitoring-setup` | Configura CloudWatch e alertas |
| `/production-checklist` | Roda checklist pre-lancamento |
| `/rollback` | Plano de rollback para versao anterior |

## Best Practices

- Provide clear, specific context about your project and requirements
- Review all suggestions before applying them to production code
- Combine with other complementary skills for comprehensive analysis

## Common Pitfalls

- Using this skill for tasks outside its domain expertise
- Applying recommendations without understanding your specific context
- Not providing enough project context for accurate analysis

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
