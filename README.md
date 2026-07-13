# AFK Studio — Tint Booking Site

Full booking site: pick a package, pick a VLT %, pick a date/time, book online — payment is
collected in person at the appointment (cash or card on-site, your call).
Frontend is plain HTML/CSS/JS. Backend is Netlify Functions + Supabase (database).

## What's here
```
index.html, styles.css, script.js   → the site (deploy as-is)
netlify/functions/                  → the backend (runs on Netlify, not in the browser)
  get-availability.js               → checks which time slots are already booked
  create-booking.js                 → saves a booking to the database
supabase-schema.sql                 → run this once in Supabase to create the bookings table
```

## 1. Business name
Already set to AFK Studio in `index.html` (header, title, footer). Edit `PACKAGES` at the
top of `script.js` to set your real services, prices (in XCD), and specs. Edit `TIME_SLOTS`
in `script.js` to your real daily schedule.

## 2. Set up Supabase (the database)
1. Create a free project at supabase.com.
2. In the Supabase dashboard, go to SQL Editor → New query, paste the contents of
   `supabase-schema.sql`, and run it.
3. Go to Project Settings → API. You'll need two values:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (not the anon key — this one bypasses row-level security so your
     functions can write bookings) → `SUPABASE_SERVICE_KEY`

## 3. Deploy to Netlify
Push this folder to a GitHub repo, then in Netlify: New site from Git → pick the repo.
Netlify will read `netlify.toml` automatically.

Then in Netlify → Site settings → Environment variables, add:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

Redeploy after adding env vars so the functions pick them up.

## 4. Test it
Book an appointment through the site, then check Supabase's Table editor — you should see
the row appear with `payment_status = pending_in_person`. After the customer pays at the
appointment, go into that row in Supabase and manually change `payment_status` to `paid`.

## Notes
- Every booking reserves the slot the moment it's submitted — there's no online payment
  step, so nothing needs a Stripe account, webhook, or API key.
- If you want online payment back in later (deposits, no-show protection, etc.), that's a
  separate addition — just let me know.
"# afk-studio-tint" 
