import { FieldConfig } from "../builder/FieldConfig";

/**
 * Unified validator for all field types.
 * Runs in both live validation (FieldRenderer) and form submission.
 */
export function runValidators(
  value: string,
  field: FieldConfig,
  context?: Record<string, string>,
  allFields?: FieldConfig[]
): string | null {
  // 🚫 Structural fields never validated
  if (["header", "spacer"].includes(field.type)) return null;

  // ─── Helpers ───
  const fail = (msg: string) => field.customErrorMessage || msg;
  const normalizeVal = (val: string): string => {
    if (
      field.type === "number" ||
      field.type === "currency" ||
      field.maskType === "currency" ||
      field.maskType === "decimal"
    ) {
      const num = parseFloat(val.replace(/[^0-9.-]/g, ""));
      return isNaN(num) ? val.trim() : String(num);
    }
    return val.trim();
  };

  // ─── Rule normalization (avoid paradoxes) ───
  if (field.minlength! < 0) field.minlength = 0;
  if (field.maxlength! < 0) field.maxlength = 0;
  if (field.exactLength! < 0) field.exactLength = 0;
  if (field.minWords! < 0) field.minWords = 0;
  if (field.maxWords! < 0) field.maxWords = 0;
  if (field.decimalPlaces! < 0) field.decimalPlaces = 0;

  if (field.minlength && field.maxlength && field.minlength > field.maxlength)
    field.maxlength = field.minlength;
  if (field.minWords && field.maxWords && field.minWords > field.maxWords)
    field.maxWords = field.minWords;
  if (field.minValue && field.maxValue && field.minValue > field.maxValue)
    field.maxValue = field.minValue;
  if (field.minDate && field.maxDate && new Date(field.minDate) > new Date(field.maxDate))
    field.maxDate = field.minDate;
  if (field.step !== undefined && field.step !== "any" && Number(field.step) <= 0)
    field.step = undefined;

  // ──────────────────────────────────────────────
  // Required
  // ──────────────────────────────────────────────
  if (field.required) {
    if (field.type === "select") {
      if (field.multiple) {
        const selected = value ? value.split(",").filter(Boolean) : [];
        if (!selected.length) return fail("Please select at least one option");
      } else if (!value.trim()) {
        return fail("Please select an option");
      }
    } else if (field.type === "radio-group" && !value.trim()) {
      return fail("Please select an option");
    } else if (field.type === "checkbox") {
      const selected = value ? value.split(",").filter(Boolean) : [];
      if (!selected.length) return fail("At least one option must be selected");
    } else if (field.type === "file") {
      const files = parseFiles(value);
      if (!files.length) return fail("Please upload a file");
    } else if (!value.trim()) {
      return fail("This field is required");
    }
  }

  // ──────────────────────────────────────────────
  // Radio sanity
  // ──────────────────────────────────────────────
  if (field.type === "radio-group" && (!field.options || field.options.length < 2)) {
    return fail("Radio groups must have at least two options");
  }

  // ──────────────────────────────────────────────
  // Text-like fields
  // ──────────────────────────────────────────────
  if (["text", "email", "password", "url", "tel", "textarea"].includes(field.type) && value) {
    // Length
    if (field.exactLength && value.length !== field.exactLength)
      return fail(`Must be exactly ${field.exactLength} characters`);
    if (field.minlength && value.length < field.minlength)
      return fail(`Must be at least ${field.minlength} characters`);
    if (field.maxlength && value.length > field.maxlength)
      return fail(`Must be at most ${field.maxlength} characters`);

    // Words
    if (field.minWords || field.maxWords) {
      const words = value.trim() ? value.trim().split(/\s+/) : [];
      if (field.minWords && words.length < field.minWords)
        return fail(`Must be at least ${field.minWords} words`);
      if (field.maxWords && words.length > field.maxWords)
        return fail(`Must be at most ${field.maxWords} words`);
    }

    // Character rules
    if (field.alphaOnly && !/^[A-Za-z \n\r]*$/.test(value))
      return fail("Letters only (A–Z, spaces, and line breaks)");
    if (field.maskType === "alphanumeric" && !/^[A-Za-z0-9 \n\r]*$/.test(value))
      return fail("Letters and numbers only (spaces and line breaks allowed)");
    if (field.noWhitespace && /\s/.test(value)) return fail("No whitespace allowed");
    if (field.uppercaseOnly && value !== value.toUpperCase())
      return fail("Must be uppercase only");
    if (field.lowercaseOnly && value !== value.toLowerCase())
      return fail("Must be lowercase only");

    // startsWith / endsWith / contains
    let target = value;
    if (field.type === "url") {
      if (!/^https?:\/\//i.test(value)) return fail("URL must start with http:// or https://");
      try {
        const urlObj = new URL(value);
        target = urlObj.hostname + urlObj.pathname;
      } catch {
        return fail("Invalid URL format");
      }
    } else if (field.type === "email") {
      target = value.split("@")[0];
    }

    if (field.startsWith && !target.startsWith(field.startsWith))
      return fail(`Must start with "${field.startsWith}"`);
    if (field.endsWith && !target.endsWith(field.endsWith))
      return fail(`Must end with "${field.endsWith}"`);
    if (field.contains && !target.includes(field.contains))
      return fail(`Must contain "${field.contains}"`);

    // Allowed / disallowed
    if (field.allowedValues) {
      const normalized = normalizeVal(value);
      const allowed = field.allowedValues.map((v) => normalizeVal(v));
      if (!allowed.includes(normalized))
        return fail(`Must be one of: ${field.allowedValues.join(", ")}`);
    }
    if (field.disallowedValues) {
      const normalized = normalizeVal(value);
      const disallowed = field.disallowedValues.map((v) => normalizeVal(v));
      if (disallowed.includes(normalized)) return fail(`Value "${value}" is not allowed`);
    }

    // Regex
    if (field.pattern) {
      try {
        const regex = new RegExp(field.pattern);
        if (!regex.test(value)) return fail("Invalid format");
      } catch {
        return fail("Invalid regex pattern");
      }
    }
  }

  // ──────────────────────────────────────────────
  // Numbers / Currency
  // ──────────────────────────────────────────────
  if ((field.type === "number" || field.type === "currency" || field.maskType === "decimal") && value) {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ""));
    if (isNaN(num)) return fail("Must be a valid number");

    if (field.minValue !== undefined && num < field.minValue)
      return fail(`Minimum is ${field.minValue}`);
    if (field.maxValue !== undefined && num > field.maxValue)
      return fail(`Maximum is ${field.maxValue}`);

    if (field.noNegative && num < 0) return fail("No negative numbers allowed");
    if (field.positiveOnly && num <= 0) return fail("Must be a positive number");
    if (field.integerOnly && !Number.isInteger(num)) return fail("Must be an integer");

    if (field.decimalPlaces !== undefined) {
      const decimals = value.includes(".") ? value.split(".")[1].length : 0;
      if (decimals > field.decimalPlaces)
        return fail(`Maximum ${field.decimalPlaces} decimal places allowed`);
    }

    if (field.step !== undefined && field.step !== "any") {
      const step = Number(field.step);
      if (!isNaN(step) && step > 0) {
        const offset = field.minValue ?? 0;
        const remainder = (num - offset) % step;
        const epsilon = 1e-9;
        if (Math.abs(remainder) > epsilon && Math.abs(remainder - step) > epsilon)
          return fail(`Must align with step of ${step}`);
      }
    }

    if (field.allowedValues) {
      const normalized = normalizeVal(String(num));
      const allowed = field.allowedValues.map((v) => normalizeVal(v));
      if (!allowed.includes(normalized))
        return fail(`Allowed values: ${field.allowedValues.join(", ")}`);
    }
    if (field.disallowedValues) {
      const normalized = normalizeVal(String(num));
      const disallowed = field.disallowedValues.map((v) => normalizeVal(v));
      if (disallowed.includes(normalized)) return fail(`Value ${num} is not allowed`);
    }
  }

  // ──────────────────────────────────────────────
  // Dates
  // ──────────────────────────────────────────────
  if ((field.type === "date" || field.type === "datetime-local") && value) {
    const dateVal = new Date(value);
    if (field.minDate && dateVal < new Date(field.minDate))
      return fail(`Must be on or after ${field.minDate}`);
    if (field.maxDate && dateVal > new Date(field.maxDate))
      return fail(`Must be on or before ${field.maxDate}`);
  }

  // ──────────────────────────────────────────────
  // Checkbox & Multi-select
  // ──────────────────────────────────────────────
  if (field.type === "checkbox" || (field.type === "select" && field.multiple)) {
    const selected = value ? value.split(",").filter(Boolean) : [];
    if (field.minValue !== undefined && selected.length < field.minValue)
      return fail(`Select at least ${field.minValue} options`);
    if (field.maxValue !== undefined && selected.length > field.maxValue)
      return fail(`Select no more than ${field.maxValue} options`);
  }

  // ──────────────────────────────────────────────
  // Files
  // ──────────────────────────────────────────────
  if (field.type === "file" && value) {
    const files = parseFiles(value);

    if (field.accept && files.length > 0) {
      const allowed = field.accept.split(",").map((ext) => ext.trim().toLowerCase());
      for (const f of files) {
        const ext = f.name.split(".").pop()?.toLowerCase();
        if (ext && !allowed.some((a) => a.replace(".", "") === ext))
          return fail(`File must be one of: ${field.accept}`);
      }
    }

    if (field.multiple && field.maxValue !== undefined && files.length > field.maxValue)
      return fail(`You can upload a maximum of ${field.maxValue} files`);

    if (field.maxFileSizeMB !== undefined) {
      for (const f of files) {
        if (f.sizeMB > field.maxFileSizeMB)
          return fail(`Each file must be ≤ ${field.maxFileSizeMB} MB`);
      }
    }
  }

  // ──────────────────────────────────────────────
  // Match Field
  // ──────────────────────────────────────────────
  if (field.matchField) {
    const otherVal = context?.[field.matchField];
    if (otherVal === undefined) return fail(`Match field "${field.matchField}" not found in form`);
    if (normalizeVal(value) !== normalizeVal(otherVal)) {
      const targetLabel = allFields?.find((f) => f.name === field.matchField)?.label || field.matchField;
      return fail(`Must match ${targetLabel}`);
    }
  }

  return null; // ✅ valid
}

// ─── File parser helper ───
function parseFiles(value: string): { name: string; sizeMB: number }[] {
  try {
    return value ? (JSON.parse(value) as { name: string; sizeMB: number }[]) : [];
  } catch {
    // fallback: treat raw string as single file
    return value.trim() ? [{ name: value.trim(), sizeMB: 0 }] : [];
  }
}
