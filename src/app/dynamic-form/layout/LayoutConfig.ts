import { FieldType } from "../builder/FieldConfig";

interface LayoutDefaults {
  layout: "full" | "half";
  align: "start" | "center" | "end";
  justify: "start" | "center" | "end" | "between";
  margin: string;
  padding: string;
}

export const LayoutConfig: Record<FieldType, LayoutDefaults> = {
  text: {
    layout: "half",
    align: "start",
    justify: "start",
    margin: "mb-4",
    padding: "p-2",
  },
  email: {
    layout: "half",
    align: "start",
    justify: "start",
    margin: "mb-4",
    padding: "p-2",
  },
  number: {
    layout: "half",
    align: "start",
    justify: "start",
    margin: "mb-4",
    padding: "p-2",
  },
  password: {
    layout: "half",
    align: "start",
    justify: "start",
    margin: "mb-4",
    padding: "p-2",
  },
  url: {
    layout: "half",
    align: "start",
    justify: "start",
    margin: "mb-4",
    padding: "p-2",
  },
  tel: {
    layout: "half",
    align: "start",
    justify: "start",
    margin: "mb-4",
    padding: "p-2",
  },
  date: {
    layout: "half",
    align: "start",
    justify: "start",
    margin: "mb-4",
    padding: "p-2",
  },
  "datetime-local": {
    layout: "half",
    align: "start",
    justify: "start",
    margin: "mb-4",
    padding: "p-2",
  },
  file: {
    layout: "full",
    align: "start",
    justify: "start",
    margin: "mb-6",
    padding: "p-2",
  },
  checkbox: {
    layout: "half",
    align: "start",
    justify: "start",
    margin: "mb-2",
    padding: "p-1",
  },
  "radio-group": {
    layout: "half",
    align: "start",
    justify: "start",
    margin: "mb-2",
    padding: "p-1",
  },
  textarea: {
    layout: "half",
    align: "start",
    justify: "start",
    margin: "mb-6",
    padding: "p-2",
  },
  select: {
    layout: "half", // dropdowns usually fit nicely in half width
    align: "start",
    justify: "start",
    margin: "mb-4",
    padding: "p-2",
  },
};
