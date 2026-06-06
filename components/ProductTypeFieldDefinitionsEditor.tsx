"use client";

import type { ProductTypeFieldDefinition } from "@/lib/api/product-types";
import {
  PRODUCT_TYPE_VALUE_TYPES,
} from "@/lib/product-type-field-definitions";
import { fieldInput, fieldLabel } from "@/lib/components/form-classes";

type Props = {
  value: ProductTypeFieldDefinition[];
  onChange: (next: ProductTypeFieldDefinition[]) => void;
};

export function ProductTypeFieldDefinitionsEditor({ value, onChange }: Props) {
  function updateAt(
    index: number,
    patch: Partial<ProductTypeFieldDefinition>,
  ) {
    const next = value.map((row, i) =>
      i === index ? { ...row, ...patch } : row,
    );
    onChange(next);
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([
      ...value,
      {
        name: "",
        label: null,
        valueType: "string",
        required: true,
      },
    ]);
  }

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-800/50">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={`${fieldLabel} mb-0`}>Custom attributes</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Define inputs users will fill when creating products of this type
            (e.g. land: lot_size; mobile: imei). Names: lowercase snake_case.
          </p>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
        >
          <i className="fas fa-plus mr-1.5 text-xs" aria-hidden />
          Add field
        </button>
      </div>

      {value.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No custom fields. Add fields to collect type-specific data when
          listing products.
        </p>
      ) : (
        <ul className="space-y-4">
          {value.map((row, index) => (
            <li
              key={index}
              className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-600 dark:bg-gray-900/80"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Field {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="text-sm text-red-600 hover:underline dark:text-red-400"
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label className={fieldLabel} htmlFor={`ptf-name-${index}`}>
                    Name (API key)
                  </label>
                  <input
                    id={`ptf-name-${index}`}
                    className={fieldInput}
                    value={row.name}
                    onChange={(e) =>
                      updateAt(index, { name: e.target.value.toLowerCase() })
                    }
                    placeholder="e.g. imei, lot_size"
                    autoComplete="off"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className={fieldLabel} htmlFor={`ptf-label-${index}`}>
                    Label{" "}
                    <span className="font-normal text-gray-500">(optional)</span>
                  </label>
                  <input
                    id={`ptf-label-${index}`}
                    className={fieldInput}
                    value={row.label ?? ""}
                    onChange={(e) =>
                      updateAt(index, {
                        label: e.target.value.trim() || null,
                      })
                    }
                    placeholder="Shown in forms"
                  />
                </div>
                <div>
                  <label className={fieldLabel} htmlFor={`ptf-type-${index}`}>
                    Value type
                  </label>
                  <select
                    id={`ptf-type-${index}`}
                    className={fieldInput}
                    value={row.valueType}
                    onChange={(e) =>
                      updateAt(index, { valueType: e.target.value })
                    }
                  >
                    {PRODUCT_TYPE_VALUE_TYPES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={row.required}
                      onChange={(e) =>
                        updateAt(index, { required: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primaryColorBlack focus:ring-primaryColorBlack"
                    />
                    Required (default on)
                  </label>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
