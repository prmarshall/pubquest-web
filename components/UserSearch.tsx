"use client";
import React, { useState } from "react";
import { useUsers } from "@/context/UsersContext";

export const UserSearch = () => {
  const { search, setSearch } = useUsers();
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search input (400ms delay)
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(localSearch);
    }, 400);

    return () => clearTimeout(timeout);
  }, [localSearch, setSearch]);

  return (
    <div className="mb-4">
      <input
        type="text"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Search users by username or email..."
        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};
