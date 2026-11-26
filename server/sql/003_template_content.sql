-- The text and photo slots a customer edits directly inside their template (wishes, coupons,
-- captions, the P.S., the lock code...). Each template has its own fields, so it's stored as JSON.
-- Run once in Supabase: SQL Editor > New query > paste > Run. Safe to run again.

alter table public.order_content
  add column if not exists template_content jsonb;
