'use client';

import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '@/lib/api/errors';
import { listVerificationCodes, type VerificationCodeItem } from '@/lib/api/verifications';
import { useAdminAuth } from '@/lib/auth/admin-auth-context';
import { STORAGE_ADMIN_ACCESS_TOKEN } from '@/lib/config/constants';

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function userLabel(row: VerificationCodeItem) {
  const name = row.user?.displayName ?? row.user?.fullName;
  if (name) return name;
  return row.user?.email ?? row.user?.phone ?? 'Unknown user';
}

export default function VerificationsPage() {
  const { token } = useAdminAuth();
  const [rows, setRows] = useState<VerificationCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [checkedAt, setCheckedAt] = useState(() => Date.now());

  const loadRows = useCallback(async () => {
    const t = token ?? window.localStorage.getItem(STORAGE_ADMIN_ACCESS_TOKEN);
    if (!t) return;
    setLoading(true);
    setListError(null);
    try {
      const res = await listVerificationCodes(t);
      setRows(res.verifications);
      setCheckedAt(Date.now());
    } catch (e) {
      setListError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRows();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadRows]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Verification codes
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Recent email and phone verification codes sent by the user service.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadRows()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          disabled={loading}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {listError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{listError}</p>
        ) : null}
        {loading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[64rem] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700">
                  <th className="pb-2 pr-4 font-medium">User</th>
                  <th className="pb-2 pr-4 font-medium">Sent to</th>
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium">Code</th>
                  <th className="pb-2 pr-4 font-medium">Purpose</th>
                  <th className="pb-2 pr-4 font-medium">Sent date</th>
                  <th className="pb-2 pr-4 font-medium">Expires</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const consumed = Boolean(row.consumedAt);
                  const expired = !consumed && new Date(row.expiresAt).getTime() < checkedAt;
                  return (
                    <tr key={row.id} className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="py-3 pr-4 font-medium text-zinc-900 dark:text-zinc-100">
                        {userLabel(row)}
                      </td>
                      <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">
                        {row.target}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold uppercase text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                          {row.medium}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <code className="rounded bg-zinc-100 px-2 py-1 text-sm font-semibold text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
                          {row.code ?? 'not stored'}
                        </code>
                      </td>
                      <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">
                        {row.purpose}
                      </td>
                      <td className="py-3 pr-4 text-zinc-500">{formatDate(row.createdAt)}</td>
                      <td className="py-3 pr-4 text-zinc-500">{formatDate(row.expiresAt)}</td>
                      <td className="py-3">
                        {consumed ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                            Used
                          </span>
                        ) : expired ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                            Expired
                          </span>
                        ) : (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length === 0 ? <p className="mt-4 text-sm text-zinc-500">No verification codes yet.</p> : null}
          </div>
        )}
      </section>
    </div>
  );
}
