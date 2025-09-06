// /form/FormCanvas.tsx
"use client";

import React from "react";
import { FieldConfig } from "../builder/FieldConfig";
import FieldRenderer from "./FieldRenderer";

// ✅ Structural block types (unified header only)
type StructuralType = "header" | "spacer";

export default function FormCanvas({
  fields,
  formData,
  errors,
  onChange,
  updateFieldConfig,
  onSubmit,
  onReset,
  moveField,
  deleteField,
  onEdit,
  previewMode,
  isEditing,
  editingFieldId,
  resetBuilderForm,
  insertBlock,
}: {
  fields: FieldConfig[];
  formData: Record<string, string>;
  errors: Record<string, string | null>;
  onChange: (f: FieldConfig, v: string, err?: string | null) => void;
  updateFieldConfig: (f: FieldConfig) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  moveField: (index: number, dir: "up" | "down") => void;
  deleteField: (index: number) => void;
  onEdit: (field: FieldConfig) => void;
  previewMode: "sm" | "md" | "lg";
  isEditing: boolean;
  editingFieldId?: number;
  resetBuilderForm: () => void;
  insertBlock: (at: number, type: StructuralType) => void;
}) {
  type Item = { field: FieldConfig; idx: number };
  type Segment =
    | { type: "columns"; items: Item[] }
    | { type: "full"; item: Item };

  const segments: Segment[] = [];
  let buffer: Item[] = [];

  // ─── Build row segments ───
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    const item = { field: f, idx: i };

    if (previewMode !== "sm") {
      if (f.layout === "full") {
        if (buffer.length) {
          segments.push({ type: "columns", items: buffer });
          buffer = [];
        }
        segments.push({ type: "full", item });
      } else {
        buffer.push(item);
      }
    } else {
      buffer.push(item);
    }
  }
  if (buffer.length) segments.push({ type: "columns", items: buffer });

  // ─── Half/Full distribution ───
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

  // ─── Structural Toolbar ───
  const StructuralToolbar = ({ at }: { at: number }) => (
    <div className="flex gap-2 my-2">
      {(["header", "spacer"] as const).map((t) => (
        <button
          key={t}
          type="button"
          className={`text-xs px-2 py-1 rounded border ${
            t === "header"
              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => insertBlock(at, t)}
        >
          + {t.charAt(0).toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e);
      }}
      noValidate
      className="bg-white p-6 rounded-2xl shadow space-y-4"
    >
      <h2 className="text-xl font-semibold mb-4">Generated Form</h2>

      {/* Top toolbar */}
      <StructuralToolbar at={-1} />

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
              updateFieldConfig={updateFieldConfig}
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
                    updateFieldConfig={updateFieldConfig}
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
                      updateFieldConfig={updateFieldConfig}
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
                      updateFieldConfig={updateFieldConfig}
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

      {/* Bottom toolbar */}
      <StructuralToolbar at={fields.length - 1} />

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

// ─── FieldBlock ───
function FieldBlock({ ...props }) {
  const {
    field,
    fields,
    formData,
    errors,
    globalIdx,
    onChange,
    updateFieldConfig,
    moveField,
    deleteField,
    onEdit,
    previewMode,
    isEditing,
    editingFieldId,
    resetBuilderForm,
    lane,
  } = props;

  const isCurrentlyEditing = isEditing && editingFieldId === field.id;
  const isStructural = ["header", "spacer"].includes(field.type);

  const layoutLabel =
    field.layout === "full" ? "Full" : `Half${lane ? ` (${lane})` : ""}`;

  return (
    <div className="flex flex-col items-start justify-start border border-gray-200 rounded p-3 w-full">
      <div className="text-xs text-gray-500 mb-1">
        #{globalIdx + 1} · {layoutLabel} · {field.type}
      </div>

      <div className="w-full">
        <FieldRenderer
          field={field}
          value={formData[field.name] || ""}
          error={errors[field.name]}
          context={formData}
          allFields={fields}
          onChange={(val, err) => onChange(field, val, err)}
        />
      </div>

      {/* Inline controls for structural edits */}
      {isStructural && (
        <div className="flex flex-wrap gap-2 mt-2 text-xs">
          {field.type === "header" && (
            <>
              <input
                type="text"
                value={field.label}
                onChange={(e) =>
                  updateFieldConfig({ ...field, label: e.target.value })
                }
                className="border px-2 py-1 rounded text-sm"
                placeholder="Edit header text"
              />
              <select
                value={field.level || "h2"}
                onChange={(e) =>
                  updateFieldConfig({
                    ...field,
                    level: e.target.value as
                      | "h1"
                      | "h2"
                      | "h3"
                      | "h4"
                      | "h5",
                  })
                }
                className="border px-2 py-1 rounded"
              >
                <option value="h1">H1</option>
                <option value="h2">H2</option>
                <option value="h3">H3</option>
                <option value="h4">H4</option>
                <option value="h5">H5</option>
              </select>
            </>
          )}

          {field.type === "spacer" && (
            <select
              value={field.spacerSize || "md"}
              onChange={(e) =>
                updateFieldConfig({
                  ...field,
                  spacerSize: e.target.value as "sm" | "md" | "lg" | "xl",
                })
              }
              className="border px-2 py-1 rounded"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">XL</option>
            </select>
          )}

          {/* Toggle layout */}
          <button
            type="button"
            className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
            onClick={() =>
              updateFieldConfig({
                ...field,
                layout: field.layout === "full" ? "half" : "full",
              })
            }
          >
            Toggle {field.layout === "full" ? "Half" : "Full"}
          </button>
        </div>
      )}

      {/* Always show move + delete */}
      <div className="flex gap-2 mt-2 flex-wrap">
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

        {/* Only non-structural get ✎ edit */}
        {!isStructural && (
          <button
            type="button"
            className="text-xs px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
            onClick={() => onEdit(field)}
            title="Edit"
          >
            ✎
          </button>
        )}
      </div>
    </div>
  );
}