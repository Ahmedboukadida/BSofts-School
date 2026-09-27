---
name: database-migrations-migration-observability
description: "Migration monitoring, CDC, and observability infrastructure"
risk: unknown
source: community
tags: "database, cdc, debezium, kafka, prometheus, grafana, monitoring"
date_added: "2026-02-27"
---

# Migration Observability and Real-time Monitoring

You are a database observability expert specializing in Change Data Capture, real-time migration monitoring, and enterprise-grade observability infrastructure. Create comprehensive monitoring solutions for database migrations with CDC pipelines, anomaly detection, and automated alerting.

## Use this skill when

- Working on migration observability and real-time monitoring tasks or workflows
- Needing guidance, best practices, or checklists for migration observability and real-time monitoring

## Do not use this skill when

- The task is unrelated to migration observability and real-time monitoring
- You need a different domain or tool outside this scope

## Context
The user needs observability infrastructure for database migrations, including real-time data synchronization via CDC, comprehensive metrics collection, alerting systems, and visual dashboards.

## Requirements
$ARGUMENTS

## Instructions

### 1. Observable MongoDB Migrations

```javascript
const { MongoClient } = require('mongodb');
const { createLogger, transports } = require('winston');
const prometheus = require('prom-client');

class ObservableAtlasMigration {
    constructor(connectionString) {
        this.client = new MongoClient(connectionString);
        this.logger = createLogger({
            transports: [
                new transports.File({ filename: 'migrations.log' }),
                new transports.Console()
            ]
        });
        this.metrics = this.setupMetrics();
    }

    setupMetrics() {
        const register = new prometheus.Registry();

        return {
            migrationDuration: new prometheus.Histogram({
                name: 'mongodb_migration_duration_seconds',
                help: 'Duration of MongoDB migrations',
                labelNames: ['version', 'status'],
                buckets: [1, 5, 15, 30, 60, 300],
                registers: [register]
            }),
            documentsProcessed: new prometheus.Counter({
                name: 'mongodb_migration_documents_total',
                help: 'Total documents processed',
                labelNames: ['version', 'collection'],
                registers: [register]
            }),
            migrationErrors: new prometheus.Counter({
                name: 'mongodb_migration_errors_total',
                help: 'Total migration errors',
                labelNames: ['version', 'error_type'],
                registers: [register]
            }),
            register
        };
    }

    async migrate() {
        await this.client.connect();
        const db = this.client.db();

        for (const [version, migration] of this.migrations) {
            await this.executeMigrationWithObservability(db, version, migration);
        }
    }

    async executeMigrationWithObservability(db, version, migration) {
        const timer = this.metrics.migrationDuration.startTimer({ version });
        const session = this.client.startSession();

        try {
            this.logger.info(`Starting migration ${version}`);

            await session.withTransaction(async () => {
                await migration.up(db, session, (collection, count) => {
                    this.metrics.documentsProcessed.inc({
                        version,
                        collection
                    }, count);
                });
            });

            timer({ status: 'success' });
            this.logger.info(`Migration ${version} completed`);

        } catch (error) {
            this.metrics.migrationErrors.inc({
                version,
                error_type: error.name
            });
            timer({ status: 'failed' });
            throw error;
        } finally {
            await session.endSession();
        }
    }
}
```

### 2. Change Data Capture with Debezium

```python
import asyncio
import json
from kafka import KafkaConsumer, KafkaProducer
from prometheus_client import Counter, Histogram, Gauge
from datetime import datetime

class CDCObservabilityManager:
    def __init__(self, config):
        self.config = config
        self.metrics = self.setup_metrics()

    def setup_metrics(self):
        return {
            'events_processed': Counter(
                'cdc_events_processed_total',
                'Total CDC events processed',
                ['source', 'table', 'operation']
            ),
            'consumer_lag': Gauge(
                'cdc_consumer_lag_messages',
                'Consumer lag in messages',
                ['topic', 'partition']
            ),
            'replication_lag': Gauge(
                'cdc_replication_lag_seconds',
                'Replication lag',
                ['source_table', 'target_table']
            )
        }

    async def setup_cdc_pipeline(self):
        self.consumer = KafkaConsumer(
            'database.changes',
            bootstrap_servers=self.config['kafka_brokers'],
            group_id='migration-consumer',
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )

        self.producer = KafkaProducer(
            bootstrap_servers=self.config['kafka_brokers'],
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )

    async def process_cdc_events(self):
        for message in self.consumer:
            event = self.parse_cdc_event(message.value)

            self.metrics['events_processed'].labels(
                source=event.source_db,
                table=event.table,
                operation=event.operation
            ).inc()

            await self.apply_to_target(
                event.table,
                event.operation,
                event.data,
                event.timestamp
            )

    async def setup_debezium_connector(self, source_config):
        connector_config = {
            "name": f"migration-connector-{source_config['name']}",
            "config": {
                "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
                "database.hostname": source_config['host'],
                "database.port": source_config['port'],
                "database.dbname": source_config['database'],
                "plugin.name": "pgoutput",
                "heartbeat.interval.ms": "10000"
            }
        }

        response = requests.post(
            f"{self.config['kafka_connect_url']}/connectors",
            json=connector_config
        )
```

### 3. Enterprise Monitoring and Alerting

