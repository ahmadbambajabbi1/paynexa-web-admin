"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  listKycApplications,
  type KycApplicationListItem,
} from "@/lib/api/kyc-applications";
import { errorMessage } from "@/lib/api/errors";
import { STORAGE_ADMIN_ACCESS_TOKEN } from "@/lib/config/constants";
import { useAdminAuth } from "@/lib/auth/admin-auth-context";

function statusStyle(status: string) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200";
    case "REJECTED":
      return "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200";
    case "SUBMITTED":
    case "UNDER_REVIEW":
    case "DRAFT":
      return "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100";
    default:
      return "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200";
  }
}

export default function KycApplicationsPage() {
  const { token } = useAdminAuth();
  const [rows, setRows] = useState<KycApplicationListItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const t =
      token ?? window.localStorage.getItem(STORAGE_ADMIN_ACCESS_TOKEN);
    if (!t) return;
    setErr(null);
    setLoading(true);
    try {
      const res = await listKycApplications(t);
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
            KYC applications
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Lawyer and agent professional-role applications from the user service.
            Open a row to view uploaded documents (time-limited download links) and
            approve or reject. End-user personal KYC is under{" "}
            <Link href="/personal-kyc-applications" className="font-semibold underline">
              Personal KYC
            </Link>
            .
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
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/80 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/80">
                  <th className="px-4 py-3 font-medium">Applicant</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Documents</th>
                  <th className="px-4 py-3 font-medium">Selfie</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
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
                    <td className="px-4 py-3 font-medium capitalize text-zinc-800 dark:text-zinc-200">
                      {r.role.toLowerCase()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle(r.status)}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {r.kycDocumentCount}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          r.hasSelfie
                            ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                            : "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200"
                        }`}
                      >
                        {r.hasSelfie ? "Present" : "Missing"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Intl.DateTimeFormat(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(r.createdAt))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/kyc-applications/${r.id}`}
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
              <p className="p-6 text-sm text-zinc-500">No applications yet.</p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
