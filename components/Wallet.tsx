"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";

// Level calculation functions (matching backend)
function xpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

function xpToNextLevel(currentXP: number): number {
  const currentLevel = Math.floor(Math.sqrt(currentXP / 100)) + 1;
  const nextLevelXP = xpForLevel(currentLevel + 1);
  return nextLevelXP - currentXP;
}

function levelProgress(currentXP: number): number {
  const currentLevel = Math.floor(Math.sqrt(currentXP / 100)) + 1;
  const currentLevelXP = xpForLevel(currentLevel);
  const nextLevelXP = xpForLevel(currentLevel + 1);
  const progressInLevel = currentXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  return (progressInLevel / xpNeededForLevel) * 100;
}

export const Wallet = () => {
  const { user } = useAuth();

  const currentXP = user?.xp || 0;
  const currentLevel = user?.level || 1;
  const xpNeeded = xpToNextLevel(currentXP);
  const progress = levelProgress(currentXP);

  return (
    <section className="border p-4 rounded bg-gray-50 shadow-sm">
      <h2 className="font-bold mb-3 text-gray-700">2. Player Wallet</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* LEVEL & XP CARD WITH PROGRESS BAR */}
        <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700 text-white p-4 rounded shadow col-span-2">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase opacity-75 mb-1">
                Level {currentLevel}
              </h3>
              <p className="text-2xl font-bold">{currentXP} XP</p>
            </div>
            <div className="text-right text-xs opacity-75">
              <div>{xpNeeded} XP to next level</div>
            </div>
          </div>
          <div>
            <div className="w-full bg-purple-900/50 rounded-full h-3 overflow-hidden mb-1">
              <div
                className="bg-gradient-to-r from-purple-300 to-blue-300 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-xs opacity-75">
              {progress.toFixed(1)}% to Level {currentLevel + 1}
            </div>
          </div>
        </div>

        {/* GOLD CARD */}
        <div className="bg-yellow-500 text-white p-4 rounded shadow col-span-2">
          <h3 className="text-xs font-bold uppercase opacity-75">Gold</h3>
          <p className="text-2xl font-bold">{user?.gold} G</p>
        </div>
        {/* CURRENT STATUS INDICATOR */}
        {user?.venue_id ? (
          <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200 font-bold flex items-center gap-2 col-span-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Checked In: Venue #{user.venue_id}
          </div>
        ) : (
          <div className="text-xs text-gray-400 col-span-2">Not checked in</div>
        )}
      </div>
    </section>
  );
};
