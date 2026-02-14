# Atlantis Admin/Owner Mobile UX Design Document

Date: 2026-02-14
Scope: Mobile UI for `ADMIN` and `OWNER` inside `atlantis-typescript`.
Out of scope (frozen): Trainer mobile UI, Calendar (trainer/admin/owner), Dashboard, Admin Management.

---

## 1) Final product decisions (confirmed)

1. Unified detail-page pattern for all detailed pages.
2. Card-based UX for list/data-grid flows (replace desktop-grid feel on mobile).
3. Swipe actions are allowed, but final preferred pattern is **left-swipe reveal action panel** (persistent until swipe right/close).
4. Global pull-to-refresh per page.
5. Invoices mobile: view + cancel only (no create/edit).
6. Training Types & Subscriptions: full read + create/edit on mobile.
7. Trainer salary: visible for `OWNER`, hidden for `ADMIN`.
8. Expenses: Option C (quick-add FAB + bottom sheet), plus stronger mobile flow.
9. Search: collapsible and easy access.
10. Filters/actions: use bottom sheets.
11. Forms: scrollable forms.
12. Data display: bold numbers; avoid low-value timestamps in list cards.
13. Main mobile header (`ATLANTIS` + burger) should stay fixed at top.
14. Client-detail primary actions should be centralized in a gradient SpeedDial FAB.
15. Form container should support feature-flag switch: dialog vs bottom sheet.

---

## 2) Core UX system for all admin/owner mobile pages

### 2.1 Page anatomy (unified)

Every page uses:
1. **Hero summary** (gradient header, title, subtitle, optional status chip)
2. **Quick stats row** (2–4 bold metric cards)
3. **Primary actions row** (context actions, e.g. add, filter, export/cancel where relevant)
4. **Main content sections** (stacked cards/sections, scrollable)
5. **Sticky/Floating action** (FAB where creation/quick entry is relevant)
6. **Fixed top header** for mobile home context

### 2.2 List/card model (for former data grids)

- Replace dense table rows with **mobile cards**.
- Card summary = 2–4 most critical fields.
- Expandable details with progressive disclosure.
- Keep visual style: gradients, paper cards, rounded corners, subtle pattern overlay.

### 2.3 Interaction model

- **Pull-to-refresh**: one global refresh per page.
- **Pull-to-refresh must be disabled while overlays are open/closing** (bottom sheets, dialogs, modals).
- **Swipe actions (preferred implemented pattern):**
  - Swipe left to reveal action panel.
  - Action panel stays open until swipe right/close.
  - Actions do not execute on swipe itself; user taps revealed action.
  - Destructive action always asks confirmation.
- **Collapsible search**: compact search trigger in header; expands inline.
- **Filters in bottom sheet**: status/date/type chips + reset/apply.
- **Confirmation**: all destructive actions require explicit confirm.
- **First-visit guidance**: use one lightweight dismissible hint, not per-card hints.

### 2.4 Responsive behavior

- Single-column vertical flow.
- Minimum touch target: 44px.
- Sticky page controls where needed (search/filter action bar).
- Avoid horizontal scrolling except micro-stat rows if necessary.
- Stack lists are full-width on mobile (edge-to-edge blocks are allowed where visually better).

### 2.5 Role visibility policy

- `OWNER`: full financial visibility.
- `ADMIN`: salary blocks removed entirely on trainer details.

---

## 3) Page-by-page design specification

## 3.1 Clients list (mobile replacement)

Current route: `/home/clients`

### UX goals
- Improve current mobile clients look and hierarchy.
- Fast scan + quick actions.

### Structure
1. Hero: “Клиенты” + count + active/inactive snapshot.
2. Quick stats: total, active, with students, pending contact tasks.
3. Search trigger + filter sheet (active status, has students, debt flag, last payment age).
4. Card list (new card design).
5. FAB: `Добавить клиента`.
6. One-time swipe hint banner (dismissible).

### Card design (new)
- Top row: full name + status chip + debt badge if needed.
- Middle row: phone/email concise.
- Footer row: students count + balance pill.
- Tap card: open details.
- Swipe left: reveal action panel.
- Revealed actions: `Редакт.` + `Статус` (activate/deactivate).
- Swipe right: close revealed panel.

### Notes
- Replace old accordion-heavy visual style with cleaner card hierarchy and better spacing.
- Students count must come from reliable source (lazy `/clients/{id}/students` fetch), not only embedded list payload.

---

## 3.2 Client detail page

Current route: `/home/clients/:clientId`

### UX goals
- Match unified detail style.
- Simplify tab-heavy desktop logic into stacked mobile sections.

### Structure (stacked, scrollable)
1. Hero summary (name, contact, status, debt snapshot).
2. Quick stats cards: students, invoices, payments, balance.
3. Primary actions centralized in SpeedDial FAB:
  - edit client
  - add payment
  - add student
  - invoice filter
  - payment filter
