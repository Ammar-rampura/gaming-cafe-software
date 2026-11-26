-- =====================================================================
-- VORA Gaming Lounge Operations OS - Complete Supabase Schema
-- Copy and paste this ENTIRE file into:
-- Supabase Dashboard > SQL Editor > New query -> Click "Run"
-- =====================================================================

create extension if not exists pgcrypto;

-- 1. USERS & PROFILES (Linked directly to Supabase Auth)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  role text not null default 'staff' check (role in ('superadmin','admin','staff')),
  active boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. CAFE SETTINGS (Single configuration row)
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  cafe_name text not null default 'VORA GAMING LOUNGE',
  logo_url text,
  address text not null default '',
  phone text not null default '',
  receipt_footer text not null default 'Thank you for gaming with us! See you again.',
  receipt_prefix text not null default 'VOR-',
  show_logo_on_receipt boolean not null default false,
  billing_method text not null default 'per_minute' check (billing_method in ('per_minute','per_30_min','per_hour')),
  next_receipt_no bigint not null default 1
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

-- 3. CAFE REGISTRATION REQUESTS (Pending Super Admin Approval)
create table if not exists public.cafe_registration_requests (
  id uuid primary key default gen_random_uuid(),
  cafe_name text not null,
  owner_name text not null,
  email text not null,
  phone text not null default '',
  address text not null default '',
  station_count int not null default 5,
  simulator_count int not null default 2,
  notes text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  generated_username text,
  temporary_password text,
  created_user_id uuid references public.users(id) on delete set null,
  reviewed_by uuid references public.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists cafe_requests_status_idx on public.cafe_registration_requests(status, created_at desc);

-- 4. GAMING STATIONS
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

-- 5. PRICING RULES
create table if not exists public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('ps5','simulator')),
  station_id uuid references public.gaming_stations(id) on delete cascade,
  label text not null,
  players int not null check (players between 1 and 10),
  hourly_rate numeric(10,2) not null check (hourly_rate >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists pricing_rules_uq on public.pricing_rules
  (category, players, lower(label), coalesce(station_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- 6. DISCOUNTS
create table if not exists public.discounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('percent','flat')),
  value numeric(10,2) not null check (value > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 7. SNACKS & CAFE MENU POS
create table if not exists public.snacks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null check (price >= 0),
  category text not null default 'Beverage',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 8. GAMING SESSIONS
create table if not exists public.gaming_sessions (
  id uuid primary key default gen_random_uuid(),
  session_no bigint generated always as identity unique,
  station_id uuid not null references public.gaming_stations(id),
  station_name text not null,
  category text not null,
  players int not null,
  pricing_label text not null,
  pricing_rule_id uuid references public.pricing_rules(id) on delete set null,
  customer_name text,
  customer_phone text,
  check_in timestamptz not null default now(),
  check_out timestamptz,
  hourly_rate numeric(10,2) not null,
  billing_method text not null,
  discount_type text check (discount_type in ('percent','flat')),
  discount_value numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  duration_minutes int,
  subtotal numeric(10,2),
  snacks jsonb default '[]'::jsonb,
  snacks_amount numeric(10,2) not null default 0,
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

create unique index if not exists one_active_session_per_station
  on public.gaming_sessions (station_id) where status = 'active';
create index if not exists sessions_check_in_idx on public.gaming_sessions (check_in desc);
create index if not exists sessions_status_idx on public.gaming_sessions (status);

-- 9. PAYMENTS
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.gaming_sessions(id),
  amount numeric(10,2) not null check (amount >= 0),
  method text not null check (method in ('cash','upi','card','other')),
  receipt_no bigint not null,
  received_by uuid references public.users(id),
  paid_at timestamptz not null default now()
);

-- 10. AUDIT LOGS
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
-- Helper Functions & Trigger Routines
-- =====================================================================

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.users where id = auth.uid() and active) $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.users where id = auth.uid() and active and role in ('admin','superadmin')) $$;

create or replace function public.is_superadmin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.users where id = auth.uid() and active and role = 'superadmin') $$;

create or replace function public.has_users() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.users) $$;

create or replace function public.server_now() returns timestamptz
language sql stable as $$ select now() $$;

-- First user created becomes the active superadmin automatically
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare first_user boolean;
begin
  perform pg_advisory_xact_lock(4242);
  select not exists (select 1 from public.users) into first_user;
  insert into public.users (id, full_name, email, role, active)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email,
          case when first_user then 'superadmin' else 'staff' end, first_user)
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Single Source of Truth Billing Maths
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

