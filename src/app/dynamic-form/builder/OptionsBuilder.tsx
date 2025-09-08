"use client";

import React from "react";
import { FieldOption } from "./FieldConfig";
import { BuilderFieldConfig } from "./FieldBuilder"; // ✅ use builder type

export default function OptionsBuilder({
  field,
  setField,
}: {
  field: BuilderFieldConfig;
  setField: (f: BuilderFieldConfig) => void;
}) {
  if (!["checkbox", "radio-group", "select"].includes(field.type)) return null;

  const updateOption = (
    idx: number,
    key: keyof FieldOption,
    val: string | boolean
  ) => {
    const updated = [...(field.options || [])];
    updated[idx] = { ...updated[idx], [key]: val };
    setField({ ...field, options: updated });
  };

  const toggleDefault = (idx: number, checked: boolean) => {
    const updated = [...(field.options || [])];
    if (checked) {
      // radio/select → only one default allowed
      updated.forEach((o, i) => (o.default = i === idx));
    } else {
      // select → allow none selected
      updated[idx].default = false;
    }
    setField({ ...field, options: updated });
  };

  const addOption = () => {
    setField({
      ...field,
      options: [
        ...(field.options || []),
        { label: "", value: "" }, // start blank
      ],
    });
  };

  const removeOption = (idx: number) => {
    setField({
      ...field,
      options: (field.options || []).filter((_, i) => i !== idx),
    });
  };

  const hasEmptyOptions =
    (field.options || []).some((o) => !o.label.trim() || !o.value.trim());

  return (
    <div className="bg-purple-50 p-6 rounded-xl space-y-4 border border-purple-200 w-full">
      <h3 className="font-semibold text-lg text-purple-700">Options</h3>

      {/* ─── Orientation for checkbox / radio ─── */}
      {["checkbox", "radio-group"].includes(field.type) && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Orientation
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`orientation-${field.id}`}
                value="vertical"
                checked={field.orientation === "vertical"}
                onChange={() => setField({ ...field, orientation: "vertical" })}
              />
              Vertical
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`orientation-${field.id}`}
                value="horizontal"
                checked={field.orientation === "horizontal"}
                onChange={() =>
                  setField({ ...field, orientation: "horizontal" })
                }
              />
              Horizontal
            </label>
          </div>
        </div>
      )}

      {/* ─── Option list ─── */}
      <div className="space-y-3">
        {(field.options || []).map((opt, i) => {
          const labelError = !opt.label.trim();
          const valueError = !opt.value.trim();

          return (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className={`border p-2 rounded flex-1 ${
                    labelError ? "border-red-500" : ""
                  }`}
                  placeholder="Label (required)"
                  value={opt.label}
                  onChange={(e) => updateOption(i, "label", e.target.value)}
                />
                <input
                  type="text"
                  className={`border p-2 rounded flex-1 ${
                    valueError ? "border-red-500" : ""
                  }`}
                  placeholder="Value (required)"
                  value={opt.value}
                  onChange={(e) => updateOption(i, "value", e.target.value)}
                />

                {/* Checkbox → multiple defaults */}
                {field.type === "checkbox" && (
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={opt.checked || false}
                      onChange={(e) =>
                        updateOption(i, "checked", e.target.checked)
                      }
                    />
                    Checked
                  </label>
                )}

                {/* Radio → single default */}
                {field.type === "radio-group" && (
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name={`default-${field.id}`}
                      checked={opt.default || false}
                      onChange={() => toggleDefault(i, true)}
                    />
                    Default
                  </label>
                )}

                {/* Select → toggle default */}
                {field.type === "select" && (
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={opt.default || false}
                      onChange={(e) => toggleDefault(i, e.target.checked)}
                    />
                    Default
                  </label>
                )}

                <button
                  type="button"
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => removeOption(i)}
                >
                  ✕
                </button>
              </div>

              {(labelError || valueError) && (
                <p className="text-xs text-red-600 ml-1">
                  {labelError && valueError
                    ? "Label and value are required."
                    : labelError
                    ? "Label is required."
                    : "Value is required."}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addOption}
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Option
      </button>

      {/* Error banner */}
      {hasEmptyOptions && (
        <p className="text-red-600 text-sm font-medium border border-red-300 bg-red-50 px-3 py-2 rounded mt-2">
          All options must have both label and value filled in.
        </p>
      )}
    </div>
  );
}
