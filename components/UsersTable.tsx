"use client";
import React from "react";
import { Button } from "@/components/Button";
import { useUsers } from "@/context/UsersContext";
import { useNavigation } from "@/context/NavigationContext";
import { OnlineStatus } from "@/components/OnlineStatus";
import { UserLevel } from "@/components/UserLevel";

export const UsersTable: React.FC = () => {
  const { users, meta, page, setPage, isPlaceholderData, limit, selectUser } =
    useUsers();
  const { selectVenue } = useNavigation();
  const startCount = (page - 1) * limit + 1;
  const endCount = Math.min(page * limit, meta.total);

  return (
    <section className="mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-2 font-semibold text-gray-600">Username</th>
              <th className="p-2 font-semibold text-gray-600">Status</th>
              <th className="p-2 font-semibold text-gray-600">Email</th>
              <th className="p-2 font-semibold text-gray-600">Level</th>
              <th className="p-2 font-semibold text-gray-600">XP</th>
              <th className="p-2 font-semibold text-gray-600">Party</th>
              <th className="p-2 font-semibold text-gray-600">Location</th>
              <th className="p-2 font-semibold text-gray-600 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr
                key={user.id}
                className={`hover:bg-gray-50 transition-colors ${
                  isPlaceholderData ? "opacity-50" : ""
                }`}
              >
                <td className="p-2 font-medium text-gray-800">
                  {user.username}{" "}
                  <span className="text-xs text-gray-400">#{user.id}</span>
                </td>
                <td className="p-2">
                  <OnlineStatus lastActive={user.last_active} variant="badge" />
                </td>
                <td className="p-2 text-gray-600 text-xs">{user.email}</td>
                <td className="p-2">
                  <UserLevel level={user.level} variant="badge" />
                </td>
                <td className="p-2">
                  <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-700 border border-purple-200">
                    {user.xp} XP
                  </span>
                </td>
                <td className="p-2">
                  {user.party_id ? (
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 border border-blue-200">
                      👥 {user.party_name}
                    </span>
                  ) : (
                    <span className="text-gray-300 text-xs">-</span>
                  )}
                </td>
                <td className="p-2">
                  {user.venue_id ? (
                    <button
                      onClick={() => selectVenue(user.venue_id!)}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      🍺 Venue #{user.venue_id}
                    </button>
                  ) : (
                    <span className="text-gray-300 text-xs">-</span>
                  )}
                </td>
                <td className="p-2 text-right">
                  <Button
                    onClick={() => selectUser(user.id)}
                    variant="outline"
                    className="h-8 text-xs py-0"
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
        <Button
          onClick={() => {
            if (!isPlaceholderData && page > 1) setPage((old) => old - 1);
          }}
          disabled={isPlaceholderData || page <= 1}
          variant="outline"
          className="text-xs"
        >
          ← Previous
        </Button>

        <span className="text-gray-600">
          {meta.total > 0
            ? `Showing ${startCount}–${endCount} of ${meta.total} users`
            : "No users found"}
        </span>

        <Button
          onClick={() => {
            if (!isPlaceholderData && page < (meta.totalPages || 1))
              setPage((old) => old + 1);
          }}
          disabled={isPlaceholderData || page >= (meta.totalPages || 1)}
          variant="outline"
          className="text-xs"
        >
          Next →
        </Button>
      </div>
    </section>
  );
};
