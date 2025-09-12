// app/dynamic-form/components/Collapsible.tsx
"use client";
import React from "react";

type CollapsibleProps = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  right?: React.ReactNode;
};

export default function Collapsible({
  title,
  defaultOpen = false,
  children,
  right,
}: CollapsibleProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const id = React.useId();

  return (
    <div className="w-full border border-gray-200 rounded-lg">
      {/* Header */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left bg-gray-50 hover:bg-gray-100"
      >
        <div className="flex items-center gap-2">
          <svg
            className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-semibold">{title}</span>
        </div>
        {right ?? null}
      </button>

      {/* Content */}
      <div
        id={id}
        className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out ${
          open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-90"
        }`}
      >
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
