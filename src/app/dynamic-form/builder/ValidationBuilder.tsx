// app/dynamic-form/form/ValidationBuilder.tsx
"use client";

import React from "react";
import { BuilderFieldConfig } from "./FieldBuilder";
import Collapsible from "../components/Collapsible";

export default function ValidationBuilder({
  field,
  setField,
}: {
  field: BuilderFieldConfig;
  setField: (f: BuilderFieldConfig) => void;
}) {
  return (
    <Collapsible title="Validation Rules" defaultOpen={false}>
      <div className="space-y-6 w-full">
        {/* ─── General ─── */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">General</h4>
          <label className="flex items-center gap-2 text-sm">
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

        {/* ─── Text-like Validation ─── */}
        {["text", "email", "password", "url", "tel", "textarea"].includes(
          field.type
        ) && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Text Validation</h4>

            {/* Length */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <NumberInput
                label="Min Length"
                value={field.minlength}
                onChange={(val) =>
                  setField({
                    ...field,
                    minlength: val,
                    maxlength:
                      field.maxlength !== undefined &&
                      val !== undefined &&
                      val > field.maxlength
                        ? val
                        : field.maxlength,
                  })
                }
              />
              <NumberInput
                label="Max Length"
                value={field.maxlength}
                onChange={(val) =>
                  setField({
                    ...field,
                    maxlength: val,
                    minlength:
                      field.minlength !== undefined &&
                      val !== undefined &&
                      val < field.minlength
                        ? val
                        : field.minlength,
                  })
                }
              />
              <NumberInput
                label="Exact Length"
                value={field.exactLength}
                onChange={(val) =>
                  setField({
                    ...field,
                    exactLength: val !== undefined ? Math.max(0, val) : undefined,
                  })
                }
              />
            </div>

            {/* String rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextInput
                label="Must start with"
                value={field.startsWith}
                onChange={(v) => setField({ ...field, startsWith: v })}
              />
              <TextInput
                label="Must end with"
                value={field.endsWith}
                onChange={(v) => setField({ ...field, endsWith: v })}
              />
              <TextInput
                label="Must contain"
                value={field.contains}
                onChange={(v) => setField({ ...field, contains: v })}
                className="md:col-span-2"
              />
            </div>

            {/* Character restrictions */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-700">
              <Checkbox
                label="Uppercase only"
                checked={field.uppercaseOnly}
                onChange={(v) => setField({ ...field, uppercaseOnly: v })}
              />
              <Checkbox
                label="Lowercase only"
                checked={field.lowercaseOnly}
                onChange={(v) => setField({ ...field, lowercaseOnly: v })}
              />
              <Checkbox
                label="Letters (A–Z) only"
                checked={field.alphaOnly}
                onChange={(v) => setField({ ...field, alphaOnly: v })}
              />
              <Checkbox
                label="No whitespace"
                checked={field.noWhitespace}
                onChange={(v) => setField({ ...field, noWhitespace: v })}
              />
            </div>

            {/* Word Count (textarea only) */}
            {field.type === "textarea" && (
              <div className="grid grid-cols-2 gap-3">
                <NumberInput
                  label="Min words"
                  value={field.minWords}
                  onChange={(val) =>
                    setField({
                      ...field,
                      minWords: val,
                      maxWords:
                        field.maxWords !== undefined &&
                        val !== undefined &&
                        val > field.maxWords
                          ? val
                          : field.maxWords,
                    })
                  }
                />
                <NumberInput
                  label="Max words"
                  value={field.maxWords}
                  onChange={(val) =>
                    setField({
                      ...field,
                      maxWords: val,
                      minWords:
                        field.minWords !== undefined &&
                        val !== undefined &&
                        val < field.minWords
                          ? val
                          : field.minWords,
                    })
                  }
                />
              </div>
            )}

            <TextInput
              label="Allowed Values (CSV)"
              value={field.allowedValues?.join(",")}
              onChange={(v) =>
                setField({
                  ...field,
                  allowedValues: v
                    ? v.split(",").map((s) => s.trim())
                    : undefined,
                })
              }
            />
            <TextInput
              label="Disallowed Values (CSV)"
              value={field.disallowedValues?.join(",")}
              onChange={(v) =>
                setField({
                  ...field,
                  disallowedValues: v
                    ? v.split(",").map((s) => s.trim())
                    : undefined,
                })
              }
            />
            <TextInput
              label="Custom regex"
              value={field.pattern}
              onChange={(v) => setField({ ...field, pattern: v })}
            />
            <TextInput
              label="Match Field (name)"
              value={field.matchField}
              onChange={(v) => setField({ ...field, matchField: v })}
            />
            <TextInput
              label="Custom Error Message"
              value={field.customErrorMessage}
              onChange={(v) => setField({ ...field, customErrorMessage: v })}
            />
          </div>
        )}

        {/* ─── Number & Currency Validation ─── */}
        {(field.type === "number" || field.type === "currency") && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">
              {field.type === "currency"
                ? "Currency Validation"
                : "Number Validation"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <NumberInput
                label="Min Value"
                value={field.minValue}
                onChange={(val) =>
                  setField({
                    ...field,
                    minValue: val,
                    maxValue:
                      field.maxValue !== undefined &&
                      val !== undefined &&
                      val > field.maxValue
                        ? val
                        : field.maxValue,
                  })
                }
              />
              <NumberInput
                label="Max Value"
                value={field.maxValue}
                onChange={(val) =>
                  setField({
                    ...field,
                    maxValue: val,
                    minValue:
                      field.minValue !== undefined &&
                      val !== undefined &&
                      val < field.minValue
                        ? val
                        : field.minValue,
                  })
                }
              />
              <NumberInput
                label="Step"
                value={field.step}
                min={0.0001}
                step={0.0001}
                onChange={(val) =>
                  setField({
                    ...field,
                    step: val !== undefined ? Math.max(0.0001, val) : undefined,
                  })
                }
              />
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-700 mt-2">
              <Checkbox
                label="No negatives (≥ 0)"
                checked={field.noNegative}
                onChange={(v) => setField({ ...field, noNegative: v })}
              />
              <Checkbox
                label="Positive only (> 0)"
                checked={field.positiveOnly}
                onChange={(v) => setField({ ...field, positiveOnly: v })}
              />
              <Checkbox
                label="Integer only"
                checked={field.integerOnly}
                onChange={(v) => setField({ ...field, integerOnly: v })}
              />
              <NumberInput
                label="Decimal places"
                value={field.decimalPlaces}
                onChange={(val) =>
                  setField({
                    ...field,
                    decimalPlaces:
                      val !== undefined ? Math.max(0, val) : undefined,
                  })
                }
              />
            </div>

            <TextInput
              label="Allowed Values (CSV)"
              value={field.allowedValues?.join(",")}
              onChange={(v) =>
                setField({
                  ...field,
                  allowedValues: v
                    ? v.split(",").map((s) => s.trim())
                    : undefined,
                })
              }
            />
            <TextInput
              label="Disallowed Values (CSV)"
              value={field.disallowedValues?.join(",")}
              onChange={(v) =>
                setField({
                  ...field,
                  disallowedValues: v
                    ? v.split(",").map((s) => s.trim())
                    : undefined,
                })
              }
            />
          </div>
        )}

        {/* ─── Date/DateTime Validation ─── */}
        {["date", "datetime-local"].includes(field.type) && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Date Validation</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextInput
                label="Min Date"
                type={field.type}
                value={field.minDate}
                onChange={(v) =>
                  setField({
                    ...field,
                    minDate: v || undefined,
                    maxDate:
                      field.maxDate &&
                      v &&
                      new Date(v) > new Date(field.maxDate)
                        ? undefined
                        : field.maxDate,
                  })
                }
              />
              <TextInput
                label="Max Date"
                type={field.type}
                value={field.maxDate}
                onChange={(v) =>
                  setField({
                    ...field,
                    maxDate: v || undefined,
                    minDate:
                      field.minDate &&
                      v &&
                      new Date(v) < new Date(field.minDate)
                        ? undefined
                        : field.minDate,
                  })
                }
              />
            </div>
          </div>
        )}

        {/* ─── File Validation ─── */}
        {field.type === "file" && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">File Validation</h4>
            <TextInput
              label="Accepted Types"
              placeholder=".jpg,.png,.pdf"
              value={field.accept}
              onChange={(v) => setField({ ...field, accept: v || undefined })}
            />
            <Checkbox
              label="Allow multiple files"
              checked={field.multiple}
              onChange={(v) => setField({ ...field, multiple: v })}
            />
            <NumberInput
              label="Max File Size (MB)"
              min={1}
              value={field.maxFileSizeMB}
              onChange={(val) =>
                setField({
                  ...field,
                  maxFileSizeMB: val !== undefined ? Number(val) : undefined,
                })
              }
            />
          </div>
        )}

        {/* ─── Checkbox Validation ─── */}
        {field.type === "checkbox" && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Options Validation</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <NumberInput
                label="Min Selections"
                value={field.minValue}
                onChange={(val) =>
                  setField({
                    ...field,
                    minValue: val,
                    maxValue:
                      field.maxValue !== undefined &&
                      val !== undefined &&
                      val > field.maxValue
                        ? val
                        : field.maxValue,
                  })
                }
              />
              <NumberInput
                label="Max Selections"
                value={field.maxValue}
                onChange={(val) =>
                  setField({
                    ...field,
                    maxValue: val,
                    minValue:
                      field.minValue !== undefined &&
                      val !== undefined &&
                      val < field.minValue
                        ? val
                        : field.minValue,
                  })
                }
              />
            </div>
          </div>
        )}

        {/* ─── Select Validation ─── */}
        {field.type === "select" && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Select Settings</h4>
            <Checkbox
              label="Allow multiple selections"
              checked={field.multiple}
              onChange={(v) => setField({ ...field, multiple: v })}
            />
            {field.multiple && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <NumberInput
                  label="Min Selections"
                  value={field.minValue}
                  onChange={(val) =>
                    setField({
                      ...field,
                      minValue: val,
                      maxValue:
                        field.maxValue !== undefined &&
                        val !== undefined &&
                        val > field.maxValue
                          ? val
                          : field.maxValue,
                    })
                  }
                />
                <NumberInput
                  label="Max Selections"
                  value={field.maxValue}
                  onChange={(val) =>
                    setField({
                      ...field,
                      maxValue: val,
                      minValue:
                        field.minValue !== undefined &&
                        val !== undefined &&
                        val < field.minValue
                          ? val
                          : field.minValue,
                    })
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Collapsible>
  );
}

/* ─── Helper components ─── */
function TextInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  className = "",
}: {
  label: string;
  value?: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="border p-2 rounded"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  step,
  className = "",
}: {
  label: string;
  value?: number | string; // allow string like "any"
  onChange: (val: number | undefined) => void;
  min?: number;
  step?: number;
  className?: string;
}) {
  const displayValue =
    typeof value === "number" || value === "" ? value : ""; // show blank if "any"

  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm text-gray-600 mb-1">{label}</label>
      <input
        type="number"
        min={min}
        step={step}
        className="border p-2 rounded"
        value={displayValue ?? ""}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : undefined)
        }
      />
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked?: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked || false}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
