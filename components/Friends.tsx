"use client";
import React, { useState, useEffect } from "react";
import { useFriends } from "@/context/FriendsContext";
import { useGeolocation } from "@/context/GeolocationContext";
import { useNavigation } from "@/context/NavigationContext";
import { Button } from "./Button";
import { OnlineStatus } from "./OnlineStatus";
import { UserLevel } from "./UserLevel";

// Calculate distance between two points in meters using Haversine formula
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

export const Friends = () => {
  const { location } = useGeolocation();
  const { selectUser, selectVenue } = useNavigation();
  const {
    friends,
    requests,
    searchResults,
    isLoadingFriends,
    isLoadingRequests,
    searchQuery,
    setSearchQuery,
    sendFriendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
  } = useFriends();

  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "search">(
    "friends",
  );
  const [localSearch, setLocalSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    setActiveTab("search");
  };

  const handleAction = async (action: () => Promise<void>, id: number) => {
    setActionLoading(id);
    try {
      await action();
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setActionLoading(null);
    }
  };

  // Check if a friend is nearby (within 100 meters)
  const isFriendNearby = (friend: any): boolean => {
    if (!location || !friend.friend_lat || !friend.friend_lng) return false;
    const distance = calculateDistance(
      location.lat,
      location.lng,
      friend.friend_lat,
      friend.friend_lng,
    );
    return distance <= 100; // 100 meters threshold
  };

  return (
    <section className="border p-4 rounded bg-white shadow-sm">
      <h2 className="font-bold text-gray-700 mb-4">👥 Friends</h2>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search users by username..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit" variant="primary" className="text-sm">
            Search
          </Button>
        </div>
      </form>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b">
        <button
          onClick={() => setActiveTab("friends")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "friends"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Friends ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "requests"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Requests ({requests.length})
        </button>
        {searchQuery && (
          <button
            onClick={() => setActiveTab("search")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "search"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Search Results
          </button>
        )}
      </div>

      {/* Friends List */}
      {activeTab === "friends" && (
        <div>
          {isLoadingFriends ? (
            <div className="text-center p-4 text-gray-400">
              Loading friends...
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center p-8 text-gray-400">
              <p className="text-4xl mb-2">😔</p>
              <p>No friends yet. Search for users to add!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <div
                  key={friend.friendship_id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium text-gray-800 flex items-center gap-2">
                      {friend.friend_last_active && (
                        <OnlineStatus
                          lastActive={friend.friend_last_active}
                          variant="dot"
                        />
                      )}
                      {friend.friend_username}
                      {isFriendNearby(friend) && (
                        <span className="ml-1 text-green-600" title="Nearby">
                          📍
                        </span>
                      )}
                      <span className="ml-2">
                        <UserLevel
                          level={friend.friend_level}
                          variant="inline"
                        />
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {friend.friend_xp} XP
                      {friend.friend_venue_id && friend.friend_venue_name && (
                        <button
                          onClick={() => selectVenue(friend.friend_venue_id!)}
                          className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 cursor-pointer transition-colors"
                        >
                          🍺 {friend.friend_venue_name}
                        </button>
                      )}
                      {friend.friend_party_id && (
                        <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
                          👥 {friend.friend_party_name}
                        </span>
                      )}
                    </div>
                    {friend.friend_lat && friend.friend_lng && (
                      <div className="text-xs text-gray-500">
                        📍 Location: {friend.friend_lat.toFixed(4)},{" "}
                        {friend.friend_lng.toFixed(4)}
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      Friends since{" "}
                      {/* {new Date(friend.friends_since).toLocaleDateString()} */}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => selectUser(friend.friend_id)}
                      variant="outline"
                      className="text-xs"
                    >
                      View
                    </Button>
                    <Button
                      onClick={() =>
                        handleAction(
                          () => removeFriend(friend.friendship_id),
                          friend.friendship_id,
                        )
                      }
                      disabled={actionLoading === friend.friendship_id}
                      variant="outline"
                      className="text-xs text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Friend Requests */}
      {activeTab === "requests" && (
        <div>
          {isLoadingRequests ? (
            <div className="text-center p-4 text-gray-400">
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center p-8 text-gray-400">
              <p className="text-4xl mb-2">📭</p>
              <p>No pending friend requests</p>
            </div>
          ) : (
            <div className="space-y-2">
              {requests.map((request) => (
                <div
                  key={request.friendship_id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium text-gray-800">
                      {request.requester_username}
                    </div>
                    <div className="text-xs text-gray-500">
                      {request.requester_xp} XP
                    </div>
                    <div className="text-xs text-gray-400">
                      {/* {new Date(request.created_at).toLocaleDateString()} */}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        handleAction(
                          () => acceptRequest(request.friendship_id),
                          request.friendship_id,
                        )
                      }
                      disabled={actionLoading === request.friendship_id}
                      variant="primary"
                      className="text-xs"
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() =>
                        handleAction(
                          () => rejectRequest(request.friendship_id),
                          request.friendship_id,
                        )
                      }
                      disabled={actionLoading === request.friendship_id}
                      variant="outline"
                      className="text-xs"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      {activeTab === "search" && (
        <div>
          {searchResults.length === 0 ? (
            <div className="text-center p-8 text-gray-400">
              <p className="text-4xl mb-2">🔍</p>
              <p>No users found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium text-gray-800">
                      {user.username}
                    </div>
                    <div className="text-xs text-gray-500">{user.xp} XP</div>
                  </div>
                  <div>
                    {user.friendship_status === "FRIENDS" && (
                      <span className="text-xs text-green-600">✓ Friends</span>
                    )}
                    {user.friendship_status === "REQUEST_SENT" && (
                      <span className="text-xs text-gray-500">
                        Request Sent
                      </span>
                    )}
                    {user.friendship_status === "REQUEST_RECEIVED" && (
                      <Button
                        onClick={() => setActiveTab("requests")}
                        variant="primary"
                        className="text-xs"
                      >
                        View Request
                      </Button>
                    )}
                    {user.friendship_status === "NONE" && (
                      <Button
                        onClick={() =>
                          handleAction(
                            () => sendFriendRequest(user.id),
                            user.id,
                          )
                        }
                        disabled={actionLoading === user.id}
                        variant="primary"
                        className="text-xs"
                      >
                        Add Friend
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
