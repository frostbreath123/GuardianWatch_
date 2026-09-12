# SafeBand

A companion web dashboard for a women's safety wearable device — SOS alerts with a cancelable countdown, live location sharing, geofenced safe zones, emergency contacts, and simulated wearable telemetry, all in one polished Next.js app.

## Features

- **SOS Alerts** — a prominent pulse-animated SOS button opens a 5-second cancelable countdown, then captures your location, emails every emergency contact, and sounds a looping alarm (Web Audio API, no audio files) until dismissed.
- **Live Location** — an embedded OpenStreetMap preview built from `navigator.geolocation`, with graceful fallbacks when permission is denied.
- **Safe Zones / Geofencing** — set a center point and radius; the dashboard computes your distance (Haversine formula) and flags whether you're inside or outside the zone.
- **Emergency Contacts** — full CRUD for trusted contacts with quick `tel:`/`mailto:` links.
- **Alert History** — a searchable log of every SOS/fall event with status (sent / simulated / failed) and a map link.
- **Simulated Wearable Telemetry** — battery, heart rate, connectivity, and signal strength update live with sparkline history, plus a "simulate fall" demo control.
- **Dark Mode** — system-aware theme with a persisted manual toggle.

## Screenshots

_Add screenshots of the dashboard, SOS flow, and settings page here._

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router) + React 19
- [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first config)
- [Headless UI](https://headlessui.com/) & [Heroicons](https://heroicons.com/)
- [Nodemailer](https://nodemailer.com/) for server-side email dispatch
- Browser `localStorage` for all client-persisted data (no database)

## Getting Started

```bash
git clone https://github.com/<your-username>/Women-s-Safety-Wearable-Device.git
cd Women-s-Safety-Wearable-Device
npm install
cp .env.example .env.local
```

Fill in `.env.local` with a Gmail address and an [App Password](https://myaccount.google.com/apppasswords) (see below), then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Email Alerts (Gmail App Password)

SOS emails are sent server-side via a Next.js Route Handler (`src/app/api/sos/route.js`) using Nodemailer's Gmail transport. Gmail requires an **App Password** rather than your normal account password:

1. Enable 2-Step Verification on your Google account.
2. Visit [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) and generate a 16-character app password.
3. Set `EMAIL` to your Gmail address and `EMAIL_PASS` to the generated app password in `.env.local`.

If these variables aren't set, the app still works — alerts are simulated locally instead of sent, and the Settings page shows the current configuration status.

**Security note:** `.env.local` contains real credentials and is already excluded via `.gitignore` (`.env*`). Never commit it. If a secret is ever accidentally committed, revoke/rotate it immediately in your Google account, since removing it from a future commit does not remove it from git history.

## Project Structure

```
src/
  app/
    api/sos/route.js   # SOS email dispatch (GET status, POST send)
    contacts/          # Emergency contacts CRUD
    history/           # Alert history log
    settings/          # Theme, alerts, safe zone, email status
    page.js            # Dashboard
    layout.js           # Shell: sidebar, top bar, toast provider
  components/          # Sidebar, TopBar, SosButton, Sparkline, ToastProvider
  lib/
    storage.js          # localStorage helpers
    deviceSimulator.js  # useDeviceTelemetry() wearable simulator hook
```

## License

Licensed under the [MIT License](./LICENSE).
