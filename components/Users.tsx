"use client";
import React, { useRef, useEffect } from "react";
import { useUsers } from "@/context/UsersContext";
import { UserSearch } from "./UserSearch";
import { UserDetail } from "@/components/UserDetail";
import { UsersTable } from "@/components/UsersTable";
import { useNavigation } from "@/context/NavigationContext";

export const Users = () => {
  const { isLoading, selectedUser, selectUser } = useUsers();
  const { selectedUserId: selectedUserIdFromNav, clearUser } = useNavigation();
  const ref = useRef<HTMLDivElement>(null);

  // When user is selected from Friends component via NavigationContext
  useEffect(() => {
    if (selectedUserIdFromNav) {
      selectUser(selectedUserIdFromNav);
    }
  }, [selectedUserIdFromNav, selectUser]);

  // Clear navigation context when user closes detail
  useEffect(() => {
    if (!selectedUser) {
      clearUser();
    }
  }, [selectedUser, clearUser]);

  if (isLoading)
    return (
      <div className="text-center p-4 text-gray-400">Loading users...</div>
    );

  return (
    <section
      ref={ref}
      className="col-span-1 lg:col-span-2 border p-4 rounded bg-white shadow-sm mt-8"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-gray-700">👥 Users</h2>
      </div>
      <UserSearch />
      <UsersTable />
      {selectedUser && (
        <div>
          <UserDetail />
        </div>
      )}
    </section>
  );
};
