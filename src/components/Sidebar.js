"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheckIcon,
  HomeIcon,
  UserGroupIcon,
  ClockIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const NAV = [
  { href: "/", label: "Dashboard", icon: HomeIcon },
  { href: "/contacts", label: "Contacts", icon: UserGroupIcon },
  { href: "/history", label: "History", icon: ClockIcon },
  { href: "/settings", label: "Settings", icon: Cog6ToothIcon },
];

export function BrandLogo() {
  return (
    <div className="flex items-center gap-2 px-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
        <ShieldCheckIcon className="h-5 w-5" />
      </div>
      <span className="text-lg font-bold tracking-tight">SafeBand</span>
    </div>
  );
}

export function NavLinks({ onNavigate }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                : "text-[var(--fg-muted)] hover:bg-neutral-100 hover:text-[var(--fg)] dark:hover:bg-neutral-800"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-6 gap-8">
      <BrandLogo />
      <NavLinks />
      <div className="mt-auto rounded-xl bg-neutral-100 dark:bg-neutral-800 p-4 text-xs text-[var(--fg-muted)]">
        SafeBand pairs with your wearable to keep you connected to help, always.
      </div>
    </aside>
  );
}
