import { FC } from "react";
import { AnimatedMarker } from "./AnimatedMarker";
import { Popup } from "react-leaflet/Popup";
import { UserLevel } from "./UserLevel";
import { Friend } from "@/context/FriendsContext";
import { friendIconOptions } from "@/config/map.config";

import L from "leaflet";

const FriendIcon = L.divIcon(friendIconOptions);

const FriendMarker: FC<Friend> = ({
  friend_id,
  friend_lat,
  friend_lng,
  friend_username,
  friend_level,
  friend_xp,
  friend_venue_name,
}) => {
  return (
    <AnimatedMarker
      key={friend_id}
      position={[friend_lat!, friend_lng!]}
      icon={FriendIcon}
    >
      <Popup>
        <div className="min-w-[150px]">
          <div className="font-bold text-base mb-1 text-blue-600">
            👤 {friend_username}
          </div>
          <div className="text-xs text-gray-500 mb-1">
            <UserLevel level={friend_level} variant="text" /> • {friend_xp} XP
          </div>
          {friend_venue_name && (
            <div className="text-xs text-green-600">
              🍺 At {friend_venue_name}
            </div>
          )}
        </div>
      </Popup>
    </AnimatedMarker>
  );
};

export default FriendMarker;
