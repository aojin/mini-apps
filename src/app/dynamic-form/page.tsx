// /app/dynamic-form/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ToastProvider, useToast } from "./components/Toast";
import { FieldConfig, FieldType } from "./builder/FieldConfig";
import { BuilderFieldConfig } from "./builder/FieldBuilder";
import { runValidators } from "./form/Validation";
import FieldBuilder from "./builder/FieldBuilder";
import FormCanvas from "./form/FormCanvas";
import { LayoutConfig } from "./layout/LayoutConfig";
import { computeDefaultValue } from "./form/utils";
import Link from "next/link";

export default function Page() {
  return (
    <ToastProvider>
      <DynamicFormBuilder />
    </ToastProvider>
  );
}

// Extend FieldType with "" for builder draft
type DraftFieldType = FieldType | "";

function DynamicFormBuilder() {
  const { addToast } = useToast();

  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // 🔥 separate: preview width vs preview toggle
  const [previewMode, setPreviewMode] = useState<"sm" | "md" | "lg">("lg");
  const [isPreview, setIsPreview] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ─── Default Field Template ───
  const defaultField: BuilderFieldConfig = {
    id: 0,
    type: "" as DraftFieldType, // ✅ no any
    label: "",
    name: "",
    ...LayoutConfig["text"],
    layout: "full",
    // masks
    maskType: undefined,
    pattern: undefined,
    placeholder: "",
    maxlength: undefined,
    // validation
    minlength: undefined,
    exactLength: undefined,
    startsWith: undefined,
    endsWith: undefined,
    contains: undefined,
    minWords: undefined,
    maxWords: undefined,
    allowedValues: undefined,
    disallowedValues: undefined,
    matchField: undefined,
    customErrorMessage: undefined,
    // numbers
    minValue: undefined,
    maxValue: undefined,
    step: undefined,
    noNegative: undefined,
    positiveOnly: undefined,
    integerOnly: undefined,
    decimalPlaces: undefined,
    // dates
    minDate: undefined,
    maxDate: undefined,
    // checkbox/radio/select
    options: undefined,
    orientation: "vertical",
    isMulti: undefined,
    // file
    accept: undefined,
    multiple: undefined,
    maxFileSizeMB: undefined,
    // textarea
    rows: undefined,
    cols: undefined,
  };

  const [newField, setNewField] = useState<BuilderFieldConfig>(defaultField);
  const [editingFieldId, setEditingFieldId] = useState<number | null>(null);

  // ─── Detect screen width ───
  useEffect(() => {
    const checkSize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (mobile) setPreviewMode("sm");
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // ─── Reset builder form ───
  const resetBuilderForm = () => {
    setNewField({ ...defaultField });
    setEditingFieldId(null);
  };

  const nextIdRef = React.useRef(0);

  // ─── Add field ───
  const addField = () => {
    if (!newField.label.trim() || !newField.name.trim() || !newField.type) return;

    nextIdRef.current += 1;
    const id = nextIdRef.current;

    const f: FieldConfig = {
      ...newField,
      id,
      type: newField.type as FieldType, // ✅ no any
    };
    setFields((prev) => [...prev, f]);

    const defVal = computeDefaultValue(f);
    if (defVal) {
      setFormData((prev) => ({ ...prev, [f.name]: defVal }));
    }

    resetBuilderForm();
  };

  // ─── Insert structural block (header, spacer) ───
  const insertBlock = (index: number, type: "header" | "spacer") => {
    nextIdRef.current += 1;
    const id = nextIdRef.current;

    const block: FieldConfig = {
      id,
      type,
      layout: "full",
      name: `${type}_${id}`,
      label: type === "header" ? "Header" : "",
      ...(type === "header" && { level: "h2" as const }),
      ...(type === "spacer" && { spacerSize: "md" as const }),
    };

    setFields((prev) => {
      const copy = [...prev];
      let target = index < 0 ? 0 : index + 1;
      if (target > copy.length) target = copy.length;
      copy.splice(target, 0, block);
      return copy;
    });

    resetBuilderForm();
  };

  // ─── Update existing field ───
  const updateField = () => {
    if (!editingFieldId) return;

    const updated: FieldConfig = {
      ...newField,
      id: editingFieldId,
      type: newField.type as FieldType, // ✅ no any
    };

    setFields((prev) =>
      prev.map((f) => (f.id === editingFieldId ? updated : f))
    );

    const defVal = computeDefaultValue(updated);
    if (defVal) {
      setFormData((prev) => ({ ...prev, [updated.name]: defVal }));
    }

    resetBuilderForm();
  };

  // ─── Edit existing field ───
  const handleEdit = (field: FieldConfig) => {
    setNewField({ ...field });
    setEditingFieldId(field.id);
  };

  // ─── Reorder ───
  const moveField = (index: number, direction: "up" | "down") => {
    setFields((prev) => {
      const newFields = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newFields.length) return prev;
      [newFields[index], newFields[targetIndex]] = [
        newFields[targetIndex],
        newFields[index],
      ];
      return newFields;
    });
  };

  // ─── Delete ───
  const deleteField = (index: number) => {
    setFields((prev) => {
      const newFields = prev.filter((_, i) => i !== index);
      const removed = prev[index];

      if (removed) {
        setFormData((prevData) => {
          const { [removed.name]: _, ...rest } = prevData;
          return rest;
        });
        setErrors((prevErrors) => {
          const { [removed.name]: _, ...rest } = prevErrors;
          return rest;
        });
      }

      return newFields;
    });
  };

  // ─── Track form input ───
  const handleChange = (
    field: FieldConfig,
    value: string,
    error?: string | null
  ) => {
    setFormData((prev) => ({ ...prev, [field.name]: value }));
    setErrors((prev) => ({ ...prev, [field.name]: error ?? null }));
  };

  // ─── Submit ───
  const handleSubmit = (e: React.FormEvent): boolean => {
    e.preventDefault();
    const newErrors: Record<string, string | null> = {}; // ✅ const
    let hasError = false;

    fields.forEach((f) => {
      if (["header", "spacer"].includes(f.type)) return;

      let val = formData[f.name] ?? "";

      if (
        !val &&
        !["checkbox", "radio-group", "select", "file"].includes(f.type)
      ) {
        val = computeDefaultValue(f);
      }

      const err = runValidators(val, f, { ...formData, [f.name]: val }, fields);
      if (err) hasError = true;
      newErrors[f.name] = err;
    });

    fields.forEach((f) => {
      if (f.matchField) {
        const val = formData[f.name] ?? "";
        const err = runValidators(val, f, formData, fields);
        if (err) {
          hasError = true;
          newErrors[f.name] = err;
        }
      }
    });

    setErrors(newErrors);

    if (hasError) {
      addToast("Form has errors. Please fix them.", "error");
      return false;
    }

    addToast("Form submitted successfully!", "success");
    console.log("Form Data:", formData);
    return true;
  };

  // ─── Reset ───
  const handleReset = () => {
    const clearedData: Record<string, string> = {};
    const clearedErrors: Record<string, string | null> = {};
    fields.forEach((f) => {
      const defVal = computeDefaultValue(f);
      clearedData[f.name] = defVal;
      clearedErrors[f.name] = null;
    });
    setFormData(clearedData);
    setErrors(clearedErrors);
  };

  const updateFieldConfig = (updated: FieldConfig) => {
    setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  const cancelEdit = () => {
    setEditingFieldId(null);
    resetBuilderForm();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 overflow-visible">
      <div className="self-start mb-4">
        <Link
          href="/"
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Mini Apps
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-center mb-6">
        Dynamic Form Builder
      </h1>

      <div className="mb-6 p-4 w-full bg-blue-50 border-l-4 border-blue-400 rounded">
        <h2 className="text-lg font-semibold mb-2">About this app</h2>

        <p className="mb-3">
          The Dynamic Form Builder lets you design, preview, and test forms
          interactively. You can add fields of different types, configure validation
          rules, and instantly see how your form will behave.
        </p>

        <ul className="list-disc list-inside mb-3 text-sm text-gray-700 space-y-1">
          <li><strong>Add Fields:</strong> Use the builder panel ...</li>
          <li><strong>Edit & Reorder:</strong> Click the ✏️ edit ...</li>
          <li><strong>Validation:</strong> Apply rules ...</li>
          <li><strong>Preview:</strong> Toggle preview mode ...</li>
          <li><strong>Reset & Submit:</strong> Try clearing ...</li>
        </ul>

        <p className="text-sm text-gray-600">
          💡 Tip: Use preview mode to experience the form exactly as end-users would.
          This builder is a foundation — you could extend it with persistence,
          exporting configs, or even hooking into a backend API.
        </p>
      </div>

      <div className="mx-auto w-full max-w-[1280px] space-y-8 overflow-visible">
        {/* Builder */}
        <div className="w-full overflow-visible">
          <FieldBuilder
            newField={newField}
            setNewField={setNewField}
            addField={addField}
            updateField={updateField}
            isEditing={editingFieldId !== null}
            cancelEdit={cancelEdit}
            fields={fields}
          />
        </div>

        {/* Preview */}
        {fields.length > 0 && (
          <div className="flex flex-col items-center w-full overflow-visible">
            {/* 🔥 Sticky controls */}
            <div className="sticky top-0 z-10 flex w-full justify-between mb-4 bg-gray-100 py-2">
              <button
                type="button"
                onClick={() => setIsPreview((p) => !p)}
                className={`px-3 py-1 rounded ${
                  isPreview ? "bg-green-500 text-white" : "bg-gray-200"
                }`}
              >
                {isPreview ? "Toggle Preview Off" : "Toggle Preview On"}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode("sm")}
                  className={`px-3 py-1 rounded ${
                    previewMode === "sm"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  Mobile
                </button>
                {!isMobile && (
                  <>
                    <button
                      type="button"
                      onClick={() => setPreviewMode("md")}
                      className={`px-3 py-1 rounded ${
                        previewMode === "md"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      Tablet
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode("lg")}
                      className={`px-3 py-1 rounded ${
                        previewMode === "lg"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      Desktop
                    </button>
                  </>
                )}
              </div>
            </div>

            <div
              className={`border rounded bg-gray-50 p-4 transition-all w-full overflow-visible ${
                previewMode === "sm"
                  ? "max-w-[375px]"
                  : previewMode === "md"
                  ? "max-w-[768px]"
                  : "max-w-[1280px]"
              }`}
            >
              <FormCanvas
                fields={fields}
                formData={formData}
                errors={errors}
                onChange={handleChange}
                updateFieldConfig={updateFieldConfig}
                onSubmit={handleSubmit}
                moveField={moveField}
                deleteField={deleteField}
                onEdit={handleEdit}
                previewMode={previewMode}
                isPreview={isPreview}
                onReset={handleReset}
                isEditing={editingFieldId !== null}
                editingFieldId={editingFieldId ?? undefined}
                resetBuilderForm={resetBuilderForm}
                insertBlock={insertBlock}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
