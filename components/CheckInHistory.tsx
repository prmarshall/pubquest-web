"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";

const API_URL = "http://localhost:3000/api";

interface CheckIn {
  id: number;
  venue_name: string;
  category: string;
  check_in_time: string;
}

export const CheckInHistory = () => {
  const { token } = useAuth();

  const { data: history = [] } = useQuery({
    queryKey: ["history"],
    queryFn: async () => {
      if (!token) return [];
      try {
        const res = await fetch(`${API_URL}/users/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          console.error("Failed to fetch history:", res.status);
          return [];
        }
        const json = await res.json();
        return json.history as CheckIn[];
      } catch (error) {
        console.error("Error fetching history:", error);
        return [];
      }
    },
    enabled: !!token,
  });

  if (history.length === 0) {
    return (
      <div className="text-gray-400 text-sm italic py-4 text-center">
        No recent check-ins. Go explore! 🍺
      </div>
    );
  }

  return (
    <ul className="space-y-2 animate-in fade-in duration-300">
      {history.map((item) => (
        <li
          key={item.id}
          className="text-sm bg-gray-50 p-2 rounded border border-gray-100 flex justify-between items-center hover:bg-white hover:shadow-sm transition-all"
        >
          <div>
            <span className="font-semibold text-gray-700 block">
              {item.venue_name}
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">
              {/* {new Date(item.check_in_time).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })} */}
            </span>
          </div>
          <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
            {item.category}
          </span>
        </li>
      ))}
    </ul>
  );
};
