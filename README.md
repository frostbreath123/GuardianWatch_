# SafeBand

A companion web dashboard for a women's safety wearable device — SOS alerts with a cancelable countdown, live location sharing, geofenced safe zones, emergency contacts, and simulated wearable telemetry, all in one polished Next.js app.

> **Note:** This is a **prototype & proof-of-concept** demonstrating how modern web technologies (Next.js, React, Tailwind CSS) can build sophisticated companion apps for IoT wearable devices. It shows architectural patterns, UI/UX best practices, and real-time data handling suitable for production deployment with minor additions (backend database, push notifications, real email service integration).

## Features

- **SOS Alerts** — a prominent pulse-animated SOS button opens a dialog to choose recipient email, starts a 5-second cancelable countdown, captures your location, and prepares an alert that can be copied to clipboard or sent manually. A looping alarm (Web Audio API, no audio files) sounds until dismissed.
- **Live Location** — an embedded OpenStreetMap preview built from `navigator.geolocation`, with graceful fallbacks when permission is denied.
- **Safe Zones / Geofencing** — set a center point and radius; the dashboard computes your distance (Haversine formula) and flags whether you're inside or outside the zone.
- **Emergency Contacts** — full CRUD for trusted contacts with quick `tel:`/`mailto:` links.
- **Alert History** — a log of every SOS/fall event with status, location link, and timestamp.
- **Simulated Wearable Telemetry** — battery, heart rate, connectivity, and signal strength update live with sparkline history, plus a "simulate fall" demo control.
- **Dark Mode** — system-aware theme with a persisted manual toggle.

## Screenshots

_Add screenshots of the dashboard, SOS flow, and settings page here._

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router) + React 19
- [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first config)
- [Headless UI](https://headlessui.com/) & [Heroicons](https://heroicons.com/)
- Browser `localStorage` for all client-persisted data (no database)

## Getting Started

```bash
git clone https://github.com/<your-username>/Women-s-Safety-Wearable-Device.git
cd Women-s-Safety-Wearable-Device
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Alert Flow

1. **Trigger** — Click the SOS button or simulate a fall event.
2. **Select Recipient** — Enter the email address of the person you want to alert (e.g., a trusted contact).
3. **Confirm** — The app starts a 5-second cancelable countdown while capturing your location.
4. **Copy & Send** — Once ready, the alert is formatted with your message and location link. Copy it to your clipboard and send via email, text, or your preferred method.
5. **History** — The alert is logged in your history for record-keeping.

This design keeps the app lightweight and doesn't require external email service setup — you maintain full control over who receives your alerts and how they're sent.

**For Production:** To add automatic email dispatch, integrate a service like [Resend](https://resend.com/), [SendGrid](https://sendgrid.com/), or [Brevo](https://www.brevo.com/) and modify `src/app/api/sos/route.js` to send emails via their API.

## Project Structure

```
src/
  app/
    api/sos/route.js   # Minimal alert validation endpoint
    contacts/          # Emergency contacts CRUD
    history/           # Alert history log
    settings/          # Theme, alerts, safe zone
    page.js            # Dashboard
    layout.js          # Shell: sidebar, top bar, toast provider
  components/          # Sidebar, TopBar, SosButton, Sparkline, ToastProvider
  lib/
    storage.js         # localStorage helpers
    deviceSimulator.js  # useDeviceTelemetry() wearable simulator hook
```

## License

Licensed under the [MIT License](./LICENSE).
