-- =====================================================================
-- POWER PLAY Gaming Cafe Management System  -  Supabase schema
-- Run this whole file once in: Supabase Dashboard > SQL Editor > New query
-- =====================================================================
create extension if not exists pgcrypto;

-- ---------- 1. users (staff / admin profiles linked to Supabase Auth) ----------
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  role text not null default 'staff' check (role in ('admin','staff')),
  active boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- settings (single row) ----------
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  cafe_name text not null default 'POWER PLAY GAMING CAFE',
  logo_url text,
  address text not null default '',
  phone text not null default '',
  receipt_footer text not null default 'Thank you for playing! See you again.',
  receipt_prefix text not null default 'PP-',
  show_logo_on_receipt boolean not null default false,
  billing_method text not null default 'per_minute' check (billing_method in ('per_minute','per_30_min','per_hour')),
  next_receipt_no bigint not null default 1
);
insert into public.settings (id) values (1) on conflict do nothing;

-- ---------- 2. gaming_stations ----------
create table if not exists public.gaming_stations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('ps5','simulator')),
  status text not null default 'available' check (status in ('available','occupied','maintenance')),
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create unique index if not exists gaming_stations_name_uq on public.gaming_stations (lower(name)) where active;

-- ---------- 3. pricing_rules ----------
create table if not exists public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('ps5','simulator')),
  station_id uuid references public.gaming_stations(id) on delete cascade,  -- null = applies to whole category
  label text not null,
  players int not null check (players between 1 and 10),
  hourly_rate numeric(10,2) not null check (hourly_rate >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists pricing_rules_uq on public.pricing_rules
  (category, players, lower(label), coalesce(station_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- ---------- 6. discounts (presets) ----------
create table if not exists public.discounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('percent','flat')),
  value numeric(10,2) not null check (value > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- 4. gaming_sessions ----------
create table if not exists public.gaming_sessions (
  id uuid primary key default gen_random_uuid(),
  session_no bigint generated always as identity unique,
  station_id uuid not null references public.gaming_stations(id),
  station_name text not null,                 -- snapshot
  category text not null,                     -- snapshot
  players int not null,
  pricing_label text not null,                -- snapshot
  pricing_rule_id uuid references public.pricing_rules(id) on delete set null,
  customer_name text,
  customer_phone text,
  check_in timestamptz not null default now(),
  check_out timestamptz,
  hourly_rate numeric(10,2) not null,         -- snapshot: old bills never change
  billing_method text not null,               -- snapshot
  discount_type text check (discount_type in ('percent','flat')),
  discount_value numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  duration_minutes int,
  subtotal numeric(10,2),
  final_amount numeric(10,2),
  status text not null default 'active' check (status in ('active','ended','completed')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid')),
  payment_method text check (payment_method in ('cash','upi','card','other')),
  receipt_no bigint,
  started_by uuid references public.users(id),
  ended_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  constraint checkout_after_checkin check (check_out is null or check_out >= check_in),
  constraint ended_needs_checkout check (status = 'active' or check_out is not null)
);
-- Two customers can never hold the same station at once:
create unique index if not exists one_active_session_per_station
  on public.gaming_sessions (station_id) where status = 'active';
create index if not exists sessions_check_in_idx on public.gaming_sessions (check_in desc);
create index if not exists sessions_status_idx on public.gaming_sessions (status);

-- ---------- 5. payments ----------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.gaming_sessions(id),
  amount numeric(10,2) not null check (amount >= 0),
  method text not null check (method in ('cash','upi','card','other')),
  receipt_no bigint not null,
  received_by uuid references public.users(id),
  paid_at timestamptz not null default now()
);

-- ---------- 7. audit_logs ----------
create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  user_id uuid,
  user_name text,
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_created_idx on public.audit_logs (created_at desc);

-- =====================================================================
-- Helper functions
-- =====================================================================
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.users where id = auth.uid() and active) $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.users where id = auth.uid() and active and role = 'admin') $$;

create or replace function public.has_users() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.users) $$;

-- Server clock, so every screen computes timers from the same time source
create or replace function public.server_now() returns timestamptz
language sql stable as $$ select now() $$;

-- First account ever created becomes the active admin. Everyone else starts
-- inactive (an admin must approve them), so open sign-ups are harmless.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare first_user boolean;
begin
  perform pg_advisory_xact_lock(4242);
  select not exists (select 1 from public.users) into first_user;
  insert into public.users (id, full_name, email, role, active)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email,
          case when first_user then 'admin' else 'staff' end, first_user);
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- billing maths (the single source of truth) ----------
create or replace function public.calc_amount(p_minutes int, p_rate numeric, p_method text)
returns numeric language sql immutable as $$
  select case
    when p_minutes <= 0 then 0
    when p_method = 'per_30_min' then round(ceil(p_minutes / 30.0) * p_rate / 2)
    when p_method = 'per_hour'   then round(ceil(p_minutes / 60.0) * p_rate)
    else round(p_minutes * p_rate / 60.0)
  end
$$;

