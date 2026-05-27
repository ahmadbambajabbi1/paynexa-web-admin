"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/auth/admin-auth-context";

type NavItem = { href: string; label: string; icon: "dash" | "users" | "box" | "shield" };

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: "dash" }],
  },
  {
    title: "Compliance",
    items: [
      { href: "/kyc-applications", label: "Professional KYC", icon: "shield" },
      { href: "/personal-kyc-applications", label: "Personal KYC", icon: "shield" },
      { href: "/verifications", label: "Verification codes", icon: "shield" },
    ],
  },
  {
    title: "Catalog",
    items: [{ href: "/product-types", label: "Product types", icon: "box" }],
  },
  {
    title: "Service marketplace",
    items: [
      { href: "/service-categories", label: "Service categories", icon: "box" },
      { href: "/marketplace-service-fees", label: "Service fees", icon: "box" },
      { href: "/service-providers", label: "Providers", icon: "users" },
      { href: "/service-disputes", label: "Disputes", icon: "shield" },
      { href: "/service-analytics", label: "Analytics", icon: "dash" },
    ],
  },
  {
    title: "Administration",
    items: [{ href: "/users", label: "Admin users", icon: "users" }],
  },
];

function NavIcon({ kind }: { kind: NavItem["icon"] }) {
  const common = "h-5 w-5 shrink-0";
  switch (kind) {
    case "dash":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 13h7V4H4v9zm0 7h7v-5H4v5zm9 0h7V4h-7v16zm0-18v9h7V4h-7z"
            fill="currentColor"
            opacity="0.9"
          />
        </svg>
      );
    case "shield":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3zm0 2.2 6 2.25v5.55c0 3.9-2.6 7.7-6 8.95-3.4-1.25-6-5.05-6-8.95V6.45l6-2.25z"
            fill="currentColor"
            opacity="0.9"
          />
        </svg>
      );
    case "box":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 8.5 12 4 3 8.5 12 13l9-4.5zM4.5 10.25V16L12 19l7.5-3V10.25L12 14.25 4.5 10.25z"
            fill="currentColor"
            opacity="0.9"
          />
        </svg>
      );
    case "users":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M16 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3zm-8 0c2.2 0 4-1.8 4-4S10.2 3 8 3 4 4.8 4 7s1.8 4 4 4zm0 2c-2.7 0-8 1.3-8 4v3h16v-3c0-2.7-5.3-4-8-4zm8 0c-.3 0-.6 0-1 .1 1.2.8 2 2 2 2v3h6v-3c0-1.7-3.3-3.1-7-3.1z"
            fill="currentColor"
            opacity="0.9"
          />
        </svg>
      );
    default:
      return null;
  }
}

function linkActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-200"
          aria-hidden
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-950">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700 dark:border-zinc-700 dark:border-t-zinc-200"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {mobileNav ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileNav(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[17.5rem] flex-col border-r border-zinc-200/80 bg-gradient-to-b from-white via-white to-zinc-50 shadow-lg shadow-zinc-900/5 transition-transform dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 md:static md:translate-x-0 ${
          mobileNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-zinc-200/80 px-5 py-5 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
              E
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Escrow
              </p>
              <p className="text-base font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
                Admin console
              </p>
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                {g.title}
              </p>
              <div className="flex flex-col gap-0.5">
                {g.items.map((item) => {
                  const active = linkActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileNav(false)}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                          : "text-zinc-600 hover:bg-zinc-100/90 dark:text-zinc-400 dark:hover:bg-zinc-800/80"
                      }`}
                    >
                      <span
                        className={
                          active
                            ? "text-white dark:text-zinc-900"
                            : "text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300"
                        }
                      >
                        <NavIcon kind={item.icon} />
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-zinc-200/80 p-4 dark:border-zinc-800">
          <p className="truncate text-xs text-zinc-500" title={user.email}>
            {user.email}
          </p>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="mt-3 w-full rounded-xl bg-zinc-100 px-3 py-2.5 text-left text-sm font-semibold text-zinc-800 ring-1 ring-zinc-200/80 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-700"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-zinc-200/80 bg-white/90 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90 md:hidden">
          <button
            type="button"
            aria-label="Open menu"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
            onClick={() => setMobileNav(true)}
          >
            <span className="block h-0.5 w-5 rounded-full bg-zinc-800 dark:bg-zinc-200" />
            <span className="block h-0.5 w-5 rounded-full bg-zinc-800 dark:bg-zinc-200" />
            <span className="block h-0.5 w-5 rounded-full bg-zinc-800 dark:bg-zinc-200" />
          </button>
          <span className="font-semibold">Escrow admin</span>
        </header>
        <main className="min-h-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
