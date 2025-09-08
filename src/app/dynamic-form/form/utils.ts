// /app/dynamic-form/form/utils.ts
import { FieldConfig } from "../builder/FieldConfig";

/**
 * Compute the default value for a given field
 * based on its type and options.
 */
export function computeDefaultValue(field: FieldConfig): string {
  if (field.type === "select" || field.type === "radio-group") {
    return field.options?.find((o) => o.default)?.value ?? "";
  }
  if (field.type === "checkbox") {
    const checkedVals = (field.options ?? [])
      .filter((o) => o.checked)
      .map((o) => o.value);
    return checkedVals.join(",");
  }
  return "";
}
