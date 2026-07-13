-- Run this in your Supabase project's SQL editor (Supabase dashboard -> SQL Editor -> New query)

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  customer_name text not null,
  phone text not null,
  email text,
  vehicle_make text,
  vehicle_model text,
  vehicle_type text,
  package_id text not null,
  package_label text not null,
  vlt text not null,
  price numeric not null,
  appointment_date date not null,
  appointment_time text not null,
  payment_method text not null default 'in_person',
  payment_status text not null default 'pending_in_person', -- 'pending_in_person' | 'paid' | 'failed'
  notes text
);

-- Prevent double-booking the same date/time slot
create unique index if not exists bookings_date_time_unique
  on bookings (appointment_date, appointment_time)
  where payment_status != 'failed';

-- Enable row level security; only server (service role key) writes/reads directly
alter table bookings enable row level security;

-- Migration: run this too if you already created the bookings table before this update
alter table bookings add column if not exists total_sqft numeric;
