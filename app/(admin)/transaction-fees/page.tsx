"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminAuth } from "@/lib/auth/admin-auth-context";
import { STORAGE_ADMIN_ACCESS_TOKEN } from "@/lib/config/constants";
import { errorMessage } from "@/lib/api/errors";
import { cardPanel, fieldInput, fieldLabel } from "@/lib/components/form-classes";
import * as feesApi from "@/lib/api/transaction-fees";

export default function TransactionFeesPage() {
  const { token } = useAdminAuth();
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [percentageEnabled, setPercentageEnabled] = useState(false);
  const [percentageFee, setPercentageFee] = useState("0");
  const [fixedEnabled, setFixedEnabled] = useState(false);
  const [fixedFee, setFixedFee] = useState("0");

  const load = useCallback(async () => {
    const t = token ?? (typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_ADMIN_ACCESS_TOKEN) : null);
    if (!t) return;
    setLoading(true);
    setLoadErr(null);
    try {
      const row = await feesApi.getTransactionFees(t);
      setPercentageEnabled(row.percentageEnabled);
      setPercentageFee(row.percentageFee ?? "0");
      setFixedEnabled(row.fixedEnabled);
      setFixedFee(row.fixedFee ?? "0");
    } catch (e) {
      setLoadErr(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  const authToken = token ?? (typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_ADMIN_ACCESS_TOKEN) : null);
  if (!authToken) return null;

  const preview = useMemo(() => {
    const sample = 100;
    let pct = 0;
    let fixed = 0;
    if (percentageEnabled) pct = (sample * Number(percentageFee || 0)) / 100;
    if (fixedEnabled) fixed = Number(fixedFee || 0);
    const total = pct + fixed;
    const parts: string[] = [];
    if (percentageEnabled) parts.push(`${percentageFee}%`);
    if (fixedEnabled) parts.push(`$${fixedFee} fixed`);
    return {
      label: parts.length ? parts.join(" + ") : "No platform fee",
      fee: total.toFixed(2),
      sellerNet: Math.max(sample - total, 0).toFixed(2),
    };
  }, [percentageEnabled, percentageFee, fixedEnabled, fixedFee]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSubmitErr(null);
    setSubmitting(true);
    try {
      await feesApi.patchTransactionFees(authToken!, {
        percentageEnabled,
        percentageFee: percentageEnabled ? Number(percentageFee) : 0,
        fixedEnabled,
        fixedFee: fixedEnabled ? Number(fixedFee) : 0,
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
        <h1 className="font-display text-2xl font-bold text-slate-900">Platform transaction fees</h1>
        <p className="mt-2 text-sm text-slate-600">
          Configure <strong>platform (admin) fees</strong> deducted from the seller&apos;s payout when escrow is released.
          These are separate from <strong>Stripe processing fees</strong>, which are configured only via server environment
          variables (<code className="text-xs">STRIPE_PERCENTAGE_FEE</code>, <code className="text-xs">STRIPE_FIXED_FEE</code>)
          and are never shown to buyers at checkout.
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p className="font-semibold">Stripe vs platform fees</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><strong>Stripe processing fee</strong> — card network cost; taken when the buyer pays by card; wallet is credited with Stripe&apos;s net amount.</li>
          <li><strong>Platform fee (this page)</strong> — your revenue; calculated on the transaction list price and deducted from escrow before the seller is paid.</li>
        </ul>
      </div>

      {loadErr ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{loadErr}</div> : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <form onSubmit={(e) => void onSave(e)} className={`${cardPanel} space-y-6 p-6`}>
          <fieldset className="space-y-3">
            <legend className={`${fieldLabel} mb-2`}>Percentage platform fee</legend>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" checked={percentageEnabled} onChange={(e) => setPercentageEnabled(e.target.checked)} className="mt-1" />
              <span>Charge a percentage of the transaction list price</span>
            </label>
            <input type="number" min={0} max={100} step={0.01} value={percentageFee} onChange={(e) => setPercentageFee(e.target.value)} className={fieldInput} disabled={!percentageEnabled} />
          </fieldset>

          <fieldset className="space-y-3 border-t border-slate-100 pt-6">
            <legend className={`${fieldLabel} mb-2`}>Fixed platform fee</legend>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" checked={fixedEnabled} onChange={(e) => setFixedEnabled(e.target.checked)} className="mt-1" />
              <span>Charge a fixed amount per transaction (in transaction currency)</span>
            </label>
            <input type="number" min={0} step={0.01} value={fixedFee} onChange={(e) => setFixedFee(e.target.value)} className={fieldInput} disabled={!fixedEnabled} />
          </fieldset>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Preview (sample $100 transaction)</p>
            <p className="mt-1">Fee type: {preview.label}</p>
            <p>Platform fee: ${preview.fee}</p>
            <p>Seller receives (before Stripe): ${preview.sellerNet}</p>
            <p className="mt-2 text-xs text-slate-500">
              You can enable percentage and fixed together (combined fee). Leave both unchecked for zero platform fee.
            </p>
          </div>

          {submitErr ? <p className="text-sm text-red-600">{submitErr}</p> : null}

          <button type="submit" disabled={submitting} className="rounded-xl bg-primaryColorBlack px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {submitting ? "Saving…" : "Save platform fee rules"}
          </button>
        </form>
      )}
    </div>
  );
}
