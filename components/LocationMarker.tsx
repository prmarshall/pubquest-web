import { Popup, useMap } from "react-leaflet";
import { AnimatedMarker } from "./AnimatedMarker";
import { FC, useEffect } from "react";
import { Coords } from "@/context/GeolocationContext";
import {
  LOCATION_MARKER_TRANSITION_MS,
  MAP_PAN_DURATION_MS,
  userIconOptions,
} from "@/config/map.config";

import L from "leaflet";

const UserIcon = L.divIcon(userIconOptions);

const LocationMarker: FC<Coords> = ({ lat, lng }) => {
  const map = useMap();

  useEffect(() => {
    // Animate map slightly slower than marker (1000ms) so marker leads
    map.setView([lat, lng], map.getZoom(), {
      animate: true,
      duration: MAP_PAN_DURATION_MS / 1000,
    });
  }, [lat, lng, map]);

  return (
    <AnimatedMarker
      position={[lat, lng]}
      icon={UserIcon}
      transitionMs={LOCATION_MARKER_TRANSITION_MS}
    >
      <Popup>
        <strong>You are here</strong>
        <br />
      </Popup>
    </AnimatedMarker>
  );
};

export default LocationMarker;
