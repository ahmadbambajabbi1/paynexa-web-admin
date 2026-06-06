"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/auth/admin-auth-context";
import { STORAGE_ADMIN_ACCESS_TOKEN } from "@/lib/config/constants";
import { errorMessage } from "@/lib/api/errors";
import { cardPanel, fieldInput, fieldLabel } from "@/lib/components/form-classes";
import * as feesApi from "@/lib/api/marketplace-service-fees";

export default function MarketplaceServiceFeesPage() {
  const { token } = useAdminAuth();
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [providerFeeEnabled, setProviderFeeEnabled] = useState(false);
  const [providerFeePercent, setProviderFeePercent] = useState("0");
  const [customerFeeEnabled, setCustomerFeeEnabled] = useState(false);
  const [customerFeePercent, setCustomerFeePercent] = useState("0");

  const load = useCallback(async () => {
    const t = token ?? (typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_ADMIN_ACCESS_TOKEN) : null);
    if (!t) return;
    setLoading(true);
    setLoadErr(null);
    try {
      const row = await feesApi.getMarketplaceServiceFees(t);
      setProviderFeeEnabled(row.providerFeeEnabled);
      setProviderFeePercent(row.providerFeePercent ?? "0");
      setCustomerFeeEnabled(row.customerFeeEnabled);
      setCustomerFeePercent(row.customerFeePercent ?? "0");
    } catch (e) {
      setLoadErr(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const authToken =
    token ?? (typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_ADMIN_ACCESS_TOKEN) : null);
  if (!authToken) return null;
  const adminToken: string = authToken;

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSubmitErr(null);
    setSubmitting(true);
    try {
      const pp = Number(providerFeePercent);
      const cp = Number(customerFeePercent);
      if (!Number.isFinite(pp) || pp < 0 || pp > 100) {
        setSubmitErr("Provider fee percent must be between 0 and 100.");
        return;
      }
      if (!Number.isFinite(cp) || cp < 0 || cp > 100) {
        setSubmitErr("Customer fee percent must be between 0 and 100.");
        return;
      }
      await feesApi.patchMarketplaceServiceFees(adminToken, {
        providerFeeEnabled,
        providerFeePercent: pp,
        customerFeeEnabled,
        customerFeePercent: cp,
      });
      await load();
    } catch (e) {
      setSubmitErr(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Marketplace service fees</h1>
        <p className="mt-2 text-sm text-slate-600">
          Control how the platform earns from paid service bookings. Percentages apply to the agreed service price when a
          customer books. Provider fees reduce what the provider receives on payout; customer fees increase what the
          customer pays at checkout (labeled here as the customer — the person booking the service).
        </p>
      </div>

      {loadErr ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{loadErr}</div>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <form onSubmit={(e) => void onSave(e)} className={`${cardPanel} space-y-6 p-6`}>
          <fieldset className="space-y-3">
            <legend className={`${fieldLabel} mb-2`}>Provider fee</legend>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={providerFeeEnabled}
                onChange={(e) => setProviderFeeEnabled(e.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-slate-900">Charge provider</span>
                <span className="mt-0.5 block text-slate-600">
                  Deduct a percentage of the agreed price from the provider&apos;s payout (they fund their share of the
                  platform fee).
                </span>
              </span>
            </label>
            <div>
              <label className={fieldLabel} htmlFor="prov-pct">
                Provider fee (%)
              </label>
              <input
                id="prov-pct"
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={providerFeePercent}
                onChange={(e) => setProviderFeePercent(e.target.value)}
                className={fieldInput}
                disabled={!providerFeeEnabled}
              />
            </div>
          </fieldset>

          <fieldset className="space-y-3 border-t border-slate-100 pt-6">
            <legend className={`${fieldLabel} mb-2`}>Customer fee</legend>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={customerFeeEnabled}
                onChange={(e) => setCustomerFeeEnabled(e.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-slate-900">Charge customer (booker)</span>
                <span className="mt-0.5 block text-slate-600">
                  Add a percentage on top of the agreed price when the customer pays to fund the booking.
                </span>
              </span>
            </label>
            <div>
              <label className={fieldLabel} htmlFor="cust-pct">
                Customer fee (%)
              </label>
              <input
                id="cust-pct"
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={customerFeePercent}
                onChange={(e) => setCustomerFeePercent(e.target.value)}
                className={fieldInput}
                disabled={!customerFeeEnabled}
              />
            </div>
          </fieldset>

          {submitErr ? (
            <p className="text-sm text-red-600" role="alert">
              {submitErr}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-primaryColorBlack px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save fee rules"}
          </button>
        </form>
      )}
    </div>
  );
}
