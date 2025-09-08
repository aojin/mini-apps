"use client";

import React from "react";
import { FieldConfig } from "./FieldConfig";

export default function ValidationBuilder({
  field,
  setField,
}: {
  field: FieldConfig;
  setField: (f: FieldConfig) => void;
}) {
  return (
    <div className="bg-gray-50 p-6 rounded-xl space-y-6 border w-full">
      <h3 className="font-semibold text-lg">Validation Rules</h3>

      {/* ─── General ─── */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-600">General</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={field.required || false}
              onChange={(e) =>
                setField({ ...field, required: e.target.checked })
              }
            />
            Required
          </label>
        </div>
      </div>

      {/* ─── Text-like Validation ─── */}
      {["text", "email", "password", "url", "tel", "textarea"].includes(
        field.type
      ) && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-600">Text Validation</h4>

          {/* Length */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Min Length */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Min Length</label>
              <input
                type="number"
                min={0}
                className="border p-2 rounded"
                value={field.minlength ?? ""}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  const newMax =
                    field.maxlength !== undefined &&
                    val !== undefined &&
                    val > field.maxlength
                      ? val
                      : field.maxlength;
                  setField({ ...field, minlength: val, maxlength: newMax });
                }}
              />
            </div>
            {/* Max Length */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Max Length</label>
              <input
                type="number"
                min={0}
                className="border p-2 rounded"
                value={field.maxlength ?? ""}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  const newMin =
                    field.minlength !== undefined &&
                    val !== undefined &&
                    val < field.minlength
                      ? val
                      : field.minlength;
                  setField({ ...field, maxlength: val, minlength: newMin });
                }}
              />
            </div>
            {/* Exact Length */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Exact Length</label>
              <input
                type="number"
                min={0}
                className="border p-2 rounded"
                value={field.exactLength ?? ""}
                onChange={(e) =>
                  setField({
                    ...field,
                    exactLength: e.target.value
                      ? Math.max(0, Number(e.target.value))
                      : undefined,
                  })
                }
              />
            </div>
          </div>

          {/* String rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Must start with</label>
              <input
                type="text"
                className="border p-2 rounded"
                value={field.startsWith ?? ""}
                onChange={(e) =>
                  setField({ ...field, startsWith: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Must end with</label>
              <input
                type="text"
                className="border p-2 rounded"
                value={field.endsWith ?? ""}
                onChange={(e) =>
                  setField({ ...field, endsWith: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm text-gray-600 mb-1">Must contain</label>
              <input
                type="text"
                className="border p-2 rounded"
                value={field.contains ?? ""}
                onChange={(e) =>
                  setField({ ...field, contains: e.target.value })
                }
              />
            </div>
          </div>

          {/* Character restrictions */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-700">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.uppercaseOnly || false}
                onChange={(e) =>
                  setField({ ...field, uppercaseOnly: e.target.checked })
                }
              />
              Uppercase only
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.lowercaseOnly || false}
                onChange={(e) =>
                  setField({ ...field, lowercaseOnly: e.target.checked })
                }
              />
              Lowercase only
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.alphaOnly ?? false}
                onChange={(e) =>
                  setField({ ...field, alphaOnly: e.target.checked })
                }
              />
              Letters (A–Z) only
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.noWhitespace ?? false}
                onChange={(e) =>
                  setField({ ...field, noWhitespace: e.target.checked })
                }
              />
              No whitespace
            </label>
          </div>

          {/* Word Count (textarea only) */}
          {field.type === "textarea" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Min words</label>
                <input
                  type="number"
                  min={0}
                  className="border p-2 rounded"
                  value={field.minWords ?? ""}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined;
                    const newMax =
                      field.maxWords !== undefined &&
                      val !== undefined &&
                      val > field.maxWords
                        ? val
                        : field.maxWords;
                    setField({ ...field, minWords: val, maxWords: newMax });
                  }}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Max words</label>
                <input
                  type="number"
                  min={0}
                  className="border p-2 rounded"
                  value={field.maxWords ?? ""}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined;
                    const newMin =
                      field.minWords !== undefined &&
                      val !== undefined &&
                      val < field.minWords
                        ? val
                        : field.minWords;
                    setField({ ...field, maxWords: val, minWords: newMin });
                  }}
                />
              </div>
            </div>
          )}

          {/* Allowed / Disallowed */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Allowed Values (CSV)</label>
            <input
              type="text"
              className="border p-2 rounded"
              value={field.allowedValues?.join(",") ?? ""}
              onChange={(e) =>
                setField({
                  ...field,
                  allowedValues: e.target.value
                    ? e.target.value.split(",").map((s) => s.trim())
                    : undefined,
                })
              }
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">
              Disallowed Values (CSV)
            </label>
            <input
              type="text"
              className="border p-2 rounded"
              value={field.disallowedValues?.join(",") ?? ""}
              onChange={(e) =>
                setField({
                  ...field,
                  disallowedValues: e.target.value
                    ? e.target.value.split(",").map((s) => s.trim())
                    : undefined,
                })
              }
            />
          </div>

          {/* Regex + Match */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Custom regex</label>
            <input
              type="text"
              className="border p-2 rounded"
              value={field.pattern ?? ""}
              onChange={(e) => setField({ ...field, pattern: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Match Field (name)</label>
            <input
              type="text"
              className="border p-2 rounded"
              value={field.matchField ?? ""}
              onChange={(e) => setField({ ...field, matchField: e.target.value })}
            />
          </div>

          {/* Custom Error */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Custom Error Message</label>
            <input
              type="text"
              className="border p-2 rounded"
              value={field.customErrorMessage ?? ""}
              onChange={(e) =>
                setField({ ...field, customErrorMessage: e.target.value })
              }
            />
          </div>
        </div>
      )}

      {/* ─── Number & Currency Validation ─── */}
      {(field.type === "number" || field.type === "currency") && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-600">
            {field.type === "currency" ? "Currency Validation" : "Number Validation"}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Min Value */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Min Value</label>
              <input
                type="number"
                className="border p-2 rounded"
                value={field.minValue ?? ""}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  const newMax =
                    field.maxValue !== undefined &&
                    val !== undefined &&
                    val > field.maxValue
                      ? val
                      : field.maxValue;
                  setField({ ...field, minValue: val, maxValue: newMax });
                }}
              />
            </div>
            {/* Max Value */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Max Value</label>
              <input
                type="number"
                className="border p-2 rounded"
                value={field.maxValue ?? ""}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  const newMin =
                    field.minValue !== undefined &&
                    val !== undefined &&
                    val < field.minValue
                      ? val
                      : field.minValue;
                  setField({ ...field, maxValue: val, minValue: newMin });
                }}
              />
            </div>
            {/* Step */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Step</label>
              <input
                type="number"
                min={0.0001}
                step={0.0001}
                className="border p-2 rounded"
                value={field.step ?? ""}
                onChange={(e) =>
                  setField({
                    ...field,
                    step: e.target.value
                      ? Math.max(0.0001, Number(e.target.value))
                      : undefined,
                  })
                }
              />
            </div>
          </div>

          {/* Extra Rules */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-700 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.noNegative || false}
                onChange={(e) =>
                  setField({ ...field, noNegative: e.target.checked })
                }
              />
              No negatives (≥ 0)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.positiveOnly || false}
                onChange={(e) =>
                  setField({ ...field, positiveOnly: e.target.checked })
                }
              />
              Positive only (&gt; 0)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={field.integerOnly || false}
                onChange={(e) =>
                  setField({ ...field, integerOnly: e.target.checked })
                }
              />
              Integer only
            </label>
            <div className="flex flex-col w-32">
              <label className="text-sm text-gray-600 mb-1">Decimal places</label>
              <input
                type="number"
                min={0}
                className="border p-2 rounded"
                value={field.decimalPlaces ?? ""}
                onChange={(e) =>
                  setField({
                    ...field,
                    decimalPlaces: e.target.value
                      ? Math.max(0, Number(e.target.value))
                      : undefined,
                  })
                }
              />
            </div>
          </div>

          {/* Allowed / Disallowed Values */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Allowed Values (CSV)</label>
            <input
              type="text"
              className="border p-2 rounded"
              value={field.allowedValues?.join(",") ?? ""}
              onChange={(e) =>
                setField({
                  ...field,
                  allowedValues: e.target.value
                    ? e.target.value.split(",").map((s) => s.trim())
                    : undefined,
                })
              }
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">
              Disallowed Values (CSV)
            </label>
            <input
              type="text"
              className="border p-2 rounded"
              value={field.disallowedValues?.join(",") ?? ""}
              onChange={(e) =>
                setField({
                  ...field,
                  disallowedValues: e.target.value
                    ? e.target.value.split(",").map((s) => s.trim())
                    : undefined,
                })
              }
            />
          </div>
        </div>
      )}

      {/* ─── Date/DateTime Validation ─── */}
      {["date", "datetime-local"].includes(field.type) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-600">Date Validation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Min Date</label>
              <input
                type={field.type}
                className="border p-2 rounded"
                value={field.minDate ?? ""}
                max={field.maxDate || undefined}
                onChange={(e) => {
                  const newMin = e.target.value || undefined;
                  const newMax =
                    field.maxDate &&
                    newMin &&
                    new Date(newMin) > new Date(field.maxDate)
                      ? undefined
                      : field.maxDate;
                  setField({ ...field, minDate: newMin, maxDate: newMax });
                }}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Max Date</label>
              <input
                type={field.type}
                className="border p-2 rounded"
                value={field.maxDate ?? ""}
                min={field.minDate || undefined}
                onChange={(e) => {
                  const newMax = e.target.value || undefined;
                  const newMin =
                    field.minDate &&
                    newMax &&
                    new Date(newMax) < new Date(field.minDate)
                      ? undefined
                      : field.minDate;
                  setField({ ...field, minDate: newMin, maxDate: newMax });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── File Validation ─── */}
      {field.type === "file" && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-600">File Validation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm text-gray-600 mb-1">Accepted Types</label>
              <input
                type="text"
                className="border p-2 rounded"
                value={field.accept ?? ""}
                placeholder=".jpg,.png,.pdf"
                onChange={(e) =>
                  setField({ ...field, accept: e.target.value || undefined })
                }
              />
            </div>
            <label className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                checked={field.multiple || false}
                onChange={(e) =>
                  setField({ ...field, multiple: e.target.checked })
                }
              />
              Allow multiple files
            </label>
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm text-gray-600 mb-1">Max File Size (MB)</label>
              <input
                type="number"
                min={1}
                className="border p-2 rounded"
                value={field.maxFileSizeMB ?? ""}
                onChange={(e) =>
                  setField({
                    ...field,
                    maxFileSizeMB: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── Checkbox Validation ─── */}
      {field.type === "checkbox" && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-600">Options Validation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Min Selections</label>
              <input
                type="number"
                min={0}
                className="border p-2 rounded"
                value={field.minValue ?? ""}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  const newMax =
                    field.maxValue !== undefined &&
                    val !== undefined &&
                    val > field.maxValue
                      ? val
                      : field.maxValue;
                  setField({ ...field, minValue: val, maxValue: newMax });
                }}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Max Selections</label>
              <input
                type="number"
                min={0}
                className="border p-2 rounded"
                value={field.maxValue ?? ""}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  const newMin =
                    field.minValue !== undefined &&
                    val !== undefined &&
                    val < field.minValue
                      ? val
                      : field.minValue;
                  setField({ ...field, maxValue: val, minValue: newMin });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── Select Validation (multi) ─── */}
      {field.type === "select" && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-600">Select Settings</h4>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={field.multiple || false}
              onChange={(e) =>
                setField({ ...field, multiple: e.target.checked })
              }
            />
            Allow multiple selections
          </label>
          {field.multiple && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Min Selections</label>
                <input
                  type="number"
                  min={0}
                  className="border p-2 rounded"
                  value={field.minValue ?? ""}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined;
                    const newMax =
                      field.maxValue !== undefined &&
                      val !== undefined &&
                      val > field.maxValue
                        ? val
                        : field.maxValue;
                    setField({ ...field, minValue: val, maxValue: newMax });
                  }}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Max Selections</label>
                <input
                  type="number"
                  min={0}
                  className="border p-2 rounded"
                  value={field.maxValue ?? ""}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined;
                    const newMin =
                      field.minValue !== undefined &&
                      val !== undefined &&
                      val < field.minValue
                        ? val
                        : field.minValue;
                    setField({ ...field, maxValue: val, minValue: newMin });
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
