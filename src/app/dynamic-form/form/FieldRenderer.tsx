// /form/FieldRenderer.tsx
"use client";

import React, { useState, useEffect } from "react";
import { FieldConfig } from "../builder/FieldConfig";
import { runValidators } from "./Validation";
import { computeDefaultValue } from "./utils";

// ─── Helpers ───
function formatCurrency(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const num = parseFloat(cleaned || "0");
  if (isNaN(num)) return "";
  return `$${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function sanitizeInput(val: string, field: FieldConfig): string {
  let out = val;
  if (field.alphaOnly) out = out.replace(/[^A-Za-z \n]/g, "");
  if (field.maskType === "alphanumeric") out = out.replace(/[^A-Za-z0-9 \n]/g, "");
  if (field.noWhitespace) out = out.replace(/\s+/g, "");
  if (field.type === "textarea" && field.maxlength !== undefined) {
    out = out.slice(0, field.maxlength);
  }
  return out;
}

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
    case "decimal":
      return value.replace(/[^0-9.]/g, "");
    case "time": {
      const clean = digits.slice(0, 4);
      if (clean.length <= 2) return clean;
      return `${clean.slice(0, 2)}:${clean.slice(2)}`;
    }
    case "slug":
      return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
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

function normalizeDate(val: string | undefined, type: string): string {
  if (!val) return "";
  if (type === "date") return /^\d{4}-\d{2}-\d{2}$/.test(val) ? val : "";
  if (type === "datetime-local")
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val) ? val : "";
  return "";
}

// ─── Component ───
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
  const [displayValue, setDisplayValue] = useState(value || "");

  const inputId = `${field.name}-${field.id}`;
  const errorId = `${inputId}-error`;

  useEffect(() => {
    setLocalError(error || null);
  }, [error]);

  useEffect(() => {
    if (field.type === "currency") {
      setDisplayValue(value ? formatCurrency(value) : "");
    }
  }, [value, field.type]);

  useEffect(() => {
    if (!value && ["select", "radio-group", "checkbox", "file"].includes(field.type)) {
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
    let val = sanitizeInput(raw, field);
    if (field.type === "currency") {
      const cleaned = raw.replace(/[^0-9.]/g, "");
      const num = parseFloat(cleaned || "0");
      val = isNaN(num) ? "" : String(num);
      setDisplayValue(cleaned ? formatCurrency(cleaned) : "");
    } else if (
      !["date", "datetime-local", "number", "textarea", "file", "currency", "select"].includes(
        field.type
      )
    ) {
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
        ? "text-3xl"
        : field.level === "h3"
        ? "text-2xl"
        : field.level === "h4"
        ? "text-xl"
        : "text-lg";
    return (
      <HeadingTag className={`${sizeClass} font-semibold text-gray-800 w-full my-4`}>
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
        : "h-6 my-2";
    const widthClass = field.layout === "half" ? "w-1/2" : "w-full";
    return <div className={`${widthClass} ${sizeClass}`} aria-hidden="true" />;
  }

  // ─── Inputs ───
  return (
    <div className="flex flex-col items-start w-full">
      {field.label && !["note"].includes(field.type) && (
        <label htmlFor={inputId} className="block font-medium text-sm mb-2">
          {field.label}
        </label>
      )}

      {field.type === "currency" ? (
        <input
          id={inputId}
          type="text"
          name={field.name}
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          className={baseInputClass}
          placeholder={field.placeholder || "$0.00"}
          aria-invalid={!!localError}
          aria-describedby={localError ? errorId : undefined}
        />
      ) : field.type === "textarea" ? (
        <textarea
          id={inputId}
          name={field.name}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className={`${baseInputClass} resize-y`}
          rows={field.rows}
          cols={field.cols}
          placeholder={field.placeholder}
          maxLength={field.maxlength}
          aria-invalid={!!localError}
          aria-describedby={localError ? errorId : undefined}
        />
      ) : field.type === "select" && field.options ? (
        <select
          id={inputId}
          name={field.name}
          value={field.multiple ? value.split(",").filter(Boolean) : value}
          onChange={(e) => {
            if (field.multiple) {
              const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
              handleChange(selected.join(","));
            } else {
              handleChange(e.target.value);
            }
          }}
          className={`${baseInputClass} ${field.multiple ? "min-h-[6rem]" : ""}`}
          multiple={field.multiple}
          size={field.multiple ? Math.min(field.options.length, 4) : undefined}
          aria-invalid={!!localError}
          aria-describedby={localError ? errorId : undefined}
        >
          {!field.multiple && !field.options.some((o) => o.default) && (
            <option value="">-- Select --</option>
          )}
          {field.options.map((opt, idx) => (
            <option key={idx} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === "radio-group" && field.options ? (
        <fieldset
          id={inputId}
          className="flex flex-col gap-2"
          aria-invalid={!!localError}
          aria-describedby={localError ? errorId : undefined}
        >
          <legend className="block font-medium text-sm mb-2">{field.label}</legend>
          {field.options.map((opt, idx) => (
            <label key={idx} className="inline-flex items-center gap-2">
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
        </fieldset>
      ) : field.type === "checkbox" && field.options ? (
        <fieldset
          id={inputId}
          className="flex flex-col gap-2"
          aria-invalid={!!localError}
          aria-describedby={localError ? errorId : undefined}
        >
          <legend className="block font-medium text-sm mb-2">{field.label}</legend>
          {field.options.map((opt, idx) => {
            const selected = value ? value.split(",") : [];
            return (
              <label key={idx} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name={field.name}
                  value={opt.value}
                  checked={selected.includes(opt.value)}
                  onChange={(e) => {
                    const newSelected = e.target.checked
                      ? [...selected, opt.value]
                      : selected.filter((v) => v !== opt.value);
                    handleChange(newSelected.join(","));
                  }}
                />
                {opt.label}
              </label>
            );
          })}
        </fieldset>
      ) : field.type === "file" ? (
        <div className="w-full">
          <label
            htmlFor={inputId}
            className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 border-gray-300"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
              <svg
                aria-hidden="true"
                className="w-10 h-10 mb-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.1a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag & drop
              </p>
              {field.accept && (
                <p className="text-xs text-gray-400">Accepted: {field.accept}</p>
              )}
            </div>
            <input
              id={inputId}
              name={field.name}
              type="file"
              multiple={field.multiple}
              accept={field.accept}
              className="hidden"
              aria-invalid={!!localError}
              aria-describedby={localError ? errorId : undefined}
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                const serialized = files.map((f) => ({
                  name: f.name,
                  sizeMB: +(f.size / 1024 / 1024).toFixed(2),
                }));
                const val = JSON.stringify(serialized);
                const validationError = runValidators(val, field, context, allFields);
                setLocalError(validationError);
                onChange(val, validationError);
              }}
            />
          </label>

          {value && (() => {
            let files: { name: string; sizeMB: number }[] = [];
            try {
              files = JSON.parse(value);
            } catch {
              if (value.trim()) {
                files = [{ name: value.trim(), sizeMB: 0 }];
              }
            }
            return files.length ? (
              <ul className="mt-3 space-y-1 w-full text-sm text-gray-700">
                {files.map((f, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded px-2 py-1"
                  >
                    <span className="truncate">{f.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{f.sizeMB} MB</span>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 text-xs"
                        onClick={() => {
                          const updated = files.filter((_, i) => i !== idx);
                          const newVal = JSON.stringify(updated);
                          const validationError = runValidators(newVal, field, context, allFields);
                          setLocalError(validationError);
                          onChange(newVal, validationError);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null;
          })()}
        </div>
      ) : (
        <input
          id={inputId}
          type={field.maskType === "decimal" ? "text" : field.type}
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
          aria-invalid={!!localError}
          aria-describedby={localError ? errorId : undefined}
        />
      )}

      {localError && (
        <span
          id={errorId}
          className="text-sm text-red-600 mt-1"
          role="alert"
        >
          {localError}
        </span>
      )}
    </div>
  );
}
