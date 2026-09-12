"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Battery50Icon,
  HeartIcon,
  WifiIcon,
  SignalIcon,
  MapPinIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Sparkline from "@/components/Sparkline";
import SosButton from "@/components/SosButton";
import { useDeviceTelemetry } from "@/lib/deviceSimulator";
import { getHistory, getSettings } from "@/lib/storage";

function haversine(a, b) {
  const R = 6371000;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function StatCard({ icon: Icon, label, value, sub, sparkData, accent }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
      <div className="flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        {sparkData && <Sparkline data={sparkData} className="text-brand-500" />}
      </div>
      <p className="mt-4 text-2xl font-bold">{value}</p>
      <p className="text-xs text-[var(--fg-muted)]">{label}</p>
      {sub && <p className="mt-1 text-[11px] text-[var(--fg-muted)]">{sub}</p>}
    </div>
  );
}

const TYPE_LABEL = { sos: "SOS Alert", fall: "Fall Detected", safezone: "Safe Zone Alert" };
const STATUS_STYLE = {
  sent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  simulated: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  failed: "bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300",
};

export default function DashboardPage() {
  const telemetry = useDeviceTelemetry();
  const [recent, setRecent] = useState([]);
  const [coords, setCoords] = useState(null);
  const [locError, setLocError] = useState(false);
  const [fallTrigger, setFallTrigger] = useState(0);
  const [settings, setLocalSettings] = useState(null);

  useEffect(() => {
    setRecent(getHistory().slice(0, 3));
    setLocalSettings(getSettings());

    if (!navigator.geolocation) {
      setLocError(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocError(true),
      { timeout: 8000 }
    );
  }, []);

  const safeZone = settings?.safeZone;
  let zoneStatus = null;
  if (safeZone && coords) {
    const distance = haversine(coords, safeZone);
    zoneStatus = { inside: distance <= safeZone.radius, distance: Math.round(distance) };
  }

  const mapSrc = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.005}%2C${coords.lat - 0.005}%2C${coords.lng + 0.005}%2C${coords.lat + 0.005}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`
    : null;

  return (
    <div className="flex flex-col gap-8">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-1">
            Your SafeBand wearable is {telemetry.connected ? "connected and monitoring" : "reconnecting…"}.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <SosButton variant="sos" label="SOS" />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Battery50Icon}
          label="Battery"
          value={`${telemetry.battery}%`}
          sparkData={telemetry.batteryHistory}
          accent="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
        />
        <StatCard
          icon={HeartIcon}
          label="Heart Rate"
          value={`${telemetry.heartRate} bpm`}
          sub={settings && telemetry.heartRate >= settings.heartRateThreshold ? "Above threshold" : undefined}
          sparkData={telemetry.heartRateHistory}
          accent="bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
        />
        <StatCard
          icon={WifiIcon}
          label="Connectivity"
          value={telemetry.connected ? "Online" : "Offline"}
          accent="bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
        />
        <StatCard
          icon={SignalIcon}
          label="Signal Strength"
          value={`${telemetry.signal}/5`}
          accent="bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Live Location</h2>
            {zoneStatus && (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  zoneStatus.inside
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                }`}
              >
                {zoneStatus.inside ? "Inside Safe Zone" : `Outside Safe Zone (${zoneStatus.distance}m)`}
              </span>
            )}
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border border-[var(--border)] aspect-video">
            {mapSrc ? (
              <iframe title="Live location map" src={mapSrc} className="h-full w-full" loading="lazy" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-[var(--fg-muted)] text-sm bg-neutral-100 dark:bg-neutral-800">
                <MapPinIcon className="h-8 w-8" />
                {locError ? "Location permission denied or unavailable" : "Locating…"}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 flex flex-col gap-4">
          <h2 className="font-semibold">Demo Controls</h2>
          <p className="text-sm text-[var(--fg-muted)]">
            Simulate a fall event to preview the full alert flow, from countdown to email dispatch.
          </p>
          <SosButton variant="fall" label="Simulate Fall Detected" triggerAt={fallTrigger || undefined} />
          <button
            onClick={() => {
              telemetry.simulateFall();
              setFallTrigger((n) => n + 1);
            }}
            className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white w-fit"
          >
            Trigger Fall Alert
          </button>
          <button onClick={telemetry.chargeBattery} className="text-xs text-[var(--fg-muted)] underline w-fit">
            Simulate charging (reset battery to 100%)
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent Alerts</h2>
          <Link href="/history" className="flex items-center gap-1 text-sm text-brand-600 hover:underline">
            View all <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-[var(--fg-muted)]">No alerts yet. Your history will appear here.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recent.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                <span className="font-medium">{TYPE_LABEL[entry.type] ?? entry.type}</span>
                <span className="text-[var(--fg-muted)]">{new Date(entry.timestamp).toLocaleString()}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[entry.status] ?? ""}`}>
                  {entry.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
