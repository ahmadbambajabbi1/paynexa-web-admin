import type { ProductTypeFieldDefinition } from "@/lib/api/product-types";

export const PRODUCT_TYPE_VALUE_TYPES = [
  { value: "string", label: "Text (short)" },
  { value: "text", label: "Text (long)" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Yes / no" },
  { value: "date", label: "Date" },
  { value: "email", label: "Email" },
  { value: "url", label: "URL" },
] as const;

const NAME_PATTERN = /^[a-z][a-z0-9_]{0,63}$/;

export function validateFieldDefinitionsLocal(
  rows: ProductTypeFieldDefinition[],
): string | null {
  const seen = new Set<string>();
  for (const row of rows) {
    const name = row.name.trim();
    if (!name) {
      return "Each field needs a name (e.g. lot_size, imei).";
    }
    if (!NAME_PATTERN.test(name)) {
      return `Invalid field name “${name}”: use lowercase snake_case, starting with a letter.`;
    }
    if (seen.has(name)) {
      return `Duplicate field name “${name}”.`;
    }
    seen.add(name);
  }
  return null;
}

export function coerceFieldDefinitions(
  raw: unknown,
): ProductTypeFieldDefinition[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: ProductTypeFieldDefinition[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const o = item as Record<string, unknown>;
    if (typeof o.name !== "string" || typeof o.valueType !== "string") {
      continue;
    }
    out.push({
      name: o.name,
      label:
        o.label != null && typeof o.label === "string" ? o.label : null,
      valueType: o.valueType,
      required: o.required !== false,
    });
  }
  return out;
}
