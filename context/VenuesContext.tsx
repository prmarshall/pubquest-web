"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGeolocation } from "@/context/GeolocationContext";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { GEOLOCATION_DEFAULT } from "@/config/geolocation.config";
import {
  VENUES_LIMIT,
  VENUES_PAGE,
  VENUES_REFETCH_INTERVAL_MS,
  VENUES_LOCATION_RADIUS_M,
} from "@/config/venues.config";

const API_URL = "http://localhost:3000/api";

interface Venue {
  id: number;
  name: string;
  category: string;
  lat: number;
  lng: number;
  live_count: number;
  distance_meters?: number;
  address?: string;
}

interface VenueResponse {
  data: Venue[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

interface VenuesContextType {
  venues: Venue[];
  meta: VenueResponse["meta"];
  page: number;
  setPage: (page: number | ((old: number) => number)) => void;
  search: string;
  setSearch: (search: string) => void;
  useGeoLocation: boolean;
  setUseGeoLocation: (use: boolean) => void;
  isLoading: boolean;
  isPlaceholderData: boolean;
  limit: number;
  selectedVenueId: number | null;
  selectVenue: (venueId: number) => void;
  clearSelectedVenue: () => void;
  selectedVenue: Venue | null;
  isLoadingSelectedVenue: boolean;
}

const VenuesContext = createContext<VenuesContextType | undefined>(undefined);

export const VenuesProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const { location } = useGeolocation();
  const [page, setPage] = useState(VENUES_PAGE);
  const [search, setSearch] = useState("");
  const [useGeoLocation, setUseGeoLocation] = useState(GEOLOCATION_DEFAULT);
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null);

  // Wrapper functions that reset page when filters change
  const handleSearchChange = (newSearch: string) => {
    if (newSearch !== search) {
      setPage(VENUES_PAGE);
    }
    setSearch(newSearch);
  };

  const handleGeoLocationToggle = (useGeo: boolean) => {
    if (useGeo !== useGeoLocation) {
      setPage(VENUES_PAGE);
    }
    setUseGeoLocation(useGeo);
  };

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ["venues", page, search, useGeoLocation, location],
    queryFn: async () => {
      if (!token) return null;

      // Use different endpoints based on useGeoLocation
      if (useGeoLocation && location) {
        // Nearby venues endpoint (no pagination)
        const params = new URLSearchParams({
          lat: location.lat.toString(),
          lng: location.lng.toString(),
          radius: `${VENUES_LOCATION_RADIUS_M}`,
          limit: VENUES_LIMIT.toString(),
        });

        const res = await fetch(
          `${API_URL}/venues/nearby?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) throw new Error("Failed to fetch nearby venues");
        const nearbyData = await res.json();

        // Transform to match paginated response format
        return {
          data: nearbyData.data,
          meta: {
            page: 1,
            limit: VENUES_LIMIT,
            total: nearbyData.data.length,
            totalPages: 1,
          },
        } as VenueResponse;
      } else {
        // Regular paginated venues endpoint
        const params = new URLSearchParams({
          limit: VENUES_LIMIT.toString(),
          page: page.toString(),
        });

        if (search) {
          params.append("search", search);
        }

        const res = await fetch(`${API_URL}/venues?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch venues");
        return res.json() as Promise<VenueResponse>;
      }
    },
    enabled: !!token,
    placeholderData: keepPreviousData,
    refetchInterval: VENUES_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false, // Don't poll when tab is not visible
  });

  // Query for selected venue details
  const { data: selectedVenueData, isLoading: isLoadingSelectedVenue } =
    useQuery({
      queryKey: ["venue", selectedVenueId],
      queryFn: async () => {
        if (!token || !selectedVenueId) return null;

        const response = await fetch(`${API_URL}/venues/${selectedVenueId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch venue");
        return response.json() as Promise<Venue>;
      },
      enabled: !!token && !!selectedVenueId,
    });

  const venues = data?.data || [];
  const meta = data?.meta || {
    page: 1,
    totalPages: 1,
    total: 0,
    limit: VENUES_LIMIT,
  };

  return (
    <VenuesContext.Provider
      value={{
        venues,
        meta,
        page,
        setPage,
        search,
        setSearch: handleSearchChange,
        useGeoLocation,
        setUseGeoLocation: handleGeoLocationToggle,
        isLoading,
        isPlaceholderData,
        limit: VENUES_LIMIT,
        selectedVenueId,
        selectVenue: setSelectedVenueId,
        clearSelectedVenue: () => setSelectedVenueId(null),
        selectedVenue: selectedVenueData || null,
        isLoadingSelectedVenue,
      }}
    >
      {children}
    </VenuesContext.Provider>
  );
};

export const useVenues = () => {
  const context = useContext(VenuesContext);
  if (context === undefined) {
    throw new Error("useVenues must be used within a VenuesProvider");
  }
  return context;
};
