"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/Button";
import { OnlineStatus } from "@/components/OnlineStatus";
import { UserLevel } from "@/components/UserLevel";
import { useUsers } from "@/context/UsersContext";

export interface User {
  id: number;
  username: string;
  email: string;
  xp: number;
  level: number;
  gold: number;
  venue_id: number | null;
  last_active: string;
  friendship_status: "FRIENDS" | "REQUEST_SENT" | "REQUEST_RECEIVED" | "NONE";
  party_id: number | null;
  party_name: string | null;
  friends_since: string | null;
}

export const UserDetail: React.FC = () => {
  const {
    selectedUser: user,
    clearSelectedUser,
    isLoadingSelectedUser,
  } = useUsers();

  if (!user) return null;

  if (isLoadingSelectedUser) {
    return (
      <section className="mt-6 border border-blue-200 rounded-lg bg-blue-50/50 p-4">
        <div className="text-center p-4 text-gray-400">
          Loading user details...
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 border border-blue-200 rounded-lg bg-blue-50/50 p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            {user.username}
            <span className="text-sm text-gray-400 ml-2">#{user.id}</span>
          </h3>
          <div className="flex gap-2 mt-2">
            <OnlineStatus lastActive={user.last_active} variant="badge" />
            <UserLevel level={user.level} variant="badge" />
            <span className="inline-block px-2 py-1 rounded text-xs bg-purple-100 text-purple-700 border border-purple-200">
              {user.xp} XP
            </span>
            <span className="inline-block px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700 border border-yellow-200">
              {user.gold} 🪙
            </span>
          </div>
        </div>
        <Button
          onClick={clearSelectedUser}
          variant="outline"
          className="text-xs"
        >
          Close
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-white rounded p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Email</div>
          <div className="text-sm text-gray-700">{user.email}</div>
        </div>

        <div className="bg-white rounded p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Party</div>
          <div className="text-sm text-gray-700">
            {user.party_id ? (
              <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 border border-blue-200">
                👥 {user.party_name}
              </span>
            ) : (
              <span className="text-gray-400">No party</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Location</div>
          <div className="text-sm text-gray-700">
            {user.venue_id ? (
              <span className="text-xs text-gray-700">
                🍺 Venue #{user.venue_id}
              </span>
            ) : (
              <span className="text-gray-400">Not checked in</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Friendship Status</div>
          <div className="text-sm text-gray-700">
            {user.friendship_status === "FRIENDS" && (
              <div>
                <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 border border-green-200">
                  ✓ Friends
                </span>
                {user.friends_since && (
                  <div className="mt-2 text-xs text-gray-500">
                    Since {new Date(user.friends_since).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
            {user.friendship_status === "REQUEST_SENT" && (
              <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700 border border-yellow-200">
                ⏳ Request Sent
              </span>
            )}
            {user.friendship_status === "REQUEST_RECEIVED" && (
              <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 border border-blue-200">
                📬 Request Received
              </span>
            )}
            {user.friendship_status === "NONE" && (
              <span className="text-gray-400">Not friends</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded p-3 border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Last Active</div>
          <div className="text-sm text-gray-700">
            {new Date(user.last_active).toLocaleString()}
          </div>
        </div>
      </div>
    </section>
  );
};
