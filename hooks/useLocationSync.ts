import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGeolocation } from "@/context/GeolocationContext";
import { useQueryClient } from "@tanstack/react-query";
import { logger } from "@/services/LogService";

export const useLocationSync = () => {
  const { token, user, loadUser } = useAuth();
  const { location, getCurrentPosition, resumeGPSTracking } = useGeolocation();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);

  const syncLocation = async () => {
    if (!navigator.geolocation) {
      logger.log("❌ Geolocation not supported by this browser.");
      return false;
    }

    setIsSyncing(true);
    logger.log("📡 Acquiring GPS signal...");

    try {
      // Use current location from context if available, otherwise get fresh position
      const position = location || (await getCurrentPosition());

      if (!position) {
        logger.log("❌ No location available.");
        return false;
      }

      logger.log(
        `📍 Got Coords: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`,
      );

      // Sync with server
      const res = await fetch("http://localhost:3000/api/users/location", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lat: position.lat, lng: position.lng }),
      });

      if (res.ok) {
        const data = await res.json();
        logger.log("✅ Location synced with server.");

        // Check if user was auto-checked out
        if (data.checkedOut && user?.venue_id) {
          logger.log("🚪 Auto-checked out (moved out of range)");

          // Optimistically decrement venue live_count in ALL venues queries
          queryClient.setQueriesData({ queryKey: ["venues"] }, (old: any) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: old.data.map((venue: any) =>
                venue.id === user.venue_id
                  ? {
                      ...venue,
                      live_count: Math.max(0, venue.live_count - 1),
                    }
                  : venue,
              ),
            };
          });
        }

        // Resume GPS tracking (exit manual mode)
        resumeGPSTracking();
        await loadUser();

        return true;
      } else {
        logger.log("❌ Failed to sync location.");
        return false;
      }
    } catch (err: any) {
      logger.log(`❌ Error: ${err.message || err}`);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  return { syncLocation, isSyncing };
};
