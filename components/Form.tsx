"use client";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormType, FORM_CONFIGS, FIELD_LIBRARY } from "@/config/forms.config";
import { FormInput } from "./FormInput";

interface ModularFormProps {
  type: FormType;
  onSubmit: (data: any) => Promise<void>;
}

export const Form: React.FC<ModularFormProps> = ({ type, onSubmit }) => {
  const config = FORM_CONFIGS[type];

  // 1. Dynamically build Zod Schema based on the field list
  const schema = useMemo(() => {
    const shape: Record<string, z.ZodType<any>> = {};

    config.fields.forEach((fieldKey) => {
      const fieldDef = FIELD_LIBRARY[fieldKey];
      shape[fieldDef.name] = fieldDef.schema;
    });

    return z.object(shape);
  }, [config.fields]);

  // 2. Initialize Hook Form with dynamic schema
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      {/* 3. Map through the config fields */}
      {config.fields.map((fieldKey) => {
        const field = FIELD_LIBRARY[fieldKey];
        return (
          <FormInput
            key={field.name}
            name={field.name}
            label={field.label} // <--- Pass Label
            type={field.type}
            placeholder={field.placeholder}
            register={register}
            error={errors[field.name] as any}
            valueAsNumber={field.valueAsNumber} // <--- Pass Number Flag
          />
        );
      })}

      <button
        type="submit"
        className={`${config.submitColor} text-white p-2 rounded w-full font-medium transition-colors`}
      >
        {config.submitLabel}
      </button>
    </form>
  );
};