4. Section: `Контакты и профиль`.
5. Section: `Ученики` (cards + quick add).
6. Section: `Абонементы учеников` (important surface).
7. Section: `Инвойсы` (compact list with status chips).
8. Section: `Платежи` (latest payments + actions).
9. Section: `Финансы` summary block.

### Simplification
- Replace tabs with collapsible section cards.
- Keep only most recent N items with “Показать все” expansion.
- Use bottom sheets for filters within invoices/payments sublists.
- Remove duplicated inline CTA buttons if action exists in SpeedDial.

### Container variant policy (implemented)
- Use env feature flag for client forms on mobile:
  - `VITE_MOBILE_CLIENT_FORM_VARIANT="dialog"` → modal/dialog
  - `VITE_MOBILE_CLIENT_FORM_VARIANT="bottomsheet"` → bottom sheet
- Applies to:
  - edit client form
  - add payment form
  - add student form
  - invoice/payment filter pickers

---

## 3.3 Client Contacts (tasks)

Current route: `/home/client-contacts`

### UX goals
- Make pending queue operationally fast on mobile.

### Structure
1. Hero with pending count.
2. Quick stats: pending, in progress, done today.
3. Search + status filter (bottom sheet).
4. Contact task cards.
5. FAB: `Новая задача` (if allowed by current rules).

### Card actions
- Swipe right: mark completed.
- Swipe left: postpone/cancel (confirmation).
- Tap: open details/comments in bottom sheet.

---

## 3.4 Students list

Current route: `/home/students`

### UX goals
- Replace grid with easy scan cards.

### Structure
1. Hero + total active.
2. Stats: active, frozen subscriptions, no active subscription, upcoming expirations.
3. Collapsible search + filters bottom sheet.
4. Student cards.
5. FAB: `Добавить ученика`.

### Card content
- Student name + age + active/frozen chip.
- Parent/client mini-line.
- Subscription state mini badges.
- Next expiration relative+absolute.

### Swipe
- Right: edit/open quick actions.
- Left: toggle active/archive (safe confirmation).

---

## 3.5 Student detail page

Current route: `/home/students/:studentId`

### UX goals
- Preserve subscription management importance.
- Remove tab complexity; stacked sections.

### Structure
1. Hero summary (student identity/status).
2. Quick stats: age, active subs, sessions total, freeze status.
3. Primary actions: add subscription, edit student.
4. Section: profile + parent/client context.
5. Section: active/frozen subscriptions (priority section).
6. Section: subscription history timeline.
7. Section: quick financial/attendance indicators.

### Subscription management simplification
- Keep one prominent CTA: `Добавить абонемент`.
- For each subscription card: status, remaining sessions, date range, freeze/unfreeze actions.
- Advanced actions moved into per-card bottom sheet.

---

## 3.6 Trainers list

Current route: `/home/trainers`

### UX goals
- Mobile-first trainer directory with safe actions.

### Structure
1. Hero + active trainer count.
2. Stats: active/inactive, fixed/percent type split.
3. Search + filter sheet (active, type, workload band).
4. Trainer cards.
5. FAB: `Добавить тренера`.

### Card content
- Name + status + type chip.
- Main contact.
- Next training/day load summary.
- (No salary on list for admin consistency).

### Swipe
- Right: edit/open details.
- Left: deactivate (confirm).

---

## 3.7 Trainer detail page

Current route: `/home/trainers/:trainerId`

### UX goals
- Simplify payments tracking.
- Role-safe salary visibility.

### Structure
1. Hero summary.
2. Stats row (mobile cards).
3. Primary actions (edit/status).
4. Section: profile.
5. Section: payment tracking (simplified).
6. Section: salary (owner only).
7. Section: activity/workload indicators.

### Role rule
- `OWNER`: show salary section.
- `ADMIN`: salary section absent (not masked).

### Payment tracking simplification
- Replace complex table interactions with:
  - summary tiles (current month due/paid/remaining)
  - compact transaction cards
  - date filter in bottom sheet
  - one “view all” deep list

---

## 3.8 Training Types & Subscriptions

Current route: `/home/trainings-and-abonements`

### UX goals
- Keep mobile functionality with lower admin frequency.
- Full read + create/edit.

### Structure
1. Hero summary.
2. Segmented control / top tabs:
   - `Виды тренировок`
   - `Абонементы`
3. For each tab:
   - collapsible search
   - filter bottom sheet
   - card list
   - FAB (`Добавить` context-aware)

### Training type card
- Name, price, max participants, color indicator, active flag.
- Swipe right: edit.
- Swipe left: deactivate/archive (confirmation).

