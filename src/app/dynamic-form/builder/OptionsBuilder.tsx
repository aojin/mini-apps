"use client";

import React from "react";
import { FieldConfig, FieldOption } from "./FieldConfig";

export default function OptionsBuilder({
  field,
  setField,
}: {
  field: FieldConfig;
  setField: (f: FieldConfig) => void;
}) {
  if (!["checkbox", "radio-group", "select"].includes(field.type)) return null;

  const updateOption = (idx: number, key: keyof FieldOption, val: string | boolean) => {
    const updated = [...(field.options || [])];
    updated[idx] = { ...updated[idx], [key]: val };

    // enforce single default for radio/select
    if (key === "default" && val === true && ["radio-group", "select"].includes(field.type)) {
      updated.forEach((o, i) => {
        if (i !== idx) o.default = false;
      });
    }

    setField({ ...field, options: updated });
  };

  const addOption = () => {
    setField({
      ...field,
      options: [...(field.options || []), { label: "", value: "" }],
    });
  };

  const removeOption = (idx: number) => {
    setField({
      ...field,
      options: (field.options || []).filter((_, i) => i !== idx),
    });
  };

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
                onChange={() => setField({ ...field, orientation: "horizontal" })}
              />
              Horizontal
            </label>
          </div>
        </div>
      )}

      {/* ─── Option list ─── */}
      <div className="space-y-3">
        {(field.options || []).map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              className="border p-2 rounded flex-1"
              placeholder="Label"
              value={opt.label}
              onChange={(e) => updateOption(i, "label", e.target.value)}
            />
            <input
              type="text"
              className="border p-2 rounded flex-1"
              placeholder="Value"
              value={opt.value}
              onChange={(e) => updateOption(i, "value", e.target.value)}
            />

            {field.type === "checkbox" && (
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={opt.checked || false}
                  onChange={(e) => updateOption(i, "checked", e.target.checked)}
                />
                Default
              </label>
            )}
            {["radio-group", "select"].includes(field.type) && (
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name={`default-${field.id}`}
                  checked={opt.default || false}
                  onChange={() => updateOption(i, "default", true)}
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
        ))}
      </div>

      <button
        type="button"
        onClick={addOption}
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Option
      </button>
    </div>
  );
}
