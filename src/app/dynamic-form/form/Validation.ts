import { FieldConfig } from "../builder/FieldConfig";

export function runValidators(value: string, field: FieldConfig): string | null {
  // ─── Required ───
  if (field.required) {
    if (field.type === "select" || field.type === "radio-group") {
      if (!value || value.trim() === "") {
        return "Please select an option";
      }
    } else if (field.type === "checkbox") {
      const selected = value ? value.split(",").filter(Boolean) : [];
      if (selected.length === 0) {
        return "At least one option must be selected";
      }
    } else {
      if (!value || value.trim() === "") {
        return "This field is required";
      }
    }
  }

  // ─── Radio group rules ───
  if (field.type === "radio-group" && (!field.options || field.options.length < 2)) {
    return "Radio groups must have at least two options";
  }

  // ─── Text-like fields ───
  if (["text", "email", "password", "url", "tel", "textarea"].includes(field.type)) {
    if (value) {
      if (field.minlength !== undefined && value.length < field.minlength) {
        return `Minimum length is ${field.minlength}`;
      }
      if (field.maxlength !== undefined && value.length > field.maxlength) {
        return `Maximum length is ${field.maxlength}`;
      }
      if (field.pattern) {
        try {
          const regex = new RegExp(field.pattern);
          if (!regex.test(value)) {
            return "Invalid format";
          }
        } catch {
          return "Invalid regex pattern";
        }
      }
    }
  }

  // ─── Number fields ───
  if (field.type === "number" && value) {
    const num = parseFloat(value);

    const min = field.min !== undefined ? Number(field.min) : undefined;
    const max = field.max !== undefined ? Number(field.max) : undefined;
    const step = field.step !== undefined && field.step !== "any" ? Number(field.step) : undefined;

    if (min !== undefined && num < min) {
      return `Minimum is ${min}`;
    }
    if (max !== undefined && num > max) {
      return `Maximum is ${max}`;
    }

    if (step !== undefined && !Number.isNaN(step)) {
      const remainder = (num - (min ?? 0)) % step;
      if (Math.abs(remainder) > 1e-9 && Math.abs(remainder - step) > 1e-9) {
        return `Must align with step ${step}`;
      }
    }
  }

  // ─── Checkbox groups ───
  if (field.type === "checkbox") {
    const selected = value ? value.split(",").filter(Boolean) : [];

    const min = field.min !== undefined ? Number(field.min) : undefined;
    const max = field.max !== undefined ? Number(field.max) : undefined;

    if (min !== undefined && selected.length < min) {
      return `Select at least ${min} options`;
    }
    if (max !== undefined && selected.length > max) {
      return `Select no more than ${max} options`;
    }
  }

  // ─── File fields ───
  if (field.type === "file" && value) {
    if (field.accept) {
      const allowed = field.accept
        .split(",")
        .map((ext) => ext.trim().toLowerCase());

      const fileExt = value.split(".").pop()?.toLowerCase();
      if (fileExt && !allowed.some((ext) => ext.replace(".", "") === fileExt)) {
        return `File must be one of: ${field.accept}`;
      }
    }

    if (field.multiple && field.max !== undefined) {
      const max = Number(field.max);
      const files = value.split(",").filter(Boolean); // assuming multiple file names stored as comma-separated
      if (files.length > max) {
        return `You can upload a maximum of ${max} files`;
      }
    }
  }

  return null;
}