### Subscription card
- Name, sessions, validity days, price, active flag.
- Swipe right: edit.
- Swipe left: deactivate/archive (confirmation).

---

## 3.9 Invoices & Payments (view/cancel only)

Current route: `/home/invoices`

### UX goals
- Operational review and cancellation only.

### Structure
1. Hero summary with financial snapshot.
2. Segmented tabs:
   - `Инвойсы`
   - `История транзакций`
3. Search + bottom-sheet filters (status/date/client).
4. Card list per tab.

### Invoices card
- Invoice number, client, amount, status, due date.
- Secondary row: created/updated dates.
- Actions: open details; cancel (if cancellable).

### Payments history card
- Payment id/source, amount, status, timestamp.
- Optional linked invoice/client pill.
- Cancel action only where business rules allow.

### Cancellation flow
- Swipe left or overflow `Отменить`.
- Confirmation bottom sheet with reason (optional field configurable).
- Post-action toast + refresh.

### Explicit limits
- No create invoice.
- No edit invoice.

---

## 3.10 Expenses (Option C + improved mobile)

Current route: `/home/expenses`

### UX goals
- Faster daily entry without full heavy redesign cost.

### Structure
1. Hero summary (month total, today total).
2. Stats row (month, week, pending approvals if any).
3. Sections:
   - `Расходы` list cards
   - `Типы расходов` management cards
4. FAB: `Быстрый расход`.

### Quick-add bottom sheet (Option C)
- Minimal required fields first:
  - amount
  - type
  - date (default today)
  - note (optional)
- Smart defaults from latest user behavior.
- Primary action: `Сохранить`.
- Secondary action: `Сохранить и добавить ещё`.

### Expense card actions
- Swipe right: edit.
- Swipe left: delete/cancel (confirm).

---

## 4) Shared components to design/build (mobile kit)

1. `MobilePageShell` (hero, stats, actions, content slots)
2. `MobileCollapsibleSearch`
3. `MobileFilterBottomSheet`
4. `MobileActionBottomSheet`
5. `MobileRefreshContainer` (pull-to-refresh wrapper)
6. `SwipeableActionCard` (safe thresholds, haptics-ready)
7. `MetricPillCard` (bold KPI)
8. `SectionCard` (stacked detail block)
9. `QuickAddBottomSheet` (expenses first, reusable)
10. `MobileFormBottomSheet` (form container variant for mobile)

All components must preserve Atlantis gradients and base styling from current design system.

---

## 5) Safety and usability rules

- Destructive swipe never executes immediately; always confirm.
- Keep one primary CTA per screen context.
- Financial values use strong visual hierarchy.
- Do not show noisy timestamps in list rows unless they carry business value.
- Empty states always include next best action.
- Loading uses skeleton cards, not blank space.
- In dark theme, SpeedDial actions must be high-contrast (no default gray).

---

## 6) Implementation order (recommended)

1. Shared mobile kit components.
2. Clients list redesign + Client detail stacked redesign.
3. Students list + Student detail (subscription-first).
4. Trainers list + Trainer detail with role-gated salary.
5. Invoices/Payments view+cancel flow.
6. Training Types & Subscriptions mobile full read/create/edit.
7. Expenses quick-add bottom sheet + card refinements.

---

## 7) Acceptance criteria per page (high level)

- No desktop-style dense grid as primary mobile pattern.
- Card-based list and stacked details are used.
- Pull-to-refresh works globally on each page.
- Pull-to-refresh is blocked when overlays are open.
- Search is collapsible; filters/actions use bottom sheets.
- Swipe actions present with confirmations.
- Swipe list behavior uses left-reveal persistent action panel.
- Trainer salary hidden for admins and visible for owners.
- Invoices page allows view/cancel only.
- Expenses supports quick-add via bottom sheet FAB.

---

## 9) Reusable rollout checklist for remaining pages

Use this checklist for `Students`, `Trainers`, `Client Contacts`, `Invoices`, `Training Types/Subscriptions`, `Expenses`:

1. Add `MobilePageShell` + gradient hero.
2. Add 2–4 `MetricPillCard` KPIs.
3. Convert desktop rows to full-width stack cards.
4. Add `SwipeableActionCard` with left-reveal persistent actions.
5. Add one-time hint banner (dismissible) only if gesture is new.
6. Use collapsible search + `MobileFilterBottomSheet`.
7. Add FAB/SpeedDial as single action entrypoint.
8. Move duplicate inline buttons into FAB/SpeedDial actions.
9. If forms are complex, support dialog/bottomsheet variant behind env flag.
10. Ensure pull-to-refresh is disabled while overlays are open.

---

## 8) Explicitly excluded now

- Dashboard mobile redesign.
- Trainer mobile app redesign.
- Calendar redesign for any role.
- Admin Management mobile redesign.
