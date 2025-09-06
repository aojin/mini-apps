// /app/dynamic-form/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ToastProvider, useToast } from "./components/Toast";
import { FieldConfig } from "./builder/FieldConfig";
import { runValidators } from "./form/Validation";
import FieldBuilder from "./builder/FieldBuilder";
import FormCanvas from "./form/FormCanvas";
import { LayoutConfig } from "./layout/LayoutConfig";

export default function Page() {
  return (
    <ToastProvider>
      <DynamicFormBuilder />
    </ToastProvider>
  );
}

// ─── Default Value Helper ───
function computeDefaultValue(field: FieldConfig): string {
  if (field.type === "select" || field.type === "radio-group") {
    return field.options?.find((o) => o.default)?.value ?? "";
  }
  if (field.type === "checkbox") {
    const checkedVals = (field.options ?? [])
      .filter((o) => o.checked)
      .map((o) => o.value);
    return checkedVals.join(",");
  }
  return "";
}

function DynamicFormBuilder() {
  const { addToast } = useToast();

  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [counter, setCounter] = useState(0);

  // 🔥 separate: preview width vs preview toggle
  const [previewMode, setPreviewMode] = useState<"sm" | "md" | "lg">("lg");
  const [isPreview, setIsPreview] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ─── Default Field Template ───
  const defaultField: FieldConfig = {
    id: 0,
    type: "" as any,
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

  const [newField, setNewField] = useState<FieldConfig>(defaultField);
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

    const f = { ...newField, id };
    setFields((prev) => [...prev, f]);

    const defVal = computeDefaultValue(f);
    if (defVal) {
      setFormData((prev) => ({ ...prev, [f.name]: defVal }));
    }

    resetBuilderForm();
  };

  // ─── Insert header or spacer ───
  const insertBlock = (
    index: number,
    type: "header" | "spacer",
    variant: "header" | "subheader" = "header"
  ) => {
    nextIdRef.current += 1;
    const id = nextIdRef.current;

    const block: FieldConfig = {
      id,
      type: "header",
      layout: "full",
      label: variant === "subheader" ? "Subheader" : "Header",
      level: variant === "subheader" ? "h3" : "h2",
      ...(type === "spacer" && { type: "spacer", spacerSize: "md", label: "" }),
      name: `${variant}_${id}`,
    };

    setFields((prev) => {
      const copy = [...prev];
      let target = index < 0 ? 0 : index + 1;
      if (target > copy.length) target = copy.length;
      copy.splice(target, 0, block);
      return copy;
    });

    setNewField({ ...defaultField });
    setEditingFieldId(null);
  };

  // ─── Update existing field ───
  const updateField = () => {
    if (!editingFieldId) return;
    setFields((prev) =>
      prev.map((f) =>
        f.id === editingFieldId ? { ...newField, id: editingFieldId } : f
      )
    );

    const defVal = computeDefaultValue(newField);
    if (defVal) {
      setFormData((prev) => ({ ...prev, [newField.name]: defVal }));
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: Record<string, string | null> = {};
    let hasError = false;

    fields.forEach((f) => {
      if (["header", "spacer"].includes(f.type)) return;
      let val = formData[f.name] || "";
      if (!val) {
        val = computeDefaultValue(f);
      }
      const err = runValidators(val, f, { ...formData, [f.name]: val }, fields);
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

    setErrors(newErrors);

    if (hasError) {
      addToast("Form has errors. Please fix them.", "error");
      return;
    }

    addToast("Form submitted successfully!", "success");
    console.log("Form Data:", formData);
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

  return (
    <div className="min-h-screen bg-gray-100 p-8 overflow-visible">
      <h1 className="text-3xl font-bold text-center mb-6">
        Dynamic Form Builder
      </h1>

      <div className="mx-auto w-full max-w-[1280px] space-y-8 overflow-visible">
        {/* Builder */}
        <div className="w-full overflow-visible">
          <FieldBuilder
            newField={newField}
            setNewField={setNewField}
            addField={addField}
            updateField={updateField}
            isEditing={editingFieldId !== null}
            fields={fields}
          />
        </div>

        {/* Preview */}
        {fields.length > 0 && (
          <div className="flex flex-col items-center w-full overflow-visible">
            {/* 🔥 Sticky controls */}
            <div className="sticky top-0 z-10 flex w-full justify-between mb-4 bg-gray-100 py-2">
              {/* Left: Preview toggle */}
              <button
                type="button"
                onClick={() => setIsPreview((p) => !p)}
                className={`px-3 py-1 rounded ${
                  isPreview ? "bg-green-500 text-white" : "bg-gray-200"
                }`}
              >
                {isPreview ? "Preview On" : "Preview Off"}
              </button>

              {/* Right: Width controls */}
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
