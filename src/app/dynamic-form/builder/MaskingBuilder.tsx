"use client";

import React, { useEffect } from "react";
import { FieldConfig, MaskType } from "./FieldConfig";

export default function MaskingBuilder({
  field,
  setField,
}: {
  field: FieldConfig;
  setField: (f: FieldConfig) => void;
}) {
  const handleMaskChange = (maskType: MaskType | "") => {
    let pattern: string | undefined;
    let maxlength: number | undefined;
    let placeholder: string | undefined;

    switch (maskType) {
      case "alpha":
        pattern = "^[A-Za-z]+$";
        placeholder = "Letters only";
        // don't force a maxlength, but allow editing below
        break;
      case "creditCard":
        pattern = "^\\d{4}\\s\\d{4}\\s\\d{4}\\s\\d{4}$";
        maxlength = 19;
        placeholder = "1234 5678 9012 3456";
        break;
      case "ssn":
        pattern = "^\\d{3}-\\d{2}-\\d{4}$";
        maxlength = 11;
        placeholder = "123-45-6789";
        break;
      case "zip":
        pattern = "^\\d{5}$";
        maxlength = 5;
        placeholder = "12345";
        break;
      case "usPostal":
        pattern = "^\\d{5}-\\d{4}$";
        maxlength = 10;
        placeholder = "12345-6789";
        break;
      default:
        pattern = undefined;
        maxlength = undefined;
        placeholder = ""; // 🧹 reset when "None"
    }

    setField({
      ...field,
      maskType: maskType || undefined,
      pattern,
      maxlength,
      placeholder,
    });
  };

  // 🔹 Auto-apply regex rules for tel, email, url
  useEffect(() => {
    if (field.type === "tel") {
      setField({
        ...field,
        maskType: "tel",
        pattern: "^\\(\\d{3}\\) \\d{3}-\\d{4}$",
        maxlength: 14,
        placeholder: "(123) 456-7890",
      });
    }
    if (field.type === "email") {
      setField({
        ...field,
        maskType: "email",
        pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
        placeholder: "name@example.com",
      });
    }
    if (field.type === "url") {
      setField({
        ...field,
        maskType: "url",
        pattern: "^https?:\\/\\/.+",
        placeholder: "https://example.com",
      });
    }
  }, [field.type]);

  const isPresetSelected = !!field.maskType;

  // 🎯 Only show card if masking applies
  const supportsMasking = ["text", "tel", "email", "url", "textarea"].includes(
    field.type
  );

  if (!supportsMasking) return null;

  return (
    <div className="bg-blue-50 p-6 rounded-xl space-y-6 border border-blue-200 w-full">
      <h3 className="font-semibold text-lg text-blue-700">Input Masking</h3>

      {/* Preset masks (for text fields) */}
      {field.type === "text" && (
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Preset Mask
          </label>
          <select
            className="border p-2 rounded w-full"
            value={field.maskType ?? ""}
            onChange={(e) => handleMaskChange(e.target.value as MaskType)}
          >
            <option value="">None</option>
            <option value="alpha">Alpha Only</option>
            <option value="creditCard">Credit Card</option>
            <option value="ssn">SSN</option>
            <option value="zip">ZIP Code</option>
            <option value="usPostal">US Postal</option>
          </select>
        </div>
      )}

      {/* Max length — allow for alpha and for non-preset text/textarea */}
      {((field.maskType === "alpha") ||
        (!isPresetSelected && ["text", "textarea"].includes(field.type))) && (
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Maximum characters (hard limit)
          </label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={field.maxlength ?? ""}
            onChange={(e) =>
              setField({
                ...field,
                maxlength: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
          />
        </div>
      )}

      {/* Placeholder (always editable, descriptive helper only in builder UI) */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Placeholder
        </label>
        <input
          type="text"
          className="border p-2 rounded w-full"
          placeholder="Enter custom placeholder text"
          value={field.placeholder ?? ""}
          onChange={(e) => setField({ ...field, placeholder: e.target.value })}
        />
      </div>
    </div>
  );
}
