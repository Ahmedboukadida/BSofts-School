---
name: angular-best-practices
description: "Angular performance optimization and best practices guide. Use when writing, reviewing, or refactoring Angular code for optimal performance, bundle size, and rendering efficiency."
risk: safe
source: self
date_added: "2026-02-27"
---

# Angular Best Practices

Comprehensive performance optimization guide for Angular applications. Contains prioritized rules for eliminating performance bottlenecks, optimizing bundles, and improving rendering.

## When to Use
Reference these guidelines when:

- Writing new Angular components or pages
- Implementing data fetching patterns
- Reviewing code for performance issues
- Refactoring existing Angular code
- Optimizing bundle size or load times
- Configuring SSR/hydration

---

## Rule Categories by Priority

| Priority | Category              | Impact     | Focus                           |
| -------- | --------------------- | ---------- | ------------------------------- |
| 1        | Change Detection      | CRITICAL   | Signals, OnPush, Zoneless       |
| 2        | Async Waterfalls      | CRITICAL   | RxJS patterns, SSR preloading   |
| 3        | Bundle Optimization   | CRITICAL   | Lazy loading, tree shaking      |
| 4        | Rendering Performance | HIGH       | @defer, trackBy, virtualization |
| 5        | Server-Side Rendering | HIGH       | Hydration, prerendering         |
| 6        | Template Optimization | MEDIUM     | Control flow, pipes             |
| 7        | State Management      | MEDIUM     | Signal patterns, selectors      |
| 8        | Memory Management     | LOW-MEDIUM | Cleanup, subscriptions          |

---

## 1. Change Detection (CRITICAL)

### Use OnPush Change Detection

```typescript
// CORRECT - OnPush with Signals
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div>{{ count() }}</div>`,
})
export class CounterComponent {
  count = signal(0);
}

// WRONG - Default change detection
@Component({
  template: `<div>{{ count }}</div>`, // Checked every cycle
})
export class CounterComponent {
  count = 0;
}
```

### Prefer Signals Over Mutable Properties

```typescript
// CORRECT - Signals trigger precise updates
@Component({
  template: `
    <h1>{{ title() }}</h1>
    <p>Count: {{ count() }}</p>
  `,
})
export class DashboardComponent {
  title = signal("Dashboard");
  count = signal(0);
}

// WRONG - Mutable properties require zone.js checks
@Component({
  template: `
    <h1>{{ title }}</h1>
    <p>Count: {{ count }}</p>
  `,
})
export class DashboardComponent {
  title = "Dashboard";
  count = 0;
}
```

### Enable Zoneless for New Projects

```typescript
// main.ts - Zoneless Angular (v20+)
bootstrapApplication(AppComponent, {
  providers: [provideZonelessChangeDetection()],
});
```

**Benefits:**

- No zone.js patches on async APIs
- Smaller bundle (~15KB savings)
- Clean stack traces for debugging
- Better micro-frontend compatibility

---

## 2. Async Operations & Waterfalls (CRITICAL)

### Eliminate Sequential Data Fetching

```typescript
// WRONG - Nested subscriptions create waterfalls
this.route.params.subscribe((params) => {
  // 1. Wait for params
  this.userService.getUser(params.id).subscribe((user) => {
    // 2. Wait for user
    this.postsService.getPosts(user.id).subscribe((posts) => {
      // 3. Wait for posts
    });
  });
});

// CORRECT - Parallel execution with forkJoin
forkJoin({
  user: this.userService.getUser(id),
  posts: this.postsService.getPosts(id),
}).subscribe((data) => {
  // Fetched in parallel
});

// CORRECT - Flatten dependent calls with switchMap
this.route.params
  .pipe(
    map((p) => p.id),
    switchMap((id) => this.userService.getUser(id)),
  )
  .subscribe();
```

### Avoid Client-Side Waterfalls in SSR

```typescript
// CORRECT - Use resolvers or blocking hydration for critical data
export const route: Route = {
  path: "profile/:id",
  resolve: { data: profileResolver }, // Fetched on server before navigation
  component: ProfileComponent,
};

