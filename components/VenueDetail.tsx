"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/Button";
import { NPCConversation } from "@/components/NPCConversation";
import { VenueLiveCount } from "@/components/VenueLiveCount";
import { VenueCheckInButton } from "@/components/VenueCheckInButton";
import { useAuth } from "@/context/AuthContext";
import { useVenues } from "@/context/VenuesContext";

export interface Venue {
  id: number;
  name: string;
  lat: number;
  lng: number;
  category: string;
  address?: string;
  live_count: number;
  distance_meters?: number;
}

interface DialogueNode {
  text: string;
  options?: Array<{
    text: string;
    next: string;
  }>;
  show_quests?: boolean;
  end?: boolean;
}

interface DialogueTree {
  [key: string]: DialogueNode;
}

interface NPC {
  id: number;
  name: string;
  description: string;
  avatar_url: string | null;
  venue_id: number | null;
  is_quest_giver: boolean;
  greeting_text: string | null;
  venue_name: string | null;
  available_quests_count: number;
  dialogue_tree: DialogueTree;
}

export const VenueDetail: React.FC = () => {
  const { user } = useAuth();
  const {
    selectedVenue: venue,
    clearSelectedVenue,
    isLoadingSelectedVenue,
  } = useVenues();
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [isLoadingNpcs, setIsLoadingNpcs] = useState(true);
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);

  useEffect(() => {
    if (!venue) return;

    // Reset NPCs when venue changes to prevent showing old data
    setNpcs([]);
    setIsLoadingNpcs(true);

    const fetchNPCs = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:3000/api/npcs?venue_id=${venue.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          setNpcs(data);
        }
      } catch (error) {
        console.error("Failed to fetch NPCs:", error);
      } finally {
        setIsLoadingNpcs(false);
      }
    };

    fetchNPCs();
  }, [venue?.id]);

  if (!venue) return null;

  // Show loading state when fetching new venue
  if (isLoadingSelectedVenue) {
    return (
      <section className="mt-6 border border-blue-200 rounded-lg bg-blue-50/50 p-4">
        <div className="space-y-4 animate-pulse">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded col-span-2"></div>
          </div>
        </div>
      </section>
    );
  }

  const isCheckedIn = user?.venue_id === venue.id;

  return (
    <>
      <section className="mt-6 border border-blue-200 rounded-lg bg-blue-50/50 p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{venue.name}</h3>
            <span className="inline-block mt-1 px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 border border-gray-200">
              {venue.category}
            </span>
          </div>
          <Button
            onClick={clearSelectedVenue}
            variant="outline"
            className="text-xs"
          >
            Close
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded p-3 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Venue ID</div>
            <div className="font-semibold text-gray-800">#{venue.id}</div>
          </div>

          <div className="bg-white rounded p-3 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Current Activity</div>
            <VenueLiveCount
              venueId={venue.id}
              initialCount={venue.live_count}
            />
          </div>

          <div className="bg-white rounded p-3 border border-gray-200 col-span-2">
            <div className="text-xs text-gray-500 mb-1">Location</div>
            <div className="text-sm text-gray-700">
              📍 {venue.lat.toFixed(6)}, {venue.lng.toFixed(6)}
              {venue.distance_meters !== undefined && (
                <span className="ml-2 text-xs text-gray-500">
                  (
                  {venue.distance_meters < 1000
                    ? `${Math.round(venue.distance_meters)}m away`
                    : `${(venue.distance_meters / 1000).toFixed(1)}km away`}
                  )
                </span>
              )}
            </div>
          </div>

          {venue.address && (
            <div className="bg-white rounded p-3 border border-gray-200 col-span-2">
              <div className="text-xs text-gray-500 mb-1">Address</div>
              <div className="text-sm text-gray-700">{venue.address}</div>
            </div>
          )}

          {/* Check-in section */}
          <div className="bg-white rounded p-3 border border-gray-200 col-span-2">
            <VenueCheckInButton variant="outline" fullWidth />
          </div>

          {/* NPCs at this venue */}
          <div className="bg-white rounded p-3 border border-gray-200 col-span-2">
            <div className="text-xs text-gray-500 mb-2">
              NPCs at this location
            </div>
            {!isCheckedIn ? (
              <div className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded p-3">
                🚪 You must check in to this venue to interact with NPCs
              </div>
            ) : isLoadingNpcs ? (
              <div className="text-sm text-gray-400">Loading NPCs...</div>
            ) : npcs.length > 0 ? (
              <div className="space-y-2">
                {npcs.map((npc) => (
                  <button
                    key={npc.id}
                    onClick={() => setSelectedNPC(npc)}
                    className="w-full flex items-start gap-3 p-2 rounded bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">
                      {npc.avatar_url ? (
                        <Image
                          src={npc.avatar_url}
                          alt={npc.name}
                          width={40}
                          height={40}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        "👤"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                        {npc.name}
                        {npc.is_quest_giver && (
                          <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded border border-yellow-200">
                            ⚔️ Quest Giver
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {npc.description}
                      </p>
                      {npc.greeting_text && (
                        <p className="text-xs text-gray-500 italic mt-1">
                          &ldquo;{npc.greeting_text}&rdquo;
                        </p>
                      )}
                      {npc.is_quest_giver && npc.available_quests_count > 0 && (
                        <div className="text-xs text-blue-600 mt-1">
                          📜 {npc.available_quests_count}{" "}
                          {npc.available_quests_count === 1
                            ? "quest"
                            : "quests"}{" "}
                          available
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400">
                No NPCs at this location
              </div>
            )}
          </div>
        </div>
      </section>

      {/* NPC Conversation Modal */}
      {selectedNPC && (
        <NPCConversation
          npc={selectedNPC}
          onClose={() => setSelectedNPC(null)}
        />
      )}
    </>
  );
};
