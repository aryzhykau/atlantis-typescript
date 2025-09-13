# Trainer Mobile Calendar — Implementation Prompt

Target branch: `mobile-calendar` (current branch)

Purpose

Provide a single, copy-paste-ready brief for an engineer or AI agent to refactor the existing Trainer mobile calendar so it: uses the real-trainings endpoint, shows only the trainer's real trainings, hides create/edit/move/cancel controls entirely for trainers, lets trainers only mark student attendance as ABSENT (with client-side validation and optimistic update), and makes event cards full-width in the timegrid slot.

Checklist (must satisfy)

- [ ] Use existing real-trainings endpoint as the data source (do not rely on `training_type`).
- [ ] Show only trainings where `event.trainer?.id === currentUser.id`.
- [ ] Do not render the green "+" create button for trainers.
- [ ] Do not render the viewmode selector for trainers.
- [ ] Do not render edit / move / cancel training actions for trainers at all.
- [ ] Trainers can mark a student's attendance as `ABSENT` only when previous status is `REGISTERED` or `PRESENT`.
- [ ] Marking absent must use optimistic UI and rollback on failure; surface toasts for success/error.
- [ ] Event cards on the trainer calendar must occupy the full width of the timegrid slot.
- [ ] Reuse existing mobile calendar components; refactor/replace existing trainer calendar instead of creating a duplicate.
- [ ] Add unit/component tests for filtering and attendance mutation behaviors.

Assumptions

1. Auth/context exposes current user with id and role (e.g., `useAuth()` or a redux store).  
2. There is an existing trainer calendar component in `calendar-v2` — we will replace/refactor it.  
3. A real-trainings API endpoint exists and is the canonical data source for trainer events.  
4. Backend supports attendance mutation; if not, the PR should add a TODO and an API spec for backend changes.  
5. Project uses React + TypeScript + MUI; tests run with Jest + React Testing Library.

Behavior & UI rules (explicit)

- Data fetching
  - Use the real-trainings endpoint to populate events.
  - In addition, client-side filter should ensure events belong to the current trainer: `event.trainer?.id === currentUser.id`.

- UI
  - Completely hide the create button (+) for trainers.
  - Completely hide the viewmode selector for trainers (no switching between templates/real trainings).
  - Do not render edit / move / cancel buttons or actions anywhere in the trainer flow.
  - Keep the weekdays row and the month-toggle button visible in the trainer mobile calendar header.
  - Event cards in trainer calendar should visually fill the timegrid slot (pass a prop to existing event card if supported or add a scoped CSS override to make event card width 100% of the slot).

- Attendance interaction
  - Trainers can only mark a student as `ABSENT`.
  - Only allow marking `ABSENT` when current status is `REGISTERED` or `PRESENT` (client-side guard).
  - On click:
    - Immediately update the local state (optimistic) to `ABSENT` and show a success toast like "Отмечено как пропуск".
    - Call the attendance API (e.g., `PATCH /trainings/:trainingId/students/:studentTrainingId` with `{ status: 'ABSENT' }`).
    - If the call fails, rollback the change and show an error toast.
  - If backend returns 403/permission error, surface message: "Нет прав для изменения посещаемости" and rollback.

Files to edit / create (exact suggestions)

1. Replace/refactor existing trainer calendar mount (role-aware change)
   - Find the file that currently renders a trainer-specific calendar (search for `Trainer` + `Calendar` or role-dependent calendar rendering inside `src/features/calendar-v2`).
   - Update it to use the real-trainings endpoint and apply the role-specific UI rules above. If a `TrainerMobileCalendar` already exists, refactor it.

