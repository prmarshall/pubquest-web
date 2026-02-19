"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Form } from "./Form";
import { FormType } from "@/config/forms.config";

export const AuthForms = () => {
  const { login, register } = useAuth();
  const [authMode, setAuthMode] = useState<FormType>(FormType.LOGIN);

  return (
    <section className="border p-4 rounded bg-white shadow-sm">
      {/* HEADER / TOGGLE */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-gray-700">1. Authentication</h2>
        <div className="text-xs space-x-2">
          <button
            onClick={() => setAuthMode(FormType.LOGIN)}
            className={`px-2 py-1 rounded ${
              authMode === FormType.LOGIN
                ? "bg-blue-100 text-blue-700 font-bold"
                : "text-gray-500"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setAuthMode(FormType.REGISTER)}
            className={`px-2 py-1 rounded ${
              authMode === FormType.REGISTER
                ? "bg-blue-100 text-blue-700 font-bold"
                : "text-gray-500"
            }`}
          >
            Register
          </button>
        </div>
      </div>

      {/* RENDER THE SELECTED FORM */}
      {authMode === FormType.LOGIN ? (
        <Form type={FormType.LOGIN} onSubmit={login} />
      ) : (
        <Form type={FormType.REGISTER} onSubmit={register} />
      )}
    </section>
  );
};
