---
name: judger-ui-ux
description: Enforces strict 5-color solid palette, zero gradients, responsive tables, and contextual empty/error states.
---

# Judger UI/UX Skill

## Overview
This skill guides the design, review, and verification of user interface components and layouts for BSofts-School.

## Core Rules & Verification Procedures

### 1. Strict 5-Color Solid Palette (Zero Gradients Rule)
Verify that the codebase contains ZERO `linear-gradient`, `radial-gradient`, or Tailwind gradient classes (`bg-gradient-to-*`).
Enforce the exact 5 solid colors:
- `#242F40` (Slate Navy / Jet Black): Primary brand and dark backgrounds.
- `#363636` (Charcoal): Secondary surfaces and dark cards.
- `#CCA43B` (Golden Bronze): Active navigation, focus rings, primary CTA buttons, badges.
- `#E5E5E5` (Light Platinum): Subtle hairline borders, light card backgrounds.
- `#FFFFFF` (Pure White): Page background in light mode, clean white text in dark mode.

### 2. Informative Empty & Error States
- Never leave table views or dashboards blank on zero records.
- Provide descriptive empty states explaining how to add the first record with a direct CTA button.
- Ensure all API failures trigger actionable toast notifications (`showApiErrorToast(err)`) instead of silent failures.

### 3. Responsive Constraints
- Tables must feature horizontal scrolling with fixed column headers on mobile screens (< 768px).
- Modals must be responsive (`max-w-4xl`, `max-w-6xl`, or full-screen on mobile) with clear escape and close buttons.
