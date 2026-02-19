import { FC } from "react";
import { Venue } from "./VenueDetail";
import { VenueLiveCount } from "./VenueLiveCount";
import { VenueCheckInButton } from "./VenueCheckInButton";
import { Popup } from "react-leaflet/Popup";
import { Marker } from "react-leaflet";
import { venueIconOptions, venueInRangeIconOptions } from "@/config/map.config";

import L from "leaflet";

const VenueIcon = L.icon(venueIconOptions);
const VenueInRangeIcon = L.icon(venueInRangeIconOptions);

const VenueMarker: FC<Venue> = ({
  id,
  name,
  lat,
  lng,
  category,
  live_count,
  distance_meters,
}) => {
  const isInRange = distance_meters !== undefined && distance_meters <= 100;
  return (
    <Marker
      key={id}
      position={[lat, lng]}
      icon={isInRange ? VenueInRangeIcon : VenueIcon}
    >
      <Popup>
        <div className="min-w-[200px]">
          <div className="font-bold text-base mb-1">{name}</div>
          <div className="text-xs text-gray-500 mb-2">
            {category} • ID: {id}
          </div>
          <div className="mb-2">
            <VenueLiveCount
              venueId={id}
              initialCount={live_count}
              variant="popup"
            />
          </div>
          <div className="flex gap-2">
            <VenueCheckInButton
              venueId={id}
              distanceMeters={distance_meters}
              variant="primary"
              className="flex-1 px-3 py-1.5 text-sm"
            />
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default VenueMarker;
