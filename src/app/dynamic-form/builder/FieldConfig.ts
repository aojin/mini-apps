export type FieldType =
  | "text"
  | "email"
  | "number"
  | "password"
  | "url"
  | "tel"
  | "date"
  | "datetime-local"
  | "file"
  | "checkbox"
  | "radio-group"
  | "textarea"
  | "select";

export interface FieldOption {
  label: string;
  value: string;
  checked?: boolean;   // used for checkbox
  default?: boolean;   // used for radio-group & select
}

export type MaskType =
  | "creditCard"
  | "ssn"
  | "zip"
  | "usPostal"
  | "tel"
  | "email"
  | "url"
  | "alpha"    
  | "custom";

export interface FieldConfig {
  id: number;
  type: FieldType;
  label: string;
  name: string;
  layout?: "full" | "half";

  // ─── Layout styling ───
  align?: "start" | "center" | "end";
  justify?: "start" | "center" | "end" | "between";
  margin?: string;  // Tailwind margin classes like "m-2" or "mt-4"
  padding?: string; // Tailwind padding classes like "p-2" or "px-4"

  // ─── Common ───
  required?: boolean;
  placeholder?: string;

  // ─── Text-like ───
  minlength?: number;
  maxlength?: number;

  // Regex pattern for validation (not formatting)
  pattern?: string;

  // Masking (applies live as user types)
  maskType?: MaskType;

  // ─── Number / Date ───
  min?: number | string;
  max?: number | string;
  step?: number | "any";

  // ─── Checkbox / Radio / Select ───
  options?: FieldOption[];
  orientation?: "vertical" | "horizontal";
  isMulti?: boolean;

  // ─── File ───
  accept?: string;
  multiple?: boolean;

  // ─── Textarea ───
  rows?: number;
  cols?: number;
}
