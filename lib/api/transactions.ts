import { adminApiFetch } from "@/lib/api/client";

export type AdminParty = {
  id: string;
  fullName: string | null;
  displayName: string | null;
  email: string | null;
  phone: string | null;
};

export type AdminTransactionRow = {
  id: string;
  productTitle: string;
  amount: string;
  currencyCode: string;
  status: string;
  platformFeeAmount: string | null;
  sellerNetAmount: string | null;
  platformFeeType: string | null;
  buyer: AdminParty | null;
  seller: AdminParty | null;
  createdAt: string;
  updatedAt: string;
  payment?: {
    paymentMethod?: string;
    transactionCurrency?: string;
    transactionAmount?: string;
    paidCurrency?: string;
    paidAmount?: string;
    exchangeRate?: string | null;
    stripeFeeAmount?: string | null;
    netReceivedAmount?: string | null;
  } | null;
};

export async function listAdminTransactions(
  token: string,
  params?: { query?: string; status?: string; limit?: number; offset?: number },
) {
  const qs = new URLSearchParams();
  if (params?.query) qs.set("query", params.query);
  if (params?.status) qs.set("status", params.status);
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.offset != null) qs.set("offset", String(params.offset));
  const suffix = qs.toString() ? `?${qs}` : "";
  return adminApiFetch<{ items: AdminTransactionRow[]; total: number }>(
    `/admin/transactions${suffix}`,
    { token },
  );
}

export async function getAdminTransaction(token: string, id: string) {
  return adminApiFetch<Record<string, unknown>>(`/admin/transactions/${encodeURIComponent(id)}`, {
    token,
  });
}
