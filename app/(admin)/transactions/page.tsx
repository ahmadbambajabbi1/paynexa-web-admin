"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/auth/admin-auth-context";
import { STORAGE_ADMIN_ACCESS_TOKEN } from "@/lib/config/constants";
import { errorMessage } from "@/lib/api/errors";
import { cardPanel, fieldInput, fieldLabel } from "@/lib/components/form-classes";
import * as txApi from "@/lib/api/transactions";

export default function AdminTransactionsPage() {
  const { token } = useAdminAuth();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [rows, setRows] = useState<txApi.AdminTransactionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const t = token ?? (typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_ADMIN_ACCESS_TOKEN) : null);
    if (!t) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await txApi.listAdminTransactions(t, { query: query || undefined, status: status || undefined, limit: 50 });
      setRows(res.items);
      setTotal(res.total);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [query, status, token]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Transactions</h1>
        <p className="mt-2 text-sm text-slate-600">Search and review escrow transactions, parties, and fee breakdowns.</p>
      </div>

      <div className={`${cardPanel} grid gap-4 p-4 sm:grid-cols-3`}>
        <div>
          <label className={fieldLabel} htmlFor="q">Search</label>
          <input id="q" value={query} onChange={(e) => setQuery(e.target.value)} className={fieldInput} placeholder="ID, title…" />
        </div>
        <div>
          <label className={fieldLabel} htmlFor="status">Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className={fieldInput}>
            <option value="">All</option>
            <option value="AWAITING_FUNDING">Awaiting funding</option>
            <option value="FUNDED">Funded</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="DISPUTED">Disputed</option>
            <option value="COMPLETED">Completed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
        <div className="flex items-end">
          <button type="button" onClick={() => void load()} className="rounded-xl bg-primaryColorBlack px-4 py-2.5 text-sm font-semibold text-white">Apply</button>
        </div>
      </div>

      {err ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{err}</div> : null}

      <div className={`${cardPanel} overflow-hidden`}>
        <div className="border-b border-slate-100 px-4 py-3 text-sm text-slate-500">{total} transaction(s)</div>
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Fee / Net</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Parties</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <Link href={`/transactions/${row.id}`} className="font-medium text-slate-900 hover:underline">{row.productTitle}</Link>
                      <p className="text-xs text-slate-400">{row.id.slice(0, 8)}…</p>
                    </td>
                    <td className="px-4 py-3">{row.currencyCode} {row.amount}</td>
                    <td className="px-4 py-3">
                      {row.platformFeeAmount ? `Fee ${row.platformFeeAmount}` : "—"}
                      <br />
                      {row.sellerNetAmount ? `Net ${row.sellerNetAmount}` : ""}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {row.payment ? (
                        <>
                          <div>{row.payment.paymentMethod ?? "—"}</div>
                          {row.payment.paidCurrency &&
                          row.payment.transactionCurrency &&
                          row.payment.paidCurrency !== row.payment.transactionCurrency ? (
                            <>
                              <div>Paid {row.payment.paidAmount} {row.payment.paidCurrency}</div>
                              <div>Listed {row.payment.transactionAmount} {row.payment.transactionCurrency}</div>
                              {row.payment.exchangeRate ? <div>Rate {row.payment.exchangeRate}</div> : null}
                            </>
                          ) : (
                            <div>{row.payment.paidAmount ?? row.amount} {row.payment.paidCurrency ?? row.currencyCode}</div>
                          )}
                          {row.payment.stripeFeeAmount ? <div>Stripe fee {row.payment.stripeFeeAmount}</div> : null}
                          {row.payment.netReceivedAmount ? <div>Net received {row.payment.netReceivedAmount}</div> : null}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">{row.status.replaceAll("_", " ")}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <div>Buyer: {row.buyer?.fullName ?? row.buyer?.email ?? "—"}</div>
                      <div>Seller: {row.seller?.fullName ?? row.seller?.email ?? "—"}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