-- Audit triggers
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
  foreach t in array array['gaming_stations','pricing_rules','discounts','snacks','settings','users','cafe_registration_requests'] loop
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
-- Session Workflow RPCs
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
         final_amount = greatest(0, sub - d) + coalesce(s.snacks_amount, 0),
         status = 'ended', ended_by = auth.uid()
   where id = s.id returning * into s;
  update public.gaming_stations set status = 'available' where id = s.station_id and status = 'occupied';
  perform public.log_audit('end_session','gaming_sessions', s.id::text,
      jsonb_build_object('session_no', s.session_no, 'minutes', mins, 'amount', s.final_amount));
  return s;
end $$;

create or replace function public.update_session_snacks(p_session uuid, p_snacks jsonb)
returns public.gaming_sessions language plpgsql security definer set search_path = public as $$
declare s public.gaming_sessions; item jsonb; total numeric := 0;
begin
  if not public.is_staff() then raise exception 'Not authorised'; end if;
  select * into s from public.gaming_sessions where id = p_session for update;
  if not found then raise exception 'Session not found'; end if;

  for item in select * from jsonb_array_elements(coalesce(p_snacks, '[]'::jsonb)) loop
    total := total + (coalesce((item->>'price')::numeric, 0) * coalesce((item->>'qty')::numeric, 1));
  end loop;

  update public.gaming_sessions
     set snacks = coalesce(p_snacks, '[]'::jsonb),
         snacks_amount = total,
         final_amount = case
           when status = 'ended' then greatest(0, coalesce(subtotal, 0) - coalesce(discount_amount, 0)) + total
           else final_amount
         end
   where id = s.id returning * into s;

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
-- Cafe Registration Requests RPCs (Public Submit -> Superadmin Approval)
-- =====================================================================

create or replace function public.submit_cafe_registration(
  p_cafe_name text,
  p_owner_name text,
  p_email text,
  p_phone text default '',
  p_address text default '',
  p_station_count int default 5,
  p_simulator_count int default 2,
  p_notes text default ''
)
returns public.cafe_registration_requests language plpgsql security definer set search_path = public as $$
declare req public.cafe_registration_requests;
begin
  if trim(coalesce(p_cafe_name, '')) = '' then
    raise exception 'Cafe name is required';
  end if;
  if trim(coalesce(p_owner_name, '')) = '' then
    raise exception 'Owner name is required';
  end if;
  if trim(coalesce(p_email, '')) = '' then
    raise exception 'Email is required';
  end if;

  insert into public.cafe_registration_requests (
    cafe_name, owner_name, email, phone, address, station_count, simulator_count, notes, status
  )
  values (
    trim(p_cafe_name), trim(p_owner_name), lower(trim(p_email)),
    trim(coalesce(p_phone, '')), trim(coalesce(p_address, '')),
    greatest(1, coalesce(p_station_count, 5)),
    greatest(0, coalesce(p_simulator_count, 2)),
    trim(coalesce(p_notes, '')),
    'pending'
  )
  returning * into req;

  return req;
end $$;

-- =====================================================================
-- Row Level Security (RLS)
-- =====================================================================

alter table public.users enable row level security;
alter table public.settings enable row level security;
alter table public.cafe_registration_requests enable row level security;
alter table public.gaming_stations enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.discounts enable row level security;
alter table public.snacks enable row level security;
alter table public.gaming_sessions enable row level security;
alter table public.payments enable row level security;
alter table public.audit_logs enable row level security;

-- Users policies
drop policy if exists users_read on public.users;
create policy users_read on public.users for select using (public.is_staff() or id = auth.uid());
drop policy if exists users_admin_update on public.users;
create policy users_admin_update on public.users for update using (public.is_admin()) with check (public.is_admin());

-- Cafe registration requests policies:
-- Anonymous or unauthenticated visitors can INSERT pending requests
drop policy if exists cafe_requests_insert on public.cafe_registration_requests;
create policy cafe_requests_insert on public.cafe_registration_requests for insert with check (true);

-- Superadmins can view and update requests
drop policy if exists cafe_requests_admin on public.cafe_registration_requests;
create policy cafe_requests_admin on public.cafe_registration_requests for all using (public.is_admin()) with check (public.is_admin());