create or replace function public.calc_discount(p_sub numeric, p_type text, p_val numeric)
returns numeric language sql immutable as $$
  select least(p_sub, coalesce(round(case p_type
      when 'percent' then p_sub * least(p_val, 100) / 100.0
      when 'flat' then p_val else 0 end), 0))
$$;

-- ---------- audit trigger for configuration tables ----------
create or replace function public.audit_trigger() returns trigger
language plpgsql security definer set search_path = public as $$
declare uname text;
begin
  if TG_TABLE_NAME = 'settings' and TG_OP = 'UPDATE'
     and (to_jsonb(NEW) - 'next_receipt_no') = (to_jsonb(OLD) - 'next_receipt_no') then
    return NEW;
  end if;
  select full_name into uname from public.users where id = auth.uid();
  insert into public.audit_logs (user_id, user_name, action, entity, entity_id, details)
  values (auth.uid(), uname, lower(TG_OP), TG_TABLE_NAME,
          coalesce(to_jsonb(coalesce(NEW, OLD))->>'id',''),
          case TG_OP
            when 'DELETE' then jsonb_build_object('old', to_jsonb(OLD) - 'logo_url')
            when 'UPDATE' then jsonb_build_object('old', to_jsonb(OLD) - 'logo_url', 'new', to_jsonb(NEW) - 'logo_url')
            else jsonb_build_object('new', to_jsonb(NEW) - 'logo_url') end);
  return coalesce(NEW, OLD);
end $$;