```python
from prometheus_client import Counter, Gauge, Histogram, Summary
import numpy as np

class EnterpriseMigrationMonitor:
    def __init__(self, config):
        self.config = config
        self.registry = prometheus.CollectorRegistry()
        self.metrics = self.setup_metrics()
        self.alerting = AlertingSystem(config.get('alerts', {}))

    def setup_metrics(self):
        return {
            'migration_duration': Histogram(
                'migration_duration_seconds',
                'Migration duration',
                ['migration_id'],
                buckets=[60, 300, 600, 1800, 3600],
                registry=self.registry
            ),
            'rows_migrated': Counter(
                'migration_rows_total',
                'Total rows migrated',
                ['migration_id', 'table_name'],
                registry=self.registry
            ),
            'data_lag': Gauge(
                'migration_data_lag_seconds',
                'Data lag',
                ['migration_id'],
                registry=self.registry
            )
        }

    async def track_migration_progress(self, migration_id):
        while migration.status == 'running':
            stats = await self.calculate_progress_stats(migration)

            self.metrics['rows_migrated'].labels(
                migration_id=migration_id,
                table_name=migration.table
            ).inc(stats.rows_processed)

            anomalies = await self.detect_anomalies(migration_id, stats)
            if anomalies:
                await self.handle_anomalies(migration_id, anomalies)

            await asyncio.sleep(30)

    async def detect_anomalies(self, migration_id, stats):
        anomalies = []

        if stats.rows_per_second < stats.expected_rows_per_second * 0.5:
            anomalies.append({
                'type': 'low_throughput',
                'severity': 'warning',
                'message': f'Throughput below expected'
            })

        if stats.error_rate > 0.01:
            anomalies.append({
                'type': 'high_error_rate',
                'severity': 'critical',
                'message': f'Error rate exceeds threshold'
            })

        return anomalies

    async def setup_migration_dashboard(self):
        dashboard_config = {
            "dashboard": {
                "title": "Database Migration Monitoring",
                "panels": [
                    {
                        "title": "Migration Progress",
                        "targets": [{
                            "expr": "rate(migration_rows_total[5m])"
                        }]
                    },
                    {
                        "title": "Data Lag",
                        "targets": [{
                            "expr": "migration_data_lag_seconds"
                        }]
                    }
                ]
            }
        }

        response = requests.post(
            f"{self.config['grafana_url']}/api/dashboards/db",
            json=dashboard_config,
            headers={'Authorization': f"Bearer {self.config['grafana_token']}"}
        )

class AlertingSystem:
    def __init__(self, config):
        self.config = config

    async def send_alert(self, title, message, severity, **kwargs):
        if 'slack' in self.config:
            await self.send_slack_alert(title, message, severity)

        if 'email' in self.config:
            await self.send_email_alert(title, message, severity)

    async def send_slack_alert(self, title, message, severity):
        color = {
            'critical': 'danger',
            'warning': 'warning',
            'info': 'good'
        }.get(severity, 'warning')

        payload = {
            'text': title,
            'attachments': [{
                'color': color,
                'text': message
            }]
        }

        requests.post(self.config['slack']['webhook_url'], json=payload)
```

### 4. Grafana Dashboard Configuration

```python
dashboard_panels = [
    {
        "id": 1,
        "title": "Migration Progress",
        "type": "graph",
        "targets": [{
            "expr": "rate(migration_rows_total[5m])",
            "legendFormat": "{{migration_id}} - {{table_name}}"
        }]
    },
    {
        "id": 2,
        "title": "Data Lag",
        "type": "stat",
        "targets": [{
            "expr": "migration_data_lag_seconds"
        }],
        "fieldConfig": {
            "thresholds": {
                "steps": [
                    {"value": 0, "color": "green"},
                    {"value": 60, "color": "yellow"},
                    {"value": 300, "color": "red"}
                ]
            }
        }
    },
    {
        "id": 3,
        "title": "Error Rate",
        "type": "graph",
        "targets": [{
            "expr": "rate(migration_errors_total[5m])"
        }]
    }
]
```

### 5. CI/CD Integration

```yaml
name: Migration Monitoring

on:
  push:
    branches: [main]

jobs:
  monitor-migration:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Start Monitoring
        run: |
          python migration_monitor.py start \
            --migration-id ${{ github.sha }} \
            --prometheus-url ${{ secrets.PROMETHEUS_URL }}

      - name: Run Migration
        run: |
          python migrate.py --environment production

      - name: Check Migration Health
        run: |
          python migration_monitor.py check \
            --migration-id ${{ github.sha }} \
            --max-lag 300
```

## Output Format

1. **Observable MongoDB Migrations**: Atlas framework with metrics and validation
2. **CDC Pipeline with Monitoring**: Debezium integration with Kafka
3. **Enterprise Metrics Collection**: Prometheus instrumentation
4. **Anomaly Detection**: Statistical analysis
5. **Multi-channel Alerting**: Email, Slack, PagerDuty integrations
6. **Grafana Dashboard Automation**: Programmatic dashboard creation
7. **Replication Lag Tracking**: Source-to-target lag monitoring
8. **Health Check Systems**: Continuous pipeline monitoring

Focus on real-time visibility, proactive alerting, and comprehensive observability for zero-downtime migrations.

## Cross-Plugin Integration

This plugin integrates with:
- **sql-migrations**: Provides observability for SQL migrations
- **nosql-migrations**: Monitors NoSQL transformations
- **migration-integration**: Coordinates monitoring across workflows

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
