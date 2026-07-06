---
name: Admin RBAC frontend gating
description: Backend role middleware alone isn't enough — admin UI write controls must also be hidden per-role, or read-only users see a confusing/misleading full write UI.
---

Backend routes enforcing role checks (e.g. per-resource role groups like CONTENT_WRITE, MASJID_WRITE, EDUCATION_WRITE, DONATION_WRITE, SUPER_ADMIN_ONLY) do not automatically hide the corresponding "New X" buttons, Edit/Delete icons, or editable Select controls in the admin frontend. Without frontend gating, a role like `read_only` sees full write UI that then fails/no-ops on submit — not a data security hole, but a real UX/security-clarity bug.

**Why:** Discovered via RBAC-focused e2e testing (Grays Park Masjid CMS) — visitor journey and CRUD tests all passed while missing this class of bug entirely; only a test written specifically to check role-based UI visibility caught it.

**How to apply:** When adding a new admin CRUD page (or a role system in general), pair every backend role check with a frontend `useCanWrite(roleGroup)`-style hook that conditionally renders add/edit/delete controls and disables in-place editable controls (e.g. status Select dropdowns) for roles lacking write access. Test this explicitly with an e2e pass logged in as the most restricted role, not just as an admin with full access.
