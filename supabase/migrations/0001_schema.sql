-- 0001: core schema. All money is integer cents. Order lines snapshot name+price.
create type user_role as enum ('staff','owner','customer');
create type selection_type as enum ('single','multi');
create type fulfillment_type as enum ('pickup','delivery');
create type order_status as enum ('placed','accepted','cooking','ready','completed','cancelled','refunded');
create type promo_type as enum ('percent','fixed','free_delivery');

create table profiles (id uuid primary key references auth.users on delete cascade, full_name text, phone text,
  role user_role not null default 'customer', loyalty_points int not null default 0 check (loyalty_points >= 0));
create table addresses (id uuid primary key default gen_random_uuid(), profile_id uuid not null references profiles on delete cascade,
  label text, line1 text not null, line2 text, city text not null, postal_code text not null, lat double precision, lng double precision, instructions text);
create table categories (id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null, sort_order int default 0, is_active bool default true);
create table menu_items (id uuid primary key default gen_random_uuid(), category_id uuid references categories, name text not null, slug text unique not null,
  description text, price_cents int not null check (price_cents >= 0), image_path text, calories int, allergens text[] default '{}', dietary_tags text[] default '{}',
  is_available bool default true, sort_order int default 0);
create table modifier_groups (id uuid primary key default gen_random_uuid(), name text not null, selection_type selection_type not null,
  min_select int not null default 0, max_select int not null default 1, is_required bool default false, check (max_select >= min_select));
create table modifiers (id uuid primary key default gen_random_uuid(), group_id uuid not null references modifier_groups on delete cascade,
  name text not null, price_delta_cents int not null default 0, is_available bool default true, sort_order int default 0);
create table menu_item_modifier_groups (menu_item_id uuid references menu_items on delete cascade, modifier_group_id uuid references modifier_groups on delete cascade,
  sort_order int default 0, primary key (menu_item_id, modifier_group_id));
create table orders (id uuid primary key default gen_random_uuid(), order_number serial, profile_id uuid references profiles, customer_name text not null, customer_phone text not null,
  fulfillment fulfillment_type not null, status order_status not null default 'placed',
  subtotal_cents int not null, tax_cents int not null, tip_cents int not null default 0, delivery_fee_cents int not null default 0, discount_cents int not null default 0, total_cents int not null,
  promo_code text, scheduled_for timestamptz, notes text, address_id uuid references addresses, stripe_payment_intent_id text,
  created_at timestamptz default now(), updated_at timestamptz default now());
create table order_items (id uuid primary key default gen_random_uuid(), order_id uuid not null references orders on delete cascade, menu_item_id uuid references menu_items,
  name_snapshot text not null, unit_price_cents int not null, quantity int not null check (quantity > 0), notes text);
create table order_item_modifiers (id uuid primary key default gen_random_uuid(), order_item_id uuid not null references order_items on delete cascade,
  modifier_id uuid references modifiers, name_snapshot text not null, price_delta_cents int not null);
create table order_events (id uuid primary key default gen_random_uuid(), order_id uuid not null references orders on delete cascade,
  from_status order_status, to_status order_status not null, actor_id uuid, created_at timestamptz default now());
create table payments (id uuid primary key default gen_random_uuid(), order_id uuid not null references orders, provider text not null,
  provider_ref text unique not null, amount_cents int not null, status text not null, raw_payload jsonb);  -- unique ref = webhook idempotency
create table promos (id uuid primary key default gen_random_uuid(), code text unique not null, type promo_type not null, value int not null default 0,
  min_subtotal_cents int default 0, starts_at timestamptz, ends_at timestamptz, max_redemptions int, redemption_count int not null default 0);
create table loyalty_ledger (id uuid primary key default gen_random_uuid(), profile_id uuid not null references profiles, order_id uuid references orders,
  points_delta int not null, reason text not null, created_at timestamptz default now());
create table store_settings (id bool primary key default true check (id), name text, address text, phone text, timezone text not null default 'America/Chicago',
  open_time time not null default '18:00', close_time time not null default '03:00', delivery_radius_miles numeric default 3, delivery_fee_cents int default 399,
  delivery_minimum_cents int default 1500, tax_rate_bps int not null default 825, is_accepting_orders bool not null default true);

-- Append-only audit log
create function forbid_mutation() returns trigger language plpgsql as $$ begin raise exception 'append-only'; end $$;
create trigger order_events_immutable before update or delete on order_events for each row execute function forbid_mutation();

-- Role helpers (security definer avoids recursive RLS on profiles)
create function auth_role() returns user_role language sql stable security definer set search_path = public as $$ select role from profiles where id = auth.uid() $$;
create function is_staff() returns bool language sql stable as $$ select coalesce(auth_role() in ('staff','owner'), false) $$;
create function is_owner() returns bool language sql stable as $$ select coalesce(auth_role() = 'owner', false) $$;

do $$ declare t text; begin
  for t in select unnest(array['profiles','addresses','categories','menu_items','modifier_groups','modifiers','menu_item_modifier_groups','orders','order_items','order_item_modifiers','order_events','payments','promos','loyalty_ledger','store_settings'])
  loop execute format('alter table %I enable row level security', t); end loop; end $$;

-- Public reads of menu + settings; only owners write
do $$ declare t text; begin
  for t in select unnest(array['categories','menu_items','modifier_groups','modifiers','menu_item_modifier_groups','store_settings'])
  loop
    execute format('create policy "public read" on %I for select using (true)', t);
    execute format('create policy "owner write" on %I for all using (is_owner()) with check (is_owner())', t);
  end loop; end $$;

-- Customers see own rows only; other people's rows are invisible (zero rows, no error)
create policy "own profile" on profiles for select using (id = auth.uid() or is_staff());
create policy "own profile update" on profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = auth_role());
create policy "own addresses" on addresses for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "own or staff orders" on orders for select using (profile_id = auth.uid() or is_staff());
create policy "own or staff items" on order_items for select using (exists (select 1 from orders o where o.id = order_id and (o.profile_id = auth.uid() or is_staff())));
create policy "own or staff item mods" on order_item_modifiers for select using (exists (select 1 from order_items i join orders o on o.id = i.order_id where i.id = order_item_id and (o.profile_id = auth.uid() or is_staff())));
create policy "own or staff events" on order_events for select using (exists (select 1 from orders o where o.id = order_id and (o.profile_id = auth.uid() or is_staff())));
create policy "own ledger" on loyalty_ledger for select using (profile_id = auth.uid());
create policy "staff payments" on payments for select using (is_staff());
create policy "owner promos" on promos for all using (is_owner()) with check (is_owner());
-- No insert/update policies on orders, payments, ledger: only the server (service role) writes them after Zod + price recompute.

alter publication supabase_realtime add table orders;
