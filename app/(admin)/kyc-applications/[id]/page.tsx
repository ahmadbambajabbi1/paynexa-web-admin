"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  approveKycApplication,
  getKycApplication,
  rejectKycApplication,
  type KycApplicationDetailResponse,
} from "@/lib/api/kyc-applications";
import { errorMessage } from "@/lib/api/errors";
import { STORAGE_ADMIN_ACCESS_TOKEN } from "@/lib/config/constants";
import { useAdminAuth } from "@/lib/auth/admin-auth-context";

export default function KycApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAdminAuth();
  const [data, setData] = useState<KycApplicationDetailResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);

  const load = useCallback(async () => {
    const t =
      token ?? window.localStorage.getItem(STORAGE_ADMIN_ACCESS_TOKEN);
    if (!t || !id) return;
    setErr(null);
    setLoading(true);
    try {
      const res = await getKycApplication(t, id);
      setData(res);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onApprove() {
    const t =
      token ?? window.localStorage.getItem(STORAGE_ADMIN_ACCESS_TOKEN);
    if (!t || !id) return;
    setBusy("approve");
    setErr(null);
    try {
      await approveKycApplication(t, id);
      await load();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function onReject() {
    const t =
      token ?? window.localStorage.getItem(STORAGE_ADMIN_ACCESS_TOKEN);
    if (!t || !id) return;
    setBusy("reject");
    setErr(null);
    try {
      await rejectKycApplication(t, id, { reason: rejectReason.trim() || undefined });
      setRejectReason("");
      await load();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  const app = data?.application;
  const selfieDocs =
    app?.kycDocuments.filter((d) => d.uploader.toLowerCase().includes("selfie")) ?? [];
  const reviewable =
    app?.status === "SUBMITTED" ||
    app?.status === "UNDER_REVIEW" ||
    app?.status === "DRAFT";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link
          href="/kyc-applications"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to list
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          KYC application
        </h1>
      </div>

      {err ? (
        <p className="text-sm text-red-600 dark:text-red-400">{err}</p>
      ) : null}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : app ? (
        <>
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              Applicant
            </h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-zinc-500">Name</dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                  {app.user.displayName || app.user.fullName || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Email</dt>
                <dd className="font-medium">{app.user.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Phone</dt>
                <dd className="font-medium">{app.user.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Role</dt>
                <dd className="font-medium capitalize">{app.role.toLowerCase()}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Status</dt>
                <dd className="font-medium">{app.status}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              Submitted details
            </h2>
            <pre className="mt-4 max-h-64 overflow-auto rounded-xl bg-zinc-50 p-4 text-xs text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
              {JSON.stringify(app.payload ?? {}, null, 2)}
            </pre>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              Documents
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Download links expire after a short time. Refresh the page if a
              link stops working.
            </p>
            {selfieDocs.length === 0 ? (
              <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
                Missing required selfie document.
              </p>
            ) : (
              <div className="mt-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Selfie preview</p>
                <img
                  src={selfieDocs[0].downloadUrl}
                  alt="Applicant selfie"
                  className="mt-3 h-56 w-56 rounded-lg object-cover"
                />
              </div>
            )}
            <ul className="mt-4 space-y-3">
              {app.kycDocuments.map((d) => (
                <li
                  key={d.id}
                  className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {d.uploader}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {d.kind} ·{" "}
                      {new Intl.DateTimeFormat(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(d.createdAt))}
                    </p>
                  </div>
                  <a
                    href={d.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Open file
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {reviewable ? (
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                Decision
              </h2>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void onApprove()}
                  className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  {busy === "approve" ? "Approving…" : "Approve"}
                </button>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <label
                    htmlFor="reject-reason"
                    className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Rejection note (optional)
                  </label>
                  <textarea
                    id="reject-reason"
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                    placeholder="Explain what is missing or incorrect…"
                  />
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void onReject()}
                    className="self-start rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
                  >
                    {busy === "reject" ? "Rejecting…" : "Reject"}
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              This application is already {app.status.toLowerCase()}. No further
              action is available.
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-zinc-500">Not found.</p>
      )}

      <button
        type="button"
        onClick={() => router.push("/kyc-applications")}
        className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
      >
        Return to list
      </button>
    </div>
  );
}
