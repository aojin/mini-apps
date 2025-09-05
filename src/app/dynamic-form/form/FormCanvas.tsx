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
  /**
   * Segment model:
   *  - "columns": a run of half-width fields rendered in two independent vertical lanes.
   *  - "full": a single full-width field that breaks the lanes.
   *
   * We keep global indices (idx) from the original `fields[]` so move/edit/delete continue to work.
   */
  type Item = { field: FieldConfig; idx: number };
  type Segment =
    | { type: "columns"; items: Item[] }
    | { type: "full"; item: Item };

  const segments: Segment[] = [];
  let buffer: Item[] = [];

  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    const item = { field: f, idx: i };

    // On small screens, we will stack everything; segmentation still fine.
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

  /**
   * Helper: distribute a "columns" segment into two independent lanes.
   * We don't use ghosts or grid row coupling. Each lane is its own vertical flex stack.
   */
  const distributeToLanes = (items: Item[]) => {
    const left: Item[] = [];
    const right: Item[] = [];
    let toggle = true; // you can persist this across segments if you want, but per-segment is usually fine.

    for (const it of items) {
      if (toggle) left.push(it);
      else right.push(it);
      toggle = !toggle;
    }
    return { left, right };
  };

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="bg-white p-6 rounded-2xl shadow space-y-4"
    >
      <h2 className="text-xl font-semibold mb-4">Generated Form</h2>

      {/* MOBILE: simple stack in original order */}
      {previewMode === "sm" ? (
        <div className="flex flex-col gap-4">
          {fields.map((field, idx) => (
            <FieldBlock
              key={field.id}
              field={field}
              formData={formData}
              errors={errors}
              globalIdx={idx}
              onChange={onChange}
              moveField={moveField}
              deleteField={deleteField}
              onEdit={onEdit}
              previewMode={previewMode}
            />
          ))}
        </div>
      ) : (
        /**
         * MD+: render segments:
         *  - "columns" → a 2-col grid where each column is an independent vertical flex stack (independent lane).
         *  - "full"    → a single full-width block that clears both lanes.
         */
        <div className="flex flex-col gap-6">
          {segments.map((seg, si) => {
            if (seg.type === "full") {
              const { field, idx } = seg.item;
              return (
                <div key={`full-${si}`} className="w-full">
                  <FieldBlock
                    field={field}
                    formData={formData}
                    errors={errors}
                    globalIdx={idx}
                    onChange={onChange}
                    moveField={moveField}
                    deleteField={deleteField}
                    onEdit={onEdit}
                    previewMode={previewMode}
                  />
                </div>
              );
            }

            // columns segment
            const { left, right } = distributeToLanes(seg.items);
            return (
              <div
                key={`cols-${si}`}
                className="grid md:grid-cols-2 gap-4 items-start"
              >
                {/* Left lane */}
                <div className="flex flex-col gap-4">
                  {left.map(({ field, idx }) => (
                    <FieldBlock
                      key={field.id}
                      field={field}
                      formData={formData}
                      errors={errors}
                      globalIdx={idx}
                      onChange={onChange}
                      moveField={moveField}
                      deleteField={deleteField}
                      onEdit={onEdit}
                      previewMode={previewMode}
                    />
                  ))}
                </div>

                {/* Right lane */}
                <div className="flex flex-col gap-4">
                  {right.map(({ field, idx }) => (
                    <FieldBlock
                      key={field.id}
                      field={field}
                      formData={formData}
                      errors={errors}
                      globalIdx={idx}
                      onChange={onChange}
                      moveField={moveField}
                      deleteField={deleteField}
                      onEdit={onEdit}
                      previewMode={previewMode}
                    />
                  ))}
                </div>
              </div>
            );
          })}
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
}: {
  field: FieldConfig;
  formData: Record<string, string>;
  errors: Record<string, string | null>;
  globalIdx: number;
  onChange: (f: FieldConfig, v: string) => void;
  moveField: (index: number, dir: "up" | "down") => void;
  deleteField: (index: number) => void;
  onEdit: (field: FieldConfig) => void;
  previewMode: "sm" | "md" | "lg";
}) {
  return (
    <div className="flex flex-col items-start justify-start w-full">
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
          className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => deleteField(globalIdx)}
          title="Delete"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
