# POWER PLAY – Gaming Cafe Management System

React + Vite + Tailwind + Supabase (Postgres, Auth, Realtime) + Lucide + Recharts.

## 1. Set up Supabase (10 minutes, once)
1. Create a free project at https://supabase.com.
2. **SQL Editor → New query**, paste all of `supabase/schema.sql`, click **Run**.
   This creates the 7 tables (`users`, `gaming_stations`, `pricing_rules`, `gaming_sessions`, `payments`, `discounts`, `audit_logs`) plus `settings`, security rules, billing functions, and starting stations/rates (3 PS5, 2 simulators; editable).
3. **Authentication → Providers → Email**: turn **OFF "Confirm email"** (needed so staff accounts work instantly).
4. **Project Settings → API**: copy the *Project URL* and the *anon public* key.

## 2. Run the app
```bash
cp .env.example .env     # then paste the URL and anon key into .env
npm install
npm run dev              # http://localhost:5173
```
For the cafe PC: `npm run build`, then host the `dist/` folder (Netlify, Vercel, Cloudflare Pages, or any static host).

## 3. First login
Open the app. On a fresh database it shows **"Create the administrator account"**. The first account is the admin. Add staff under **Admin Settings → Staff** (they log in with a username + password).

## How accuracy is guaranteed
- `check_in` is stored by the database when START SESSION is clicked. Timers are always `now − check_in`; nothing depends on `setInterval` counting. Refresh, restart, or reopen the browser and every session shows the right time.
- The checkout amount is calculated **in the database** (`end_session`), using the rate and billing method **snapshotted at check-in**, so changing prices never changes old bills.
- A partial unique index allows only one `active` session per station, and the station row is locked while starting, so two staff cannot book the same station.
- Staff cannot write to sessions directly; they can only call the start / end / pay functions. Admin pages are admin-only at both UI and database level.
- Offline: running timers keep counting; start/end need internet and show a clear message.

## Billing methods (Admin Settings → Pricing & billing)
Per minute (proportional, rounded to the nearest ₹), per 30 minutes (rounded up), per hour (rounded up). 1h 30m at ₹100/hr = ₹150 per-minute.

## Printing receipts (80mm thermal)
Receipt → Print. In the browser print dialog choose the thermal printer, set margins to *None* and scale 100%.

## Notes
- Staff passwords cannot be reset by an admin from inside the app (Supabase needs a server key for that). To reset one, use Supabase → Authentication → Users, or disable the account and create a new one.
- New sign-ups from outside start **inactive** and see no data until an admin enables them.
