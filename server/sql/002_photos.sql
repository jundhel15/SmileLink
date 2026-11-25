-- Private storage for customers' photos. Only the server can read or write it; recipients get
-- temporary links. Run once in Supabase: SQL Editor > New query > paste > Run. Safe to run again.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('order-photos', 'order-photos', false, 2097152, array['image/jpeg'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
