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

function DynamicFormBuilder() {
  const { addToast } = useToast();

  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [counter, setCounter] = useState(0);

  const [previewWidth, setPreviewWidth] = useState<"sm" | "md" | "lg">("lg");
  const [isMobile, setIsMobile] = useState(false);

  const [newField, setNewField] = useState<FieldConfig>({
    id: 0,
    type: "" as any, // 👈 start empty until user picks
    label: "",
    name: "",
    ...LayoutConfig["text"],
    layout: "full",
    maskType: undefined,
    pattern: undefined,
    maxlength: undefined,
    placeholder: "",
    options: undefined,
  });

  const [editingFieldId, setEditingFieldId] = useState<number | null>(null);

  // ─── Detect screen width for mobile vs desktop ───
  useEffect(() => {
    const checkSize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (mobile) setPreviewWidth("sm");
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // ─── Reset builder form ───
  const resetBuilderForm = () => {
    setNewField({
      id: 0,
      type: "" as any,
      label: "",
      name: "",
      ...LayoutConfig["text"],
      layout: "full",
      maskType: undefined,
      pattern: undefined,
      maxlength: undefined,
      placeholder: "",
      options: undefined,
    });
    setEditingFieldId(null);
  };

  // ─── Add field ───
  const addField = () => {
    if (!newField.label.trim() || !newField.name.trim() || !newField.type) return;
    setCounter((c) => {
      const id = c + 1;
      setFields([...fields, { ...newField, id }]);
      return id;
    });
    resetBuilderForm();
  };

  // ─── Update existing field ───
  const updateField = () => {
    if (!editingFieldId) return;
    setFields((prev) =>
      prev.map((f) =>
        f.id === editingFieldId ? { ...newField, id: editingFieldId } : f
      )
    );
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
  const handleChange = (field: FieldConfig, value: string) => {
    setFormData({ ...formData, [field.name]: value });
    const error = runValidators(value, field);
    setErrors((prev) => ({ ...prev, [field.name]: error }));
  };

  // ─── Submit form ───
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: Record<string, string | null> = {};
    let hasError = false;

    fields.forEach((f) => {
      const error = runValidators(formData[f.name] || "", f);
      newErrors[f.name] = error;
      if (error) hasError = true;
    });

    setErrors(newErrors);

    if (hasError) {
      addToast("Form has errors. Please fix them.", "error");
      return;
    }

    addToast("Form submitted successfully!", "success");
    console.log("Form Data:", formData);
  };

  // ─── Reset form data ───
  const handleReset = () => {
    const clearedData: Record<string, string> = {};
    const clearedErrors: Record<string, string | null> = {};
    fields.forEach((f) => {
      clearedData[f.name] = "";
      clearedErrors[f.name] = null;
    });
    setFormData(clearedData);
    setErrors(clearedErrors);
  };

  // ─── Render ───
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        Dynamic Form Builder
      </h1>

      <div className="mx-auto w-full max-w-[1280px] space-y-8">
        {/* Builder */}
        <div className="w-full">
          <FieldBuilder
            newField={newField}
            setNewField={setNewField}
            addField={addField}
            updateField={updateField}
            isEditing={editingFieldId !== null}
            fields={fields}
          />
        </div>

        {/* Preview section */}
        {fields.length > 0 && (
          <div className="flex flex-col items-center w-full">
            {/* Preview controls */}
            <div className="flex gap-2 mb-4 justify-center">
              <button
                type="button"
                onClick={() => setPreviewWidth("sm")}
                className={`px-3 py-1 rounded ${
                  previewWidth === "sm"
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
                    onClick={() => setPreviewWidth("md")}
                    className={`px-3 py-1 rounded ${
                      previewWidth === "md"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Tablet
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewWidth("lg")}
                    className={`px-3 py-1 rounded ${
                      previewWidth === "lg"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Desktop
                  </button>
                </>
              )}
            </div>

            {/* Preview container */}
            <div
              className={`border rounded bg-gray-50 p-4 transition-all w-full ${
                previewWidth === "sm"
                  ? "max-w-[375px]"
                  : previewWidth === "md"
                  ? "max-w-[768px]"
                  : "max-w-[1280px]"
              }`}
            >
              <FormCanvas
                fields={fields}
                formData={formData}
                errors={errors}
                onChange={handleChange}
                onSubmit={handleSubmit}
                moveField={moveField}
                deleteField={deleteField}
                onEdit={handleEdit}
                previewMode={previewWidth}
                onReset={handleReset}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
