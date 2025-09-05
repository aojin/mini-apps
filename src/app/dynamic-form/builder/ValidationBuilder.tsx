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
              onChange={(e) => setField({ ...field, required: e.target.checked })}
            />
            Required
          </label>
        </div>
      </div>

      {/* ─── Text-like Validation ─── */}
      {["text", "email", "password", "url", "tel", "textarea"].includes(field.type) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-600">Text Validation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Min Length"
              className="border p-2 rounded"
              value={field.minlength ?? ""}
              onChange={(e) =>
                setField({
                  ...field,
                  minlength: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
            <input
              type="number"
              placeholder="Max Length"
              className="border p-2 rounded"
              value={field.maxlength ?? ""}
              onChange={(e) =>
                setField({
                  ...field,
                  maxlength: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
            <input
              type="text"
              placeholder="Regex pattern"
              className="border p-2 rounded md:col-span-2"
              value={field.pattern ?? ""}
              onChange={(e) => setField({ ...field, pattern: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* ─── Number Validation ─── */}
      {field.type === "number" && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-600">Number Validation</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="number"
              placeholder="Min Value"
              className="border p-2 rounded"
              value={field.min ?? ""}
              onChange={(e) =>
                setField({
                  ...field,
                  min: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
            <input
              type="number"
              placeholder="Max Value"
              className="border p-2 rounded"
              value={field.max ?? ""}
              onChange={(e) =>
                setField({
                  ...field,
                  max: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
            <input
              type="number"
              placeholder="Step"
              className="border p-2 rounded"
              value={field.step ?? ""}
              onChange={(e) =>
                setField({
                  ...field,
                  step: e.target.value ? Number(e.target.value) : undefined,
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
            {/* Min Date */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Min Date</label>
              <input
                type={field.type}
                className="border p-2 rounded"
                value={field.min ?? ""}
                max={field.max || undefined}
                onChange={(e) => {
                  const newMin = e.target.value || undefined;
                  const newMax =
                    field.max && newMin && new Date(newMin) > new Date(field.max)
                      ? undefined
                      : field.max;

                  setField({
                    ...field,
                    min: newMin,
                    max: newMax,
                  });
                }}
              />
            </div>

            {/* Max Date */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Max Date</label>
              <input
                type={field.type}
                className="border p-2 rounded"
                value={field.max ?? ""}
                min={field.min || undefined}
                onChange={(e) => {
                  const newMax = e.target.value || undefined;
                  const newMin =
                    field.min && newMax && new Date(newMax) < new Date(field.min)
                      ? undefined
                      : field.min;

                  setField({
                    ...field,
                    min: newMin,
                    max: newMax,
                  });
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
            <input
              type="text"
              placeholder="Accepted types (e.g. .jpg,.png,.pdf)"
              className="border p-2 rounded md:col-span-2"
              value={field.accept ?? ""}
              onChange={(e) =>
                setField({
                  ...field,
                  accept: e.target.value || undefined,
                })
              }
            />
            <label className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                checked={field.multiple || false}
                onChange={(e) => setField({ ...field, multiple: e.target.checked })}
              />
              Allow multiple files
            </label>
          </div>
        </div>
      )}

      {/* ─── Checkbox Validation ─── */}
      {field.type === "checkbox" && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-600">Options Validation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Min Selections"
              className="border p-2 rounded"
              value={field.min ?? ""}
              onChange={(e) =>
                setField({
                  ...field,
                  min: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
            <input
              type="number"
              placeholder="Max Selections"
              className="border p-2 rounded"
              value={field.max ?? ""}
              onChange={(e) =>
                setField({
                  ...field,
                  max: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
