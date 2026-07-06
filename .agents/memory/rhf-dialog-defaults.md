---
name: React Hook Form stale defaultValues in always-mounted dialogs
description: A Dialog/Modal component that stays mounted and is toggled via an `open` boolean prop will not re-run its useForm(defaultValues) initializer on reopen, so form fields silently retain values from the first mount.
---

`useForm({ defaultValues })` only evaluates `defaultValues` once, at the component's first mount/render. If a Dialog wraps the form and is conditionally shown via `open`/`onOpenChange` (rather than being unmounted when closed), the form's field values will "stick" to whatever the initial `defaultValues` were — even if the props feeding those defaults (e.g. a selected filter, or a different row being edited) change on subsequent opens.

**Why:** This caused a real bug in an admin Gallery Media form: selecting a different album filter and clicking "Add Media" always saved the new media to whichever album was selected the *first* time the dialog was ever opened, because the `albumId` field's default never updated. The bug was silent — no error, just wrong data saved to the DB — and only surfaced via end-to-end testing across multiple create/filter-change cycles, not via typecheck or a single manual click-through.

**How to apply:** Whenever a form lives inside a Dialog/Sheet/Popover that is kept mounted and shown/hidden via a boolean `open` prop (common in CRUD admin UIs with shared create/edit dialogs), add a `useEffect(() => { if (!open) return; form.reset(freshDefaultValues); }, [open, ...depsFeedingDefaults])` so the form re-initializes every time it opens. Do this for both "create" (fresh empty defaults, possibly seeded from external state like an active filter) and "edit" (defaults from the row being edited) cases. Verify with an e2e test that exercises the dialog more than once with different context (different filter/row) — a single happy-path test won't catch this.
