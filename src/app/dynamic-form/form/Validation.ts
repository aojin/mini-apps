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
  console.log("Validating:", { name: field.name, value, rules: field });

  // 🚫 Skip structural elements (they never need validation)
  if (["header", "subheader", "spacer"].includes(field.type)) {
    return null;
  }

  // ─── Helper: return with custom error override ───
  const fail = (msg: string) => field.customErrorMessage || msg;

  // ──────────────────────────────────────────────
  // Normalize paradoxical rules
  // ──────────────────────────────────────────────
  if (field.minlength !== undefined && field.minlength < 0) field.minlength = 0;
  if (field.maxlength !== undefined && field.maxlength < 0) field.maxlength = 0;
  if (field.exactLength !== undefined && field.exactLength < 0) field.exactLength = 0;
  if (field.minWords !== undefined && field.minWords < 0) field.minWords = 0;
  if (field.maxWords !== undefined && field.maxWords < 0) field.maxWords = 0;
  if (field.decimalPlaces !== undefined && field.decimalPlaces < 0)
    field.decimalPlaces = 0;

  if (
    field.minlength !== undefined &&
    field.maxlength !== undefined &&
    field.minlength > field.maxlength
  ) {
    field.maxlength = field.minlength;
  }
  if (
    field.minWords !== undefined &&
    field.maxWords !== undefined &&
    field.minWords > field.maxWords
  ) {
    field.maxWords = field.minWords;
  }
  if (
    field.minValue !== undefined &&
    field.maxValue !== undefined &&
    field.minValue > field.maxValue
  ) {
    field.maxValue = field.minValue;
  }
  if (
    field.minDate !== undefined &&
    field.maxDate !== undefined &&
    new Date(field.minDate) > new Date(field.maxDate)
  ) {
    field.maxDate = field.minDate;
  }

  // Step must be positive if defined
  if (field.step !== undefined && field.step !== "any" && Number(field.step) <= 0) {
    field.step = undefined;
  }

  // ──────────────────────────────────────────────
  // Required
  // ──────────────────────────────────────────────
  if (field.required) {
    if (field.type === "select") {
      if (field.multiple) {
        const selected = value ? value.split(",").filter(Boolean) : [];
        if (selected.length === 0) return fail("Please select at least one option");
      } else {
        if (!value || value.trim() === "") return fail("Please select an option");
      }
    } else if (field.type === "radio-group") {
      if (!value || value.trim() === "") return fail("Please select an option");
    } else if (field.type === "checkbox") {
      const selected = value ? value.split(",").filter(Boolean) : [];
      if (selected.length === 0) return fail("At least one option must be selected");
    } else {
      if (!value || value.trim() === "") return fail("This field is required");
    }
  }

  // ──────────────────────────────────────────────
  // Radio sanity check
  // ──────────────────────────────────────────────
  if (field.type === "radio-group" && (!field.options || field.options.length < 2)) {
    return fail("Radio groups must have at least two options");
  }

  // ──────────────────────────────────────────────
  // Text-like fields (incl. textarea)
  // ──────────────────────────────────────────────
  if (["text", "email", "password", "url", "tel", "textarea"].includes(field.type)) {
    if (value) {
      if (field.exactLength !== undefined && value.length !== field.exactLength) {
        return fail(`Must be exactly ${field.exactLength} characters`);
      }
      if (field.minlength !== undefined && value.length < field.minlength) {
        return fail(`Must be at least ${field.minlength} characters`);
      }
      if (field.maxlength !== undefined && value.length > field.maxlength) {
        return fail(`Must be at most ${field.maxlength} characters`);
      }

      if (field.minWords || field.maxWords) {
        const words = value.trim() ? value.trim().split(/\s+/) : [];
        if (field.minWords && words.length < field.minWords) {
          return fail(`Must be at least ${field.minWords} words`);
        }
        if (field.maxWords && words.length > field.maxWords) {
          return fail(`Must be at most ${field.maxWords} words`);
        }
      }

      if (field.alphaOnly && /[^A-Za-z]/.test(value)) {
        return fail("Letters only (A–Z)");
      }
      if (field.noWhitespace && /\s/.test(value)) {
        return fail("No whitespace allowed");
      }
      if (field.uppercaseOnly && value !== value.toUpperCase()) {
        return fail("Must be uppercase only");
      }
      if (field.lowercaseOnly && value !== value.toLowerCase()) {
        return fail("Must be lowercase only");
      }

      if (field.startsWith && !value.startsWith(field.startsWith)) {
        return fail(`Must start with "${field.startsWith}"`);
      }
      if (field.endsWith && !value.endsWith(field.endsWith)) {
        return fail(`Must end with "${field.endsWith}"`);
      }
      if (field.contains && !value.includes(field.contains)) {
        return fail(`Must contain "${field.contains}"`);
      }

      if (field.allowedValues && !field.allowedValues.includes(value)) {
        return fail(`Must be one of: ${field.allowedValues.join(", ")}`);
      }
      if (field.disallowedValues && field.disallowedValues.includes(value)) {
        return fail(`Value "${value}" is not allowed`);
      }

      if (field.pattern) {
        try {
          const regex = new RegExp(field.pattern);
          if (!regex.test(value)) return fail("Invalid format");
        } catch {
          return fail("Invalid regex pattern");
        }
      }
    }
  }

  // ──────────────────────────────────────────────
  // Number fields
  // ──────────────────────────────────────────────
  if (field.type === "number" && value) {
    const num = parseFloat(value);

    const min = field.minValue;
    const max = field.maxValue;
    const step =
      field.step !== undefined && field.step !== "any" ? Number(field.step) : undefined;

    if (Number.isNaN(num)) return fail("Must be a valid number");
    if (min !== undefined && num < min) return fail(`Minimum is ${min}`);
    if (max !== undefined && num > max) return fail(`Maximum is ${max}`);

    if (step !== undefined && !Number.isNaN(step)) {
      const remainder = (num - (min ?? 0)) % step;
      if (Math.abs(remainder) > 1e-9 && Math.abs(remainder - step) > 1e-9) {
        return fail(`Must align with step ${step}`);
      }
    }

    if (field.noNegative && num < 0) return fail("No negative numbers allowed");
    if (field.positiveOnly && num <= 0) return fail("Must be a positive number");
    if (field.integerOnly && !Number.isInteger(num)) return fail("Must be an integer");

    if (field.decimalPlaces !== undefined) {
      const decimals = value.includes(".") ? value.split(".")[1].length : 0;
      if (decimals > field.decimalPlaces) {
        return fail(`Must have at most ${field.decimalPlaces} decimal places`);
      }
    }
  }

  // ──────────────────────────────────────────────
  // Date fields
  // ──────────────────────────────────────────────
  if ((field.type === "date" || field.type === "datetime-local") && value) {
    const dateVal = new Date(value);
    if (field.minDate && dateVal < new Date(field.minDate)) {
      return fail(`Must be on or after ${field.minDate}`);
    }
    if (field.maxDate && dateVal > new Date(field.maxDate)) {
      return fail(`Must be on or before ${field.maxDate}`);
    }
  }

  // ──────────────────────────────────────────────
  // Checkbox groups
  // ──────────────────────────────────────────────
  if (field.type === "checkbox") {
    const selected = value ? value.split(",").filter(Boolean) : [];
    const min = field.minValue;
    const max = field.maxValue;

    if (min !== undefined && selected.length < min) {
      return fail(`Select at least ${min} options`);
    }
    if (max !== undefined && selected.length > max) {
      return fail(`Select no more than ${max} options`);
    }
  }

  // ──────────────────────────────────────────────
  // Select (multi)
  // ──────────────────────────────────────────────
  if (field.type === "select" && field.multiple) {
    const selected = value ? value.split(",").filter(Boolean) : [];
    const min = field.minValue;
    const max = field.maxValue;

    if (min !== undefined && selected.length < min) {
      return fail(`Select at least ${min} options`);
    }
    if (max !== undefined && selected.length > max) {
      return fail(`Select no more than ${max} options`);
    }
  }

  // ──────────────────────────────────────────────
  // File fields
  // ──────────────────────────────────────────────
  if (field.type === "file" && value) {
    if (field.accept) {
      const allowed = field.accept.split(",").map((ext) => ext.trim().toLowerCase());
      const fileExt = value.split(".").pop()?.toLowerCase();
      if (fileExt && !allowed.some((ext) => ext.replace(".", "") === fileExt)) {
        return fail(`File must be one of: ${field.accept}`);
      }
    }

    if (field.multiple && field.maxValue !== undefined) {
      const max = field.maxValue;
      const files = value.split(",").filter(Boolean);
      if (files.length > max) return fail(`You can upload a maximum of ${max} files`);
    }

    if (field.maxFileSizeMB !== undefined) {
      const files = value.split(",").filter(Boolean);
      for (const f of files) {
        const sizeMB = Number(f.split(":").pop());
        if (!isNaN(sizeMB) && sizeMB > field.maxFileSizeMB) {
          return fail(`Each file must be ≤ ${field.maxFileSizeMB} MB`);
        }
      }
    }
  }

  // ──────────────────────────────────────────────
  // Match Field
  // ──────────────────────────────────────────────
  if (field.matchField) {
    const otherVal = context?.[field.matchField];
    if (otherVal === undefined) {
      return fail(`Match field "${field.matchField}" not found in form`);
    }
    if (value !== otherVal) {
      const targetLabel =
        allFields?.find((f) => f.name === field.matchField)?.label ||
        field.matchField;
      return fail(`Must match ${targetLabel}`);
    }
  }

  return null; // ✅ valid
}
