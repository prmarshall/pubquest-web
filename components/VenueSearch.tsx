"use client";
import React, { useState, useEffect } from "react";
import { useVenues } from "@/context/VenuesContext";

export const VenueSearch = () => {
  const { search, setSearch } = useVenues();
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce the search with 400ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch);
    }, 400);

    return () => clearTimeout(timer);
  }, [localSearch, setSearch]);

  // Sync with external search changes
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  return (
    <div className="mb-4 w-full">
      <label className="block text-xs text-gray-500 mb-1">Search Venues</label>
      <input
        type="text"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Search by name, category..."
        className="border border-gray-300 p-2 rounded w-full text-black"
      />
    </div>
  );
};
