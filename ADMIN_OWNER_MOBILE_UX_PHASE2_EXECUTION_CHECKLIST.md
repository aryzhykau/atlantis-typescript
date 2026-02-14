# Atlantis Admin/Owner Mobile UX — Phase 2 Execution Checklist

Date: 2026-02-14  
Branch: `feat/admin-owner-mobile-ux-phase2`

This checklist is the execution plan for the remaining mobile work after Phase 1.

## 1) Scope and constraints

### Included in Phase 2
- Client Contacts mobile redesign
- Trainers list/detail mobile redesign (admin/owner safe visibility)
- Invoices/Payments mobile redesign (view + cancel only)
- Training Types & Subscriptions mobile redesign (full read + create/edit)
- Expenses mobile redesign (Option C quick-add + improved list)

### Explicitly excluded
- Dashboard redesign
- Calendar redesign
- Trainer mobile app redesign
- Admin Management redesign

---

## 2) Definition of done (per page)

- [ ] Mobile-first card stack replaces desktop-style dense table as primary view
- [ ] Pull-to-refresh is available and disabled while overlays are open
- [ ] Collapsible search exists in header
- [ ] Filters use bottom sheet
- [ ] Swipe actions use left-reveal persistent panel
- [ ] All destructive actions have explicit confirmation
- [ ] One primary action entry point (FAB/SpeedDial) where relevant
- [ ] UI preserves Atlantis gradients/base visual language

---

## 3) Execution backlog

## 3.1 Client Contacts (`/home/client-contacts`)

### Deliverables
- [x] New mobile page shell with hero + stats
- [x] Card stack for contact tasks
- [x] Search + filter bottom sheet (status/reason)
- [x] Swipe actions: call + mark done
- [x] One-time swipe hint
- [x] Route mobile menu to new mobile page

### Acceptance checks
- [ ] Pending-only and all-status modes work
- [ ] Mark done updates list without full reload glitches
- [ ] Contact phone action is easy to reach from card/reveal

Status: **In progress** (implemented, pending QA polish)

---

## 3.2 Trainers (list + detail)

### Deliverables
- [x] Trainers mobile list card stack with filters + swipe
- [ ] Trainer detail mobile structure aligned to unified pattern
- [ ] Salary visibility strictly role-gated (`OWNER` visible, `ADMIN` hidden)
- [ ] Detail actions centralized (SpeedDial)

### Acceptance checks
- [ ] Admin cannot see salary blocks anywhere on trainer detail mobile
- [ ] Owner can see salary section and actions

Status: **In progress**

---

## 3.3 Invoices & Payments (`/home/invoices`)

### Deliverables
- [x] Mobile segmented flow: invoices / transactions
- [x] Mobile card stack for both tabs
- [x] Filters in bottom sheet
- [x] Cancel-only action with confirmation

### Acceptance checks
- [ ] No create/edit invoice flows exposed on mobile
- [ ] Cancel flow updates status and cards correctly

Status: **In progress**

---

## 3.4 Training Types & Subscriptions (`/home/trainings-and-abonements`)

### Deliverables
- [x] Mobile segmented flow for training types / subscriptions
- [x] Card stacks + swipe edit/archive actions
- [x] FAB for create in current segment
- [x] Forms support dialog/bottomsheet variant policy

### Acceptance checks
- [ ] Full read + create/edit works on mobile
- [ ] Archive/deactivate requires confirmation

Status: **In progress**

---

## 3.5 Expenses (`/home/expenses`)

### Deliverables
- [x] Mobile page shell + stats
- [x] Expense card list + filters
- [x] Quick-add bottom sheet FAB (Option C)
- [x] Edit/delete swipe actions with confirmation

### Acceptance checks
- [ ] Quick-add path supports save and save+add-next flow
- [ ] Pull-to-refresh + overlay protection works

Status: **In progress**

---

## 4) Implementation order

1. Client Contacts (start here)
2. Trainers list/detail
3. Invoices & Payments
4. Training Types & Subscriptions
5. Expenses

---

## 5) Progress log

- 2026-02-14: Branch created (`feat/admin-owner-mobile-ux-phase2`), checklist created.
- 2026-02-14: Implemented initial `MobileClientContactsPage` and switched mobile route for `client-contacts`.
- 2026-02-14: Implemented `MobileTrainersListPage` and switched mobile route for `trainers`.
- 2026-02-14: Implemented initial `MobileInvoicesPaymentsPage` and switched mobile route for `invoices`.
- 2026-02-14: Started `Training Types & Subscriptions` mobile: segmented page, swipe actions, FAB create, and bottom-sheet form support.
- 2026-02-14: Started `Expenses` mobile: card list, filters, quick-add bottom sheet (save / save+add-next), swipe edit/delete with confirmations.
