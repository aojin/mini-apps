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
  | "currency"
  | "decimal"
  | "time"
  | "alphanumeric"
  | "slug"
  | "custom";

export interface FieldConfig {
  id: number;
  type: FieldType;
  label: string;
  name: string;
  layout?: "full" | "half";

  // Layout
  align?: "start" | "center" | "end";
  justify?: "start" | "center" | "end" | "between";
  margin?: string;
  padding?: string;

  // Common
  required?: boolean;
  placeholder?: string;

  // Text / input-like fields
  minlength?: number;
  maxlength?: number;
  exactLength?: number;
  pattern?: string;
  maskType?: MaskType;

  // Character restrictions
  alphaOnly?: boolean;
  noWhitespace?: boolean;
  uppercaseOnly?: boolean;
  lowercaseOnly?: boolean;

  // Extra validation
  startsWith?: string;
  endsWith?: string;
  contains?: string;
  minWords?: number;
  maxWords?: number;
  allowedValues?: string[];
  disallowedValues?: string[];
  matchField?: string;
  customErrorMessage?: string;

  // Number
  minValue?: number;
  maxValue?: number;
  step?: number | "any";
  noNegative?: boolean;
  positiveOnly?: boolean;
  integerOnly?: boolean;
  decimalPlaces?: number;

  // Dates
  minDate?: string; // "YYYY-MM-DD" or ISO datetime
  maxDate?: string;

  // Checkbox / Radio / Select
  options?: FieldOption[];
  orientation?: "vertical" | "horizontal";
  isMulti?: boolean;

  // File
  accept?: string;
  multiple?: boolean;
  maxFileSizeMB?: number;

  // Textarea
  rows?: number;
  cols?: number;
}
