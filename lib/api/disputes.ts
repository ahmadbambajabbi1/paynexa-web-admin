import { adminApiFetch } from "@/lib/api/client";
import type { AdminParty } from "./transactions";

export type AdminDisputeRow = {
  id: string;
  transactionId: string;
  raisedByUserId: string;
  raisedByRole: string;
  description: string;
  status: string;
  resolution: string | null;
  resolutionReason: string | null;
  resolvedAt: string | null;
  createdAt: string;
  thread?: Array<{
    id: string;
    actorRole: string;
    message: string;
    createdAt: string;
    kind: "opening" | "reply";
  }>;
  transaction?: {
    id: string;
    productTitle: string;
    amount: string;
    currencyCode: string;
    status: string;
  };
  buyer: AdminParty | null;
  seller: AdminParty | null;
};

export async function listAdminDisputes(
  token: string,
  params?: { status?: string; limit?: number; offset?: number },
) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.offset != null) qs.set("offset", String(params.offset));
  const suffix = qs.toString() ? `?${qs}` : "";
  return adminApiFetch<{ items: AdminDisputeRow[]; total: number }>(
    `/admin/disputes${suffix}`,
    { token },
  );
}

export async function getAdminDispute(token: string, id: string) {
  return adminApiFetch<Record<string, unknown>>(`/admin/disputes/${encodeURIComponent(id)}`, {
    token,
  });
}

export async function resolveAdminDispute(
  token: string,
  id: string,
  body: {
    resolution: "RELEASE_TO_SELLER" | "REFUND_TO_BUYER";
    resolutionReason: string;
    internalNotes?: string;
  },
) {
  return adminApiFetch(`/admin/disputes/${encodeURIComponent(id)}/resolve`, {
    method: "PATCH",
    token,
    body: JSON.stringify(body),
  });
}
