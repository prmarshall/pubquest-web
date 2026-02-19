import * as z from "zod";

// 1. Define Identifiers
export enum FormType {
  LOGIN = "LOGIN",
  REGISTER = "REGISTER",
  CHECK_IN = "CHECK_IN", // <--- NEW
  WEBHOOK = "WEBHOOK", // <--- NEW
}

export enum FieldType {
  USERNAME = "USERNAME",
  EMAIL = "EMAIL",
  PASSWORD = "PASSWORD",
  VENUE_ID = "VENUE_ID", // <--- NEW
  AMOUNT_CENTS = "AMOUNT_CENTS", // <--- NEW
}

// 2. Define the Field Library
interface FieldDef {
  name: string;
  label?: string; // Added label support
  placeholder: string;
  type: string;
  valueAsNumber?: boolean; // Added number support
  schema: z.ZodType<any>;
}

export const FIELD_LIBRARY: Record<FieldType, FieldDef> = {
  // ... (Keep existing Auth fields) ...
  [FieldType.USERNAME]: {
    name: "username",
    placeholder: "Username",
    type: "text",
    schema: z.string().min(3, "Username must be 3+ chars"),
  },
  [FieldType.EMAIL]: {
    name: "email",
    placeholder: "Email Address",
    type: "email",
    schema: z.string().email("Invalid email format"),
  },
  [FieldType.PASSWORD]: {
    name: "password",
    placeholder: "Password",
    type: "password",
    schema: z.string().min(4, "Password must be 4+ chars"),
  },

  // --- NEW QUEST FIELDS ---
  [FieldType.VENUE_ID]: {
    name: "venueId",
    label: "Objective A: Location",
    placeholder: "Venue ID (e.g. 1)",
    type: "number",
    valueAsNumber: true,
    schema: z.number().min(1, "Venue ID is required"),
  },
  [FieldType.AMOUNT_CENTS]: {
    name: "amountCents",
    label: "Objective B: Transaction",
    placeholder: "Cents (e.g. 600)",
    type: "number",
    valueAsNumber: true,
    schema: z.number().min(100, "Min spend is 100 cents"),
  },
};

// 3. Form Configs
interface FormConfig {
  fields: FieldType[];
  submitLabel: string;
  submitColor: string;
}

export const FORM_CONFIGS: Record<FormType, FormConfig> = {
  [FormType.LOGIN]: {
    fields: [FieldType.EMAIL, FieldType.PASSWORD],
    submitLabel: "Login",
    submitColor: "bg-blue-600 hover:bg-blue-700",
  },
  [FormType.REGISTER]: {
    fields: [FieldType.USERNAME, FieldType.EMAIL, FieldType.PASSWORD],
    submitLabel: "Create Hero",
    submitColor: "bg-purple-600 hover:bg-purple-700",
  },
  // --- NEW QUEST FORMS ---
  [FormType.CHECK_IN]: {
    fields: [FieldType.VENUE_ID],
    submitLabel: "📍 Check In Here",
    submitColor: "bg-orange-600 hover:bg-orange-500",
  },
  [FormType.WEBHOOK]: {
    fields: [FieldType.AMOUNT_CENTS],
    submitLabel: "💸 Simulate Transaction",
    submitColor: "bg-emerald-600 hover:bg-emerald-500",
  },
};