-- Configuration tables policies
do $$
declare t text;
begin
  foreach t in array array['settings','gaming_stations','pricing_rules','discounts','snacks'] loop
    execute format('drop policy if exists %1$s_read on public.%1$s', t);
    execute format('create policy %1$s_read on public.%1$s for select using (public.is_staff())', t);
    execute format('drop policy if exists %1$s_admin_write on public.%1$s', t);
    execute format('create policy %1$s_admin_write on public.%1$s for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Sessions & payments policies
drop policy if exists sessions_read on public.gaming_sessions;
create policy sessions_read on public.gaming_sessions for select using (public.is_staff());
drop policy if exists payments_read on public.payments;
create policy payments_read on public.payments for select using (public.is_staff());
drop policy if exists audit_admin_read on public.audit_logs;
create policy audit_admin_read on public.audit_logs for select using (public.is_admin());

-- Function permissions
revoke all on function public.start_session, public.end_session, public.update_session_snacks,
  public.complete_payment, public.set_station_status, public.log_audit from public, anon;
grant execute on function public.start_session, public.end_session, public.update_session_snacks,
  public.complete_payment, public.set_station_status, public.log_audit to authenticated;
grant execute on function public.has_users to anon, authenticated;
grant execute on function public.server_now to authenticated;
grant execute on function public.submit_cafe_registration to anon, authenticated;

-- RPC: Create Lounge User directly without triggering SMTP rate limits
create or replace function public.create_lounge_user(
  p_email text,
  p_password text,
  p_full_name text,
  p_role text default 'admin'
)
returns uuid
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_user_id uuid;
  v_encrypted_pw text;
begin
  -- 1. Check if user already exists in auth.users
  select id into v_user_id from auth.users where email = lower(p_email);
  
  if v_user_id is not null then
    -- Update existing user password
    update auth.users
    set encrypted_password = crypt(p_password, gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        raw_user_meta_data = jsonb_build_object('full_name', p_full_name)
    where id = v_user_id;
  else
    v_user_id := gen_random_uuid();
    v_encrypted_pw := crypt(p_password, gen_salt('bf'));

    insert into auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) values (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      lower(p_email),
      v_encrypted_pw,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', p_full_name),
      now(),
      now(),
      'authenticated',
      'authenticated'
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      v_user_id,
      v_user_id,
      jsonb_build_object('sub', v_user_id, 'email', lower(p_email)),
      'email',
      lower(p_email),
      now(),
      now(),
      now()
    );
  end if;

  -- 2. Upsert into public.users
  insert into public.users (id, full_name, email, role, active)
  values (v_user_id, p_full_name, lower(p_email), p_role, true)
  on conflict (id) do update
  set full_name = excluded.full_name,
      email = excluded.email,
      role = excluded.role,
      active = true;

  return v_user_id;
end;
$$;

grant execute on function public.create_lounge_user to anon, authenticated;

-- Realtime subscriptions for multi-device sync
do $$
begin
  begin alter publication supabase_realtime add table public.gaming_sessions; exception when others then null; end;
  begin alter publication supabase_realtime add table public.gaming_stations; exception when others then null; end;
  begin alter publication supabase_realtime add table public.pricing_rules; exception when others then null; end;
  begin alter publication supabase_realtime add table public.discounts; exception when others then null; end;
  begin alter publication supabase_realtime add table public.snacks; exception when others then null; end;
  begin alter publication supabase_realtime add table public.settings; exception when others then null; end;
  begin alter publication supabase_realtime add table public.cafe_registration_requests; exception when others then null; end;
end $$;

-- =====================================================================
-- Initial Seed Catalog (Ready out of the box)
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
  ('simulator','Simulator Rig',1,150)
) v(c,l,p,r)
where not exists (select 1 from public.pricing_rules);

insert into public.discounts (name, type, value)
select * from (values
  ('Student 10%', 'percent', 10),
  ('Member Flat ₹50', 'flat', 50)
) v(n,t,v)
where not exists (select 1 from public.discounts);

insert into public.snacks (name, price, category)
select * from (values
  ('Red Bull Energy Drink', 125, 'Beverage'),
  ('Cold Coffee Frappe', 90, 'Beverage'),
  ('Doritos Nacho Cheese', 50, 'Snack'),
  ('Peri Peri French Fries', 110, 'Food'),
  ('Loaded Cheese Burger', 140, 'Food'),
  ('Mineral Water (1L)', 20, 'Beverage'),
  ('Maggi Noodles Masala', 60, 'Food')
) v(n,p,c)
where not exists (select 1 from public.snacks);
