"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface NavigationContextType {
  selectedVenueId: number | null;
  selectVenue: (venueId: number) => void;
  clearVenue: () => void;
  selectedUserId: number | null;
  selectUser: (userId: number) => void;
  clearUser: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const selectVenue = (venueId: number) => {
    setSelectedVenueId(venueId);
  };

  const clearVenue = () => {
    setSelectedVenueId(null);
  };

  const selectUser = (userId: number) => {
    setSelectedUserId(userId);
  };

  const clearUser = () => {
    setSelectedUserId(null);
  };

  return (
    <NavigationContext.Provider
      value={{
        selectedVenueId,
        selectVenue,
        clearVenue,
        selectedUserId,
        selectUser,
        clearUser,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
};
