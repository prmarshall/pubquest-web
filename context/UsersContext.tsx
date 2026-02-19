"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

const API_URL = "http://localhost:3000/api/users";
const LIMIT = 10;

interface User {
  id: number;
  username: string;
  email: string;
  xp: number;
  level: number;
  gold: number;
  venue_id: number | null;
  last_active: string;
  friendship_status: "FRIENDS" | "REQUEST_SENT" | "REQUEST_RECEIVED" | "NONE";
  party_id: number | null;
  party_name: string | null;
  friends_since: string | null;
}

interface UserResponse {
  data: User[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

interface UsersContextType {
  users: User[];
  meta: UserResponse["meta"];
  page: number;
  setPage: (page: number | ((old: number) => number)) => void;
  search: string;
  setSearch: (search: string) => void;
  isLoading: boolean;
  isPlaceholderData: boolean;
  limit: number;
  selectedUserId: number | null;
  selectUser: (userId: number) => void;
  clearSelectedUser: () => void;
  selectedUser: User | null;
  isLoadingSelectedUser: boolean;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Wrapper function that resets page when search changes
  const handleSearchChange = (newSearch: string) => {
    if (newSearch !== search) {
      setPage(1);
    }
    setSearch(newSearch);
  };

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ["users", page, search],
    queryFn: async () => {
      if (!token) return null;

      // Build query params
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        page: page.toString(),
      });

      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`${API_URL}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json() as Promise<UserResponse>;
    },
    enabled: !!token,
    placeholderData: keepPreviousData,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Query for selected user details
  const { data: selectedUserData, isLoading: isLoadingSelectedUser } = useQuery(
    {
      queryKey: ["user", selectedUserId],
      queryFn: async () => {
        if (!token || !selectedUserId) return null;

        const response = await fetch(`${API_URL}/${selectedUserId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user");
        return response.json() as Promise<User>;
      },
      enabled: !!token && !!selectedUserId,
    },
  );

  const value: UsersContextType = {
    users: data?.data || [],
    meta: data?.meta || { page: 1, limit: LIMIT, total: 0, totalPages: 0 },
    page,
    setPage,
    search,
    setSearch: handleSearchChange,
    isLoading,
    isPlaceholderData,
    limit: LIMIT,
    selectedUserId,
    selectUser: setSelectedUserId,
    clearSelectedUser: () => setSelectedUserId(null),
    selectedUser: selectedUserData || null,
    isLoadingSelectedUser,
  };

  return (
    <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
};
