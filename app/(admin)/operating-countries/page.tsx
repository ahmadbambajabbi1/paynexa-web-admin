"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminAuth } from "@/lib/auth/admin-auth-context";
import { STORAGE_ADMIN_ACCESS_TOKEN } from "@/lib/config/constants";
import { errorMessage } from "@/lib/api/errors";
import { fieldInput, fieldLabel } from "@/lib/components/form-classes";
import * as countriesApi from "@/lib/api/countries";

const selectClass = `${fieldInput} cursor-pointer`;

export default function OperatingCountriesPage() {
  const { token } = useAdminAuth();
  const [countries, setCountries] = useState<countriesApi.CountryRow[]>([]);
  const [operating, setOperating] = useState<countriesApi.OperatingCountryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [iso2, setIso2] = useState("GM");
  const [sortOrder, setSortOrder] = useState("0");
  const [busy, setBusy] = useState(false);

  const t = token ?? (typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_ADMIN_ACCESS_TOKEN) : null);

  const load = useCallback(async () => {
    const auth = token ?? window.localStorage.getItem(STORAGE_ADMIN_ACCESS_TOKEN);
    if (!auth) return;
    setLoading(true);
    setErr(null);
    try {
      const [all, ops] = await Promise.all([
        countriesApi.listCountries(auth),
        countriesApi.listOperatingCountries(auth),
      ]);
      setCountries(all.countries);
      setOperating(ops.countries);
      if (all.countries.length > 0 && !all.countries.some((c) => c.iso2 === iso2)) {
        setIso2(all.countries[0]!.iso2);
      }
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [token, iso2]);

  useEffect(() => {
    void load();
  }, [load]);

  const operatingIso = useMemo(() => new Set(operating.map((c) => c.iso2)), [operating]);
  const selected = countries.find((c) => c.iso2 === iso2);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!t) return;
    const sort = Number.parseInt(sortOrder, 10);
    if (!Number.isFinite(sort) || sort < 0) {
      setErr("Sort order must be zero or greater.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await countriesApi.upsertOperatingCountry(t, { iso2, active: true, sortOrder: sort });
      await load();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function onRemove(row: countriesApi.OperatingCountryRow) {
    if (!t) return;
    setBusy(true);
    setErr(null);
    try {
      await countriesApi.removeOperatingCountry(t, row.iso2);
      await load();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-gray-50 md:text-4xl">
            Operating countries
          </h1>
          <p className="mt-2 max-w-xl text-gray-600 dark:text-gray-400">
            Select the countries where Paynexa is available. Login screens use this list, and each country carries its phone code and currency.
          </p>
        </div>
      </div>

      {err ? (
        <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {err}
        </p>
      ) : null}

      <form onSubmit={(e) => void onAdd(e)} className="mb-6 grid gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:grid-cols-[1fr_9rem_auto] md:items-end">
        <div>
          <label htmlFor="country" className={fieldLabel}>Country</label>
          <select id="country" className={selectClass} value={iso2} onChange={(e) => setIso2(e.target.value)} disabled={loading || busy}>
            {countries.map((c) => (
              <option key={c.iso2} value={c.iso2}>
                {c.name} (+{c.dialCode}) · {c.currencyCode}
              </option>
            ))}
          </select>
          {selected ? (
            <p className="mt-2 text-xs text-gray-500">
              Currency: {selected.currencySymbol} {selected.currencyCode} · {selected.currencyName}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="sortOrder" className={fieldLabel}>Sort</label>
          <input id="sortOrder" type="number" min={0} className={fieldInput} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} disabled={busy} />
        </div>
        <button type="submit" disabled={busy || loading || operatingIso.has(iso2)} className="rounded-xl bg-primaryColorBlack px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-950 disabled:opacity-60">
          {operatingIso.has(iso2) ? "Already added" : busy ? "Saving..." : "Add country"}
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {loading ? (
          <p className="px-6 py-16 text-center text-gray-500">Loading...</p>
        ) : operating.length === 0 ? (
          <p className="px-6 py-16 text-center text-gray-500">No operating countries yet.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {operating.map((row) => (
              <div key={row.iso2} className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{row.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    +{row.dialCode} · {row.currencySymbol} {row.currencyCode} · Sort {row.sortOrder}
                  </p>
                </div>
                <button type="button" onClick={() => void onRemove(row)} disabled={busy} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
