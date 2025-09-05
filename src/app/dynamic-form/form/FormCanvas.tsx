"use client";

import React from "react";
import { FieldConfig } from "../builder/FieldConfig";
import FieldRenderer from "./FieldRenderer";

export default function FormCanvas({
  fields,
  formData,
  errors,
  onChange,
  onSubmit,
  onReset,
  moveField,
  deleteField,
  onEdit,
  previewMode,
}: {
  fields: FieldConfig[];
  formData: Record<string, string>;
  errors: Record<string, string | null>;
  onChange: (f: FieldConfig, v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  moveField: (index: number, dir: "up" | "down") => void;
  deleteField: (index: number) => void;
  onEdit: (field: FieldConfig) => void;
  previewMode: "sm" | "md" | "lg";
}) {
  // Split fields into left/right "tracks"
  const left: { field: FieldConfig; globalIdx: number }[] = [];
  const right: { field: FieldConfig; globalIdx: number }[] = [];

  let toggle = true;
  fields.forEach((f, globalIdx) => {
    if (previewMode === "sm" || f.layout === "full") {
      // Full width spans both → real field left, ghost right
      left.push({ field: { ...f, __full: true } as any, globalIdx });
      right.push({ field: { ...f, __ghost: true } as any, globalIdx });
      toggle = true;
    } else {
      if (toggle) {
        left.push({ field: f, globalIdx });
        right.push({ field: { ...f, __ghost: true } as any, globalIdx });
      } else {
        right.push({ field: f, globalIdx });
        left.push({ field: { ...f, __ghost: true } as any, globalIdx });
      }
      toggle = !toggle;
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="bg-white p-6 rounded-2xl shadow space-y-4"
    >
      <h2 className="text-xl font-semibold mb-4">Generated Form</h2>

      {/* Columns */}
      {previewMode === "sm" ? (
        // Mobile: collapse into one unified column
        <div className="flex flex-col gap-4">
          {fields.map((field, globalIdx) => (
            <FieldBlock
              key={field.id}
              field={field}
              formData={formData}
              errors={errors}
              globalIdx={globalIdx}
              onChange={onChange}
              moveField={moveField}
              deleteField={deleteField}
              onEdit={onEdit}
              previewMode={previewMode}
            />
          ))}
        </div>
      ) : (
        // Tablet & Desktop: independent left/right tracks
        <div className="grid md:grid-cols-2 gap-4 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-4">
            {left.map(({ field, globalIdx }) =>
              (field as any).__ghost ? null : (
                <FieldBlock
                  key={field.id}
                  field={field}
                  formData={formData}
                  errors={errors}
                  globalIdx={globalIdx}
                  onChange={onChange}
                  moveField={moveField}
                  deleteField={deleteField}
                  onEdit={onEdit}
                  previewMode={previewMode}
                />
              )
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {right.map(({ field, globalIdx }) =>
              (field as any).__ghost ? null : (
                <FieldBlock
                  key={field.id}
                  field={field}
                  formData={formData}
                  errors={errors}
                  globalIdx={globalIdx}
                  onChange={onChange}
                  moveField={moveField}
                  deleteField={deleteField}
                  onEdit={onEdit}
                  previewMode={previewMode}
                />
              )
            )}
          </div>
        </div>
      )}

      {/* Submit + Reset */}
      <div className="mt-6 flex gap-4">
        <button
          type="submit"
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={onReset}
          className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
        >
          Reset
        </button>
      </div>
    </form>
  );
}

function FieldBlock({
  field,
  formData,
  errors,
  globalIdx,
  onChange,
  moveField,
  deleteField,
  onEdit,
  previewMode,
}: any) {
  return (
    <div
      className={`flex flex-col items-start justify-start ${
        previewMode === "sm" || (field as any).__full ? "w-full" : ""
      }`}
    >
      {/* Field wrapper */}
      <div className="w-full [&>input]:align-top [&>textarea]:align-top [&>select]:align-top">
        <FieldRenderer
          field={field}
          value={formData[field.name] || ""}
          error={errors[field.name]}
          onChange={(v: string) => onChange(field, v)}
        />
      </div>

      {/* Field controls */}
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => moveField(globalIdx, "up")}
        >
          ↑
        </button>
        <button
          type="button"
          className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => moveField(globalIdx, "down")}
        >
          ↓
        </button>
        <button
          type="button"
          className="text-xs px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
          onClick={() => onEdit(field)}
        >
          ✎
        </button>
        <button
          type="button"
          className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => deleteField(globalIdx)}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