2. Update `RealTrainingView`
   - File: `src/features/calendar-v2/components/EventBottomSheet/RealTrainingView.tsx`
   - Changes (minimal, backwards-compatible):
     - Add new props: `readOnlyForTrainer?: boolean` and `onMarkStudentAbsent?: (studentTrainingId: string) => Promise<void>`.
     - When `readOnlyForTrainer` is true:
       - Do not render the top-level action buttons (edit / move / cancel) or the "Добавить" student button.
       - For each student row, render a single IconButton to mark absent only when `status === 'REGISTERED' || status === 'PRESENT'` and the training is not in the past and not cancelled.
       - That IconButton should call `onMarkStudentAbsent(studentTraining.id)` and have `aria-label="Отметить как пропуск"`.

3. Attendance API helper (if not present)
   - File: `src/features/calendar-v2/api/attendance.ts`
   - Export: `export async function markStudentAbsent(trainingId: string, studentTrainingId: string): Promise<any>` which calls the backend and returns updated studentTraining. Reuse existing fetch client if present.

4. Styling tweak for full-width event cards
   - Prefer prop approach: pass `fullWidthSlot` to the event card renderer (if supported).
   - Otherwise add a scoped CSS/Emotion style under a `.TrainerCalendar` wrapper that sets the event card element to width: 100% and removes horizontal offsets.

5. Tests
   - `__tests__/TrainerCalendar.filter.test.tsx` — verify only real trainings from the endpoint and only trainer-owned events are shown.
   - `__tests__/RealTrainingView.trainerAttendance.test.tsx` — verify when `readOnlyForTrainer=true`:
     - edit/move/cancel/add UI are not rendered,
     - absent button exists only for REGISTERED/PRESENT,
     - clicking absent triggers `onMarkStudentAbsent` and optimistic UI update,
     - rollback on API failure.

Implementation steps (recommended order)

1. Locate the existing trainer calendar component and create a working branch `mobile-calendar` (the repo is already on this branch).  
2. Add the `markStudentAbsent` API helper (or reuse an existing client).  
3. Update `RealTrainingView.tsx` to accept `readOnlyForTrainer` and `onMarkStudentAbsent` props and to render the simplified trainer UI when `readOnlyForTrainer` is true. Keep default behavior unchanged for other roles.  
4. Refactor the trainer calendar mount to fetch from the real-trainings endpoint and to pass `readOnlyForTrainer` to `RealTrainingView`. Also ensure events are filtered by current trainer id.  
5. Add the CSS/prop changes to make event cards fill the slot in the trainer calendar.
6. Add tests and run them.  
7. Run TypeScript check and lint.  
8. Manual smoke test as trainer.

Edge cases & notes

- If the attendance API does not exist or trainers are not permitted to change attendance server-side, stop and add a backend TODO with a suggested API contract:

  - Endpoint: `PATCH /trainings/:trainingId/students/:studentTrainingId`
  - Body: `{ status: 'ABSENT' }`
  - Permissions: trainer may update status to `ABSENT` for students on trainings where they are the assigned trainer.

- Timezones: follow existing `dayjs` usage in calendar codebase for `training_date` and `start_time` parsing.

- Accessibility: add `aria-label`s to all new IconButtons and ensure focus states are visible.

Quality gates

- TypeScript compile (tsc).  
- ESLint + Prettier checks.  
- Jest unit tests and RTL component tests.  

Manual verification checklist for QA

- Login as trainer; ensure only their real trainings are visible.  
- Confirm green "+" and viewmode selector are not visible.  
- Confirm weekdays row and month button exist.  
- Open a training: confirm edit/move/cancel controls are absent; verify registrar student rows show absent action where allowed.  
- Mark a student absent: observe optimistic UI + persisted change.

Commit & PR instructions

- Branch name: `mobile-calendar/trainer-refactor` (create from `mobile-calendar` if not already created).  
- Commit structure: small, logical commits (API helper, RealTrainingView changes, calendar refactor, styling, tests).  
- PR description: reference this file and enumerate behavior changes for trainers.

---

If you want I can also scaffold the minimal TypeScript patch for `RealTrainingView.tsx` (add props + trainer conditional UI) and an attendance API wrapper — tell me "scaffold RealTrainingView + attendance helper" and I'll apply the edits on the `mobile-calendar` branch.
