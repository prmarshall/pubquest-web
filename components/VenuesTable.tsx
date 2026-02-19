"use client";
import React from "react";
import { Button } from "@/components/Button";
import { useVenues } from "@/context/VenuesContext";
import { useAuth } from "@/context/AuthContext";
import { VenueLiveCount } from "@/components/VenueLiveCount";

interface VenuesTableProps {
  currentVenueId?: number;
}

export const VenuesTable: React.FC<VenuesTableProps> = () => {
  const { venues, meta, page, setPage, isPlaceholderData, limit, selectVenue } =
    useVenues();
  const { user } = useAuth();
  const startCount = (page - 1) * limit + 1;
  const endCount = Math.min(page * limit, meta.total);

  return (
    <section className="mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-2 font-semibold text-gray-600">Name</th>
              <th className="p-2 font-semibold text-gray-600">Category</th>
              <th className="p-2 font-semibold text-gray-600">Status</th>
              <th className="p-2 font-semibold text-gray-600">Distance</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {venues.map((venue) => {
              const isInRange =
                venue.distance_meters !== undefined &&
                venue.distance_meters <= 100;
              const isCheckedIn = user?.venue_id === venue.id;
              return (
                <tr
                  key={venue.id}
                  onClick={() => selectVenue(venue.id)}
                  className={`transition-colors cursor-pointer ${
                    isCheckedIn
                      ? "bg-green-100 hover:bg-green-300 border-l-3 border-green-500"
                      : isInRange
                        ? "bg-green-50 hover:bg-green-200 border-l-3 border-green-500"
                        : "hover:bg-gray-50"
                  } ${isPlaceholderData ? "opacity-50" : ""}`}
                >
                  <td className="p-2 font-medium text-gray-800">
                    {venue.name}{" "}
                    <span className="text-xs text-gray-400">#{venue.id}</span>
                  </td>
                  <td className="p-2">
                    <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 border border-gray-200">
                      {venue.category}
                    </span>
                  </td>
                  <td className="p-2">
                    <VenueLiveCount
                      venueId={venue.id}
                      initialCount={venue.live_count}
                      variant="badge"
                    />
                  </td>
                  <td className="p-2">
                    {venue.distance_meters !== undefined ? (
                      <span className="text-xs text-gray-500">
                        {venue.distance_meters < 1000
                          ? `${Math.round(venue.distance_meters)}m`
                          : `${(venue.distance_meters / 1000).toFixed(1)}km`}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <Button
          onClick={() => setPage((old) => Math.max(old - 1, 1))}
          disabled={page === 1}
          variant="outline"
          className="text-xs"
        >
          ← Previous
        </Button>

        <span className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
          {meta.total > 0
            ? `Showing ${startCount}-${endCount} of ${meta.total}`
            : "No locations found"}
        </span>

        <Button
          onClick={() => {
            if (!isPlaceholderData && page < (meta.totalPages || 1))
              setPage((old) => old + 1);
          }}
          disabled={isPlaceholderData || page >= (meta.totalPages || 1)}
          variant="outline"
          className="text-xs"
        >
          Next →
        </Button>
      </div>
    </section>
  );
};
