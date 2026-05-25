"use client";

import { useState } from "react";
import * as productTypesApi from "@/lib/api/product-types";
import type { ProductTypeFieldDefinition } from "@/lib/api/product-types";
import { errorMessage } from "@/lib/api/errors";
import { fieldInput, fieldLabel } from "@/lib/components/form-classes";
import { ProductTypeFieldDefinitionsEditor } from "@/components/ProductTypeFieldDefinitionsEditor";
import { validateFieldDefinitionsLocal } from "@/lib/product-type-field-definitions";

type Props = {
  token: string;
  onCancel: () => void;
  onCreated: () => void;
};

export function CreateProductTypeForm({
  token,
  onCancel,
  onCreated,
}: Props) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [lawyerPricingEnabled, setLawyerPricingEnabled] = useState(false);
  const [agentPricingEnabled, setAgentPricingEnabled] = useState(false);
  const [fieldDefinitions, setFieldDefinitions] = useState<
    ProductTypeFieldDefinition[]
  >([]);
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const sort =
        sortOrder.trim() === "" ? undefined : Number.parseInt(sortOrder, 10);
      if (sortOrder.trim() !== "" && !Number.isFinite(sort)) {
        setErr("Sort order must be a number.");
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
      await productTypesApi.createProductType(token, {
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
        sortOrder: sort,
        lawyerPricingEnabled,
        agentPricingEnabled,
        fieldDefinitions: fieldDefsPayload,
      });
      setCode("");
      setName("");
      setDescription("");
      setSortOrder("");
      setLawyerPricingEnabled(false);
      setAgentPricingEnabled(false);
      setFieldDefinitions([]);
      onCreated();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-5">
      <div>
        <label htmlFor="pt-code" className={fieldLabel}>
          Code <span className="font-normal text-gray-500">(immutable)</span>
        </label>
        <input
          id="pt-code"
          className={fieldInput}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. land_sale"
          pattern="[a-z][a-z0-9_]{1,62}"
          title="Lowercase letters, digits, underscores; 2–63 characters; start with a letter"
          required
          autoComplete="off"
        />
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          Used in APIs and integrations. Lowercase snake_case.
        </p>
      </div>
      <div>
        <label htmlFor="pt-name" className={fieldLabel}>
          Display name
        </label>
        <input
          id="pt-name"
          className={fieldInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Land sale"
          required
          maxLength={120}
        />
      </div>
      <div>
        <label htmlFor="pt-desc" className={fieldLabel}>
          Description{" "}
          <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <textarea
          id="pt-desc"
          className={`${fieldInput} min-h-[100px] resize-y`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={3}
        />
      </div>
      <div>
        <label htmlFor="pt-sort" className={fieldLabel}>
          Sort order{" "}
          <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <input
          id="pt-sort"
          type="number"
          min={0}
          className={fieldInput}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          placeholder="0"
        />
      </div>
      <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-800/50">
        <p className={`${fieldLabel} mb-0`}>Pricing options</p>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-800 dark:text-gray-200">
          <input
            type="checkbox"
            checked={lawyerPricingEnabled}
            onChange={(e) => setLawyerPricingEnabled(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-gambian-blue focus:ring-gambian-blue"
          />
          <span>
            <span className="font-medium">Lawyer pricing enabled</span>
            <span className="mt-0.5 block text-xs font-normal text-gray-500 dark:text-gray-400">
              Allow lawyer-specific pricing rules for this product type.
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-800 dark:text-gray-200">
          <input
            type="checkbox"
            checked={agentPricingEnabled}
            onChange={(e) => setAgentPricingEnabled(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-gambian-blue focus:ring-gambian-blue"
          />
          <span>
            <span className="font-medium">Agent pricing enabled</span>
            <span className="mt-0.5 block text-xs font-normal text-gray-500 dark:text-gray-400">
              Allow agent-specific pricing rules for this product type.
            </span>
          </span>
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
          {submitting ? "Queueing…" : "Create product type"}
        </button>
      </div>
    </form>
  );
}
