-- Counts recent attempts (password guesses, new orders, payments) so they can be limited.
-- Run once in Supabase: SQL Editor > New query > paste > Run. Safe to run again.

create table if not exists public.rate_limits (
  key text primary key,
  hits integer not null,
  resets_at timestamptz not null
);

-- Only the server (service role) may use it
alter table public.rate_limits enable row level security;
revoke all on table public.rate_limits from anon, authenticated;
grant select, insert, update, delete on table public.rate_limits to service_role;

create index if not exists rate_limits_resets_at_idx on public.rate_limits (resets_at);

-- Adds one attempt and returns the count so far, in a single step, so attempts made at the same
-- moment are all counted.
create or replace function public.hit_rate_limit(p_key text, p_window_seconds integer)
returns table (total integer, retry_after integer)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- now and then, clear out counters that ended long ago
  if random() < 0.01 then
    delete from public.rate_limits where resets_at < now() - interval '1 day';
  end if;

  return query
  insert into public.rate_limits as r (key, hits, resets_at)
  values (p_key, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (key) do update set
    hits = case when r.resets_at <= now() then 1 else r.hits + 1 end,
    resets_at = case when r.resets_at <= now() then excluded.resets_at else r.resets_at end
  returning r.hits, greatest(1, ceil(extract(epoch from r.resets_at - now()))::integer);
end;
$$;

revoke all on function public.hit_rate_limit(text, integer) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer) to service_role;
