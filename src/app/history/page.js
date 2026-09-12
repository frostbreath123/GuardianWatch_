"use client";

import { useEffect, useState } from "react";
import { ClockIcon, MapPinIcon, TrashIcon } from "@heroicons/react/24/outline";
import { getHistory, clearHistory } from "@/lib/storage";

const TYPE_LABEL = { sos: "SOS Alert", fall: "Fall Detected", safezone: "Safe Zone Alert" };
const STATUS_STYLE = {
  sent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  simulated: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  failed: "bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300",
};

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  function handleClear() {
    setHistory(clearHistory());
    setConfirming(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alert History</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-1">A record of every SOS and fall alert triggered.</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={() => setConfirming(true)}
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <TrashIcon className="h-4 w-4" /> Clear History
          </button>
        )}
      </div>

      {confirming && (
        <div className="flex items-center justify-between rounded-lg bg-brand-50 dark:bg-brand-950 p-3 text-sm">
          <span>Clear all history? This cannot be undone.</span>
          <div className="flex gap-3">
            <button onClick={handleClear} className="font-semibold text-brand-700 dark:text-brand-300">Clear</button>
            <button onClick={() => setConfirming(false)} className="text-[var(--fg-muted)]">Cancel</button>
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border)] py-16 text-center">
          <ClockIcon className="h-10 w-10 text-[var(--fg-muted)]" />
          <p className="text-sm text-[var(--fg-muted)]">No alerts triggered yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--fg-muted)]">
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 font-medium">{TYPE_LABEL[entry.type] ?? entry.type}</td>
                  <td className="px-4 py-3 text-[var(--fg-muted)]">{new Date(entry.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {entry.location ? (
                      <a
                        href={`https://maps.google.com/?q=${entry.location.lat},${entry.location.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-brand-600 hover:underline"
                      >
                        <MapPinIcon className="h-4 w-4" /> View
                      </a>
                    ) : (
                      <span className="text-[var(--fg-muted)]">Unavailable</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[entry.status] ?? ""}`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