do $$
declare t text;
begin
  foreach t in array array['gaming_stations','pricing_rules','discounts','settings','users'] loop
    execute format('drop trigger if exists audit_%1$s on public.%1$s', t);
    execute format('create trigger audit_%1$s after insert or update or delete on public.%1$s
                    for each row execute function public.audit_trigger()', t);
  end loop;
end $$;

create or replace function public.log_audit(p_action text, p_entity text, p_id text, p_details jsonb default null)
returns void language plpgsql security definer set search_path = public as $$
declare uname text;
begin
  if not public.is_staff() then raise exception 'Not authorised'; end if;
  select full_name into uname from public.users where id = auth.uid();
  insert into public.audit_logs (user_id, user_name, action, entity, entity_id, details)
  values (auth.uid(), uname, p_action, p_entity, p_id, p_details);
end $$;

-- =====================================================================
-- Session workflow (all writes to sessions go through these functions)
-- =====================================================================
create or replace function public.start_session(
  p_station uuid, p_rule uuid, p_name text, p_phone text, p_disc_type text, p_disc_value numeric)
returns public.gaming_sessions language plpgsql security definer set search_path = public as $$
declare st public.gaming_stations; r public.pricing_rules; s public.gaming_sessions;
        m text; dt text := p_disc_type; dv numeric := coalesce(p_disc_value, 0);
begin
  if not public.is_staff() then raise exception 'Not authorised'; end if;
  select * into st from public.gaming_stations where id = p_station and active for update;
  if not found then raise exception 'Station not found'; end if;
  if st.status = 'maintenance' then raise exception '% is under maintenance', st.name; end if;
  if exists (select 1 from public.gaming_sessions where station_id = st.id and status = 'active') then
    raise exception '% is already occupied', st.name;
  end if;
  select * into r from public.pricing_rules
   where id = p_rule and active and category = st.category and (station_id is null or station_id = st.id);
  if not found then raise exception 'Select a valid pricing category'; end if;
  select billing_method into m from public.settings where id = 1;
  if dt is null or dv <= 0 then dt := null; dv := 0; end if;
  if dt = 'percent' and dv > 100 then raise exception 'Discount cannot exceed 100%%'; end if;

  insert into public.gaming_sessions (station_id, station_name, category, players, pricing_label,
      pricing_rule_id, customer_name, customer_phone, hourly_rate, billing_method,
      discount_type, discount_value, started_by)
  values (st.id, st.name, st.category, r.players, r.label, r.id, nullif(trim(p_name),''),
      nullif(trim(p_phone),''), r.hourly_rate, m, dt, dv, auth.uid())
  returning * into s;

  update public.gaming_stations set status = 'occupied' where id = st.id;
  perform public.log_audit('start_session','gaming_sessions', s.id::text,
      jsonb_build_object('session_no', s.session_no, 'station', st.name));
  return s;
end $$;

create or replace function public.end_session(p_session uuid)
returns public.gaming_sessions language plpgsql security definer set search_path = public as $$
declare s public.gaming_sessions; mins int; sub numeric; d numeric;
begin
  if not public.is_staff() then raise exception 'Not authorised'; end if;
  select * into s from public.gaming_sessions where id = p_session for update;
  if not found then raise exception 'Session not found'; end if;
  if s.status <> 'active' then raise exception 'This session has already ended'; end if;
  mins := ceil(extract(epoch from (now() - s.check_in)) / 60.0)::int;
  sub := public.calc_amount(mins, s.hourly_rate, s.billing_method);
  d := public.calc_discount(sub, s.discount_type, s.discount_value);
  update public.gaming_sessions
     set check_out = now(), duration_minutes = mins, subtotal = sub, discount_amount = d,
         final_amount = sub - d, status = 'ended', ended_by = auth.uid()
   where id = s.id returning * into s;
  update public.gaming_stations set status = 'available' where id = s.station_id and status = 'occupied';
  perform public.log_audit('end_session','gaming_sessions', s.id::text,
      jsonb_build_object('session_no', s.session_no, 'minutes', mins, 'amount', s.final_amount));
  return s;
end $$;

create or replace function public.complete_payment(p_session uuid, p_method text)
returns public.gaming_sessions language plpgsql security definer set search_path = public as $$
declare s public.gaming_sessions; rn bigint;
begin
  if not public.is_staff() then raise exception 'Not authorised'; end if;
  if p_method not in ('cash','upi','card','other') then raise exception 'Choose a payment method'; end if;
  select * into s from public.gaming_sessions where id = p_session for update;
  if not found then raise exception 'Session not found'; end if;
  if s.status <> 'ended' then raise exception 'Payment already taken or session still running'; end if;
  select next_receipt_no into rn from public.settings where id = 1 for update;
  update public.settings set next_receipt_no = rn + 1 where id = 1;
  insert into public.payments (session_id, amount, method, receipt_no, received_by)
  values (s.id, s.final_amount, p_method, rn, auth.uid());
  update public.gaming_sessions
     set status = 'completed', payment_status = 'paid', payment_method = p_method, receipt_no = rn
   where id = s.id returning * into s;
  perform public.log_audit('payment','gaming_sessions', s.id::text,
      jsonb_build_object('session_no', s.session_no, 'amount', s.final_amount, 'method', p_method));
  return s;
end $$;

create or replace function public.set_station_status(p_station uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'Not authorised'; end if;
  if p_status not in ('available','maintenance') then raise exception 'Invalid status'; end if;
  if exists (select 1 from public.gaming_sessions where station_id = p_station and status = 'active') then
    raise exception 'End the running session first';
  end if;
  update public.gaming_stations set status = p_status where id = p_station;
end $$;

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.users enable row level security;
alter table public.settings enable row level security;
alter table public.gaming_stations enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.discounts enable row level security;
alter table public.gaming_sessions enable row level security;
alter table public.payments enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists users_read on public.users;
create policy users_read on public.users for select using (public.is_staff() or id = auth.uid());
drop policy if exists users_admin_update on public.users;
create policy users_admin_update on public.users for update using (public.is_admin()) with check (public.is_admin());

do $$
declare t text;
begin
  foreach t in array array['settings','gaming_stations','pricing_rules','discounts'] loop
    execute format('drop policy if exists %1$s_read on public.%1$s', t);
    execute format('create policy %1$s_read on public.%1$s for select using (public.is_staff())', t);
    execute format('drop policy if exists %1$s_admin_write on public.%1$s', t);
    execute format('create policy %1$s_admin_write on public.%1$s for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

drop policy if exists sessions_read on public.gaming_sessions;
create policy sessions_read on public.gaming_sessions for select using (public.is_staff());
drop policy if exists payments_read on public.payments;
create policy payments_read on public.payments for select using (public.is_staff());
drop policy if exists audit_admin_read on public.audit_logs;
create policy audit_admin_read on public.audit_logs for select using (public.is_admin());

-- No insert/update/delete policies on sessions, payments, audit_logs:
-- they can only change through the functions above.

revoke all on function public.start_session, public.end_session, public.complete_payment,
  public.set_station_status, public.log_audit from public, anon;
grant execute on function public.start_session, public.end_session, public.complete_payment,
  public.set_station_status, public.log_audit to authenticated;
grant execute on function public.has_users to anon, authenticated;
grant execute on function public.server_now to authenticated;

-- Live updates between multiple staff screens
do $$
begin
  begin alter publication supabase_realtime add table public.gaming_sessions; exception when others then null; end;
  begin alter publication supabase_realtime add table public.gaming_stations; exception when others then null; end;
  begin alter publication supabase_realtime add table public.pricing_rules; exception when others then null; end;
  begin alter publication supabase_realtime add table public.discounts; exception when others then null; end;
  begin alter publication supabase_realtime add table public.settings; exception when others then null; end;
end $$;

-- =====================================================================
-- Starting configuration (all editable later in Admin Settings)
-- =====================================================================
insert into public.gaming_stations (name, category, sort_order)
select * from (values
  ('PS5 Station 1','ps5',1), ('PS5 Station 2','ps5',2), ('PS5 Station 3','ps5',3),
  ('Racing Simulator 1','simulator',1), ('Racing Simulator 2','simulator',2)
) v(n,c,o)
where not exists (select 1 from public.gaming_stations);

insert into public.pricing_rules (category, label, players, hourly_rate)
select * from (values
  ('ps5','1 Player',1,100), ('ps5','2 Players',2,150), ('ps5','3 Players',3,180), ('ps5','4 Players',4,200),
  ('simulator','Simulator',1,150)
) v(c,l,p,r)
where not exists (select 1 from public.pricing_rules);
