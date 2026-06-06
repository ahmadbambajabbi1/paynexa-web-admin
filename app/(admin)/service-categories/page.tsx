"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/auth/admin-auth-context";
import { STORAGE_ADMIN_ACCESS_TOKEN } from "@/lib/config/constants";
import { errorMessage } from "@/lib/api/errors";
import { cardPanel, fieldInput, fieldLabel } from "@/lib/components/form-classes";
import * as serviceCategoriesApi from "@/lib/api/service-categories";

export default function ServiceCategoriesPage() {
  const { token } = useAdminAuth();
  const [items, setItems] = useState<serviceCategoriesApi.ServiceCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const t = token ?? window.localStorage.getItem(STORAGE_ADMIN_ACCESS_TOKEN);
    if (!t) return;
    setLoadErr(null);
    setLoading(true);
    try {
      const res = await serviceCategoriesApi.listServiceCategories(t);
      setItems(res.categories);
    } catch (e) {
      setLoadErr(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const t =
    token ?? (typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_ADMIN_ACCESS_TOKEN)
      : null);
  if (!t) return null;

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!t) return;
    setSubmitErr(null);
    setSubmitting(true);
    try {
      const sort =
        sortOrder.trim() === "" ? undefined : Number.parseInt(sortOrder, 10);
      if (sortOrder.trim() !== "" && !Number.isFinite(sort)) {
        setSubmitErr("Sort order must be a number.");
        return;
      }
      await serviceCategoriesApi.createServiceCategory(t, {
        code: code.trim(),
        name: name.trim(),
        active,
        sortOrder: sort,
      });
      setCode("");
      setName("");
      setSortOrder("");
      setActive(true);
      setShowCreate(false);
      window.setTimeout(() => void load(), 250);
    } catch (e) {
      setSubmitErr(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-gray-50 md:text-4xl">
            Service categories
          </h1>
          <p className="mt-2 max-w-xl text-gray-600 dark:text-gray-400">
            Categories used for provider Service Listings (plumbing, painting,
            tutoring, development, etc.).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primaryColorBlack px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-950"
        >
          <i className="fas fa-plus" aria-hidden />
          New category
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {loadErr && (
          <p className="m-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {loadErr}
          </p>
        )}
        {loading ? (
          <p className="px-6 py-16 text-center text-gray-500">Loading…</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.length === 0 && !loadErr && (
              <p className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                No categories yet. Create one to get started.
              </p>
            )}
            {items.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-3 p-6 transition hover:bg-gray-50/80 dark:hover:bg-gray-800/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {row.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">
                      {row.code}
                    </code>
                    {" · "}Sort {row.sortOrder}
                  </p>
                </div>
                <div className="shrink-0">
                  {row.active ? (
                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm dark:bg-black/60">
          <div
            className={`${cardPanel} relative max-h-[90vh] w-full max-w-xl overflow-y-auto p-6 sm:p-8`}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setShowCreate(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              <i className="fas fa-times" />
            </button>
            <h3 className="font-display pr-10 text-2xl font-bold text-gray-900 dark:text-gray-50">
              New service category
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Used for Service Listings and filtering.
            </p>

            <form onSubmit={(e) => void onCreate(e)} className="mt-6 space-y-5">
              <div>
                <label className={fieldLabel} htmlFor="sc-code">
                  Code
                </label>
                <input
                  id="sc-code"
                  className={fieldInput}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. plumbing"
                  pattern="[a-z][a-z0-9_]{1,62}"
                  required
                />
              </div>
              <div>
                <label className={fieldLabel} htmlFor="sc-name">
                  Name
                </label>
                <input
                  id="sc-name"
                  className={fieldInput}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Plumbing"
                  required
                  maxLength={120}
                />
              </div>
              <div>
                <label className={fieldLabel} htmlFor="sc-sort">
                  Sort order <span className="font-normal text-gray-500">(optional)</span>
                </label>
                <input
                  id="sc-sort"
                  type="number"
                  min={0}
                  className={fieldInput}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  placeholder="0"
                />
              </div>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-800 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primaryColorBlack focus:ring-primaryColorBlack"
                />
                <span>
                  <span className="font-medium">Active</span>
                  <span className="mt-0.5 block text-xs font-normal text-gray-500 dark:text-gray-400">
                    If inactive, it won’t show up in public browsing.
                  </span>
                </span>
              </label>

              {submitErr ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
                  {submitErr}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-primaryColorBlack px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-950 disabled:opacity-50"
                >
                  {submitting ? "Saving…" : "Create category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

