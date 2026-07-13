# AFK Studio — Tint Booking Site

Full booking site: pick a package, pick a VLT %, pick a date/time, book online — payment is
collected in person at the appointment. Booking automatically sends a receipt email to the
customer and a notification email to you.

## What's here
```
index.html, styles.css, script.js   → the site
netlify/functions/
  get-availability.js               → checks which time slots are already booked
  create-booking.js                 → saves a booking, sends confirmation + notification emails
  email-templates.js                → the HTML for both emails
supabase-schema.sql                 → run this once in Supabase to create the bookings table
```

## Full setup, start to finish

### 1. Supabase (the database)
1. Create a free project at supabase.com.
2. SQL Editor → New query → paste `supabase-schema.sql` → Run.
3. Confirm it worked: Table Editor should show a `bookings` table.
4. Project Settings → API:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (not the anon key) → `SUPABASE_SERVICE_KEY`

### 2. Resend (the email receipts)
1. Create a free account at resend.com (100 emails/day, 3,000/month on the free tier).
2. Domains → Add Domain → enter a domain you own (e.g. `afkstudio.xyz` or a subdomain like
   `mail.afkstudio.xyz`). Resend gives you DNS records (TXT/CNAME for SPF + DKIM) — add
   those in Porkbun where your domain is hosted, then click Verify in Resend.
   **This step matters**: until the domain is verified, Resend will only let you send to
   your own account email, not to real customers. Verification usually takes a few minutes
   to a few hours depending on DNS propagation.
3. API Keys → Create API Key → copy it → `RESEND_API_KEY`
4. Decide your sender address, e.g. `bookings@afkstudio.xyz` → `FROM_EMAIL`
   (format: `"AFK Studio <bookings@afkstudio.xyz>"` works too, for a display name)
5. Your own inbox for new-booking alerts → `OWNER_EMAIL`

If you skip this section entirely (no `RESEND_API_KEY` set), bookings still save fine —
the site just won't send any emails. Nothing breaks either way.

### 3. Netlify
Push this folder to GitHub, then Netlify → Add new site → Import an existing project →
pick the repo. `netlify.toml` handles the rest automatically.

Site settings → Environment variables → add all of these:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `RESEND_API_KEY`
- `FROM_EMAIL`
- `OWNER_EMAIL`
- `ADMIN_PASSWORD` — pick any password; this protects your appointments dashboard

**Redeploy after adding env vars** (Deploys → Trigger deploy) so the functions can see them.

## Your appointments dashboard
Go to `https://your-site.netlify.app/admin.html`, enter the `ADMIN_PASSWORD` you set above,
and you'll see every booking — date, time, customer, vehicle, price, and status — with
buttons to mark a booking "Paid" or "Cancelled" as jobs get done. `admin.html` is excluded
from search engines but isn't otherwise hidden, so keep the password to yourself and treat
the URL like you would a login page.

## Testing it end to end
1. Book an appointment on the live site with your own email address in the customer email
   field.
2. Check Supabase Table Editor — the row should appear with `payment_status =
   pending_in_person`.
3. Check your inbox for the receipt, and your `OWNER_EMAIL` inbox for the new-booking alert.
   If your Resend domain isn't verified yet, the booking will still succeed but emails will
   silently fail — check Netlify → Functions → create-booking → logs if emails don't show up.
4. After the customer pays at the appointment, go into that row in Supabase and manually
   change `payment_status` to `paid`.

## Notes
- Payment is always in person — no Stripe, no webhooks, no card processing to manage.
- Email sending is fully optional and fails silently (booking still succeeds) if not
  configured, so you can deploy now and wire up Resend whenever you're ready.
