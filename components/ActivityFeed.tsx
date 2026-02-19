"use client";
import React, { useState } from "react";
import { CheckInHistory } from "@/components/CheckInHistory";
import { GoldHistory } from "@/components/GoldHistory"; // Using the component we made earlier

type Tab = "VISITS" | "LEDGER";

export const ActivityFeed = () => {
  const [activeTab, setActiveTab] = useState<Tab>("VISITS");

  return (
    <div className="mt-4 flex flex-col gap-3">
      {/* --- TAB HEADER --- */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab("VISITS")}
          className={`flex-1 pb-2 text-xs font-bold uppercase tracking-wide transition-colors ${
            activeTab === "VISITS"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          📍 Visits
        </button>
        <button
          onClick={() => setActiveTab("LEDGER")}
          className={`flex-1 pb-2 text-xs font-bold uppercase tracking-wide transition-colors ${
            activeTab === "LEDGER"
              ? "text-yellow-600 border-b-2 border-yellow-600"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          💰 Ledger
        </button>
      </div>

      {/* --- TAB CONTENT --- */}
      <div className="min-h-[150px]">
        {activeTab === "VISITS" ? (
          <CheckInHistory />
        ) : (
          <div className="bg-yellow-50/50 rounded-lg p-1">
            {/* We wrap GoldHistory to style it slightly differently if needed */}
            <GoldHistory />
          </div>
        )}
      </div>
    </div>
  );
};
