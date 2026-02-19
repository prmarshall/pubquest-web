"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { AuthForms } from "./AuthForms";

export const AuthSection = () => {
  const { user, logout } = useAuth();

  // 1. Logged Out View
  if (!user) {
    return <AuthForms />;
  }

  // 2. Logged In View
  return (
    <section className="border p-4 rounded bg-white shadow-sm">
      <h2 className="font-bold text-gray-700 mb-3">1. Authentication</h2>

      <div className="flex flex-col gap-3">
        {/* User Card */}
        <div className="flex justify-between items-center bg-green-50 border border-green-200 p-3 rounded">
          <div>
            <p className="text-green-800 font-bold">
              Logged in as {user.username}
            </p>
            <p className="text-xs text-green-600">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="text-red-600 text-xs font-semibold hover:underline"
          >
            Logout
          </button>
        </div>
      </div>
    </section>
  );
};
