-- -------------------------------------------------------------------
-- Makers
-- -------------------------------------------------------------------
create table if not exists public.makers (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  external_label text not null unique,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------
-- Stations
-- -------------------------------------------------------------------
create table if not exists public.stations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------
-- Cameras (maps multiple webcams on the single Raspberry Pi)
-- -------------------------------------------------------------------
create table if not exists public.cameras (
  id uuid primary key default gen_random_uuid(),
  camera_key text not null unique,          -- e.g. 'login_cam_1', 'station_cam_1'
  role text not null,                       -- 'login' or 'station'
  station_id uuid null references public.stations(id) on delete set null,
  device_path text null,                    -- optional: '/dev/video0'
  created_at timestamptz not null default now(),
  constraint cameras_role_check check (role in ('login', 'station'))
);

-- -------------------------------------------------------------------
-- Maker Status (LIVE state; if a maker is offline, no row exists)
-- -------------------------------------------------------------------
create table if not exists public.maker_status (
  maker_id uuid primary key references public.makers(id) on delete cascade,
  status text not null,                     -- 'idle' | 'active' | 'violation'
  station_id uuid null references public.stations(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint maker_status_status_check check (status in ('idle', 'active', 'violation'))
);

-- -------------------------------------------------------------------
-- Station Status (LIVE state)
-- -------------------------------------------------------------------
create table if not exists public.station_status (
  station_id uuid primary key references public.stations(id) on delete cascade,
  status text not null,                     -- 'idle' | 'in_use' | 'violation'
  active_maker_id uuid null references public.makers(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint station_status_status_check check (status in ('idle', 'in_use', 'violation'))
);

-- -------------------------------------------------------------------
-- Violations (HISTORY)
-- -------------------------------------------------------------------
create table if not exists public.violations (
  id uuid primary key default gen_random_uuid(),
  maker_id uuid not null references public.makers(id) on delete cascade,
  station_id uuid not null references public.stations(id) on delete cascade,
  camera_id uuid null references public.cameras(id) on delete set null,
  violation_type text not null,             -- e.g. 'GOGGLES_NOT_WORN'
  image_url text null,                      -- Supabase Storage public URL or storage path
  created_at timestamptz not null default now(),
  resolved_at timestamptz null
);

-- -------------------------------------------------------------------
-- Helpful indexes
-- -------------------------------------------------------------------
create index if not exists idx_violations_created_at on public.violations (created_at desc);
create index if not exists idx_station_status_active_maker_id on public.station_status (active_maker_id);
create index if not exists idx_maker_status_station_id on public.maker_status (station_id);