// WRONG - Component fetches data on init
class ProfileComponent implements OnInit {
  ngOnInit() {
    // Starts ONLY after JS loads and component renders
    this.http.get("/api/profile").subscribe();
  }
}
```

---

## 3. Bundle Optimization (CRITICAL)

### Lazy Load Routes

```typescript
// CORRECT - Lazy load feature routes
export const routes: Routes = [
  {
    path: "admin",
    loadChildren: () =>
      import("./admin/admin.routes").then((m) => m.ADMIN_ROUTES),
  },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
];

// WRONG - Eager loading everything
import { AdminModule } from "./admin/admin.module";
export const routes: Routes = [
  { path: "admin", component: AdminComponent }, // In main bundle
];
```

### Use @defer for Heavy Components

```html
<!-- CORRECT - Heavy component loads on demand -->
@defer (on viewport) {
<app-analytics-chart [data]="data()" />
} @placeholder {
<div class="chart-skeleton"></div>
}

<!-- WRONG - Heavy component in initial bundle -->
<app-analytics-chart [data]="data()" />
```

### Avoid Barrel File Re-exports

```typescript
// WRONG - Imports entire barrel, breaks tree-shaking
import { Button, Modal, Table } from "@shared/components";

// CORRECT - Direct imports
import { Button } from "@shared/components/button/button.component";
import { Modal } from "@shared/components/modal/modal.component";
```

### Dynamic Import Third-Party Libraries

```typescript
// CORRECT - Load heavy library on demand
async loadChart() {
  const { Chart } = await import('chart.js');
  this.chart = new Chart(this.canvas, config);
}

// WRONG - Bundle Chart.js in main chunk
import { Chart } from 'chart.js';
```

---

## 4. Rendering Performance (HIGH)

### Always Use trackBy with @for

```html
<!-- CORRECT - Efficient DOM updates -->
@for (item of items(); track item.id) {
<app-item-card [item]="item" />
}

<!-- WRONG - Entire list re-renders on any change -->
@for (item of items(); track $index) {
<app-item-card [item]="item" />
}
```

### Use Virtual Scrolling for Large Lists

```typescript
import { CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll } from '@angular/cdk/scrolling';

@Component({
  imports: [CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll],
  template: `
    <cdk-virtual-scroll-viewport itemSize="50" class="viewport">
      <div *cdkVirtualFor="let item of items" class="item">
        {{ item.name }}
      </div>
    </cdk-virtual-scroll-viewport>
  `
})
```

### Prefer Pure Pipes Over Methods

```typescript
// CORRECT - Pure pipe, memoized
@Pipe({ name: 'filterActive', standalone: true, pure: true })
export class FilterActivePipe implements PipeTransform {
  transform(items: Item[]): Item[] {
    return items.filter(i => i.active);
  }
}

// Template
@for (item of items() | filterActive; track item.id) { ... }

// WRONG - Method called every change detection
@for (item of getActiveItems(); track item.id) { ... }
```

### Use computed() for Derived Data

```typescript
// CORRECT - Computed, cached until dependencies change
export class ProductStore {
  products = signal<Product[]>([]);
  filter = signal('');

  filteredProducts = computed(() => {
    const f = this.filter().toLowerCase();
    return this.products().filter(p =>
      p.name.toLowerCase().includes(f)
    );
  });
}

// WRONG - Recalculates every access
get filteredProducts() {
  return this.products.filter(p =>
    p.name.toLowerCase().includes(this.filter)
  );
}
```

---

## 5. Server-Side Rendering (HIGH)

### Configure Incremental Hydration

```typescript
// app.config.ts
import {
  provideClientHydration,
  withIncrementalHydration,
} from "@angular/platform-browser";

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withIncrementalHydration(), withEventReplay()),
  ],
};
```

### Defer Non-Critical Content

```html
<!-- Critical above-the-fold content -->
<app-header />
<app-hero />

<!-- Below-fold deferred with hydration triggers -->
@defer (hydrate on viewport) {
<app-product-grid />
} @defer (hydrate on interaction) {
<app-chat-widget />
}
```

### Use TransferState for SSR Data

```typescript
@Injectable({ providedIn: "root" })
export class DataService {
  private http = inject(HttpClient);
  private transferState = inject(TransferState);
  private platformId = inject(PLATFORM_ID);

