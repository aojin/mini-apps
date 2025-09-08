// /form/FormCanvas.tsx
"use client";

import React, { useState } from "react";
import { FieldConfig } from "../builder/FieldConfig";
import FieldRenderer from "./FieldRenderer";
import FormSummary from "./FormSummary";

type StructuralType = "header" | "spacer";

interface Group {
  leftFields: { field: FieldConfig; idx: number }[];
  rightFields: { field: FieldConfig; idx: number }[];
  full?: boolean;
}

interface FormCanvasProps {
  fields: FieldConfig[];
  formData: Record<string, string>;
  errors: Record<string, string | null>;
  onChange: (f: FieldConfig, v: string, err?: string | null) => void;
  updateFieldConfig: (f: FieldConfig) => void;
  onSubmit: (e: React.FormEvent) => boolean;
  onReset: () => void;
  moveField: (index: number, dir: "up" | "down") => void;
  deleteField: (index: number) => void;
  onEdit: (field: FieldConfig) => void;
  previewMode: "sm" | "md" | "lg";
  isPreview: boolean;
  isEditing: boolean;
  editingFieldId?: number;
  resetBuilderForm: () => void;
  insertBlock: (at: number, type: StructuralType) => void;
}

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
  isPreview,
  isEditing,
  editingFieldId,
  resetBuilderForm,
  insertBlock,
}: FormCanvasProps) {
  const [showSummary, setShowSummary] = useState(false);
  const [submittedData, setSubmittedData] = useState<Record<string, string>>({});

  // ─── Grouping ───
  const groups: Group[] = [];
  let buffer: { field: FieldConfig; idx: number }[] = [];

  fields.forEach((field, idx) => {
    if (isPreview && previewMode === "sm" && field.type === "spacer" && field.hideOnMobile) {
      return;
    }

    if (field.type === "header" || field.layout === "full") {
      if (buffer.length > 0) {
        groups.push({
          leftFields: [buffer[0]],
          rightFields: buffer[1] ? [buffer[1]] : [],
        });
        buffer = [];
      }
      groups.push({
        full: true,
        leftFields: [{ field, idx }],
        rightFields: [],
      });
      return;
    }

    buffer.push({ field, idx });
    if (buffer.length === 2) {
      groups.push({
        leftFields: [buffer[0]],
        rightFields: [buffer[1]],
      });
      buffer = [];
    }
  });

  if (buffer.length === 1) {
    groups.push({ leftFields: [buffer[0]], rightFields: [] });
  }

  const StructuralToolbar = ({ at }: { at: number }) =>
    isPreview ? null : (
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
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const success = onSubmit(e);
          if (success) {
            setSubmittedData(formData);
            setShowSummary(true);
          } else {
            setShowSummary(false);
          }
        }}
        noValidate
        className="bg-white p-6 rounded-2xl shadow space-y-4"
      >
        {!isPreview && <h2 className="text-xl font-semibold mb-4">Generated Form</h2>}
        <StructuralToolbar at={-1} />

        {previewMode === "sm" ? (
          <div className="flex flex-col gap-4">
            {groups.map((g, gi) => (
              <div key={gi} className="flex flex-col gap-2">
                {[...g.leftFields, ...g.rightFields].map(({ field, idx }) => (
                  <FieldBlock
                    key={field.id}
                    field={field}
                    globalIdx={idx}
                    fields={fields}
                    formData={formData}
                    errors={errors}
                    onChange={onChange}
                    updateFieldConfig={updateFieldConfig}
                    moveField={moveField}
                    deleteField={deleteField}
                    onEdit={onEdit}
                    isPreview={isPreview}
                    isEditing={isEditing}
                    editingFieldId={editingFieldId}
                    resetBuilderForm={resetBuilderForm}
                    showBuilderControls={!isPreview}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map((g, gi) =>
              g.full ? (
                <div key={gi} className="w-full flex flex-col gap-2">
                  {g.leftFields.map(({ field, idx }) => (
                    <FieldBlock
                      key={field.id}
                      field={field}
                      globalIdx={idx}
                      fields={fields}
                      formData={formData}
                      errors={errors}
                      onChange={onChange}
                      updateFieldConfig={updateFieldConfig}
                      moveField={moveField}
                      deleteField={deleteField}
                      onEdit={onEdit}
                      isPreview={isPreview}
                      isEditing={isEditing}
                      editingFieldId={editingFieldId}
                      resetBuilderForm={resetBuilderForm}
                      showBuilderControls={!isPreview}
                    />
                  ))}
                </div>
              ) : (
                <div key={gi} className="grid md:grid-cols-2 gap-4 items-start">
                  <div className="flex flex-col gap-4">
                    {g.leftFields.map(({ field, idx }) => (
                      <FieldBlock
                        key={field.id}
                        field={field}
                        globalIdx={idx}
                        fields={fields}
                        formData={formData}
                        errors={errors}
                        onChange={onChange}
                        updateFieldConfig={updateFieldConfig}
                        moveField={moveField}
                        deleteField={deleteField}
                        onEdit={onEdit}
                        isPreview={isPreview}
                        isEditing={isEditing}
                        editingFieldId={editingFieldId}
                        resetBuilderForm={resetBuilderForm}
                        showBuilderControls={!isPreview}
                      />
                    ))}
                  </div>
                  <div className="flex flex-col gap-4">
                    {g.rightFields.map(({ field, idx }) => (
                      <FieldBlock
                        key={field.id}
                        field={field}
                        globalIdx={idx}
                        fields={fields}
                        formData={formData}
                        errors={errors}
                        onChange={onChange}
                        updateFieldConfig={updateFieldConfig}
                        moveField={moveField}
                        deleteField={deleteField}
                        onEdit={onEdit}
                        isPreview={isPreview}
                        isEditing={isEditing}
                        editingFieldId={editingFieldId}
                        resetBuilderForm={resetBuilderForm}
                        showBuilderControls={!isPreview}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        <StructuralToolbar at={fields.length - 1} />

        <div className="mt-6 flex gap-4">
          <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
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

      {showSummary && (
        <FormSummary data={submittedData} fields={fields} onClose={() => setShowSummary(false)} />
      )}
    </>
  );
}

// ─── Field Block ───
interface FieldBlockProps {
  field: FieldConfig;
  globalIdx: number;
  fields: FieldConfig[];
  formData: Record<string, string>;
  errors: Record<string, string | null>;
  onChange: (f: FieldConfig, v: string, err?: string | null) => void;
  updateFieldConfig: (f: FieldConfig) => void;
  moveField: (index: number, dir: "up" | "down") => void;
  deleteField: (index: number) => void;
  onEdit: (field: FieldConfig) => void;
  isPreview: boolean;
  isEditing: boolean;
  editingFieldId?: number;
  resetBuilderForm: () => void;
  showBuilderControls: boolean;
}

function FieldBlock({
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
  isPreview,
  isEditing,
  editingFieldId,
  resetBuilderForm,
  showBuilderControls,
}: FieldBlockProps) {
  const isCurrentlyEditing = isEditing && editingFieldId === field.id;
  const isStructural = ["header", "spacer"].includes(field.type);

  return (
    <div
      className={`flex flex-col items-start justify-start w-full ${
        isPreview ? "" : "border border-gray-200 rounded p-3"
      }`}
    >
      {showBuilderControls && (
        <div className="text-xs text-gray-500 mb-1">
          #{globalIdx + 1} · {field.layout} · {field.type}
          {field.type === "spacer" && field.hideOnMobile && " · hidden on mobile"}
        </div>
      )}

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

      {showBuilderControls && isStructural && (
        <div className="flex flex-wrap gap-2 mt-2 text-xs items-center">
          {field.type === "header" && (
            <>
              <input
                type="text"
                value={field.label}
                onChange={(e) => updateFieldConfig({ ...field, label: e.target.value })}
                className="border px-2 py-1 rounded text-sm"
                placeholder="Edit header text"
              />
              <select
                value={field.level || "h2"}
                onChange={(e) =>
                  updateFieldConfig({ ...field, level: e.target.value as "h1" | "h2" | "h3" | "h4" | "h5" })
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
            <>
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

              <select
                value={field.layout || "full"}
                onChange={(e) =>
                  updateFieldConfig({
                    ...field,
                    layout: e.target.value as "full" | "half",
                  })
                }
                className="border px-2 py-1 rounded"
              >
                <option value="full">Full Width</option>
                <option value="half">Half Width</option>
              </select>

              <button
                type="button"
                onClick={() =>
                  updateFieldConfig({
                    ...field,
                    hideOnMobile: !field.hideOnMobile,
                  })
                }
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${
                  field.hideOnMobile
                    ? "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
              >
                {field.hideOnMobile ? (
                  <>
                    <span>🙈</span> Hidden on Mobile
                  </>
                ) : (
                  <>
                    <span>👁️</span> Visible on Mobile
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}

      {showBuilderControls && (
        <div className="flex gap-2 mt-2 flex-wrap items-center">
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
      )}
    </div>
  );
}
