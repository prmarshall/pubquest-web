"use client";
import { Button } from "@/components/Button";
import { useVenues } from "@/context/VenuesContext";
import LazyMap from "@/components/LazyMap";
import { VenueSearch } from "./VenueSearch";
import { VenueDetail } from "@/components/VenueDetail";
import { VenuesTable } from "@/components/VenuesTable";
import { useAuth } from "@/context/AuthContext";

const UseGeoLocationButton = () => {
  const { useGeoLocation, setUseGeoLocation } = useVenues();
  return (
    <>
      <Button
        onClick={() => setUseGeoLocation(!useGeoLocation)}
        variant={useGeoLocation ? "primary" : "outline"}
        className="text-xs cursor-pointer"
      >
        {useGeoLocation ? "📍 Near Me" : "🌍 All Venues"}
      </Button>
    </>
  );
};

export const Venues = () => {
  const { user } = useAuth();
  const { isLoading } = useVenues();

  if (isLoading)
    return (
      <div className="text-center p-4 text-gray-400">Loading venues...</div>
    );

  return (
    <section className="col-span-1 lg:col-span-2 border p-4 rounded bg-white shadow-sm mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-gray-700">Venues & Locations</h2>
        <UseGeoLocationButton />
      </div>
      <VenueSearch />
      <LazyMap />
      <VenuesTable currentVenueId={user?.venue_id} />
      <VenueDetail />
    </section>
  );
};
