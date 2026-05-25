import { adminApiFetch } from "@/lib/api/client";

/** Stored on the product type; used later to render product create/edit forms. */
export type ProductTypeFieldDefinition = {
  name: string;
  label: string | null;
  valueType: string;
  required: boolean;
};

export type ProductTypeRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  sortOrder: number;
  lawyerPricingEnabled: boolean;
  agentPricingEnabled: boolean;
  /** Present once product-service migration has run. */
  fieldDefinitions?: ProductTypeFieldDefinition[];
  createdAt: string;
  updatedAt: string;
};

export async function listProductTypes(token: string) {
  return adminApiFetch<{ productTypes: ProductTypeRow[] }>(
    "/admin/product-types",
    { token },
  );
}

export async function createProductType(
  token: string,
  body: {
    code: string;
    name: string;
    description?: string;
    sortOrder?: number;
    lawyerPricingEnabled?: boolean;
    agentPricingEnabled?: boolean;
    fieldDefinitions?: ProductTypeFieldDefinition[];
  },
) {
  return adminApiFetch<{ accepted: true; clientRequestId: string }>(
    "/admin/product-types",
    {
      method: "POST",
      token,
      body: JSON.stringify(body),
    },
  );
}

export type UpdateProductTypeBody = {
  name?: string;
  description?: string;
  active?: boolean;
  sortOrder?: number;
  lawyerPricingEnabled?: boolean;
  agentPricingEnabled?: boolean;
  fieldDefinitions?: ProductTypeFieldDefinition[];
};

export async function updateProductType(
  token: string,
  id: string,
  body: UpdateProductTypeBody,
) {
  const enc = encodeURIComponent(id);
  return adminApiFetch<{ productType: ProductTypeRow }>(
    `/admin/product-types/${enc}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(body),
    },
  );
}

export async function deleteProductType(token: string, id: string) {
  const enc = encodeURIComponent(id);
  return adminApiFetch<Record<string, never>>(
    `/admin/product-types/${enc}`,
    {
      method: "DELETE",
      token,
    },
  );
}