  getData(key: string): Observable<Data> {
    const stateKey = makeStateKey<Data>(key);

    if (isPlatformBrowser(this.platformId)) {
      const cached = this.transferState.get(stateKey, null);
      if (cached) {
        this.transferState.remove(stateKey);
        return of(cached);
      }
    }

    return this.http.get<Data>(`/api/${key}`).pipe(
      tap((data) => {
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(stateKey, data);
        }
      }),
    );
  }
}
```

---

## 6. Template Optimization (MEDIUM)

### Use New Control Flow Syntax

```html
<!-- CORRECT - New control flow (faster, smaller bundle) -->
@if (user()) {
<span>{{ user()!.name }}</span>
} @else {
<span>Guest</span>
} @for (item of items(); track item.id) {
<app-item [item]="item" />
} @empty {
<p>No items</p>
}

<!-- WRONG - Legacy structural directives -->
<span *ngIf="user; else guest">{{ user.name }}</span>
<ng-template #guest><span>Guest</span></ng-template>
```

### Avoid Complex Template Expressions

```typescript
// CORRECT - Precompute in component
class Component {
  items = signal<Item[]>([]);
  sortedItems = computed(() =>
    [...this.items()].sort((a, b) => a.name.localeCompare(b.name))
  );
}

// Template
@for (item of sortedItems(); track item.id) { ... }

// WRONG - Sorting in template every render
@for (item of items() | sort:'name'; track item.id) { ... }
```

---

## 7. State Management (MEDIUM)

### Use Selectors to Prevent Re-renders

```typescript
// CORRECT - Selective subscription
@Component({
  template: `<span>{{ userName() }}</span>`,
})
class HeaderComponent {
  private store = inject(Store);
  // Only re-renders when userName changes
  userName = this.store.selectSignal(selectUserName);
}

// WRONG - Subscribing to entire state
@Component({
  template: `<span>{{ state().user.name }}</span>`,
})
class HeaderComponent {
  private store = inject(Store);
  // Re-renders on ANY state change
  state = toSignal(this.store);
}
```

### Colocate State with Features

```typescript
// CORRECT - Feature-scoped store
@Injectable() // NOT providedIn: 'root'
export class ProductStore { ... }

@Component({
  providers: [ProductStore], // Scoped to component tree
})
export class ProductPageComponent {
  store = inject(ProductStore);
}

// WRONG - Everything in global store
@Injectable({ providedIn: 'root' })
export class GlobalStore {
  // Contains ALL app state - hard to tree-shake
}
```

---

## 8. Memory Management (LOW-MEDIUM)

### Use takeUntilDestroyed for Subscriptions

```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({...})
export class DataComponent {
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.data$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => this.process(data));
  }
}

// WRONG - Manual subscription management
export class DataComponent implements OnDestroy {
  private subscription!: Subscription;

  ngOnInit() {
    this.subscription = this.data$.subscribe(...);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe(); // Easy to forget
  }
}
```

### Prefer Signals Over Subscriptions

```typescript
// CORRECT - No subscription needed
@Component({
  template: `<div>{{ data().name }}</div>`,
})
export class Component {
  data = toSignal(this.service.data$, { initialValue: null });
}

// WRONG - Manual subscription
@Component({
  template: `<div>{{ data?.name }}</div>`,
})
export class Component implements OnInit, OnDestroy {
  data: Data | null = null;
  private sub!: Subscription;

  ngOnInit() {
    this.sub = this.service.data$.subscribe((d) => (this.data = d));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
```

---

## Quick Reference Checklist

### New Component

- [ ] `changeDetection: ChangeDetectionStrategy.OnPush`
- [ ] `standalone: true`
- [ ] Signals for state (`signal()`, `input()`, `output()`)
- [ ] `inject()` for dependencies
- [ ] `@for` with `track` expression

### Performance Review

- [ ] No methods in templates (use pipes or computed)
- [ ] Large lists virtualized
- [ ] Heavy components deferred
- [ ] Routes lazy-loaded
- [ ] Third-party libs dynamically imported

### SSR Check

- [ ] Hydration configured
- [ ] Critical content renders first
- [ ] Non-critical content uses `@defer (hydrate on ...)`
- [ ] TransferState for server-fetched data

---

## Resources

- [Angular Performance Guide](https://angular.dev/best-practices/performance)
- [Zoneless Angular](https://angular.dev/guide/experimental/zoneless)
- [Angular SSR Guide](https://angular.dev/guide/ssr)
- [Change Detection Deep Dive](https://angular.dev/guide/change-detection)
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
