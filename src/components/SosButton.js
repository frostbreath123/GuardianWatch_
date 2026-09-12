"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { ExclamationTriangleIcon, ShieldExclamationIcon } from "@heroicons/react/24/solid";
import { getContacts, getSettings, addHistoryEntry } from "@/lib/storage";
import { useToast } from "./ToastProvider";

const COUNTDOWN_SECONDS = 5;

function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 6000 }
    );
  });
}

export function useAlarm() {
  const ctxRef = useRef(null);
  const nodesRef = useRef(null);
  const intervalRef = useRef(null);

  function start() {
    if (ctxRef.current) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    function beep() {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 880;
      gain.gain.value = 0.15;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.frequency.linearRampToValueAtTime(660, ctx.currentTime + 0.3);
      osc.stop(ctx.currentTime + 0.35);
    }

    beep();
    intervalRef.current = setInterval(beep, 500);
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
  }

  useEffect(() => () => stop(), []);

  return { start, stop };
}

export default function SosButton({ variant = "sos", label = "SOS", triggerAt }) {
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [phase, setPhase] = useState("countdown"); // countdown | sending | alarm
  const [result, setResult] = useState(null);
  const alarm = useAlarm();
  const { showToast } = useToast();
  const timerRef = useRef(null);

  useEffect(() => {
    if (triggerAt) trigger();
  }, [triggerAt]);

  function trigger() {
    setOpen(true);
    setPhase("countdown");
    setCountdown(COUNTDOWN_SECONDS);
  }

  useEffect(() => {
    if (!open || phase !== "countdown") return;
    if (countdown <= 0) {
      dispatchAlert();
      return;
    }
    timerRef.current = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, phase, countdown]);

  async function dispatchAlert() {
    setPhase("sending");
    const settings = getSettings();
    const contacts = getContacts();
    const location = await getLocation();

    let payload = { ok: false, simulated: true };
    try {
      const res = await fetch("/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contacts,
          location,
          message:
            variant === "fall"
              ? "A fall was detected by the SafeBand wearable."
              : "An SOS alert was triggered from the SafeBand dashboard.",
          type: variant,
        }),
      });
      payload = await res.json();
    } catch {
      payload = { ok: false, simulated: true, error: true };
    }

    const status = !payload.ok ? "failed" : payload.simulated ? "simulated" : "sent";
    setResult({ status, sentTo: payload.sentTo, failed: payload.failed });

    addHistoryEntry({
      type: variant,
      status,
      location,
      message: variant === "fall" ? "Fall detected" : "SOS alert",
    });

    if (settings.alarmSound) alarm.start();
    setPhase("alarm");

    if (status === "sent") showToast(`Alert sent to ${payload.sentTo.length} contact(s).`, "success");
    else if (status === "simulated") showToast("Alert simulated — email not configured.", "info");
    else showToast("Alert failed to send.", "error");
  }

  function cancel() {
    clearTimeout(timerRef.current);
    setOpen(false);
    setPhase("countdown");
  }

  function dismiss() {
    alarm.stop();
    setOpen(false);
    setResult(null);
    setPhase("countdown");
  }

  const isMain = variant === "sos";

  return (
    <>
      <button
        onClick={trigger}
        className={
          isMain
            ? "group relative flex h-40 w-40 flex-col items-center justify-center gap-1 rounded-full bg-brand-600 text-white shadow-xl animate-pulse-glow transition-transform hover:scale-105 active:scale-95"
            : "flex items-center gap-2 rounded-lg border border-brand-300 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-950"
        }
      >
        {isMain ? (
          <>
            <ShieldExclamationIcon className="h-10 w-10" />
            <span className="text-lg font-bold tracking-wide">{label}</span>
            <span className="text-[11px] opacity-90">Tap to alert</span>
          </>
        ) : (
          <>
            <ExclamationTriangleIcon className="h-4 w-4" />
            {label}
          </>
        )}
      </button>

      <Transition show={open}>
        <Dialog onClose={phase === "countdown" ? cancel : () => {}} className="relative z-50">
          <TransitionChild
            enter="ease-out duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </TransitionChild>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <TransitionChild
              enter="ease-out duration-150"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-sm rounded-2xl bg-[var(--bg-elevated)] p-6 text-center shadow-2xl">
                {phase === "countdown" && (
                  <>
                    <DialogTitle className="text-lg font-bold text-brand-600">
                      Sending {variant === "fall" ? "fall alert" : "SOS"} in {countdown}s
                    </DialogTitle>
                    <p className="mt-2 text-sm text-[var(--fg-muted)]">
                      Your emergency contacts will be notified with your location.
                    </p>
                    <div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-brand-500 text-2xl font-bold text-brand-600">
                      {countdown}
                    </div>
                    <button
                      onClick={cancel}
                      className="mt-6 w-full rounded-lg border border-[var(--border)] py-2.5 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {phase === "sending" && (
                  <>
                    <DialogTitle className="text-lg font-bold text-brand-600">Sending alert…</DialogTitle>
                    <p className="mt-2 text-sm text-[var(--fg-muted)]">Locating you and notifying contacts.</p>
                  </>
                )}

                {phase === "alarm" && (
                  <>
                    <DialogTitle className="text-lg font-bold text-brand-600">
                      {result?.status === "sent" && "Alert sent"}
                      {result?.status === "simulated" && "Alert simulated"}
                      {result?.status === "failed" && "Alert failed"}
                    </DialogTitle>
                    <p className="mt-2 text-sm text-[var(--fg-muted)]">
                      {result?.status === "sent" &&
                        `Notified ${result.sentTo?.length ?? 0} contact(s). Alarm is sounding.`}
                      {result?.status === "simulated" &&
                        "Email isn't configured, so this was simulated locally."}
                      {result?.status === "failed" && "Something went wrong sending the alert."}
                    </p>
                    <button
                      onClick={dismiss}
                      className="mt-6 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                    >
                      Dismiss — I&apos;m Safe
                    </button>
                  </>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
