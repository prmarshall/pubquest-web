"use client";
import { useLocationSync } from "@/hooks/useLocationSync";
import { useGeolocation } from "@/context/GeolocationContext";

export const LocationSyncButton = () => {
  const { syncLocation, isSyncing } = useLocationSync();
  const { isManual } = useGeolocation();

  // Determine icon and title based on state
  const getButtonState = () => {
    if (isSyncing) {
      return {
        icon: "...",
        title: "Syncing location...",
        className: "animate-pulse",
      };
    }
    if (isManual) {
      return {
        icon: "🗺️",
        title: "Manual mode - Click to resume GPS tracking",
        className: "",
      };
    }
    return {
      icon: "📡",
      title: "GPS tracking active - Click to sync with server",
      className: "",
    };
  };

  const buttonState = getButtonState();

  return (
    <button
      onClick={syncLocation}
      disabled={isSyncing}
      className="absolute top-3 right-3 z-[1000] w-10 h-10 bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 rounded-lg shadow-lg border border-gray-200 flex items-center justify-center transition-all disabled:cursor-not-allowed"
      title={buttonState.title}
    >
      <span className={`text-lg ${buttonState.className}`}>
        {buttonState.icon}
      </span>
    </button>
  );
};
