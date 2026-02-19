"use client";
import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./AuthContext";

interface PartyMember {
  user_id: number;
  username: string;
  level: number;
  last_active: string;
  is_leader: boolean;
  joined_at: string;
  lat: number | null;
  lng: number | null;
}

interface Party {
  id: number;
  name: string;
  invite_code: string;
  leader_id: number;
  created_at: string;
  members: PartyMember[];
}

interface PartyInvite {
  id: number;
  party_id: number;
  party_name: string;
  inviter_username: string;
  created_at: string;
}

interface SentPartyInvite {
  id: number;
  party_id: number;
  party_name: string;
  invitee_username: string;
  created_at: string;
}

interface PartyContextType {
  currentParty: Party | null;
  receivedInvites: PartyInvite[];
  sentInvites: SentPartyInvite[];
  isLoading: boolean;
  createParty: (name: string) => Promise<void>;
  joinParty: (inviteCode: string) => Promise<void>;
  leaveParty: () => Promise<void>;
  deleteParty: () => Promise<void>;
  kickUser: (userId: number) => Promise<void>;
  acceptInvite: (inviteId: number) => Promise<void>;
  rejectInvite: (inviteId: number) => Promise<void>;
  refetch: () => void;
}

const PartyContext = createContext<PartyContextType | undefined>(undefined);

export function PartyProvider({ children }: { children: ReactNode }) {
  const { token, user, loadUser, updateUser } = useAuth();
  const queryClient = useQueryClient();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Fetch current party
  const {
    data: currentParty = null,
    isLoading: isPartyLoading,
    refetch: refetchParty,
  } = useQuery({
    queryKey: ["currentParty"],
    queryFn: async () => {
      if (!token || !user?.party_id) return null;

      const res = await fetch(`${API_URL}/api/parties/${user.party_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!token && !!user?.party_id,
  });

  // Fetch party invites
  const {
    data: invitesData,
    isLoading: isInvitesLoading,
    refetch: refetchInvites,
  } = useQuery({
    queryKey: ["partyInvites"],
    queryFn: async () => {
      if (!token) return { received: [], sent: [] };

      const res = await fetch(`${API_URL}/api/parties/invites`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return { received: [], sent: [] };
      return res.json();
    },
    enabled: !!token,
  });

  const receivedInvites = invitesData?.received || [];
  const sentInvites = invitesData?.sent || [];

  const refetch = useCallback(async () => {
    await loadUser();
    queryClient.invalidateQueries({ queryKey: ["currentParty"] });
    queryClient.invalidateQueries({ queryKey: ["partyInvites"] });
  }, [loadUser, queryClient]);

  // Create party mutation
  const createPartyMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`${API_URL}/api/parties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create party");
      }

      return res.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Join party mutation
  const joinPartyMutation = useMutation({
    mutationFn: async (inviteCode: string) => {
      const res = await fetch(`${API_URL}/api/parties/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inviteCode }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to join party");
      }

      return res.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Leave party mutation
  const leavePartyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/parties/leave`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to leave party");
      }

      return res.json();
    },
    onMutate: async () => {
      // Immediately set currentParty to null and remove party_id from user
      await queryClient.cancelQueries({ queryKey: ["currentParty"] });
      queryClient.setQueryData(["currentParty"], null);
      updateUser({ party_id: undefined, party_name: undefined });
    },
    onSuccess: async () => {
      await refetch();
    },
  });

  // Delete party mutation
  const deletePartyMutation = useMutation({
    mutationFn: async () => {
      if (!user?.party_id) {
        throw new Error("Not in a party");
      }

      const res = await fetch(`${API_URL}/api/parties/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ partyId: user.party_id }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete party");
      }

      return res.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Kick user mutation
  const kickUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      if (!user?.party_id) {
        throw new Error("Not in a party");
      }

      const res = await fetch(`${API_URL}/api/parties/kick`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          partyId: user.party_id,
          targetUserId: userId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to kick user");
      }

      return res.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Accept invite mutation
  const acceptInviteMutation = useMutation({
    mutationFn: async (inviteId: number) => {
      const res = await fetch(
        `${API_URL}/api/parties/invite/${inviteId}/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to accept invite");
      }

      return res.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Reject invite mutation
  const rejectInviteMutation = useMutation({
    mutationFn: async (inviteId: number) => {
      const res = await fetch(
        `${API_URL}/api/parties/invite/${inviteId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to reject invite");
      }

      return res.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  return (
    <PartyContext.Provider
      value={{
        currentParty,
        receivedInvites,
        sentInvites,
        isLoading: isPartyLoading || isInvitesLoading,
        createParty: (name) => createPartyMutation.mutateAsync(name),
        joinParty: (code) => joinPartyMutation.mutateAsync(code),
        leaveParty: () => leavePartyMutation.mutateAsync(),
        deleteParty: () => deletePartyMutation.mutateAsync(),
        kickUser: (userId) => kickUserMutation.mutateAsync(userId),
        acceptInvite: (id) => acceptInviteMutation.mutateAsync(id),
        rejectInvite: (id) => rejectInviteMutation.mutateAsync(id),
        refetch,
      }}
    >
      {children}
    </PartyContext.Provider>
  );
}

export function useParty() {
  const context = useContext(PartyContext);
  if (!context) {
    throw new Error("useParty must be used within PartyProvider");
  }
  return context;
}
