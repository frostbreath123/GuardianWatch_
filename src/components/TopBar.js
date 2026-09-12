"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { Bars3Icon, MoonIcon, SunIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { BrandLogo, NavLinks } from "./Sidebar";
import { getSettings, setSettings } from "@/lib/storage";

export default function TopBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const settings = getSettings();
    applyTheme(settings.theme);
  }, []);

  function applyTheme(theme) {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = theme === "dark" || (theme === "system" && systemDark);
    root.classList.toggle("dark", isDark);
    root.classList.toggle("light", theme === "light");
    setDark(isDark);
  }

  function toggleDark() {
    const settings = getSettings();
    const nextTheme = dark ? "light" : "dark";
    setSettings({ theme: nextTheme });
    applyTheme(nextTheme);
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-elevated)]/90 backdrop-blur px-4 py-3 lg:pl-6 lg:pr-8">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <div className="lg:hidden">
          <BrandLogo />
        </div>
        <h1 className="hidden lg:block text-sm font-medium text-[var(--fg-muted)]">
          Personal Safety Dashboard
        </h1>
      </div>

      <button
        onClick={toggleDark}
        className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        aria-label="Toggle dark mode"
      >
        {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
      </button>

      <Transition show={mobileOpen}>
        <Dialog onClose={() => setMobileOpen(false)} className="relative z-50 lg:hidden">
          <TransitionChild
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </TransitionChild>
          <TransitionChild
            enter="ease-out duration-200"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in duration-150"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <DialogPanel className="fixed inset-y-0 left-0 w-72 bg-[var(--bg-elevated)] px-4 py-6 flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <BrandLogo />
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </header>
  );
}
