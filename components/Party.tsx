"use client";
import { useState, useEffect, useMemo } from "react";
import { useParty } from "@/context/PartyContext";
import { useAuth } from "@/context/AuthContext";
import { useGeolocation } from "@/context/GeolocationContext";
import { OnlineStatus } from "@/components/OnlineStatus";
import { UserLevel } from "@/components/UserLevel";

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

export function Party() {
  const { user } = useAuth();
  const { location } = useGeolocation();
  const {
    currentParty,
    receivedInvites,
    sentInvites,
    isLoading,
    createParty,
    joinParty,
    leaveParty,
    deleteParty,
    kickUser,
    acceptInvite,
    rejectInvite,
  } = useParty();

  const [partyName, setPartyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleCreateParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim()) return;

    try {
      await createParty(partyName);
      setPartyName("");
      setShowCreateForm(false);
    } catch (err: any) {
      alert(err.message || "Failed to create party");
    }
  };

  const handleJoinParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    try {
      await joinParty(inviteCode);
      setInviteCode("");
      setShowJoinForm(false);
    } catch (err: any) {
      alert(err.message || "Failed to join party");
    }
  };

  const handleLeaveParty = async () => {
    if (!confirm("Are you sure you want to leave the party?")) return;

    try {
      await leaveParty();
    } catch (err: any) {
      alert(err.message || "Failed to leave party");
    }
  };

  const handleDeleteParty = async () => {
    if (
      !confirm(
        "Are you sure you want to delete the party? This cannot be undone.",
      )
    )
      return;

    try {
      await deleteParty();
    } catch (err: any) {
      alert(err.message || "Failed to delete party");
    }
  };

  const handleKickUser = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to kick ${username} from the party?`))
      return;

    try {
      await kickUser(userId);
    } catch (err: any) {
      alert(err.message || "Failed to kick user");
    }
  };

  // Check if a party member is nearby (within 100 meters)
  const isMemberNearby = (member: any): boolean => {
    if (!location || !member.lat || !member.lng) return false;
    const distance = calculateDistance(
      location.lat,
      location.lng,
      member.lat,
      member.lng,
    );
    return distance <= 100; // 100 meters threshold
  };

  const isLeader = currentParty && user && currentParty.leader_id === user.id;

  if (isLoading) {
    return (
      <div className="border border-gray-700 rounded-lg bg-gray-800/50 p-4">
        <h2 className="text-lg font-semibold mb-3">👥 Party</h2>
        <div className="text-gray-400 text-center py-4">Loading...</div>
      </div>
    );
  }

  return (
    <div className="border border-gray-700 rounded-lg bg-gray-800/50 p-4 space-y-4">
      <h2 className="text-lg font-semibold">👥 Party</h2>

      {/* Current Party */}
      {currentParty ? (
        <div className="space-y-3">
          <div className="bg-gray-900/50 rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{currentParty.name}</h3>
              {isLeader && (
                <span className="text-xs text-yellow-400">⭐ Leader</span>
              )}
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <div>
                <span className="text-gray-500">Invite Code:</span>{" "}
                <span className="font-mono bg-gray-800 px-2 py-0.5 rounded">
                  {currentParty.invite_code}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Members:</span>{" "}
                {currentParty.members?.length || 0}
              </div>
            </div>

            {/* Members List */}
            {currentParty.members && currentParty.members.length > 0 && (
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="text-xs text-gray-500 mb-1">Party Members:</div>
                <div className="space-y-1">
                  {currentParty.members.map((member) => (
                    <div
                      key={member.user_id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span>
                        <OnlineStatus
                          lastActive={member.last_active}
                          variant="dot"
                        />
                        {member.username}
                        {member.is_leader && " ⭐"}
                        {isMemberNearby(member) && (
                          <span className="ml-1 text-green-400" title="Nearby">
                            📍
                          </span>
                        )}
                        <span className="ml-2">
                          <UserLevel
                            level={member.level}
                            variant="inline"
                            className="text-blue-400"
                          />
                        </span>
                      </span>
                      {isLeader && !member.is_leader && (
                        <button
                          onClick={() =>
                            handleKickUser(member.user_id, member.username)
                          }
                          className="text-red-400 hover:text-red-300 text-xs px-2 py-0.5 rounded hover:bg-red-900/20 transition-colors"
                        >
                          Kick
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Party Actions */}
          <div className="flex gap-2">
            {isLeader ? (
              <button
                onClick={handleDeleteParty}
                className="flex-1 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-xs transition-colors"
              >
                Delete Party
              </button>
            ) : (
              <button
                onClick={handleLeaveParty}
                className="flex-1 bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-xs transition-colors"
              >
                Leave Party
              </button>
            )}
          </div>
        </div>
      ) : (
        /* No Party - Show Create/Join Options */
        <div className="space-y-3">
          {/* Create Party */}
          {!showCreateForm && !showJoinForm && (
            <div className="space-y-2">
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm transition-colors"
              >
                Create Party
              </button>
              <button
                onClick={() => setShowJoinForm(true)}
                className="w-full bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm transition-colors"
              >
                Join with Code
              </button>
            </div>
          )}

          {/* Create Party Form */}
          {showCreateForm && (
            <form onSubmit={handleCreateParty} className="space-y-2">
              <input
                type="text"
                placeholder="Party name..."
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-xs transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setPartyName("");
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Join Party Form */}
          {showJoinForm && (
            <form onSubmit={handleJoinParty} className="space-y-2">
              <input
                type="text"
                placeholder="Enter invite code..."
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm font-mono focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-xs transition-colors"
                >
                  Join
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinForm(false);
                    setInviteCode("");
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Party Invites Received */}
      {receivedInvites.length > 0 && (
        <div className="border-t border-gray-700 pt-3 space-y-2">
          <div className="text-xs font-medium text-gray-400">
            Invites Received ({receivedInvites.length})
          </div>
          {currentParty && (
            <div className="text-xs text-yellow-500 bg-yellow-500/10 rounded p-2 mb-2">
              ⚠️ You must leave your current party before accepting new invites
            </div>
          )}
          {receivedInvites.map((invite) => (
            <div
              key={invite.id}
              className="bg-gray-900/50 rounded p-2 space-y-2"
            >
              <div className="text-sm">
                <div className="font-medium">{invite.party_name}</div>
                <div className="text-xs text-gray-400">
                  from {invite.inviter_username}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (currentParty) {
                      alert(
                        "You must leave your current party before accepting new invites",
                      );
                      return;
                    }
                    try {
                      await acceptInvite(invite.id);
                    } catch (err: any) {
                      alert(err.message || "Failed to accept invite");
                    }
                  }}
                  disabled={!!currentParty}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-2 py-1 rounded text-xs transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={async () => {
                    try {
                      await rejectInvite(invite.id);
                    } catch (err: any) {
                      alert(err.message || "Failed to reject invite");
                    }
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Party Invites Sent */}
      {sentInvites.length > 0 && (
        <div className="border-t border-gray-700 pt-3 space-y-2">
          <div className="text-xs font-medium text-gray-400">
            Invites Sent ({sentInvites.length})
          </div>
          {sentInvites.map((invite) => (
            <div key={invite.id} className="bg-gray-900/50 rounded p-2">
              <div className="text-sm">
                <div className="font-medium">{invite.party_name}</div>
                <div className="text-xs text-gray-400">
                  to {invite.invitee_username}
                </div>
                <div className="text-xs text-yellow-500 mt-1">⏳ Pending</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
