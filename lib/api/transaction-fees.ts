import { adminApiFetch } from "@/lib/api/client";

export type TransactionFeeConfig = {
  percentageEnabled: boolean;
  percentageFee: string;
  fixedEnabled: boolean;
  fixedFee: string;
  updatedAt: string;
};

export async function getTransactionFees(token: string) {
  return adminApiFetch<TransactionFeeConfig>("/admin/transaction-fees", { token });
}

export async function patchTransactionFees(
  token: string,
  body: Partial<{
    percentageEnabled: boolean;
    percentageFee: number;
    fixedEnabled: boolean;
    fixedFee: number;
  }>,
) {
  return adminApiFetch<TransactionFeeConfig>("/admin/transaction-fees", {
    method: "PATCH",
    token,
    body: JSON.stringify(body),
  });
}
