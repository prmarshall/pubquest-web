"use client";
import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface Venue {
  id: number;
  live_count: number;
}

interface VenueLiveCountProps {
  venueId: number;
  initialCount?: number;
  variant?: "default" | "popup" | "badge";
}

export const VenueLiveCount: React.FC<VenueLiveCountProps> = ({
  venueId,
  variant = "default",
}) => {
  const queryClient = useQueryClient();
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    const updateLiveCount = () => {
      const queriesCache = queryClient.getQueriesData({ queryKey: ["venues"] });

      let foundCount: number | undefined;

      for (const [, data] of queriesCache) {
        const venues = (data as any)?.data;
        if (Array.isArray(venues)) {
          const venue = venues.find((v: Venue) => v.id === venueId);
          if (venue) {
            foundCount = venue.live_count;
            break;
          }
        }
      }

      if (foundCount !== undefined) {
        setLiveCount(foundCount);
      }
    };

    // Update immediately
    updateLiveCount();

    // Subscribe to cache changes
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query.queryKey[0] === "venues") {
        updateLiveCount();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient, venueId, liveCount]);

  // Badge variant for table display
  if (variant === "badge") {
    return liveCount > 0 ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
        {liveCount} Here
      </span>
    ) : (
      <span className="text-gray-300 text-xs">-</span>
    );
  }

  // Popup variant for map popup
  if (variant === "popup") {
    return liveCount > 0 ? (
      <div className="mb-2 flex items-center gap-1 text-xs text-green-600">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        {liveCount} {liveCount === 1 ? "person" : "people"} here
      </div>
    ) : null;
  }

  // Default variant for venue detail
  return (
    <div className="font-semibold text-gray-800">
      {liveCount > 0 ? (
        <span className="inline-flex items-center text-green-600">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          {liveCount} {liveCount === 1 ? "person" : "people"} here
        </span>
      ) : (
        <span className="text-gray-400">No one here</span>
      )}
    </div>
  );
};
