"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  listPersonalKycApplications,
  type PersonalKycListItem,
} from "@/lib/api/personal-kyc-applications";
import { errorMessage } from "@/lib/api/errors";
import { STORAGE_ADMIN_ACCESS_TOKEN } from "@/lib/config/constants";
import { useAdminAuth } from "@/lib/auth/admin-auth-context";

export default function PersonalKycApplicationsPage() {
  const { token } = useAdminAuth();
  const [rows, setRows] = useState<PersonalKycListItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const t =
      token ?? window.localStorage.getItem(STORAGE_ADMIN_ACCESS_TOKEN);
    if (!t) return;
    setErr(null);
    setLoading(true);
    try {
      const res = await listPersonalKycApplications(t);
      setRows(res.applications);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Personal KYC
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            End-user identity verification before they can create escrow transactions.
            Each row shows the submission version for audit.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="self-start rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Refresh
        </button>
      </div>

      {err ? (
        <p className="text-sm text-red-600 dark:text-red-400">{err}</p>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {loading ? (
          <p className="p-6 text-sm text-zinc-500">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/80">
                  <th className="px-4 py-3 font-medium">Applicant</th>
                  <th className="px-4 py-3 font-medium">Version</th>
                  <th className="px-4 py-3 font-medium">Documents</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.userId}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {r.user.displayName || r.user.fullName || "—"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {[r.user.email, r.user.phone].filter(Boolean).join(" · ") ||
                          r.user.id}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-800 dark:text-zinc-200">
                      v{r.personalKycVersion}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {r.documentCount}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {r.pendingSince
                        ? new Intl.DateTimeFormat(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(r.pendingSince))
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/personal-kyc-applications/${r.userId}`}
                        className="text-sm font-semibold text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && !loading ? (
              <p className="p-6 text-sm text-zinc-500">No pending personal KYC.</p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
