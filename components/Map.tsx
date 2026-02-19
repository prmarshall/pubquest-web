"use client";
import { useEffect, useRef } from "react";
import { MapContainer, useMapEvents, useMap } from "react-leaflet";
import { useQueryClient } from "@tanstack/react-query";
import { useGeolocation } from "@/context/GeolocationContext";
import { useAuth } from "@/context/AuthContext";
import { useVenues } from "@/context/VenuesContext";
import { useFriends } from "@/context/FriendsContext";

import "leaflet/dist/leaflet.css";
import { LeafletProviderLayer } from "./LeafletProviderLayer";

import { logger } from "@/services/LogService";
import {
  leafletProviderOptions,
  LOCATION_MARKER_TRANSITION_MS,
  MAP_VENUE_ZOOM,
  mapContainerOptions,
} from "@/config/map.config";
import VenueMarker from "@/components/VenueMarker";
import LocationMarker from "./LocationMarker";
import FriendMarker from "./FriendMarker";
import { LocationSyncButton } from "./LocationSyncButton";

// --- SUB-COMPONENT: Handle Clicks ---
const LocationController = () => {
  const { location, setManualLocation } = useGeolocation();
  const { token, loadUser, user } = useAuth();
  const queryClient = useQueryClient();
  const lastUpdateRef = useRef<number>(0);
  const isUpdatingRef = useRef<boolean>(false);

  const map = useMap();

  // Zoom to selected venue
  const { selectedVenue } = useVenues();
  useEffect(() => {
    if (selectedVenue && selectedVenue.lat && selectedVenue.lng) {
      console.log("Zooming to venue:", selectedVenue);
      map.setView([selectedVenue.lat, selectedVenue.lng], MAP_VENUE_ZOOM, {
        animate: true,
      });
    }
  }, [selectedVenue, map]);

  // Handle click events
  useMapEvents({
    click: async (e) => {
      const now = Date.now();

      // Block clicks if currently updating
      if (isUpdatingRef.current) {
        return;
      }

      // Block clicks during marker transition
      if (now - lastUpdateRef.current < LOCATION_MARKER_TRANSITION_MS) {
        return;
      }

      // Check if clicking on the same location (within 0.0001 degrees, ~11 meters)
      if (location) {
        const latDiff = Math.abs(e.latlng.lat - location.lat);
        const lngDiff = Math.abs(e.latlng.lng - location.lng);
        if (latDiff < 0.0001 && lngDiff < 0.0001) {
          return; // Don't move to essentially the same location
        }
      }

      isUpdatingRef.current = true;
      lastUpdateRef.current = now;
      setManualLocation(e.latlng.lat, e.latlng.lng);

      // Update server location
      try {
        const res = await fetch("http://localhost:3000/api/users/location", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ lat: e.latlng.lat, lng: e.latlng.lng }),
        });

        if (res.ok) {
          const data = await res.json();
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

            await loadUser();
          }
        }
      } catch (err) {
        logger.log(`❌ Location update error: ${err}`);
      }

      // Allow new clicks after transition completes
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, LOCATION_MARKER_TRANSITION_MS);
    },
  });
  return null;
};

export default function Map() {
  const { location } = useGeolocation();
  const { venues } = useVenues();
  const { friends } = useFriends();

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <LocationSyncButton />
      <MapContainer {...mapContainerOptions}>
        <LeafletProviderLayer {...leafletProviderOptions} />
        <LocationController />

        {location && <LocationMarker {...location} />}
        {venues.map((venue) => (
          <VenueMarker key={venue.id} {...venue} />
        ))}

        {friends
          .filter((friend) => friend.friend_lat && friend.friend_lng)
          .map((friend) => (
            <FriendMarker key={friend.friend_id} {...friend} />
          ))}
      </MapContainer>
    </div>
  );
}
