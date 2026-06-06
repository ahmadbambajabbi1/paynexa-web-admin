"use client";

import { useCallback, useEffect, useState } from "react";
import * as productTypesApi from "@/lib/api/product-types";
import { errorMessage } from "@/lib/api/errors";
import { STORAGE_ADMIN_ACCESS_TOKEN } from "@/lib/config/constants";
import { useAdminAuth } from "@/lib/auth/admin-auth-context";
import { CreateProductTypeForm } from "@/components/CreateProductTypeForm";
import { EditProductTypeForm } from "@/components/EditProductTypeForm";
import { cardPanel } from "@/lib/components/form-classes";

export default function ProductTypesPage() {
  const { token } = useAdminAuth();
  const [items, setItems] = useState<productTypesApi.ProductTypeRow[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<productTypesApi.ProductTypeRow | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const t =
      token ?? window.localStorage.getItem(STORAGE_ADMIN_ACCESS_TOKEN);
    if (!t) return;
    setLoadErr(null);
    setLoading(true);
    try {
      const res = await productTypesApi.listProductTypes(t);
      setItems(res.productTypes);
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

  if (!t) {
    return null;
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-gray-50 md:text-4xl">
            Product types
          </h1>
          <p className="mt-2 max-w-xl text-gray-600 dark:text-gray-400">
            Catalogue entries used across the platform. New types are queued
            securely and appear shortly after the product service processes
            them.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primaryColorBlack px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-950"
        >
          <i className="fas fa-plus" aria-hidden />
          New product type
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
                No product types yet. Create one to get started.
              </p>
            )}
            {items.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-4 p-6 transition hover:bg-gray-50/80 dark:hover:bg-gray-800/50 lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-primaryColorBlack dark:bg-blue-950 dark:text-blue-200">
                    <i className="fas fa-tags text-xl" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {row.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">
                        {row.code}
                      </code>
                      {" · "}
                      Sort {row.sortOrder}
                      {" · "}
                      {new Date(row.updatedAt).toLocaleDateString()}
                    </p>
                    {row.description ? (
                      <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
                        {row.description}
                      </p>
                    ) : null}
                    <p className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                      {row.lawyerPricingEnabled ? (
                        <span className="rounded-md bg-violet-100 px-2 py-0.5 font-medium text-violet-900 dark:bg-violet-950 dark:text-violet-200">
                          Lawyer pricing
                        </span>
                      ) : null}
                      {row.agentPricingEnabled ? (
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                          Agent pricing
                        </span>
                      ) : null}
                      {!row.lawyerPricingEnabled && !row.agentPricingEnabled ? (
                        <span className="text-gray-400 dark:text-gray-500">
                          No role-based pricing flags
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {(row.fieldDefinitions?.length ?? 0) === 0
                        ? "No custom attribute fields"
                        : `${row.fieldDefinitions?.length ?? 0} custom attribute field(s)`}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end lg:flex-col lg:items-end">
                  <div className="text-right">
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
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(row)}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      <i className="fas fa-pen mr-1.5 text-xs" aria-hidden />
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === row.id}
                      onClick={() => {
                        if (
                          !window.confirm(
                            `Delete product type “${row.name}” (${row.code})? This cannot be undone.`,
                          )
                        ) {
                          return;
                        }
                        void (async () => {
                          setDeletingId(row.id);
                          setLoadErr(null);
                          try {
                            await productTypesApi.deleteProductType(t, row.id);
                            await load();
                          } catch (e) {
                            setLoadErr(errorMessage(e));
                          } finally {
                            setDeletingId(null);
                          }
                        })();
                      }}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-950/70"
                    >
                      <i className="fas fa-trash-alt mr-1.5 text-xs" aria-hidden />
                      {deletingId === row.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm dark:bg-black/60">
          <div
            className={`${cardPanel} relative max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6 sm:p-8`}
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
              New product type
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Submits a secure job to the catalogue service. Refresh the list if
              the new row does not appear immediately.
            </p>
            <CreateProductTypeForm
              token={t}
              onCancel={() => setShowCreate(false)}
              onCreated={() => {
                setShowCreate(false);
                window.setTimeout(() => void load(), 400);
              }}
            />
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm dark:bg-black/60">
          <div
            className={`${cardPanel} relative max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6 sm:p-8`}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setEditing(null)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              <i className="fas fa-times" />
            </button>
            <h3 className="font-display pr-10 text-2xl font-bold text-gray-900 dark:text-gray-50">
              Edit product type
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Changes are saved directly to the catalogue service.
            </p>
            <EditProductTypeForm
              token={t}
              row={editing}
              onCancel={() => setEditing(null)}
              onSaved={() => {
                setEditing(null);
                void load();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
