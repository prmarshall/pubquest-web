"use client";
import React, { useState, useMemo } from "react";
import { Button } from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { useCheckIn } from "@/hooks/useCheckIn";
import { useQueryClient } from "@tanstack/react-query";
import { useVenues } from "@/context/VenuesContext";
import { useGeolocation } from "@/context/GeolocationContext";

interface VenueCheckInButtonProps {
  venueId?: number;
  distanceMeters?: number;
  variant?: "primary" | "outline" | "secondary" | "danger";
  className?: string;
  fullWidth?: boolean;
  iconOnly?: boolean;
  onCheckOut?: () => void;
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export const VenueCheckInButton: React.FC<VenueCheckInButtonProps> = ({
  venueId: venueIdProp,
  distanceMeters: distanceMetersProp,
  variant = "primary",
  className = "",
  fullWidth = false,
  iconOnly = false,
  onCheckOut,
}) => {
  // All hooks must be called before any conditional returns
  const { selectedVenue, venues } = useVenues();
  const { location } = useGeolocation();
  const { user, token, loadUser } = useAuth();
  const { checkIn, isLoading: isCheckingIn } = useCheckIn();
  const queryClient = useQueryClient();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Use props if provided, otherwise fall back to selected venue from context
  const venueId = venueIdProp ?? selectedVenue?.id;

  // Find the venue from venues list or use selectedVenue
  const venue = useMemo(() => {
    if (venueIdProp) {
      return venues.find((v) => v.id === venueIdProp);
    }
    return selectedVenue;
  }, [venueIdProp, venues, selectedVenue]);

  // Calculate distance: Priority order
  // 1. Explicit prop (for backwards compatibility)
  // 2. Pre-calculated from API (venue.distance_meters from venues list)
  // 3. Client-side calculation (fallback when no API distance available)
  const calculatedDistance = useMemo(() => {
    if (!venue || !location) return undefined;
    return calculateDistance(location.lat, location.lng, venue.lat, venue.lng);
  }, [venue, location]);

  const distanceMeters =
    distanceMetersProp ?? venue?.distance_meters ?? calculatedDistance;

  if (!venueId) {
    return null;
  }

  const isCheckedIn = user?.venue_id === venueId;
  const isTooFar = distanceMeters !== undefined && distanceMeters > 100;

  const handleCheckOut = async () => {
    setIsCheckingOut(true);
    try {
      // Optimistically decrement venue live_count in ALL venues queries
      queryClient.setQueriesData({ queryKey: ["venues"] }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((venue: any) =>
            venue.id === venueId
              ? {
                  ...venue,
                  live_count: Math.max(0, venue.live_count - 1),
                }
              : venue,
          ),
        };
      });

      const res = await fetch("http://localhost:3000/api/users/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        await loadUser();
        if (onCheckOut) onCheckOut();
      } else {
        // Rollback on error
        queryClient.invalidateQueries({ queryKey: ["venues"] });
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      // Rollback on error
      queryClient.invalidateQueries({ queryKey: ["venues"] });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCheckIn = () => {
    checkIn(venueId);
  };

  if (iconOnly) {
    return (
      <Button
        onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
        disabled={isCheckedIn ? isCheckingOut : isCheckingIn || isTooFar}
        variant={variant}
        className={className}
        title={
          isCheckedIn
            ? "Check out"
            : isTooFar
              ? `Too far away (${Math.round(distanceMeters!)}m)`
              : "Check in to venue"
        }
      >
        {isCheckedIn ? "✓" : "📍"}
      </Button>
    );
  }

  if (isCheckedIn) {
    return (
      <Button
        onClick={handleCheckOut}
        disabled={isCheckingOut}
        variant={variant}
        className={`${fullWidth ? "w-full" : ""} ${className}`}
      >
        {isCheckingOut ? "Checking out..." : "Check Out"}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleCheckIn}
      disabled={isCheckingIn || isTooFar}
      variant={variant}
      className={`${fullWidth ? "w-full" : ""} ${className}`}
    >
      {isCheckingIn
        ? "Checking in..."
        : isTooFar
          ? `Too far away (${Math.round(distanceMeters!)}m)`
          : "Check In"}
    </Button>
  );
};
