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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold text-green-600">
          ✅ Form Submitted Successfully
        </h2>
        <p className="text-gray-600">Here’s the data that was submitted:</p>

        <div className="border rounded p-4 max-h-[400px] overflow-auto bg-gray-50">
          <dl className="space-y-2">
            {fields
              .filter(
                (f) =>
                  !["header", "spacer"].includes(f.type) // 🚫 skip structural
              )
              .map((field) => {
                const value = data[field.name];
                return (
                  <div
                    key={field.id}
                    className="flex justify-between border-b pb-1"
                  >
                    <dt className="font-medium text-gray-700">
                      {field.label || field.name}
                    </dt>
                    <dd className="text-gray-900">{value || "—"}</dd>
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
