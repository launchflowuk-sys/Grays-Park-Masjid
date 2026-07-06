---
name: Drizzle-zod patch schema must not reuse insert-omit fields
description: PATCH/PUT admin routes built from insertXSchema.partial() silently drop fields the insert schema intentionally omits, breaking updates to those fields.
---

Some `insertXSchema` definitions (built with drizzle-zod's `createInsertSchema`) intentionally `.omit()` server-managed fields like `status` (e.g. enquiries, courses, volunteers `status` defaults to `"new"` and isn't settable on create). If that same insert schema is reused as the PATCH schema (`insertXSchema.partial()`) for an admin update route, the omitted field can never be updated — the field is stripped during validation, so an update that only changes that field results in an empty payload and a DB-layer "No values to set" error.

**Why:** Hit this with the enquiries admin route: the generic `registerAdminItemRoutes` helper does `patchSchema.safeParse(body)` then `.set(parsed.data)`; because `insertEnquirySchema` omits `status`, changing an enquiry's status via the admin UI always produced an empty update and a 500.

**How to apply:** When adding a PATCH/PUT route for a table whose insert schema omits a server-managed field that admins should still be able to edit (status enums, active/published flags added only for insert-time exclusion, etc.), define a **separate** patch schema (e.g. `patchXSchema = createInsertSchema(table).omit({id, createdAt}).partial()`) that includes that field, rather than defaulting to `insertXSchema.partial()`. Check any table with `.omit({..., status: true})` in its insert schema (grep `schema: .omit(` across `lib/db/src/schema/*.ts`) if building admin edit routes for it — courses.ts and volunteers.ts have the same pattern and may need the same fix when their admin CRUD routes are built.
