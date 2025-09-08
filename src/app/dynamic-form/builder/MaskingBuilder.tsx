"use client";

import React, { useEffect } from "react";
import { MaskType } from "./FieldConfig";
import { BuilderFieldConfig } from "./FieldBuilder"; // ✅ import the builder type

export default function MaskingBuilder({
  field,
  setField,
}: {
  field: BuilderFieldConfig;
  setField: (f: BuilderFieldConfig) => void;
}) {
  const handleMaskChange = (maskType: MaskType | "") => {
    let pattern: string | undefined;
    let maxlength: number | undefined;
    let placeholder: string | undefined;

    switch (maskType) {
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
      case "currency":
        pattern = "^\\$?\\d+(,\\d{3})*(\\.\\d{2})?$";
        placeholder = "$1,234.56";
        break;
      case "decimal":
        pattern = "^\\d+(\\.\\d+)?$";
        placeholder = "123.45";
        break;
      case "time":
        pattern = "^([01]?\\d|2[0-3]):[0-5]\\d$";
        placeholder = "HH:mm (24h)";
        break;
      case "alphanumeric":
        pattern = "^[A-Za-z0-9]+$";
        placeholder = "abc123";
        break;
      case "slug":
        pattern = "^[a-z0-9]+(?:-[a-z0-9]+)*$";
        placeholder = "my-custom-slug";
        break;
      case "custom":
        pattern = field.pattern || "";
        placeholder = field.placeholder || "";
        break;
      default:
        pattern = undefined;
        maxlength = undefined;
        placeholder = "";
    }

    setField({
      ...field,
      maskType: maskType || undefined,
      pattern,
      maxlength,
      placeholder,
      decimalPlaces: maskType === "decimal" ? field.decimalPlaces : undefined,
    });
  };

  // 🔹 Auto-apply regex rules for tel, email, url
  useEffect(() => {
    if (field.type === "tel" && field.maskType !== "tel") {
      setField({
        ...field,
        maskType: "tel",
        pattern: "^\\(\\d{3}\\) \\d{3}-\\d{4}$",
        maxlength: 14,
        placeholder: "(123) 456-7890",
      });
    }

    if (field.type === "email" && field.maskType !== "email") {
      setField({
        ...field,
        maskType: "email",
        pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
        placeholder: "name@example.com",
      });
    }

    if (field.type === "url" && field.maskType !== "url") {
      setField({
        ...field,
        maskType: "url",
        pattern: "^https?:\\/\\/.+",
        placeholder: "https://example.com",
      });
    }
  }, [field.type, field.maskType]); // ✅ only rerun if type or maskType changes

  const isPresetSelected = !!field.maskType && field.maskType !== "custom";
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
            <option value="creditCard">Credit Card</option>
            <option value="ssn">SSN</option>
            <option value="zip">ZIP Code</option>
            <option value="usPostal">US Postal</option>
            <option value="currency">Currency</option>
            <option value="decimal">Decimal Number</option>
            <option value="time">Time (HH:mm)</option>
            <option value="alphanumeric">Alphanumeric</option>
            <option value="slug">Slug (kebab-case)</option>
            <option value="custom">Custom (manual regex)</option>
          </select>
        </div>
      )}

      {/* Decimal precision selector */}
      {field.maskType === "decimal" && (
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Decimal Places Allowed
          </label>
          <select
            className="border p-2 rounded w-full"
            value={field.decimalPlaces ?? ""}
            onChange={(e) =>
              setField({
                ...field,
                decimalPlaces: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
          >
            <option value="">Any</option>
            <option value="1">1 place</option>
            <option value="2">2 places</option>
            <option value="3">3 places</option>
            <option value="4">4 places</option>
          </select>
        </div>
      )}

      {/* Custom regex input */}
      {field.maskType === "custom" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Custom Regex Pattern
          </label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            placeholder="Enter regex (e.g. ^[A-Z]{3}\\d{2}$)"
            value={field.pattern ?? ""}
            onChange={(e) => setField({ ...field, pattern: e.target.value })}
          />
        </div>
      )}

      {/* Placeholder */}
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

      {/* Character restriction checkboxes */}
      {!isPresetSelected && field.maskType !== "custom" && (
        <div className="flex flex-wrap gap-4 text-sm text-blue-700">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={field.alphaOnly || false}
              onChange={(e) =>
                setField({ ...field, alphaOnly: e.target.checked })
              }
            />
            Alpha only (A–Z)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={field.noWhitespace || false}
              onChange={(e) =>
                setField({ ...field, noWhitespace: e.target.checked })
              }
            />
            No whitespace (single word)
          </label>
        </div>
      )}
    </div>
  );
}
