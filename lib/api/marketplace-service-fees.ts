import { adminApiFetch } from "@/lib/api/client";

export type MarketplaceServiceFeesPolicy = {
  providerFeeEnabled: boolean;
  providerFeePercent: string;
  customerFeeEnabled: boolean;
  customerFeePercent: string;
  updatedAt?: string;
};

export async function getMarketplaceServiceFees(token: string) {
  return await adminApiFetch<MarketplaceServiceFeesPolicy>("/admin/marketplace-service-fees", {
    token,
  });
}

export async function patchMarketplaceServiceFees(
  token: string,
  body: {
    providerFeeEnabled: boolean;
    providerFeePercent: number;
    customerFeeEnabled: boolean;
    customerFeePercent: number;
  },
) {
  return await adminApiFetch<MarketplaceServiceFeesPolicy>("/admin/marketplace-service-fees", {
    method: "PATCH",
    token,
    body: JSON.stringify(body),
  });
}
