"use client";
import React, { createContext, useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./AuthContext";

const API_URL = "http://localhost:3000/api/friends";

export interface Friend {
  friendship_id: number;
  friend_id: number;
  friend_username: string;
  friend_xp: number;
  friend_level: number;
  friend_venue_id: number | null;
  friend_venue_name: string | null;
  friend_last_active: string;
  friends_since: string;
  friend_lat: number | null;
  friend_lng: number | null;
  friend_party_id: number | null;
  friend_party_name: string | null;
}

interface FriendRequest {
  friendship_id: number;
  requester_id: number;
  requester_username: string;
  requester_xp: number;
  created_at: string;
}

interface User {
  id: number;
  username: string;
  xp: number;
  friendship_status: "FRIENDS" | "REQUEST_SENT" | "REQUEST_RECEIVED" | "NONE";
}

interface FriendsContextType {
  friends: Friend[];
  requests: FriendRequest[];
  searchResults: User[];
  isLoadingFriends: boolean;
  isLoadingRequests: boolean;
  isLoadingSearch: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sendFriendRequest: (addresseeId: number) => Promise<void>;
  acceptRequest: (friendshipId: number) => Promise<void>;
  rejectRequest: (friendshipId: number) => Promise<void>;
  removeFriend: (friendshipId: number) => Promise<void>;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error("useFriends must be used within a FriendsProvider");
  }
  return context;
};

export const FriendsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch friends list
  const { data: friendsData, isLoading: isLoadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch friends");
      return response.json();
    },
    enabled: !!token,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch pending requests
  const { data: requestsData, isLoading: isLoadingRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch requests");
      return response.json();
    },
    enabled: !!token,
    refetchInterval: 10000,
  });

  // Search all users to add as friends (users API)
  const { data: searchData, isLoading: isLoadingSearch } = useQuery({
    queryKey: ["userSearch", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return { data: [] };
      const response = await fetch(
        `http://localhost:3000/api/users?search=${encodeURIComponent(searchQuery)}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) throw new Error("Failed to search users");
      return response.json();
    },
    enabled: !!token && searchQuery.trim().length > 0,
  });

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: async (addresseeId: number) => {
      const response = await fetch(`${API_URL}/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ addresseeId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send friend request");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSearch"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  // Accept request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: async (friendshipId: number) => {
      const response = await fetch(`${API_URL}/${friendshipId}/accept`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to accept request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  // Reject request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: async (friendshipId: number) => {
      const response = await fetch(`${API_URL}/${friendshipId}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to reject request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    },
  });

  // Remove friend mutation with optimistic update
  const removeFriendMutation = useMutation({
    mutationFn: async (friendshipId: number) => {
      const response = await fetch(`${API_URL}/${friendshipId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to remove friend");
      return response.json();
    },
    onMutate: async (friendshipId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["friends"] });

      // Snapshot the previous value
      const previousFriends = queryClient.getQueryData(["friends"]);

      // Optimistically update by removing the friend
      queryClient.setQueryData(["friends"], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter(
            (friend: Friend) => friend.friendship_id !== friendshipId,
          ),
        };
      });

      return { previousFriends };
    },
    onError: (err, friendshipId, context) => {
      // Rollback on error
      if (context?.previousFriends) {
        queryClient.setQueryData(["friends"], context.previousFriends);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const value: FriendsContextType = {
    friends: friendsData?.data || [],
    requests: requestsData?.requests || [],
    searchResults: searchData?.data || [],
    isLoadingFriends,
    isLoadingRequests,
    isLoadingSearch,
    searchQuery,
    setSearchQuery,
    sendFriendRequest: async (addresseeId: number) => {
      await sendRequestMutation.mutateAsync(addresseeId);
    },
    acceptRequest: async (friendshipId: number) => {
      await acceptRequestMutation.mutateAsync(friendshipId);
    },
    rejectRequest: async (friendshipId: number) => {
      await rejectRequestMutation.mutateAsync(friendshipId);
    },
    removeFriend: async (friendshipId: number) => {
      await removeFriendMutation.mutateAsync(friendshipId);
    },
  };

  return (
    <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>
  );
};
