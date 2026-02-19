"use client";
import { useAuth } from "@/context/AuthContext";
import { SystemLogs } from "@/components/SystemLogs";
import { AuthSection } from "@/components/AuthSection";
import { Wallet } from "@/components/Wallet";
import { Party } from "@/components/Party";
import { Actions } from "@/components/Actions";
import { Venues } from "@/components/Venues"; // <--- Updated Import
import { VenuesProvider } from "@/context/VenuesContext";
import { Friends } from "@/components/Friends";
import { FriendsProvider } from "@/context/FriendsContext";
import { Users } from "@/components/Users";
import { UsersProvider } from "@/context/UsersContext";
import { PartyProvider } from "@/context/PartyContext";
import { NavigationProvider } from "@/context/NavigationContext";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading)
    return (
      <div className="p-8 text-gray-500 text-center">Loading PubQuest...</div>
    );

  return (
    <main className="p-8 font-sans max-w-4xl mx-auto space-y-6 text-sm">
      <AuthSection />

      {user && (
        <NavigationProvider>
          <Wallet />
          <PartyProvider>
            <Party />
          </PartyProvider>
          <Actions />
          <FriendsProvider>
            <Friends />
            <UsersProvider>
              <Users />
            </UsersProvider>
            <VenuesProvider>
              <Venues />
            </VenuesProvider>
          </FriendsProvider>
        </NavigationProvider>
      )}

      <SystemLogs />
    </main>
  );
}
