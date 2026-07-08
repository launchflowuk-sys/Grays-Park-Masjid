-- ============================================================
-- Grays Park Masjid — Production Postgres Migration
-- Idempotent: safe to run even if some items already exist.
-- Run this in Coolify's built-in Postgres terminal.
-- ============================================================

-- ── 1. New enum types ──────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE notification_module AS ENUM (
    'donations', 'enquiries', 'courses', 'volunteers', 'members'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 2. New columns on existing tables ──────────────────────

-- members: unsubscribe token & email opt-out
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS status_token UUID NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS email_opt_out BOOLEAN NOT NULL DEFAULT FALSE;

-- admin_users: phone number
ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- announcements: banner image
ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- donation_campaigns: new campaign-builder columns
ALTER TABLE donation_campaigns
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS long_description TEXT,
  ADD COLUMN IF NOT EXISTS gallery_images JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS preset_amounts JSONB NOT NULL DEFAULT '[10, 25, 50, 100]',
  ADD COLUMN IF NOT EXISTS allow_one_time BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS allow_monthly BOOLEAN NOT NULL DEFAULT FALSE;

-- device_tokens: link to member
ALTER TABLE device_tokens
  ADD COLUMN IF NOT EXISTS member_id TEXT;

-- courses: track last update time
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- prayer_times: jummah, sunrise & manual-override flag
ALTER TABLE prayer_times
  ADD COLUMN IF NOT EXISTS jummah_khutbah TEXT,
  ADD COLUMN IF NOT EXISTS jummah_iqamah TEXT,
  ADD COLUMN IF NOT EXISTS sunrise TEXT,
  ADD COLUMN IF NOT EXISTS is_manual_override BOOLEAN NOT NULL DEFAULT FALSE;

-- gallery_media: sort order
ALTER TABLE gallery_media
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;


-- ── 3. New tables ──────────────────────────────────────────

-- Password reset tokens (admin users)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Timetable PDFs
CREATE TABLE IF NOT EXISTS timetable_pdfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  month_label TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prayer calculation settings (single-row config)
CREATE TABLE IF NOT EXISTS prayer_calculation_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  latitude DOUBLE PRECISION NOT NULL DEFAULT 51.4762,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 0.3247,
  timezone TEXT NOT NULL DEFAULT 'Europe/London',
  calculation_method TEXT NOT NULL DEFAULT 'MoonsightingCommittee',
  madhab TEXT NOT NULL DEFAULT 'hanafi',
  high_latitude_rule TEXT NOT NULL DEFAULT 'seventhofthenight',
  fajr_adjustment INTEGER NOT NULL DEFAULT 0,
  sunrise_adjustment INTEGER NOT NULL DEFAULT 0,
  dhuhr_adjustment INTEGER NOT NULL DEFAULT 0,
  asr_adjustment INTEGER NOT NULL DEFAULT 0,
  maghrib_adjustment INTEGER NOT NULL DEFAULT 0,
  isha_adjustment INTEGER NOT NULL DEFAULT 0,
  fajr_iqamah_offset INTEGER NOT NULL DEFAULT 20,
  dhuhr_iqamah_offset INTEGER NOT NULL DEFAULT 10,
  asr_iqamah_offset INTEGER NOT NULL DEFAULT 15,
  maghrib_iqamah_offset INTEGER NOT NULL DEFAULT 5,
  isha_iqamah_offset INTEGER NOT NULL DEFAULT 15,
  iqamah_rounding_minutes INTEGER NOT NULL DEFAULT 5,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quran settings (single-row config)
CREATE TABLE IF NOT EXISTS quran_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_quran_page_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  show_in_navigation BOOLEAN NOT NULL DEFAULT TRUE,
  show_on_homepage BOOLEAN NOT NULL DEFAULT TRUE,
  default_translation TEXT NOT NULL DEFAULT 'en.sahih',
  default_reciter TEXT NOT NULL DEFAULT 'ar.alafasy',
  default_display_mode TEXT NOT NULL DEFAULT 'arabic_translation',
  default_font_size TEXT NOT NULL DEFAULT 'medium',
  default_theme TEXT NOT NULL DEFAULT 'light',
  primary_api_provider TEXT NOT NULL DEFAULT 'alquran_cloud',
  fallback_api_provider TEXT NOT NULL DEFAULT 'alquran_cloud',
  cache_duration_minutes INTEGER NOT NULL DEFAULT 1440,
  attribution_text TEXT NOT NULL DEFAULT 'Qur''an text and translations provided by AlQuran.cloud.',
  homepage_title TEXT NOT NULL DEFAULT 'Ayah of the Day',
  homepage_intro TEXT NOT NULL DEFAULT 'Reflect on a verse from the Qur''an, refreshed daily.',
  homepage_button_text TEXT NOT NULL DEFAULT 'Read the Qur''an',
  homepage_button_link TEXT NOT NULL DEFAULT '/quran',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Featured Ayah (homepage Quran widget)
CREATE TABLE IF NOT EXISTS featured_ayah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  reflection_title TEXT,
  reflection_text TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  show_on_homepage BOOLEAN NOT NULL DEFAULT FALSE,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quran reflections (admin-authored notes per ayah)
CREATE TABLE IF NOT EXISTS quran_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  show_publicly BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quran cache (API response cache)
CREATE TABLE IF NOT EXISTS quran_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL,
  cache_type TEXT NOT NULL,
  data_json TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS quran_cache_cache_key_idx ON quran_cache(cache_key);

-- Push notification broadcasts log
CREATE TABLE IF NOT EXISTS notification_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL,
  ref_id TEXT,
  sent_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin notification recipients (who gets email/SMS for each module)
CREATE TABLE IF NOT EXISTS notification_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  module notification_module NOT NULL,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (admin_user_id, module)
);


-- ── 4. Seed the single-row config tables if empty ──────────

INSERT INTO prayer_calculation_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

INSERT INTO quran_settings DEFAULT VALUES
ON CONFLICT DO NOTHING;
