"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/services/LogService";
import { useGeolocation } from "@/context/GeolocationContext"; // <--- Import

const API_URL = "http://localhost:3000/api";

export const useCheckIn = () => {
  const { token, loadUser } = useAuth();
  const { getCurrentPosition } = useGeolocation(); // <--- Use this
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      lat,
      lng,
      vId,
    }: {
      lat: number;
      lng: number;
      vId: number;
    }) => {
      const res = await fetch(`${API_URL}/quests/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ venueId: vId, lat, lng }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Check-in failed");
      }
      return res.json();
    },
    onMutate: async ({ vId }) => {
      // Optimistically update venue live_count in ALL venues queries
      await queryClient.cancelQueries({ queryKey: ["venues"] });

      // Store all previous queries for rollback
      const previousQueries = queryClient.getQueriesData({
        queryKey: ["venues"],
      });

      // Update all venues queries
      queryClient.setQueriesData({ queryKey: ["venues"] }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((venue: any) =>
            venue.id === vId
              ? { ...venue, live_count: venue.live_count + 1 }
              : venue,
          ),
        };
      });

      return { previousQueries };
    },
    onSuccess: async (data) => {
      logger.log(`✅ Success: ${data.message}`);
      if (data.questUpdates?.length > 0) {
        logger.log(`🏆 Quest Progress: ${data.questUpdates[0].description}`);
      }

      // Refresh Global State
      await loadUser();
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["ledger"] }); // <--- Updated key
    },
    onError: (error: Error, variables, context) => {
      logger.log(`❌ Failed: ${error.message}`);
      // Rollback all queries on error
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
  });

  // The simplified function we will call from the UI
  const performCheckIn = async (venueId: number) => {
    logger.log(`📍 Locating for Venue #${venueId}...`);
    try {
      // 🚀 Use our Hybrid Geolocation (Real or Map Click)
      const coords = await getCurrentPosition();

      mutation.mutate({
        lat: coords.lat,
        lng: coords.lng,
        vId: venueId,
      });
    } catch (err: any) {
      logger.log(`❌ GPS Error: ${err.message}`);
    }
  };

  return {
    checkIn: performCheckIn,
    isLoading: mutation.isPending,
  };
};
