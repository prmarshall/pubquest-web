"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";

const API_URL = "http://localhost:3000/api";

interface LedgerEntry {
  id: number;
  amount: number;
  reason: string;
  created_at: string;
}

export const GoldHistory = () => {
  const { token } = useAuth();

  const { data: ledger = [] } = useQuery({
    queryKey: ["ledger"], // Key matches our new endpoint
    queryFn: async () => {
      if (!token) return [];
      try {
        const res = await fetch(`${API_URL}/users/ledger`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          console.error("Failed to fetch ledger:", res.status);
          return [];
        }
        const json = await res.json();
        return json.ledger as LedgerEntry[];
      } catch (error) {
        console.error("Error fetching ledger:", error);
        return [];
      }
    },
    enabled: !!token,
  });

  if (ledger.length === 0)
    return (
      <div className="text-gray-400 text-sm italic py-4 text-center">
        No transactions yet.
      </div>
    );

  return (
    <ul className="space-y-2 animate-in fade-in slide-in-from-right-2 duration-300">
      {ledger.map((entry) => (
        <li
          key={entry.id}
          className="flex justify-between items-center text-sm p-2 rounded hover:bg-yellow-50 transition-colors border-b border-gray-100 last:border-0"
        >
          <div className="flex flex-col">
            <span className="text-gray-700 font-medium truncate w-32">
              {entry.reason}
            </span>
            <span className="text-[10px] text-gray-400">
              {/* {new Date(entry.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })} */}
            </span>
          </div>

          <span
            className={`font-mono font-bold text-xs ${entry.amount >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {entry.amount > 0 ? "+" : ""}
            {entry.amount} G
          </span>
        </li>
      ))}
    </ul>
  );
};
