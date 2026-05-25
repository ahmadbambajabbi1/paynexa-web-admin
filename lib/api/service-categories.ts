import { adminApiFetch } from "@/lib/api/client";

export type ServiceCategoryRow = {
  id: string;
  code: string;
  name: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export async function listServiceCategories(token: string) {
  return await adminApiFetch<{ categories: ServiceCategoryRow[] }>(
    "/admin/service-categories",
    { token },
  );
}

export async function createServiceCategory(
  token: string,
  dto: { code: string; name: string; active?: boolean; sortOrder?: number },
) {
  return await adminApiFetch<{ category: ServiceCategoryRow }>(
    "/admin/service-categories",
    { method: "POST", token, body: JSON.stringify(dto) },
  );
}

