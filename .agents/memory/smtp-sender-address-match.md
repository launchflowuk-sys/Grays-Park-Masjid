---
name: SMTP sender address must match authenticated mailbox
description: Many SMTP providers (e.g. Hostinger) reject outgoing mail if the From address differs from the authenticated SMTP_USER account.
---

When sending email via nodemailer (or similar) through a real SMTP provider, defaulting `MAIL_FROM` to a fixed domain address (e.g. `no-reply@yourdomain.com`) that isn't the authenticated mailbox will fail with `553 5.7.1 Sender address rejected: not owned by user ...`.

**Why:** Hostinger (and many shared-hosting SMTP providers) enforce that the envelope From matches the logged-in SMTP account unless the account is explicitly configured to send-as other addresses.

**How to apply:** Default `MAIL_FROM` to `SMTP_USER` when no explicit `MAIL_FROM` is configured, i.e. `process.env.MAIL_FROM ?? smtpUser ?? fallback`. Only override with a different address if the provider/account is confirmed to allow send-as aliases.
