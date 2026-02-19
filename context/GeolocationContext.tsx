"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { logger } from "@/services/LogService";
import {
  GEOLOCATION_HIGH_ACCURACY,
  GEOLOCATION_MAXIMUM_AGE_MS,
  GEOLOCATION_TIMEOUT_MS,
} from "@/config/geolocation.config";

export interface Coords {
  lat: number;
  lng: number;
}

interface GeolocationContextType {
  location: Coords | null;
  isManual: boolean; // True if user clicked the map
  setManualLocation: (lat: number, lng: number) => void;
  resumeGPSTracking: () => void; // Resume automatic GPS tracking
  getCurrentPosition: () => Promise<Coords>; // The function Actions.tsx will call
}

const GeolocationContext = createContext<GeolocationContextType | undefined>(
  undefined,
);

export const GeolocationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [location, setLocation] = useState<Coords | null>(null);
  const [isManual, setIsManual] = useState(false);

  // Watch real GPS location continuously
  useEffect(() => {
    if (!navigator.geolocation || isManual) return;

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.error("Geolocation error:", err);
      },
    );

    // Watch for position changes
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        logger.log(
          `📍 Location updated: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        );
      },
      (err) => {
        console.error("Watch position error:", err);
      },
      {
        enableHighAccuracy: GEOLOCATION_HIGH_ACCURACY,
        maximumAge: GEOLOCATION_MAXIMUM_AGE_MS,
        timeout: GEOLOCATION_TIMEOUT_MS,
      },
    );

    // Cleanup: stop watching when component unmounts or manual mode enabled
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isManual]);

  // 2. Function to force a location (The Map Click)
  const setManualLocation = (lat: number, lng: number) => {
    setIsManual(true);
    setLocation({ lat, lng });
    logger.log(`🗺️ Teleported to: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  // 3. Function to resume GPS tracking (exit manual mode)
  const resumeGPSTracking = () => {
    setIsManual(false);
    logger.log("📡 Resumed GPS tracking");
  };

  // 4. The "Hybrid" getter
  const getCurrentPosition = (): Promise<Coords> => {
    return new Promise((resolve, reject) => {
      // Priority A: If we clicked the map, use that
      if (isManual && location) {
        resolve(location);
        return;
      }

      // Priority B: Use Real GPS
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Sync state just in case
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => reject(err),
      );
    });
  };

  return (
    <GeolocationContext.Provider
      value={{
        location,
        isManual,
        setManualLocation,
        resumeGPSTracking,
        getCurrentPosition,
      }}
    >
      {children}
    </GeolocationContext.Provider>
  );
};

export const useGeolocation = () => {
  const context = useContext(GeolocationContext);
  if (!context)
    throw new Error("useGeolocation must be used within a GeolocationProvider");
  return context;
};
