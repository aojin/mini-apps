"use client";

import React, { useState } from "react";
import { FieldConfig, FieldType } from "./FieldConfig";
import { LayoutConfig } from "../layout/LayoutConfig";
import MaskingBuilder from "./MaskingBuilder";
import ValidationBuilder from "./ValidationBuilder";
import OptionsBuilder from "./OptionsBuilder";

export default function FieldBuilder({
  fields,
  newField,
  setNewField,
  addField,
  updateField,
  isEditing,
}: {
  fields: FieldConfig[];
  newField: FieldConfig;
  setNewField: (f: FieldConfig) => void;
  addField: () => void;
  updateField: () => void;
  isEditing: boolean;
}) {
  const [error, setError] = useState<string | null>(null);

  // ─── Reset builder form ───
  const resetBuilderForm = () => {
    setNewField({
      id: 0,
      type: "" as any, // start empty
      label: "",
      name: "",
      ...LayoutConfig["text"], // fallback to "text" defaults
      maskType: undefined,
      pattern: undefined,
      maxlength: undefined,
      placeholder: "",
      options: undefined,
    });
    setError(null);
  };

  // ─── Validation ───
  const validateNewField = (): boolean => {
    if (!newField.type) {
      setError("Type is required.");
      return false;
    }
    if (!newField.name.trim()) {
      setError("Name (key) is required.");
      return false;
    }
    if (!newField.label.trim()) {
      setError("Label is required.");
      return false;
    }

    // Prevent duplicate names (ignore current editing field)
    if (fields.some((f) => f.name === newField.name && f.id !== newField.id)) {
      setError(`Field name "${newField.name}" is already in use.`);
      return false;
    }

    // Enforce option rules
    if (newField.type === "radio-group") {
      if (!newField.options || newField.options.length < 2) {
        setError("Radio groups must have at least 2 options.");
        return false;
      }
    }
    if (["checkbox", "select"].includes(newField.type)) {
      if (!newField.options || newField.options.length < 1) {
        setError(`${newField.type} fields must have at least 1 option.`);
        return false;
      }
    }

    setError(null);
    return true;
  };

  // ─── Save handler ───
  const handleSave = () => {
    if (!validateNewField()) return;
    if (isEditing) {
      updateField();
    } else {
      addField();
    }
    resetBuilderForm();
  };

  // ─── Handle type change ───
  const handleTypeChange = (newType: FieldType | "") => {
    if (!newType) {
      resetBuilderForm();
      return;
    }

    setNewField({
      ...newField,
      type: newType,
      ...LayoutConfig[newType], // ← respects default layout
      maskType: undefined,
      pattern: undefined,
      maxlength: undefined,
      placeholder: "",
      ...(newType === "radio-group"
        ? {
            options: [
              { label: "Option 1", value: "opt1" },
              { label: "Option 2", value: "opt2" },
            ],
            orientation: "vertical",
          }
        : newType === "checkbox"
        ? {
            options: [{ label: "Option 1", value: "opt1" }],
            orientation: "vertical",
          }
        : newType === "select"
        ? {
            options: [{ label: "Option 1", value: "opt1" }],
          }
        : {}),
    });
  };

  // ─── Disable save button if incomplete ───
  const isSaveDisabled =
    !newField.type || !newField.name.trim() || !newField.label.trim();

  // ─── Render ───
  return (
    <div className="bg-white p-6 rounded-2xl shadow mb-8 space-y-4 w-full">
      <h2 className="text-xl font-semibold">
        {isEditing ? "Edit Field" : "Add Field"}
      </h2>

      {/* ─── Basic setup inputs ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Field type */}
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            className="border p-2 rounded w-full"
            value={newField.type || ""}
            onChange={(e) => handleTypeChange(e.target.value as FieldType)}
          >
            <option value="">-- Select field type --</option>
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="number">Number</option>
            <option value="password">Password</option>
            <option value="url">URL</option>
            <option value="tel">Telephone</option>
            <option value="date">Date</option>
            <option value="datetime-local">DateTime</option>
            <option value="file">File</option>
            <option value="checkbox">Checkbox</option>
            <option value="radio-group">Radio Group</option>
            <option value="textarea">Textarea</option>
            <option value="select">Select</option>
          </select>
        </div>

        {/* Layout */}
        <div>
          <label className="block text-sm font-medium mb-1">Layout</label>
          <select
            className="border p-2 rounded w-full"
            value={newField.layout || "full"}
            onChange={(e) =>
              setNewField({
                ...newField,
                layout: e.target.value as "full" | "half",
              })
            }
          >
            <option value="full">Full width</option>
            <option value="half">Half width</option>
          </select>
        </div>

        {/* Name (key) */}
        <div>
          <label className="block text-sm font-medium mb-1">Name (key)</label>
          <input
            type="text"
            className={`border p-2 rounded w-full ${
              error?.includes("Name") || error?.includes("in use")
                ? "border-red-500"
                : ""
            }`}
            value={newField.name}
            onChange={(e) =>
              setNewField({ ...newField, name: e.target.value })
            }
          />
        </div>

        {/* Label */}
        <div>
          <label className="block text-sm font-medium mb-1">Label</label>
          <input
            type="text"
            className={`border p-2 rounded w-full ${
              error?.includes("Label") ? "border-red-500" : ""
            }`}
            value={newField.label}
            onChange={(e) =>
              setNewField({ ...newField, label: e.target.value })
            }
          />
        </div>
      </div>

      {/* Options builder (checkbox, radio, select) */}
      {["checkbox", "radio-group", "select"].includes(newField.type) && (
        <OptionsBuilder field={newField} setField={setNewField} />
      )}

      {/* Masking */}
      {newField.type && (
        <MaskingBuilder field={newField} setField={setNewField} />
      )}

      {/* Validation */}
      {newField.type && (
        <ValidationBuilder field={newField} setField={setNewField} />
      )}

      {/* Error display */}
      {error && (
        <p className="text-red-600 text-sm font-medium border border-red-300 bg-red-50 px-3 py-2 rounded">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaveDisabled}
          className={`px-4 py-2 rounded text-white ${
            isSaveDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : isEditing
              ? "bg-green-500 hover:bg-green-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isEditing ? "Update Field" : "Add Field"}
        </button>
        <button
          type="button"
          onClick={resetBuilderForm}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          Clear Builder Form
        </button>
      </div>
    </div>
  );
}
