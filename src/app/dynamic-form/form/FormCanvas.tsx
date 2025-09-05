// /form/FormCanvas.tsx
"use client";

import React from "react";
import { FieldConfig } from "../builder/FieldConfig";
import FieldRenderer from "./FieldRenderer";
import { runValidators } from "./Validation"; // ✅ central validation

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
  isEditing,
  editingFieldId,
  resetBuilderForm,
}: {
  fields: FieldConfig[];
  formData: Record<string, string>;
  errors: Record<string, string | null>;
  onChange: (f: FieldConfig, v: string, err?: string | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  moveField: (index: number, dir: "up" | "down") => void;
  deleteField: (index: number) => void;
  onEdit: (field: FieldConfig) => void;
  previewMode: "sm" | "md" | "lg";
  isEditing: boolean;
  editingFieldId?: number;
  resetBuilderForm: () => void;
}) {
  type Item = { field: FieldConfig; idx: number };
  type Segment =
    | { type: "columns"; items: Item[] }
    | { type: "full"; item: Item };

  const segments: Segment[] = [];
  let buffer: Item[] = [];

  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    const item = { field: f, idx: i };

    if (previewMode !== "sm" && f.layout === "full") {
      if (buffer.length) {
        segments.push({ type: "columns", items: buffer });
        buffer = [];
      }
      segments.push({ type: "full", item });
    } else {
      buffer.push(item);
    }
  }
  if (buffer.length) segments.push({ type: "columns", items: buffer });

  const distributeToLanes = (items: Item[]) => {
    const left: (Item & { lane: "Left" })[] = [];
    const right: (Item & { lane: "Right" })[] = [];
    let toggle = true;
    for (const it of items) {
      if (toggle) left.push({ ...it, lane: "Left" });
      else right.push({ ...it, lane: "Right" });
      toggle = !toggle;
    }
    return { left, right };
  };

  // ─── Submit Handler ───
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    const newErrors: Record<string, string | null> = {};

    fields.forEach((f) => {
      const val = formData[f.name] || "";
      const err = runValidators(val, f, formData, fields);
      if (err) hasError = true;
      newErrors[f.name] = err;
    });

    fields.forEach((f) => {
      if (f.matchField) {
        const val = formData[f.name] || "";
        const err = runValidators(val, f, formData, fields);
        if (err) {
          hasError = true;
          newErrors[f.name] = err;
        }
      }
    });

    Object.entries(newErrors).forEach(([name, err]) => {
      const f = fields.find((ff) => ff.name === name);
      if (f) onChange(f, formData[name] || "", err);
    });

    if (hasError) return;
    onSubmit(e);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white p-6 rounded-2xl shadow space-y-4"
    >
      <h2 className="text-xl font-semibold mb-4">Generated Form</h2>

      {previewMode === "sm" ? (
        <div className="flex flex-col gap-4">
          {fields.map((field, idx) => (
            <FieldBlock
              key={field.id}
              field={field}
              fields={fields}
              formData={formData}
              errors={errors}
              globalIdx={idx}
              onChange={onChange}
              moveField={moveField}
              deleteField={deleteField}
              onEdit={onEdit}
              previewMode={previewMode}
              isEditing={isEditing}
              editingFieldId={editingFieldId}
              resetBuilderForm={resetBuilderForm}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {segments.map((seg, si) => {
            if (seg.type === "full") {
              const { field, idx } = seg.item;
              return (
                <div key={`full-${si}`} className="w-full">
                  <FieldBlock
                    field={field}
                    fields={fields}
                    formData={formData}
                    errors={errors}
                    globalIdx={idx}
                    onChange={onChange}
                    moveField={moveField}
                    deleteField={deleteField}
                    onEdit={onEdit}
                    previewMode={previewMode}
                    isEditing={isEditing}
                    editingFieldId={editingFieldId}
                    resetBuilderForm={resetBuilderForm}
                  />
                </div>
              );
            }

            const { left, right } = distributeToLanes(seg.items);
            return (
              <div
                key={`cols-${si}`}
                className="grid md:grid-cols-2 gap-4 items-start"
              >
                <div className="flex flex-col gap-4">
                  {left.map(({ field, idx, lane }) => (
                    <FieldBlock
                      key={field.id}
                      field={field}
                      fields={fields}
                      formData={formData}
                      errors={errors}
                      globalIdx={idx}
                      lane={lane}
                      onChange={onChange}
                      moveField={moveField}
                      deleteField={deleteField}
                      onEdit={onEdit}
                      previewMode={previewMode}
                      isEditing={isEditing}
                      editingFieldId={editingFieldId}
                      resetBuilderForm={resetBuilderForm}
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-4">
                  {right.map(({ field, idx, lane }) => (
                    <FieldBlock
                      key={field.id}
                      field={field}
                      fields={fields}
                      formData={formData}
                      errors={errors}
                      globalIdx={idx}
                      lane={lane}
                      onChange={onChange}
                      moveField={moveField}
                      deleteField={deleteField}
                      onEdit={onEdit}
                      previewMode={previewMode}
                      isEditing={isEditing}
                      editingFieldId={editingFieldId}
                      resetBuilderForm={resetBuilderForm}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
  fields,
  formData,
  errors,
  globalIdx,
  onChange,
  moveField,
  deleteField,
  onEdit,
  previewMode,
  isEditing,
  editingFieldId,
  resetBuilderForm,
  lane,
}: {
  field: FieldConfig;
  fields: FieldConfig[];
  formData: Record<string, string>;
  errors: Record<string, string | null>;
  globalIdx: number;
  onChange: (f: FieldConfig, v: string, err?: string | null) => void;
  moveField: (index: number, dir: "up" | "down") => void;
  deleteField: (index: number) => void;
  onEdit: (field: FieldConfig) => void;
  previewMode: "sm" | "md" | "lg";
  isEditing: boolean;
  editingFieldId?: number;
  resetBuilderForm: () => void;
  lane?: "Left" | "Right";
}) {
  const isCurrentlyEditing = isEditing && editingFieldId === field.id;

  const layoutLabel =
    field.layout === "full"
      ? "Full"
      : `Half${lane ? ` (${lane})` : ""}`;

  return (
    <div className="flex flex-col items-start justify-start w-full border border-gray-200 rounded p-3">
      {/* 🔹 Sequence + layout indicator */}
      <div className="text-xs text-gray-500 mb-1">
        #{globalIdx + 1} · {layoutLabel}
      </div>

      <div className="w-full [&>input]:align-top [&>textarea]:align-top [&>select]:align-top">
        <FieldRenderer
          field={field}
          value={formData[field.name] || ""}
          error={errors[field.name]}
          context={formData}
          allFields={fields}
          onChange={(val, err) => {
            onChange(field, val, err);
            fields.forEach((f) => {
              if (f.matchField === field.name) {
                const otherVal = formData[f.name] || "";
                const newErr = runValidators(
                  otherVal,
                  f,
                  { ...formData, [field.name]: val },
                  fields
                );
                onChange(f, otherVal, newErr);
              }
            });
          }}
        />
      </div>

      <div className="flex gap-2 mt-2">
        <button
          type="button"
          className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => moveField(globalIdx, "up")}
          title="Move up"
        >
          ↑
        </button>
        <button
          type="button"
          className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => moveField(globalIdx, "down")}
          title="Move down"
        >
          ↓
        </button>
        <button
          type="button"
          className="text-xs px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
          onClick={() => onEdit(field)}
          title="Edit"
        >
          ✎
        </button>
        <button
          type="button"
          className={`text-xs px-2 py-1 rounded ${
            isCurrentlyEditing
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
          onClick={() => {
            if (isCurrentlyEditing) return;
            if (isEditing) resetBuilderForm();
            deleteField(globalIdx);
          }}
          disabled={isCurrentlyEditing}
          title={isCurrentlyEditing ? "Cannot delete while editing" : "Delete"}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
