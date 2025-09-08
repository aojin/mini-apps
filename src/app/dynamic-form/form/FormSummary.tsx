"use client";

import React from "react";
import { FieldConfig } from "../builder/FieldConfig";

export default function FormSummary({
  data,
  fields,
  onClose,
}: {
  data: Record<string, string>;
  fields: FieldConfig[];
  onClose: () => void;
}) {
  // Format preview depending on type
  const renderValue = (field: FieldConfig, rawValue: string | undefined) => {
    if (!rawValue || rawValue.trim() === "") return "—";

    switch (field.type) {
      case "textarea":
        return (
          <pre className="whitespace-pre-wrap bg-white border rounded p-2 text-sm max-h-40 overflow-auto">
            {rawValue}
          </pre>
        );

      case "checkbox": {
        const selected = rawValue.split(",").filter(Boolean);
        if (!field.options) return selected.join(", ") || "—";
        return (
          <ul className="list-disc list-inside space-y-1 text-sm">
            {field.options
              .filter((opt) => selected.includes(opt.value))
              .map((opt, idx) => (
                <li key={idx}>{opt.label}</li>
              ))}
          </ul>
        );
      }

      case "radio-group":
      case "select": {
        if (!field.options) return rawValue;
        const match = field.options.find((opt) => opt.value === rawValue);
        return match ? match.label : rawValue;
      }

      case "file": {
        let files: { name: string; sizeMB: number }[] = [];
        try {
          files = JSON.parse(rawValue);
        } catch {
          if (rawValue.trim()) {
            files = [{ name: rawValue.trim(), sizeMB: 0 }];
          }
        }
        return files.length ? (
          <ul className="list-disc list-inside space-y-1 text-sm">
            {files.map((f, idx) => (
              <li key={idx}>
                {f.name}{" "}
                <span className="text-gray-500 text-xs">
                  {f.sizeMB ? `${f.sizeMB} MB` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          "—"
        );
      }

      case "currency": {
        const num = parseFloat(rawValue);
        if (isNaN(num)) return rawValue;
        return num.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: field.decimalPlaces ?? 2,
          maximumFractionDigits: field.decimalPlaces ?? 2,
        });
      }

      case "number": {
        const num = parseFloat(rawValue);
        if (isNaN(num)) return rawValue;

        // If field config enforces decimal places, respect it
        if (field.decimalPlaces !== undefined) {
          return num.toLocaleString("en-US", {
            minimumFractionDigits: field.decimalPlaces,
            maximumFractionDigits: field.decimalPlaces,
          });
        }

        // Otherwise, preserve decimals from input if present
        const hasDecimals = rawValue.includes(".");
        return num.toLocaleString("en-US", {
          minimumFractionDigits: hasDecimals ? 2 : 0,
          maximumFractionDigits: 6,
        });
      }

      case "date": {
        return new Date(rawValue).toLocaleDateString();
      }

      case "datetime-local": {
        return new Date(rawValue).toLocaleString();
      }

      default:
        return rawValue;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold text-green-600">
          ✅ Form Submitted Successfully
        </h2>
        <p className="text-gray-600">Here’s the data that was submitted:</p>

        <div className="border rounded p-4 max-h-[400px] overflow-auto bg-gray-50">
          <dl className="space-y-3">
            {fields
              .filter((f) => !["header", "spacer"].includes(f.type))
              .map((field) => {
                const value = data[field.name];
                return (
                  <div key={field.id} className="flex flex-col border-b pb-2">
                    <dt className="font-medium text-gray-700 mb-1">
                      {field.label || field.name}
                    </dt>
                    <dd className="text-gray-900 text-sm">
                      {renderValue(field, value)}
                    </dd>
                  </div>
                );
              })}
          </dl>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
