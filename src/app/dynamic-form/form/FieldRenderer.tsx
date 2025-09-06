// /form/FieldRenderer.tsx
"use client";

import React, { useState, useEffect } from "react";
import { FieldConfig } from "../builder/FieldConfig";
import { runValidators } from "./Validation";

// ─── Mask Formatting ───
function applyMask(value: string, maskType?: string, customPattern?: string): string {
  if (!maskType) return value;
  const digits = value.replace(/\D/g, "");

  switch (maskType) {
    case "creditCard":
      return digits.slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
    case "ssn":
      return digits
        .slice(0, 9)
        .replace(/(\d{3})(\d{2})(\d{1,4})?/, (_, a, b, c) =>
          c ? `${a}-${b}-${c}` : b ? `${a}-${b}` : a
        );
    case "zip":
      return digits.slice(0, 5);
    case "usPostal":
      return digits.slice(0, 9).replace(/(\d{5})(\d{1,4})?/, (_, a, b) =>
        b ? `${a}-${b}` : a
      );
    case "tel":
      return digits
        .slice(0, 10)
        .replace(/(\d{3})(\d{3})(\d{1,4})?/, (_, a, b, c) =>
          c ? `(${a}) ${b}-${c}` : b ? `(${a}) ${b}` : a
        );
    case "currency": {
      const cleaned = value.replace(/[^\d.]/g, "");
      const num = parseFloat(cleaned || "0");
      if (isNaN(num)) return "";
      return `$${num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    case "decimal":
      return value.replace(/[^0-9.]/g, "");
    case "time": {
      const clean = value.replace(/[^0-9]/g, "").slice(0, 4);
      if (clean.length <= 2) return clean;
      return `${clean.slice(0, 2)}:${clean.slice(2)}`;
    }
    case "alphanumeric":
      return value.replace(/[^A-Za-z0-9]/g, "");
    case "slug":
      return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    case "custom":
      if (!customPattern) return value;
      try {
        const regex = new RegExp(customPattern);
        return regex.test(value) ? value : value;
      } catch {
        return value;
      }
    default:
      return value;
  }
}

// ─── Normalize Date ───
function normalizeDate(val: string | undefined, type: string): string {
  if (!val) return "";
  if (type === "date") return /^\d{4}-\d{2}-\d{2}$/.test(val) ? val : "";
  if (type === "datetime-local")
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val) ? val : "";
  return "";
}

// ─── Compute initial (default) value from options ───
function computeDefaultValue(field: FieldConfig): string {
  if (field.type === "select" || field.type === "radio-group") {
    const def = field.options?.find((o) => o.default)?.value;
    return def ?? "";
  }
  if (field.type === "checkbox") {
    const checkedVals = (field.options ?? [])
      .filter((o) => o.checked)
      .map((o) => o.value);
    return checkedVals.length ? checkedVals.join(",") : "";
  }
  return "";
}

export default function FieldRenderer({
  field,
  value,
  error,
  context,
  allFields,
  onChange,
}: {
  field: FieldConfig;
  value: string;
  error?: string | null;
  context?: Record<string, string>;
  allFields: FieldConfig[];
  onChange: (val: string, error?: string | null) => void;
}) {
  const [localError, setLocalError] = useState<string | null>(error || null);

  useEffect(() => {
    setLocalError(error || null);
  }, [error]);

  // ✅ Seed defaults once on mount
  useEffect(() => {
    if (
      !value &&
      (field.type === "select" ||
        field.type === "radio-group" ||
        field.type === "checkbox")
    ) {
      const defVal = computeDefaultValue(field);
      if (defVal) {
        const validationError = runValidators(defVal, field, context, allFields);
        setLocalError(validationError);
        onChange(defVal, validationError);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.id]);

  const baseInputClass =
    "block w-full border rounded px-3 py-2 leading-normal " +
    (localError ? "border-red-500" : "border-gray-300");

  const handleChange = (raw: string) => {
    let val = raw;

    if (field.alphaOnly) val = val.replace(/[^A-Za-z]/g, "");
    if (field.noWhitespace) val = val.replace(/\s+/g, "");

    if (field.type === "textarea" && field.maxlength !== undefined) {
      val = val.slice(0, field.maxlength);
    }

    if (!["date", "datetime-local", "number", "textarea"].includes(field.type)) {
      val = applyMask(val, field.maskType, field.pattern);
    }

    const validationError = runValidators(val, field, context, allFields);
    setLocalError(validationError);
    onChange(val, validationError);
  };

  // ─── Structural: Header ───
  if (field.type === "header") {
    const HeadingTag: React.ElementType = field.level || "h2";

    const sizeClass =
      field.level === "h1"
        ? "text-4xl"
        : field.level === "h2"
        ? "text-2xl"
        : field.level === "h3"
        ? "text-xl"
        : field.level === "h4"
        ? "text-lg"
        : "text-base"; // h5

    const widthClass = field.layout === "half" ? "w-1/2" : "w-full";
    const scaleClass = field.layout === "half" ? "text-sm sm:text-base" : "";

    return (
      <HeadingTag
        className={`${sizeClass} ${scaleClass} font-semibold text-gray-800 ${widthClass} my-4`}
      >
        {field.label || "Header"}
      </HeadingTag>
    );
  }

  // ─── Structural: Spacer ───
  if (field.type === "spacer") {
    const sizeClass =
      field.spacerSize === "sm"
        ? "h-2 my-1"
        : field.spacerSize === "lg"
        ? "h-12 my-4"
        : field.spacerSize === "xl"
        ? "h-20 my-6"
        : "h-6 my-2"; // default md

    const widthClass = field.layout === "half" ? "w-1/2" : "w-full";

    return <div className={`${widthClass} ${sizeClass}`} />;
  }

  // ─── Inputs ───
  return (
    <div className="flex flex-col items-start">
      {field.label && (
        <label className="block font-medium text-sm mb-2">{field.label}</label>
      )}

      {field.type === "textarea" ? (
        <textarea
          name={field.name}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className={`${baseInputClass} resize-y`}
          rows={field.rows}
          cols={field.cols}
          placeholder={field.placeholder}
          maxLength={field.maxlength}
        />
      ) : field.type === "select" && field.options ? (
        <select
          name={field.name}
          value={field.multiple ? value.split(",").filter(Boolean) : value}
          onChange={(e) => {
            if (field.multiple) {
              const selected = Array.from(e.target.selectedOptions).map(
                (opt) => opt.value
              );
              handleChange(selected.join(","));
            } else {
              handleChange(e.target.value);
            }
          }}
          className={`${baseInputClass} ${
            field.multiple ? "min-h-[6rem]" : ""
          }`}
          multiple={field.multiple}
          size={field.multiple ? Math.min(field.options.length, 4) : undefined}
        >
          {!field.multiple && <option value="">-- Select --</option>}
          {field.options.map((opt, i) => (
            <option key={i} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === "checkbox" && field.options ? (
        <div
          className={
            field.orientation === "horizontal"
              ? "flex gap-4"
              : "flex flex-col gap-2"
          }
        >
          {field.options.map((opt, i) => {
            const selected = value ? value.split(",") : [];
            const isChecked = selected.includes(opt.value);

            return (
              <label key={i} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={opt.value}
                  checked={isChecked}
                  onChange={(e) => {
                    let updated = [...selected];
                    if (e.target.checked) {
                      if (!updated.includes(opt.value)) updated.push(opt.value);
                    } else {
                      updated = updated.filter((v) => v !== opt.value);
                    }
                    handleChange(updated.join(","));
                  }}
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      ) : field.type === "radio-group" && field.options ? (
        <div
          className={
            field.orientation === "horizontal"
              ? "flex gap-4"
              : "flex flex-col gap-2"
          }
        >
          {field.options.map((opt, i) => (
            <label key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name={field.name}
                value={opt.value}
                checked={value === opt.value}
                onChange={(e) => handleChange(e.target.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      ) : (
        <input
          type={field.type}
          name={field.name}
          value={
            ["date", "datetime-local"].includes(field.type)
              ? normalizeDate(value, field.type)
              : value
          }
          onChange={(e) => handleChange(e.target.value)}
          className={baseInputClass}
          placeholder={field.placeholder}
          min={
            field.type === "number"
              ? field.minValue
              : field.type.startsWith("date")
              ? (field.minDate as string)
              : undefined
          }
          max={
            field.type === "number"
              ? field.maxValue
              : field.type.startsWith("date")
              ? (field.maxDate as string)
              : undefined
          }
          step={field.step}
          minLength={field.minlength}
          maxLength={field.maxlength}
          pattern={field.pattern}
          multiple={field.multiple}
          accept={field.accept}
        />
      )}

      {localError && (
        <span className="text-sm text-red-600 mt-1">{localError}</span>
      )}
    </div>
  );
}
