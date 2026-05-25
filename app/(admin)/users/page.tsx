"use client";

import { useCallback, useEffect, useState } from "react";
import * as adminApi from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/errors";
import { STORAGE_ADMIN_ACCESS_TOKEN } from "@/lib/config/constants";
import { useAdminAuth } from "@/lib/auth/admin-auth-context";

export default function UserManagementPage() {
  const { token } = useAdminAuth();
  const [users, setUsers] = useState<adminApi.AdminUserSummary[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    const t =
      token ?? window.localStorage.getItem(STORAGE_ADMIN_ACCESS_TOKEN);
    if (!t) return;
    setListError(null);
    setLoadingList(true);
    try {
      const res = await adminApi.listAdminUsers(t);
      setUsers(res.users);
    } catch (e) {
      setListError(errorMessage(e));
    } finally {
      setLoadingList(false);
    }
  }, [token]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const t =
      token ?? window.localStorage.getItem(STORAGE_ADMIN_ACCESS_TOKEN);
    if (!t) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await adminApi.createAdminUser(t, {
        email,
        password,
        displayName: displayName.trim() || undefined,
      });
      setEmail("");
      setPassword("");
      setDisplayName("");
      await loadUsers();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          User management
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Invite another admin by email. They sign in with the password you set
          here.
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          Add admin user
        </h2>
        <form onSubmit={onCreate} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="new-email"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Email
            </label>
            <input
              id="new-email"
              type="email"
              autoComplete="off"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full max-w-md rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
          </div>
          <div>
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Initial password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full max-w-md rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
            <p className="mt-1 text-xs text-zinc-500">
              At least 8 characters. Share it securely with the new admin.
            </p>
          </div>
          <div>
            <label
              htmlFor="new-display"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Display name{" "}
              <span className="font-normal text-zinc-500">(optional)</span>
            </label>
            <input
              id="new-display"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full max-w-md rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
          </div>
          {formError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {submitting ? "Creating…" : "Create admin"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Admin accounts
          </h2>
          <button
            type="button"
            onClick={() => void loadUsers()}
            className="text-sm font-medium text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Refresh
          </button>
        </div>
        {listError ? (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">
            {listError}
          </p>
        ) : null}
        {loadingList ? (
          <p className="mt-4 text-sm text-zinc-500">Loading…</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700">
                  <th className="pb-2 pr-4 font-medium">Email</th>
                  <th className="pb-2 pr-4 font-medium">Name</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-zinc-100 dark:border-zinc-800"
                  >
                    <td className="py-3 pr-4 font-medium text-zinc-900 dark:text-zinc-100">
                      {u.email}
                    </td>
                    <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">
                      {u.displayName ?? "—"}
                    </td>
                    <td className="py-3 pr-4">
                      {u.active ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-zinc-500">
                      {new Intl.DateTimeFormat(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(u.createdAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && !loadingList ? (
              <p className="mt-4 text-sm text-zinc-500">No users yet.</p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
