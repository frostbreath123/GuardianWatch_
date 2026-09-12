"use client";

import { useEffect, useState } from "react";
import { CheckCircleIcon, ExclamationTriangleIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { getSettings, setSettings } from "@/lib/storage";
import { useToast } from "@/components/ToastProvider";

export default function SettingsPage() {
  const [settings, setLocalSettings] = useState(null);
  const [emailConfigured, setEmailConfigured] = useState(null);
  const [locating, setLocating] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setLocalSettings(getSettings());
    fetch("/api/sos")
      .then((r) => r.json())
      .then((d) => setEmailConfigured(d.configured))
      .catch(() => setEmailConfigured(false));
  }, []);

  function update(partial) {
    const next = setSettings(partial);
    setLocalSettings(next);
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = theme === "dark" || (theme === "system" && systemDark);
    root.classList.toggle("dark", isDark);
    root.classList.toggle("light", theme === "light");
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      showToast("Geolocation is not available in this browser.", "error");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update({
          safeZone: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            radius: settings?.safeZone?.radius ?? 200,
          },
        });
        setLocating(false);
        showToast("Safe zone center updated.", "success");
      },
      () => {
        setLocating(false);
        showToast("Could not access your location.", "error");
      }
    );
  }

  if (!settings) return null;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-[var(--fg-muted)] mt-1">Tune your SafeBand device and alert preferences.</p>
      </div>

      <Section title="Appearance">
        <label className="flex flex-col gap-1 text-sm max-w-xs">
          <span className="font-medium">Theme</span>
          <select
            value={settings.theme}
            onChange={(e) => {
              update({ theme: e.target.value });
              applyTheme(e.target.value);
            }}
            className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </Section>

      <Section title="Alerts">
        <Toggle
          label="Alarm sound"
          description="Play an audible alarm when an alert is triggered."
          checked={settings.alarmSound}
          onChange={(v) => update({ alarmSound: v })}
        />
        <Toggle
          label="Automatic fall detection"
          description="Let the wearable simulate detecting sudden falls."
          checked={settings.autoFallDetection}
          onChange={(v) => update({ autoFallDetection: v })}
        />
        <label className="flex flex-col gap-1 text-sm max-w-xs">
          <span className="font-medium">Heart rate alert threshold (bpm)</span>
          <input
            type="number"
            min={60}
            max={200}
            value={settings.heartRateThreshold}
            onChange={(e) => update({ heartRateThreshold: Number(e.target.value) })}
            className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2"
          />
        </label>
      </Section>

      <Section title="Safe Zone">
        <p className="text-sm text-[var(--fg-muted)]">
          Get flagged when you leave a defined area around a location.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={useCurrentLocation}
            disabled={locating}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            <MapPinIcon className="h-4 w-4" /> {locating ? "Locating…" : "Use Current Location"}
          </button>
          {settings.safeZone && (
            <button
              onClick={() => update({ safeZone: null })}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Clear Safe Zone
            </button>
          )}
        </div>
        {settings.safeZone && (
          <div className="flex flex-col gap-2 max-w-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Radius</span>
              <span className="text-[var(--fg-muted)]">{settings.safeZone.radius} m</span>
            </div>
            <input
              type="range"
              min={50}
              max={2000}
              step={50}
              value={settings.safeZone.radius}
              onChange={(e) => update({ safeZone: { ...settings.safeZone, radius: Number(e.target.value) } })}
            />
            <p className="text-xs text-[var(--fg-muted)]">
              Center: {settings.safeZone.lat.toFixed(4)}, {settings.safeZone.lng.toFixed(4)}
            </p>
          </div>
        )}
      </Section>

      <Section title="Email Alerts">
        {emailConfigured === null ? (
          <p className="text-sm text-[var(--fg-muted)]">Checking configuration…</p>
        ) : emailConfigured ? (
          <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircleIcon className="h-5 w-5" /> Configured — alerts will be emailed to your contacts.
          </p>
        ) : (
          <p className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
            <ExclamationTriangleIcon className="h-5 w-5" /> Not configured — add EMAIL and EMAIL_PASS to
            .env.local to enable real email dispatch.
          </p>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 flex flex-col gap-4">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="block text-xs text-[var(--fg-muted)]">{description}</span>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-9 shrink-0 appearance-none rounded-full bg-neutral-300 dark:bg-neutral-700 checked:bg-brand-600 relative transition-colors cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-4"
      />
    </label>
  );
}
