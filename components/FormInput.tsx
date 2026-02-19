import React from "react";
import { UseFormRegister, FieldError } from "react-hook-form";

const INPUT_STYLE = "border border-gray-300 p-2 rounded w-full text-black";

interface FormInputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  register: UseFormRegister<any>;
  name: string;
  error?: FieldError;
  valueAsNumber?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  placeholder,
  type = "text",
  register,
  name,
  error,
  valueAsNumber,
}) => (
  <div className="w-full">
    {label && (
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
    )}
    <input
      type={type}
      placeholder={placeholder}
      className={INPUT_STYLE}
      {...register(name, { valueAsNumber })}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
  </div>
);
