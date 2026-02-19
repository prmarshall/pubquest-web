"use client";
import React from "react";
import { ActivityFeed } from "./ActivityFeed";

export const Actions = () => {
  return (
    <section className="border p-4 rounded bg-white shadow-sm flex flex-col gap-4">
      <h2 className="font-bold text-gray-700">3. Recent Activity</h2>

      <ActivityFeed />
    </section>
  );
};
