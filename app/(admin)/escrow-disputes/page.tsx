"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/auth/admin-auth-context";
import { STORAGE_ADMIN_ACCESS_TOKEN } from "@/lib/config/constants";
import { errorMessage } from "@/lib/api/errors";
import { cardPanel, fieldInput, fieldLabel } from "@/lib/components/form-classes";
import * as disputeApi from "@/lib/api/disputes";

export default function EscrowDisputesPage() {
  const { token } = useAdminAuth();
  const [status, setStatus] = useState("");
  const [rows, setRows] = useState<disputeApi.AdminDisputeRow[]>([]);
  const [selected, setSelected] = useState<disputeApi.AdminDisputeRow | null>(null);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [resolution, setResolution] = useState<"RELEASE_TO_SELLER" | "REFUND_TO_BUYER">("RELEASE_TO_SELLER");
  const [resolutionReason, setResolutionReason] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const authToken = token ?? (typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_ADMIN_ACCESS_TOKEN) : null);

  const load = useCallback(async () => {
    if (!authToken) return;
    setErr(null);
    try {
      const res = await disputeApi.listAdminDisputes(authToken, { status: status || undefined, limit: 50 });
      setRows(res.items);
    } catch (e) {
      setErr(errorMessage(e));
    }
  }, [authToken, status]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!authToken) return;
    const abort = new AbortController();
    const base = process.env.NEXT_PUBLIC_ADMIN_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:5006";
    const url = `${base}/admin/disputes/stream`;
    void (async () => {
      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${authToken}` },
          signal: abort.signal,
        });
        const reader = res.body?.getReader();
        if (!reader) return;
        const decoder = new TextDecoder();
        while (!abort.signal.aborted) {
          const chunk = await reader.read();
          if (chunk.done) break;
          const txt = decoder.decode(chunk.value, { stream: true });
          if (txt.includes("dispute.created")) void load();
        }
      } catch {
        // stream closed
      }
    })();
    return () => abort.abort();
  }, [authToken, load]);

  async function openDetail(row: disputeApi.AdminDisputeRow) {
    if (!authToken) return;
    setSelected(row);
    setDetail(null);
    try {
      const d = await disputeApi.getAdminDispute(authToken, row.id);
      setDetail(d);
    } catch (e) {
      setErr(errorMessage(e));
    }
  }

  async function resolve() {
    if (!authToken || !selected) return;
    setBusy(true);
    setErr(null);
    try {
      await disputeApi.resolveAdminDispute(authToken, selected.id, {
        resolution,
        resolutionReason,
        internalNotes: internalNotes || undefined,
      });
      setSelected(null);
      setDetail(null);
      setResolutionReason("");
      setInternalNotes("");
      await load();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 pb-12 lg:grid-cols-[1fr_24rem]">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Escrow disputes</h1>
          <p className="mt-2 text-sm text-slate-600">Review buyer/seller disputes and release or refund funds.</p>
        </div>

        <div className={`${cardPanel} p-4`}>
          <label className={fieldLabel} htmlFor="d-status">Status</label>
          <select id="d-status" value={status} onChange={(e) => setStatus(e.target.value)} className={fieldInput}>
            <option value="">All</option>
            <option value="OPEN">Open</option>
            <option value="COUNTERED">Countered</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        {err ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{err}</div> : null}

        <div className={`${cardPanel} divide-y divide-slate-100`}>
          {rows.map((row) => {
            const preview =
              row.thread?.[row.thread.length - 1]?.message ??
              row.description;
            const parties = new Set(
              (row.thread ?? []).filter((m) => m.kind === "opening").map((m) => m.actorRole),
            );
            const partyLabel =
              parties.size > 1 ? "buyer & seller" : row.raisedByRole;
            return (
            <button key={row.id} type="button" onClick={() => void openDetail(row)} className="block w-full px-4 py-4 text-left hover:bg-slate-50">
              <p className="font-medium text-slate-900">{row.transaction?.productTitle ?? row.transactionId}</p>
              <p className="mt-1 text-xs text-slate-500">{partyLabel} · {row.status} · {new Date(row.createdAt).toLocaleString()}</p>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{preview}</p>
            </button>
            );
          })}
        </div>
      </div>

      <aside className={`${cardPanel} h-fit p-5`}>
        {!selected ? (
          <p className="text-sm text-slate-500">Select a dispute to review details and resolve.</p>
        ) : (
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900">Resolve dispute</h2>
            {detail ? (
              <div className="space-y-3 text-sm text-slate-600">
                <p><strong>Buyer:</strong> {(detail.buyer as { fullName?: string; email?: string })?.fullName ?? (detail.buyer as { email?: string })?.email}</p>
                <p><strong>Seller:</strong> {(detail.seller as { fullName?: string; email?: string })?.fullName ?? (detail.seller as { email?: string })?.email}</p>
                <div className="space-y-3">
                  <p className="font-semibold text-slate-800">Dispute conversation</p>
                  {Array.isArray((detail.dispute as { thread?: Array<{ id: string; actorRole: string; message: string; kind: string }> })?.thread) &&
                  (detail.dispute as { thread: Array<{ id: string; actorRole: string; message: string; kind: string }> }).thread.map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-lg border p-3 ${
                        m.kind === "opening" ? "border-red-100 bg-red-50" : "border-slate-100 bg-slate-50"
                      }`}
                    >
                      <p className={`text-xs font-bold uppercase ${m.kind === "opening" ? "text-red-800" : "text-slate-600"}`}>
                        {m.actorRole}{m.kind === "opening" ? " · opening" : ""}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm">{m.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Loading detail…</p>
            )}
            <div>
              <label className={fieldLabel}>Action</label>
              <select value={resolution} onChange={(e) => setResolution(e.target.value as typeof resolution)} className={fieldInput}>
                <option value="RELEASE_TO_SELLER">Release funds to seller</option>
                <option value="REFUND_TO_BUYER">Refund funds to buyer</option>
              </select>
            </div>
            <div>
              <label className={fieldLabel}>Resolution reason</label>
              <textarea value={resolutionReason} onChange={(e) => setResolutionReason(e.target.value)} className={`${fieldInput} min-h-24`} />
            </div>
            <div>
              <label className={fieldLabel}>Internal notes (optional)</label>
              <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} className={`${fieldInput} min-h-20`} />
            </div>
            <button type="button" disabled={busy || !resolutionReason.trim()} onClick={() => void resolve()} className="w-full rounded-xl bg-primaryColorBlack py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? "Resolving…" : "Resolve dispute"}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
