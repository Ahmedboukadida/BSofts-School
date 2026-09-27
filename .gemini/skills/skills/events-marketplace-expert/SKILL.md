---
name: events-marketplace-expert
description: Governs event marketplace operations, 3-tier geographic hierarchy (Country -> State -> City), temporal slot occupation math (ItemOccupation overlap detection), vendor booking, and payment installments.
---

# Events Marketplace & Geography Expert Skill

## Overview
This skill provides comprehensive architectural guidance, temporal collision math formulas, and multi-tier geographic hierarchy rules extracted from the OSSEvents legacy system.

## Key Mathematical & Logic Rules

### 1. Temporal Range Overlap Collision Lock (`ItemOccupation`)
To prevent double-booking of vendors, venues, equipment, or time slots, any proposed booking range `(Start, End)` for resource `ItemID` must satisfy:
$$\text{Overlap} = \text{Start} < \text{ExistingEnd} \;\land\; \text{End} > \text{ExistingStart}$$
If an overlap exists where `is_deleted = false` and `status != CANCELLED`, the booking request MUST be rejected with a `409 Conflict` status.

### 2. 3-Tier Geographical Hierarchy Cascades
All location records filter strictly down the hierarchy:
- `Country` (`app_geo_countries`) $\rightarrow$ `State` (`app_geo_states`) $\rightarrow$ `City` (`app_geo_cities`).
- Standard dynamic dropdowns must clear child selections whenever a parent selection changes.

### 3. Payment Installments Schedule
Installment payments are calculated as integer millimes (TND) using floor division with remainder adjustment:
- $\text{BaseInstallment} = \lfloor \text{TotalAmount} / N \rfloor$
- $\text{FinalInstallment} = \text{BaseInstallment} + (\text{TotalAmount} \bmod N)$

## Standards & Quality Constraints
- All amounts MUST be stored as integer millimes.
- Always check `ItemOccupation` locks inside a database transaction (`prisma.$transaction`).
