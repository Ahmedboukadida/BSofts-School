# Premium SaaS Design System Specification
## For School Management Platform Redesign (2025-2026)

---

## Table of Contents
1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Component Patterns](#5-component-patterns)
6. [Navigation & Sidebar](#6-navigation--sidebar)
7. [Dashboard Layout](#7-dashboard-layout)
8. [Animation & Micro-interactions](#8-animation--micro-interactions)
9. [Glassmorphism & Effects](#9-glassmorphism--effects)
10. [Dark Mode](#10-dark-mode)
11. [What Makes Design Look "Expensive"](#11-what-makes-design-look-expensive)
12. [Tailwind Configuration](#12-tailwind-configuration)

---

## 1. Design Philosophy

### Core Principles (Extracted from Linear, Stripe, Vercel, Award-Winners)

| Principle | Source | Implementation |
|---|---|---|
| **Restraint over decoration** | Linear, Vercel | One accent color. Color = information, not decoration. |
| **Clarity through hierarchy** | Stripe, beQ Dashboard | Typography scale + whitespace carry 90% of visual hierarchy. |
| **Dark-first, but not dark-only** | Linear, Vercel | Dark mode is canonical; light mode is the alternate. |
| **Surface lift over shadows** | Linear, Vercel | Elevation via borders + surface opacity, not drop shadows. |
| **Motion as feedback** | Linear, Stripe | 120-180ms eased transitions. No decorative animations. |
| **Typographic precision** | All premium systems | Negative letter-spacing at display sizes. Tabular numerics for data. |
| **Density with purpose** | Linear, Stripe | 32-40px rhythm for list/table rows. Compact but never cramped. |
| **Empty states that teach** | Stripe | Never apologize for empty. Tell users what to do next. |

### The "Expensive" Feel Formula
From research across Linear, Stripe, Vercel, and award-winning SaaS dashboards:

1. **Single accent color** used sparingly (brand mark, focus rings, one CTA per section)
2. **Aggressive negative letter-spacing** at display sizes (-0.04em to -0.06em)
3. **Surface hierarchy via opacity**, not shadows or heavy borders
4. **Hairline borders** (1px, 5-8% opacity) for structure
5. **Tabular numerics** for all data display
6. **Whitespace as a design element** — generous section gaps (80-128px)
7. **Micro-interactions** under 200ms with spring physics for premium feel
8. **Monochromatic palette** with one chromatic punctuation

---

## 2. Color System

### 2.1 Primary Brand Palette (School-Focused)

For a school management platform, we use a **calm, trustworthy** palette. Inspired by Stripe's restraint + Vercel's precision.

```css
/* ─── SEMANTIC TOKENS ─── */
:root {
  /* Brand */
  --brand-primary: #4F46E5;        /* Indigo 600 — trustworthy, professional */
  --brand-primary-hover: #4338CA;  /* Indigo 700 */
  --brand-primary-active: #3730A3; /* Indigo 800 */
  --brand-primary-muted: rgba(79, 70, 229, 0.08);
  --brand-primary-subtle: rgba(79, 70, 229, 0.04);

  /* Semantic Status — reserved for status signals only */
  --color-success: #059669;        /* Emerald 600 */
  --color-success-muted: rgba(5, 150, 105, 0.08);
  --color-warning: #D97706;        /* Amber 600 */
  --color-warning-muted: rgba(217, 119, 6, 0.08);
  --color-error: #DC2626;          /* Red 600 */
  --color-error-muted: rgba(220, 38, 38, 0.08);
  --color-info: #2563EB;           /* Blue 600 */
  --color-info-muted: rgba(37, 99, 235, 0.08);
}

/* ─── LIGHT MODE ─── */
:root {
  --bg-page: #FFFFFF;
  --bg-surface: #F9FAFB;
  --bg-surface-elevated: #FFFFFF;
  --bg-surface-hover: #F3F4F6;
  --bg-surface-active: #E5E7EB;

  --border-default: #E5E7EB;
  --border-subtle: #F3F4F6;
  --border-strong: #D1D5DB;

  --text-primary: #111827;          /* Gray 900 */
  --text-secondary: #6B7280;        /* Gray 500 */
  --text-tertiary: #9CA3AF;         /* Gray 400 */
  --text-inverse: #FFFFFF;

  /* Sidebar specific */
  --sidebar-bg: #F9FAFB;
  --sidebar-border: #E5E7EB;
  --sidebar-item-hover: #F3F4F6;
  --sidebar-item-active: rgba(79, 70, 229, 0.06);
}

/* ─── DARK MODE ─── */
.dark {
  --bg-page: #0A0A0B;              /* Near-black with faint warmth, NOT pure #000 */
  --bg-surface: #111113;           /* Surface 1 */
  --bg-surface-elevated: #19191B;  /* Surface 2 */
  --bg-surface-hover: #1F1F22;     /* Surface 3 */
  --bg-surface-active: #26262A;    /* Surface 4 */

  --border-default: rgba(255, 255, 255, 0.06);  /* Hairline */
  --border-subtle: rgba(255, 255, 255, 0.03);
  --border-strong: rgba(255, 255, 255, 0.10);

  --text-primary: #F5F5F7;         /* Near-white, never pure #FFF for body */
  --text-secondary: #A1A1AA;       /* Zinc 400 */
  --text-tertiary: #71717A;        /* Zinc 500 */
  --text-inverse: #111827;

  /* Sidebar specific */
  --sidebar-bg: #111113;
  --sidebar-border: rgba(255, 255, 255, 0.06);
  --sidebar-item-hover: #19191B;
  --sidebar-item-active: rgba(79, 70, 229, 0.10);
}
```

### 2.2 Gradient Usage (Restrained)

Premium systems use gradients **sparingly** — only for hero sections or brand moments, never as background fills on cards or surfaces.

```css
/* Hero gradient — school brand feel */
--gradient-hero: linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #A855F7 100%);

/* Card hover gradient — subtle brand tint */
--gradient-card-hover: linear-gradient(135deg, rgba(79, 70, 229, 0.02) 0%, rgba(124, 58, 237, 0.02) 100%);
```

### 2.3 Color Discipline Rules

1. **Color = status, not decoration.** If it appears decoratively, it loses meaning.
2. **One accent per screen.** Brand primary on CTAs only. Never fill cards with accent.
3. **Status colors are reserved.** Green = success, Red = error, Amber = warning. Never use for decorative elements.
4. **Monochrome for everything else.** Text, borders, backgrounds — all grayscale.
5. **Dark mode colors are NOT inverted light mode.** They are independently tuned for each mode.

---

## 3. Typography

### 3.1 Font Families

| Role | Font | Fallback | Tailwind Class |
|---|---|---|---|
| **Sans (UI + Display)** | Inter Variable | -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif | `font-sans` |
| **Mono (Code + Labels)** | JetBrains Mono | 'Fira Code', ui-monospace, monospace | `font-mono` |

**Why Inter Variable:** Used by Linear, widely adopted by premium SaaS. Supports variable font weights (510, 590) that standard Inter doesn't offer. Geist Sans is another excellent option (Vercel's choice).

### 3.2 Type Scale

Based on Linear's typographic discipline + Vercel's Geist system:

| Token | Size | Line Height | Weight | Letter Spacing | Use |
|---|---|---|---|---|---|
| `display-2xl` | 60px | 1.0 | 510 | -0.03em | Hero headlines |
| `display-xl` | 48px | 1.05 | 510 | -0.03em | Section headlines |
| `display-lg` | 40px | 1.1 | 510 | -0.025em | Page titles |
| `heading-lg` | 30px | 1.2 | 510 | -0.02em | Card/panel titles |
| `heading-md` | 24px | 1.3 | 510 | -0.015em | Subsection headers |
| `heading-sm` | 20px | 1.4 | 510 | -0.01em | Widget titles |
| `body-lg` | 16px | 1.5 | 400 | 0 | Body text |
| `body-md` | 15px | 1.5 | 400 | 0 | Default UI text |
| `body-sm` | 14px | 1.5 | 400 | 0 | Secondary text |
| `caption` | 13px | 1.5 | 400 | 0.01em | Labels, metadata |
| `overline` | 11px | 1.5 | 500 | 0.06em | Section eyebrows, uppercase labels |

### 3.3 Typography Rules

1. **Negative tracking at display sizes.** Scale: -0.03em at 60px → 0 at 16px.
2. **Weight 510 for headings** (not 600 or 700). Between medium and semibold — reads as "engineered" not "marketing."
3. **Tabular numerics for data.** Font-feature-settings: "tnum" for all metric displays.
4. **Uppercase + wide tracking for overlines.** `text-xs font-medium uppercase tracking-widest`.
5. **No weight 700 anywhere in UI.** Max weight is 600 (semibold), used sparingly.
6. **Monospace for code, labels, and technical metadata.** 11-13px uppercase.

```css
/* Typography utilities */
.font-feature-tabular { font-feature-settings: "tnum"; }
.font-feature-lining { font-feature-settings: "lnum"; }
```

### 3.4 Tailwind Typography Classes

```js
// tailwind.config.js extensions
fontSize: {
  'display-2xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '510' }],
  'display-xl': ['3rem', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '510' }],
  'display-lg': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '510' }],
  'heading-lg': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '510' }],
  'heading-md': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.015em', fontWeight: '510' }],
  'heading-sm': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '510' }],
  'body-lg': ['1rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
  'body-md': ['0.9375rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
  'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
  'caption': ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '400' }],
  'overline': ['0.6875rem', { lineHeight: '1.5', letterSpacing: '0.06em', fontWeight: '500' }],
},
```

---

## 4. Spacing & Layout

### 4.1 Spacing Scale (4px base)

All premium systems use a 4px or 8px base unit. We use 4px for micro-spacing, snapping to 8px for component-level gaps.

| Token | Value | Use |
|---|---|---|
| `0` | 0px | — |
| `0.5` | 2px | Inline tight spacing |
| `1` | 4px | Micro gaps, icon-to-text |
| `1.5` | 6px | Tight component gaps |
| `2` | 8px | Default gap, padding-sm |
| `2.5` | 10px | — |
| `3` | 12px | Button padding, input padding |
| `4` | 16px | Card padding, default gap |
| `5` | 20px | — |
| `6` | 24px | Section padding, card gaps |
| `8` | 32px | Major component gaps |
| `10` | 40px | Section internal gaps |
| `12` | 48px | — |
| `16` | 64px | Section vertical padding |
| `20` | 80px | Major section gaps |
| `24` | 96px | Page section breaks |
| `32` | 128px | Full-bleed section gaps |

### 4.2 Layout Container

```css
/* Page container */
.page-container {
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 24px;
  padding-right: 24px;
}

/* At 1280px+ */
@media (min-width: 1280px) {
  .page-container {
    padding-left: 48px;
    padding-right: 48px;
  }
}
```

### 4.3 Grid System

```css
/* Dashboard grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

/* Common layouts */
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }

/* Bento grid (premium pattern) */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto;
  gap: 16px;
}
.bento-grid .span-2 { grid-column: span 2; }
.bento-grid .span-3 { grid-column: span 3; }
.bento-grid .span-4 { grid-column: span 4; }
```

### 4.4 Section Spacing

| Section Type | Vertical Gap | Use |
|---|---|---|
| Page sections | 80-96px | Between major dashboard sections |
| Card groups | 24px | Between cards in a grid |
| Related items | 16px | Within a card or panel |
| Inline elements | 8px | Tags, badges, inline items |
| Tight elements | 4px | Icon + text, label + value |

---

## 5. Component Patterns

### 5.1 Cards

**Philosophy:** Cards use **surface lift + hairline borders**, not shadows. (Linear/Vercel approach)

```tsx
// Default card
<div className="bg-bg-surface border border-border-default rounded-xl p-6">

// Elevated card (hover state)
<div className="bg-bg-surface-elevated border border-border-strong rounded-xl p-6 transition-colors duration-150 hover:border-border-strong">

// Stat card (dashboard metric)
<div className="bg-bg-surface border border-border-default rounded-xl p-6 group hover:bg-bg-surface-hover transition-colors duration-150">
  <p className="text-overline uppercase text-text-tertiary">Total Students</p>
  <p className="text-display-xl text-text-primary mt-2 font-feature-tabular">2,847</p>
  <div className="flex items-center gap-1 mt-2">
    <ArrowUp className="w-4 h-4 text-color-success" />
    <span className="text-body-sm text-color-success">+12.5%</span>
    <span className="text-caption text-text-tertiary">vs last month</span>
  </div>
</div>
```

### 5.2 Buttons

**Philosophy:** Bifurcated radius — 6px for functional buttons, 9999px for primary CTAs.

| Variant | Background | Text | Border | Radius | Height |
|---|---|---|---|---|---|
| Primary | `var(--brand-primary)` | White | None | `rounded-lg` (8px) | 40px |
| Secondary | `var(--bg-surface)` | `var(--text-primary)` | `border-default` | `rounded-lg` (8px) | 40px |
| Ghost | Transparent | `var(--text-secondary)` | None | `rounded-lg` (8px) | 40px |
| Danger | `var(--color-error)` | White | None | `rounded-lg` (8px) | 40px |
| Pill (CTA) | `var(--brand-primary)` | White | None | `rounded-full` | 44px |

```tsx
// Primary button
<button className="inline-flex items-center justify-center gap-2 px-4 h-10 bg-brand-primary text-white rounded-lg text-body-sm font-medium transition-all duration-150 hover:opacity-90 active:scale-[0.98]">

// Secondary button
<button className="inline-flex items-center justify-center gap-2 px-4 h-10 bg-bg-surface text-text-primary border border-border-default rounded-lg text-body-sm font-medium transition-all duration-150 hover:bg-bg-surface-hover">

// Ghost button
<button className="inline-flex items-center justify-center gap-2 px-4 h-10 text-text-secondary rounded-lg text-body-sm font-medium transition-colors duration-150 hover:bg-bg-surface-hover hover:text-text-primary">
```

### 5.3 Inputs

```tsx
// Default input
<input className="w-full h-10 px-3 bg-bg-surface border border-border-default rounded-lg text-body-sm text-text-primary placeholder:text-text-tertiary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary" />

// Input with label
<div className="space-y-1.5">
  <label className="text-body-sm font-medium text-text-primary">Student Name</label>
  <input className="w-full h-10 px-3 bg-bg-surface border border-border-default rounded-lg text-body-sm text-text-primary placeholder:text-text-tertiary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary" placeholder="Enter student name" />
</div>
```

### 5.4 Tables

**Philosophy:** Stripe-style data tables — sticky headers, clean rows, monochrome with status color only.

```tsx
<table className="w-full text-body-sm">
  <thead>
    <tr className="border-b border-border-default">
      <th className="text-left py-3 px-4 text-overline uppercase text-text-tertiary font-medium">Name</th>
      <th className="text-left py-3 px-4 text-overline uppercase text-text-tertiary font-medium">Grade</th>
      <th className="text-right py-3 px-4 text-overline uppercase text-text-tertiary font-medium">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-border-subtle hover:bg-bg-surface-hover transition-colors duration-100">
      <td className="py-3 px-4 text-text-primary font-medium">Ahmed Hassan</td>
      <td className="py-3 px-4 text-text-secondary">Grade 10</td>
      <td className="py-3 px-4 text-right">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption bg-color-success-muted text-color-success">Active</span>
      </td>
    </tr>
  </tbody>
</table>
```

### 5.5 Badges & Status Indicators

```tsx
// Status badges
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption font-medium bg-color-success-muted text-color-success">
  <span className="w-1.5 h-1.5 rounded-full bg-color-success" />
  Active
</span>

<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption font-medium bg-color-warning-muted text-color-warning">
  Pending
</span>

<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption font-medium bg-color-error-muted text-color-error">
  Overdue
</span>
```

### 5.6 Modals / Dialogs

```tsx
// Modal overlay
<div className="fixed inset-0 z-50 flex items-center justify-center">
  {/* Backdrop */}
  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

  {/* Modal content */}
  <div className="relative bg-bg-surface-elevated border border-border-default rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
    <h2 className="text-heading-md text-text-primary">Add New Student</h2>
    <p className="text-body-sm text-text-secondary mt-1">Fill in the details below</p>
    {/* ... form content ... */}
  </div>
</div>
```

### 5.7 Toast Notifications

```tsx
// Success toast
<div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-bg-surface-elevated border border-border-default rounded-xl px-4 py-3 shadow-lg">
  <CheckCircle className="w-5 h-5 text-color-success" />
  <div>
    <p className="text-body-sm font-medium text-text-primary">Student added</p>
    <p className="text-caption text-text-secondary">Record saved successfully</p>
  </div>
</div>
```

---

## 6. Navigation & Sidebar

### 6.1 Sidebar Design

**Philosophy:** Linear/Stripe-style — job-based labels, 32-40px row height, single accent indicator.

```tsx
<aside className="w-64 h-screen bg-sidebar-bg border-r border-sidebar-border flex flex-col">
  {/* Logo */}
  <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
    <Logo className="w-8 h-8 text-brand-primary" />
    <span className="ml-3 text-heading-sm font-medium text-text-primary">EduPlatform</span>
  </div>

  {/* Navigation */}
  <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
    {/* Section label */}
    <p className="px-3 py-2 text-overline uppercase text-text-tertiary">Overview</p>

    {/* Active item */}
    <a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-item-active text-brand-primary text-body-sm font-medium transition-colors duration-100">
      <LayoutDashboard className="w-5 h-5" />
      Dashboard
    </a>

    {/* Inactive item */}
    <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary text-body-sm font-medium transition-colors duration-100 hover:bg-sidebar-item-hover hover:text-text-primary">
      <Users className="w-5 h-5" />
      Students
    </a>

    {/* Section label */}
    <p className="px-3 py-2 mt-6 text-overline uppercase text-text-tertiary">Academic</p>

    <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary text-body-sm font-medium transition-colors duration-100 hover:bg-sidebar-item-hover hover:text-text-primary">
      <BookOpen className="w-5 h-5" />
      Classes
    </a>
  </nav>

  {/* Bottom section */}
  <div className="p-3 border-t border-sidebar-border">
    <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary text-body-sm font-medium hover:bg-sidebar-item-hover hover:text-text-primary transition-colors duration-100">
      <Settings className="w-5 h-5" />
      Settings
    </a>
  </div>
</aside>
```

### 6.2 Top Navigation Bar

```tsx
<header className="h-16 bg-bg-surface/80 backdrop-blur-xl border-b border-border-default flex items-center justify-between px-6 sticky top-0 z-40">
  {/* Left: Page title + breadcrumbs */}
  <div className="flex items-center gap-2">
    <h1 className="text-heading-md text-text-primary">Dashboard</h1>
  </div>

  {/* Right: Actions */}
  <div className="flex items-center gap-3">
    {/* Search (Cmd+K style) */}
    <button className="flex items-center gap-2 h-9 px-3 bg-bg-surface border border-border-default rounded-lg text-body-sm text-text-tertiary hover:border-border-strong transition-colors duration-150">
      <Search className="w-4 h-4" />
      <span>Search...</span>
      <kbd className="ml-4 px-1.5 py-0.5 bg-bg-surface-hover rounded text-overline">⌘K</kbd>
    </button>

    {/* Notifications */}
    <button className="relative p-2 rounded-lg text-text-secondary hover:bg-bg-surface-hover transition-colors duration-150">
      <Bell className="w-5 h-5" />
      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-color-error rounded-full" />
    </button>

    {/* Avatar */}
    <button className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-body-sm font-medium">
      MZ
    </button>
  </div>
</header>
```

### 6.3 Command Palette (⌘K)

**Pattern:** Linear's command palette — unified surface for navigation + search + actions.

```tsx
// Cmd+K overlay
<div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
  <div className="relative bg-bg-surface-elevated border border-border-default rounded-xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden">
    {/* Search input */}
    <div className="flex items-center gap-3 px-4 h-14 border-b border-border-default">
      <Search className="w-5 h-5 text-text-tertiary" />
      <input className="flex-1 bg-transparent text-body-md text-text-primary placeholder:text-text-tertiary outline-none" placeholder="Search students, classes, fees..." />
    </div>

    {/* Results */}
    <div className="py-2 px-2 max-h-80 overflow-y-auto">
      <p className="px-2 py-1.5 text-overline uppercase text-text-tertiary">Recent</p>
      <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-surface-hover transition-colors text-left">
        <Users className="w-5 h-5 text-text-tertiary" />
        <div>
          <p className="text-body-sm text-text-primary">Students</p>
          <p className="text-caption text-text-tertiary">Manage student records</p>
        </div>
      </button>
    </div>
  </div>
</div>
```

---

## 7. Dashboard Layout

### 7.1 Layout Structure

```
┌──────────────────────────────────────────────────────┐
│ Sidebar (240px)  │  Top Bar (64px, sticky)           │
│                  ├──────────────────────────────────┤
│  Logo            │                                   │
│  Nav Items       │  Page Content (scrollable)        │
│  ...             │                                   │
│  Settings        │  ┌─────────┐ ┌─────────┐         │
│                  │  │ Stat    │ │ Stat    │         │
│                  │  │ Card    │ │ Card    │         │
│                  │  └─────────┘ └─────────┘         │
│                  │  ┌───────────────────────────┐   │
│                  │  │     Main Content Area     │   │
│                  │  │     (Table / Charts)       │   │
│                  │  └───────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### 7.2 Dashboard Page Template

```tsx
<div className="flex h-screen bg-bg-page">
  {/* Sidebar */}
  <Sidebar />

  {/* Main content */}
  <div className="flex-1 flex flex-col overflow-hidden">
    {/* Top bar */}
    <TopBar />

    {/* Scrollable content */}
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-display-lg text-text-primary">Dashboard</h1>
            <p className="text-body-md text-text-secondary mt-1">Welcome back, here's what's happening today.</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 h-10 bg-brand-primary text-white rounded-lg text-body-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>

        {/* Stat cards row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Students" value="2,847" change="+12.5%" trend="up" icon={Users} />
          <StatCard title="Active Classes" value="42" change="+3" trend="up" icon={BookOpen} />
          <StatCard title="Attendance Rate" value="94.2%" change="-0.8%" trend="down" icon={Calendar} />
          <StatCard title="Fee Collection" value="$124,500" change="+8.2%" trend="up" icon={DollarSign} />
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main chart (2/3 width) */}
          <div className="lg:col-span-2 bg-bg-surface border border-border-default rounded-xl p-6">
            <h2 className="text-heading-sm text-text-primary mb-4">Enrollment Overview</h2>
            {/* Chart component */}
          </div>

          {/* Activity feed (1/3 width) */}
          <div className="bg-bg-surface border border-border-default rounded-xl p-6">
            <h2 className="text-heading-sm text-text-primary mb-4">Recent Activity</h2>
            {/* Activity items */}
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
```

### 7.3 Dashboard Stat Card Component

```tsx
function StatCard({ title, value, change, trend, icon: Icon }) {
  return (
    <div className="bg-bg-surface border border-border-default rounded-xl p-6 group hover:bg-bg-surface-hover transition-colors duration-150">
      <div className="flex items-center justify-between">
        <p className="text-overline uppercase text-text-tertiary tracking-wider">{title}</p>
        <Icon className="w-5 h-5 text-text-tertiary" />
      </div>
      <p className="text-display-xl text-text-primary mt-3 font-feature-tabular">{value}</p>
      <div className="flex items-center gap-1 mt-2">
        {trend === 'up' ? (
          <ArrowUp className="w-4 h-4 text-color-success" />
        ) : (
          <ArrowDown className="w-4 h-4 text-color-error" />
        )}
        <span className={`text-body-sm font-medium ${trend === 'up' ? 'text-color-success' : 'text-color-error'}`}>
          {change}
        </span>
        <span className="text-caption text-text-tertiary ml-1">vs last month</span>
      </div>
    </div>
  );
}
```

---

## 8. Animation & Micro-interactions

### 8.1 Core Animation Tokens

Based on Linear (120-180ms) + premium micro-interaction research:

```css
:root {
  /* Duration */
  --duration-instant: 0ms;
  --duration-fast: 100ms;
  --duration-normal: 150ms;
  --duration-slow: 200ms;
  --duration-slower: 300ms;
  --duration-page: 400ms;

  /* Easing */
  --ease-default: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 8.2 Tailwind Animation Config

```js
// tailwind.config.js
transitionDuration: {
  'instant': '0ms',
  'fast': '100ms',
  'normal': '150ms',
  'slow': '200ms',
  'slower': '300ms',
  'page': '400ms',
},
transitionTimingFunction: {
  'ease-default': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
  'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
  'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'ease-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
},
```

### 8.3 Common Interaction Patterns

```tsx
// Button hover + press
<button className="transition-all duration-normal ease-default hover:opacity-90 active:scale-[0.98]">

// Card hover lift (subtle)
<div className="transition-all duration-slow ease-default hover:-translate-y-0.5 hover:shadow-lg">

// Link underline animation
<a className="relative text-brand-primary after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-brand-primary after:transition-all after:duration-normal hover:after:w-full">

// Sidebar item hover
<a className="transition-colors duration-fast hover:bg-sidebar-item-hover">

// Fade in content
<div className="animate-in fade-in slide-in-from-bottom-2 duration-slower fill-mode-both">
```

### 8.4 Framer Motion Presets

For React + Framer Motion projects:

```tsx
import { motion } from 'framer-motion';

// Page transition
const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// Card entrance (staggered)
const cardContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
};

// Spring toggle (Linear-style)
const springToggle = {
  toggle: {
    x: isOn ? 20 : 0,
    transition: { type: 'spring', stiffness: 500, damping: 30 },
  },
};

// Modal entrance
const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, scale: 0.96, y: 10, transition: { duration: 0.15 } },
};

// Skeleton shimmer
const shimmer = {
  initial: { backgroundPosition: '-200% 0' },
  animate: { backgroundPosition: '200% 0', transition: { duration: 1.5, repeat: Infinity, ease: 'linear' } },
};
```

### 8.5 Reduced Motion

**Mandatory.** Every animation must have a reduced-motion fallback:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```tsx
// Framer Motion
import { useReducedMotion } from 'framer-motion';

function AnimatedComponent() {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      animate={prefersReduced ? {} : { y: 0, opacity: 1 }}
      transition={prefersReduced ? { duration: 0 } : { duration: 0.3 }}
    >
      {/* content */}
    </motion.div>
  );
}
```

---

## 9. Glassmorphism & Effects

### 9.1 When to Use Glass

Use glass effects **sparingly** — for overlays, floating navigation, modals. **Never** for main content cards or dashboard surfaces.

### 9.2 Glass Tokens

```css
:root {
  /* Glass surfaces */
  --glass-bg: rgba(255, 255, 255, 0.72);
  --glass-bg-heavy: rgba(255, 255, 255, 0.85);
  --glass-border: rgba(255, 255, 255, 0.18);
  --glass-blur: 16px;
  --glass-blur-heavy: 24px;
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.dark {
  --glass-bg: rgba(17, 17, 19, 0.72);
  --glass-bg-heavy: rgba(17, 17, 19, 0.85);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.32);
}
```

### 9.3 Glass Utility Classes

```css
/* Basic glass */
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(180%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(180%);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

/* Glass card */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur-heavy)) saturate(180%);
  -webkit-backdrop-filter: blur(var(--glass-blur-heavy)) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--glass-shadow);
}

/* Glass navigation bar */
.glass-nav {
  background: var(--glass-bg-heavy);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--glass-border);
}
```

### 9.4 Glass Effects via Tailwind

```tsx
// Glass top bar
<header className="sticky top-0 z-40 bg-white/80 dark:bg-bg-page/80 backdrop-blur-xl backdrop-saturate-180 border-b border-white/20 dark:border-white/5">

// Glass modal backdrop
<div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />

// Glass floating card
<div className="bg-white/70 dark:bg-bg-surface/70 backdrop-blur-xl backdrop-saturate-180 border border-white/20 dark:border-white/5 rounded-2xl shadow-xl">

// Specular highlight (top edge shine)
<div className="relative overflow-hidden">
  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
  {/* content */}
</div>
```

### 9.5 Accessibility Requirements

```css
/* Required fallbacks */
@media (prefers-reduced-transparency: reduce) {
  .glass, .glass-card, .glass-nav {
    backdrop-filter: none;
    background: var(--glass-bg-heavy); /* Solid fallback */
  }
}

@media (prefers-contrast: more) {
  .glass, .glass-card {
    backdrop-filter: none;
    background: var(--bg-surface);
    border: 1px solid var(--border-strong);
  }
}
```

---

## 10. Dark Mode

### 10.1 Dark Mode Best Practices

1. **Near-black, never pure black.** Use `#0A0A0B` or `#09090B`, not `#000000`.
2. **Surface ladder** — 4 steps of elevation via opacity, not shadows.
3. **Borders via rgba** — `rgba(255,255,255,0.06)` instead of gray hex values.
4. **Text at reduced opacity** — `#F5F5F7` for primary (not `#FFFFFF`), `#A1A1AA` for secondary.
5. **System preference detection** — follow OS setting by default.
6. **Zero flash on load** — CSS variables defined before any rendering.
7. **Independent dark tokens** — dark mode tokens are NOT inverted light mode values.

### 10.2 Dark Mode Surface Ladder

```
Page background:    #0A0A0B  (darkest)
Surface:            #111113  (+1 step)
Surface elevated:   #19191B  (+2 steps)
Surface hover:      #1F1F22  (+3 steps)
Surface active:     #26262A  (+4 steps)
```

### 10.3 Dark Mode Implementation

```tsx
// Using next-themes or similar
import { ThemeProvider } from 'next-themes';

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {/* app */}
</ThemeProvider>
```

```css
/* In globals.css */
:root {
  /* Light mode defaults */
  color-scheme: light;
}

.dark {
  color-scheme: dark;
  /* Dark mode overrides */
}
```

---

## 11. What Makes Design Look "Expensive"

### 11.1 The Premium Checklist

| Factor | How | Example |
|---|---|---|
| **Single accent** | One brand color, used sparingly | Linear's `#5e6ad2` only on CTAs |
| **Negative tracking** | -0.03em at display sizes | Linear, Vercel hero headlines |
| **Hairline borders** | 1px at 5-8% opacity | `border-white/5` in dark mode |
| **Surface opacity** | Cards at 2-5% above background | Linear `rgba(255,255,255,0.05)` |
| **Tabular numerics** | Monospaced numbers in tables | All premium dashboards |
| **Generous whitespace** | 80-128px between sections | Stripe, Vercel landing pages |
| **Micro-interactions** | Under 200ms, spring physics | Linear toggle, Vercel hover |
| **Restraint** | No gradients, no heavy shadows | Linear, Vercel |
| **Consistent density** | 32-40px row height | Linear list items |
| **No decoration** | Color = status, not decoration | Stripe dashboard |

### 11.2 Anti-Patterns to Avoid

| Anti-Pattern | Why It Looks Cheap |
|---|---|
| Multiple accent colors | Visual noise, no hierarchy |
| Heavy drop shadows | Material Design feel, not premium |
| Rounded-full on everything | Looks like a toy, not a tool |
| Font-weight 700 for headings | Reads as "marketing" not "product" |
| Bright gradient backgrounds | Decorative, not functional |
| Centered body text | Unreadable, looks amateur |
| Emoji in UI | Undermines professionalism |
| Font size > 16px for body | Too airy, loses density |
| Pure #000000 or #FFFFFF | Too harsh, no warmth |
| Hardcoded hex values | Can't theme, can't maintain |

---

## 12. Tailwind Configuration

### 12.1 Complete Config

```js
// tailwind.config.js
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Variable', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        'display-2xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '510' }],
        'display-xl': ['3rem', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '510' }],
        'display-lg': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '510' }],
        'heading-lg': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '510' }],
        'heading-md': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.015em', fontWeight: '510' }],
        'heading-sm': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '510' }],
        'body-lg': ['1rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'body-md': ['0.9375rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'caption': ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '400' }],
        'overline': ['0.6875rem', { lineHeight: '1.5', letterSpacing: '0.06em', fontWeight: '500' }],
      },
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          'primary-hover': 'var(--brand-primary-hover)',
          'primary-active': 'var(--brand-primary-active)',
          'primary-muted': 'var(--brand-primary-muted)',
          'primary-subtle': 'var(--brand-primary-subtle)',
        },
        bg: {
          page: 'var(--bg-page)',
          surface: 'var(--bg-surface)',
          'surface-elevated': 'var(--bg-surface-elevated)',
          'surface-hover': 'var(--bg-surface-hover)',
          'surface-active': 'var(--bg-surface-active)',
        },
        border: {
          default: 'var(--border-default)',
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          inverse: 'var(--text-inverse)',
        },
        color: {
          success: 'var(--color-success)',
          'success-muted': 'var(--color-success-muted)',
          warning: 'var(--color-warning)',
          'warning-muted': 'var(--color-warning-muted)',
          error: 'var(--color-error)',
          'error-muted': 'var(--color-error-muted)',
          info: 'var(--color-info)',
          'info-muted': 'var(--color-info-muted)',
        },
        sidebar: {
          bg: 'var(--sidebar-bg)',
          border: 'var(--sidebar-border)',
          'item-hover': 'var(--sidebar-item-hover)',
          'item-active': 'var(--sidebar-item-active)',
        },
      },
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
        'pill': '9999px',
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.12)',
      },
      transitionDuration: {
        'instant': '0ms',
        'fast': '100ms',
        'normal': '150ms',
        'slow': '200ms',
        'slower': '300ms',
        'page': '400ms',
      },
      transitionTimingFunction: {
        'ease-default': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px',
        '18': '72px',
        '22': '88px',
        '26': '104px',
        '30': '120px',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '16px',
        'glass-lg': '24px',
        'glass-xl': '40px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 1.5s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
```

### 12.2 Global CSS

```css
/* globals.css */
@import "tailwindcss";

@layer base {
  :root {
    color-scheme: light;
    /* All CSS variables from Section 2 */
  }

  .dark {
    color-scheme: dark;
    /* All dark mode variables from Section 2 */
  }

  * {
    border-color: var(--border-default);
  }

  body {
    background-color: var(--bg-page);
    color: var(--text-primary);
    font-family: 'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Tabular numerics for data */
  .font-feature-tabular {
    font-feature-settings: "tnum";
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Reduced transparency fallback */
  @media (prefers-reduced-transparency: reduce) {
    .glass, .glass-card, .glass-nav {
      backdrop-filter: none;
      background-color: var(--bg-surface-elevated);
    }
  }
}
```

---

## Appendix A: Color Palette Quick Reference

| Token | Light | Dark | Use |
|---|---|---|---|
| Brand Primary | `#4F46E5` | `#818CF8` | CTAs, active states, links |
| Brand Primary Hover | `#4338CA` | `#A5B4FC` | Hover states |
| Success | `#059669` | `#34D399` | Active status, positive trends |
| Warning | `#D97706` | `#FBBF24` | Pending, attention |
| Error | `#DC2626` | `#F87171` | Errors, overdue, negative trends |
| Info | `#2563EB` | `#60A5FA` | Information, links |
| Text Primary | `#111827` | `#F5F5F7` | Headings, body |
| Text Secondary | `#6B7280` | `#A1A1AA` | Descriptions, metadata |
| Text Tertiary | `#9CA3AF` | `#71717A` | Labels, placeholders |
| Border Default | `#E5E7EB` | `rgba(255,255,255,0.06)` | Card borders, dividers |
| Border Subtle | `#F3F4F6` | `rgba(255,255,255,0.03)` | Hairline dividers |
| Border Strong | `#D1D5DB` | `rgba(255,255,255,0.10)` | Focus, hover borders |
| BG Page | `#FFFFFF` | `#0A0A0B` | Page background |
| BG Surface | `#F9FAFB` | `#111113` | Card backgrounds |
| BG Surface Elevated | `#FFFFFF` | `#19191B` | Elevated panels, dropdowns |
| BG Surface Hover | `#F3F4F6` | `#1F1F22` | Hover states |
| BG Surface Active | `#E5E7EB` | `#26262A` | Active/pressed states |

## Appendix B: Spacing Quick Reference

| Tailwind | px | Use Case |
|---|---|---|
| `p-1` | 4px | Icon padding |
| `p-1.5` | 6px | Tight component padding |
| `p-2` | 8px | Small button padding |
| `p-3` | 12px | Input padding, button padding |
| `p-4` | 16px | Card internal padding |
| `p-5` | 20px | — |
| `p-6` | 24px | Standard card padding |
| `p-8` | 32px | Section internal padding |
| `p-10` | 40px | — |
| `p-12` | 48px | Large section padding |
| `p-16` | 64px | Page section vertical padding |
| `p-20` | 80px | Major section gap |
| `p-24` | 96px | Full section break |

## Appendix C: Border Radius Quick Reference

| Token | Value | Use |
|---|---|---|
| `rounded-sm` | 4px | Small elements, badges |
| `rounded-md` | 6px | Inputs, small buttons |
| `rounded-lg` | 8px | Buttons, cards (default) |
| `rounded-xl` | 12px | Cards, panels |
| `rounded-2xl` | 16px | Modals, large cards |
| `rounded-3xl` | 24px | Feature cards |
| `rounded-pill` | 9999px | Pill buttons, avatars, tags |

---

## Sources

- **Linear Design System** — `designsystems.one/design-systems/linear`, `shadcn.io/design/linear`
- **Stripe Dashboard** — `925studios.co/blog/stripe-dashboard-design-breakdown`, `mattstromawn.com/projects/stripe-dashboard`
- **Vercel Geist** — `vercel.com/geist/introduction`, `designsystems.one/design-systems/vercel-geist`
- **Award-winning dashboards** — UX Design Awards 2025-2026, A' Design Award winners
- **Premium Tailwind systems** — Unified UI, YunUI, Fragment UI, Nerio, System One
- **Glassmorphism** — glassmorphism-theme, liquidglass-tailwind, glass-ui
- **Micro-interactions** — rune.codes, siadesign.ee, Framer Motion marketplace
- **School management** — SchoolFlow, EduBoard, EduVanta, Edudash
