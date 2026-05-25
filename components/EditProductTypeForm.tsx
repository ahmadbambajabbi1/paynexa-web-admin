"use client";

import { useState } from "react";
import * as productTypesApi from "@/lib/api/product-types";
import type { ProductTypeFieldDefinition } from "@/lib/api/product-types";
import { errorMessage } from "@/lib/api/errors";
import { fieldInput, fieldLabel } from "@/lib/components/form-classes";
import { ProductTypeFieldDefinitionsEditor } from "@/components/ProductTypeFieldDefinitionsEditor";
import {
  coerceFieldDefinitions,
  validateFieldDefinitionsLocal,
} from "@/lib/product-type-field-definitions";

type Props = {
  token: string;
  row: productTypesApi.ProductTypeRow;
  onCancel: () => void;
  onSaved: () => void;
};

export function EditProductTypeForm({ token, row, onCancel, onSaved }: Props) {
  const [name, setName] = useState(row.name);
  const [description, setDescription] = useState(row.description ?? "");
  const [active, setActive] = useState(row.active);
  const [sortOrder, setSortOrder] = useState(String(row.sortOrder));
  const [lawyerPricingEnabled, setLawyerPricingEnabled] = useState(
    row.lawyerPricingEnabled,
  );
  const [agentPricingEnabled, setAgentPricingEnabled] = useState(
    row.agentPricingEnabled,
  );
  const [fieldDefinitions, setFieldDefinitions] = useState<
    ProductTypeFieldDefinition[]
  >(() => coerceFieldDefinitions(row.fieldDefinitions));
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const sortParsed = Number.parseInt(sortOrder, 10);
      if (!Number.isFinite(sortParsed) || sortParsed < 0) {
        setErr("Sort order must be a non-negative number.");
        return;
      }
      const fdErr = validateFieldDefinitionsLocal(fieldDefinitions);
      if (fdErr) {
        setErr(fdErr);
        return;
      }
      const fieldDefsPayload = fieldDefinitions.map((r) => ({
        name: r.name.trim(),
        label: r.label?.trim() ? r.label.trim() : null,
        valueType: r.valueType,
        required: r.required,
      }));
      await productTypesApi.updateProductType(token, row.id, {
        name: name.trim(),
        description: description.trim(),
        active,
        sortOrder: sortParsed,
        lawyerPricingEnabled,
        agentPricingEnabled,
        fieldDefinitions: fieldDefsPayload,
      });
      onSaved();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-5">
      <div>
        <p className={fieldLabel}>Code (read-only)</p>
        <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
          {row.code}
        </p>
      </div>
      <div>
        <label htmlFor="ept-name" className={fieldLabel}>
          Display name
        </label>
        <input
          id="ept-name"
          className={fieldInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
        />
      </div>
      <div>
        <label htmlFor="ept-desc" className={fieldLabel}>
          Description
        </label>
        <textarea
          id="ept-desc"
          className={`${fieldInput} min-h-[100px] resize-y`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={3}
        />
      </div>
      <div>
        <label htmlFor="ept-sort" className={fieldLabel}>
          Sort order
        </label>
        <input
          id="ept-sort"
          type="number"
          min={0}
          className={fieldInput}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        />
      </div>
      <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-800 dark:text-gray-200">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-gambian-blue focus:ring-gambian-blue"
        />
        <span className="font-medium">Active</span>
      </label>
      <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-800/50">
        <p className={`${fieldLabel} mb-0`}>Pricing options</p>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-800 dark:text-gray-200">
          <input
            type="checkbox"
            checked={lawyerPricingEnabled}
            onChange={(e) => setLawyerPricingEnabled(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-gambian-blue focus:ring-gambian-blue"
          />
          <span className="font-medium">Lawyer pricing enabled</span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-800 dark:text-gray-200">
          <input
            type="checkbox"
            checked={agentPricingEnabled}
            onChange={(e) => setAgentPricingEnabled(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-gambian-blue focus:ring-gambian-blue"
          />
          <span className="font-medium">Agent pricing enabled</span>
        </label>
      </div>
      <ProductTypeFieldDefinitionsEditor
        value={fieldDefinitions}
        onChange={setFieldDefinitions}
      />
      {err ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          {err}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-gambian-blue px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-950 disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
