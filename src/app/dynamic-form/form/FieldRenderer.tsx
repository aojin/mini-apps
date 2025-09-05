"use client";

import React from "react";
import { FieldConfig } from "../builder/FieldConfig";

// ─── Live Mask Formatting ───
function applyMask(value: string, maskType?: string): string {
  if (!maskType) return value;
  const digits = value.replace(/\D/g, "");

  switch (maskType) {
    case "alpha":
      return value.replace(/[^A-Za-z]/g, "");
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
      return digits
        .slice(0, 9)
        .replace(/(\d{5})(\d{1,4})?/, (_, a, b) => (b ? `${a}-${b}` : a));
    case "tel":
      return digits
        .slice(0, 10)
        .replace(/(\d{3})(\d{3})(\d{1,4})?/, (_, a, b, c) =>
          c ? `(${a}) ${b}-${c}` : b ? `(${a}) ${b}` : a
        );
    default:
      return value;
  }
}

// ─── Normalize Date Values ───
function normalizeDate(val: string | undefined, type: string): string {
  if (!val) return "";
  if (type === "date") {
    return /^\d{4}-\d{2}-\d{2}$/.test(val) ? val : "";
  }
  if (type === "datetime-local") {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val) ? val : "";
  }
  return "";
}

export default function FieldRenderer({
  field,
  value,
  error,
  onChange,
}: {
  field: FieldConfig;
  value: string;
  error?: string | null;
  onChange: (val: string) => void;
}) {
  const isTextLike = !["checkbox", "radio-group", "select"].includes(field.type);

  // Shared input class for consistent alignment
  const baseInputClass =
    "block w-full border p-2 rounded align-top " +
    (error ? "border-red-500" : "border-gray-300");

  const handleChange = (raw: string) => {
    if (
      field.type === "date" ||
      field.type === "datetime-local" ||
      field.type === "number"
    ) {
      onChange(raw);
      return;
    }
    const masked = applyMask(raw, field.maskType);
    onChange(masked);
  };

  return (
    <div className="flex flex-col items-start justify-start">
      {/* ✅ Fixed label height for row consistency */}
      {field.label && (
        <label className="block font-medium text-sm h-6 flex items-center leading-none mb-2">
          {field.label}
        </label>
      )}

      {/* ✅ Textarea */}
      {field.type === "textarea" ? (
        <textarea
          name={field.name}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className={baseInputClass}
          rows={field.rows}
          cols={field.cols}
          placeholder={field.placeholder}
        />
      ) : /* ✅ Select */ field.type === "select" && field.options ? (
        <select
          name={field.name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
        >
          <option value="">-- Select an option --</option>
          {field.options.map((opt, i) => (
            <option key={i} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : /* ✅ Checkbox group */ field.type === "checkbox" && field.options ? (
        <div
          className={
            field.orientation === "horizontal"
              ? "flex flex-wrap gap-x-4 gap-y-2 min-h-[2.5rem]" // horizontal: wrap, match input height baseline
              : "flex flex-col gap-2" // vertical: expand column like textarea
          }
        >
          {field.options.map((opt, i) => {
            const selected = value ? value.split(",") : [];
            const isChecked = selected.includes(opt.value);
            return (
              <label key={i} className="flex items-center gap-2 leading-none">
                <input
                  type="checkbox"
                  name={field.name}
                  value={opt.value}
                  checked={isChecked}
                  onChange={(e) => {
                    let updated = [...selected];
                    if (e.target.checked) {
                      updated.push(opt.value);
                    } else {
                      updated = updated.filter((v) => v !== opt.value);
                    }
                    onChange(updated.join(","));
                  }}
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      ) : /* ✅ Radio group */ field.type === "radio-group" && field.options ? (
        <div
          className={
            field.orientation === "horizontal"
              ? "flex flex-wrap gap-x-4 gap-y-2 min-h-[2.5rem]"
              : "flex flex-col gap-2"
          }
        >
          {field.options.map((opt, i) => (
            <label key={i} className="flex items-center gap-2 leading-none">
              <input
                type="radio"
                name={field.name}
                value={opt.value}
                checked={value === opt.value}
                onChange={(e) => onChange(e.target.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      ) : (
        /* ✅ Generic input */
        <input
          type={field.type}
          name={field.name}
          value={
            field.type === "date" || field.type === "datetime-local"
              ? normalizeDate(value, field.type)
              : value
          }
          onChange={(e) => handleChange(e.target.value)}
          className={baseInputClass}
          placeholder={field.placeholder}
          min={
            field.type === "date" || field.type === "datetime-local"
              ? normalizeDate(field.min as string, field.type)
              : field.min
          }
          max={
            field.type === "date" || field.type === "datetime-local"
              ? normalizeDate(field.max as string, field.type)
              : field.max
          }
          step={field.step}
          minLength={field.minlength}
          maxLength={field.maxlength}
          pattern={field.pattern}
          multiple={field.multiple}
          accept={field.accept}
        />
      )}

      {error && <span className="text-sm text-red-600 mt-1">{error}</span>}
    </div>
  );
}
