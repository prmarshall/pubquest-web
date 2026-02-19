"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/Button";

interface DialogueNode {
  text: string;
  options?: Array<{
    text: string;
    next: string;
  }>;
  show_quests?: boolean;
  quest_title?: string;
  check_quest?: string;
  if_active?: string;
  if_no_work?: string;
  end?: boolean;
}

interface DialogueTree {
  [key: string]: DialogueNode;
}

interface Quest {
  id: number;
  title: string;
  description: string;
  reward_xp: number;
  reward_gold: number;
  level_requirement: number;
  is_repeatable: boolean;
  status?: string;
}

interface NPC {
  id: number;
  name: string;
  description: string;
  avatar_url: string | null;
  greeting_text: string | null;
  dialogue_tree: DialogueTree;
}

interface NPCConversationProps {
  npc: NPC;
  onClose: () => void;
}

export const NPCConversation: React.FC<NPCConversationProps> = ({
  npc,
  onClose,
}) => {
  const [currentNode, setCurrentNode] = useState<string | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [, setActiveQuests] = useState<Quest[]>([]);
  const [isLoadingQuests, setIsLoadingQuests] = useState(false);
  const [isAcceptingQuest, setIsAcceptingQuest] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const dialogue = currentNode ? npc.dialogue_tree[currentNode] : null;

  // Initialize dialogue - get starting node from backend (only once)
  useEffect(() => {
    if (isInitialized) return;

    const initializeDialogue = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:3000/api/npcs/${npc.id}/dialogue`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          setCurrentNode(data.start_node);
        } else {
          // Fallback to greeting
          setCurrentNode("greeting");
        }
      } catch (error) {
        console.error("Failed to initialize dialogue:", error);
        setCurrentNode("greeting");
      } finally {
        setIsInitialized(true);
      }
    };

    initializeDialogue();
  }, [isInitialized, npc.id]);

  const fetchQuests = useCallback(async () => {
    setIsLoadingQuests(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/npcs/${npc.id}/quests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setQuests(data.available || []);
        setActiveQuests(data.active || []);
      }
    } catch (error) {
      console.error("Failed to fetch quests:", error);
    } finally {
      setIsLoadingQuests(false);
    }
  }, [npc.id]);

  useEffect(() => {
    let isCancelled = false;

    if (dialogue?.show_quests) {
      fetchQuests();
    } else if (dialogue?.quest_title) {
      // Fetch specific quest by title
      const fetchSpecificQuest = async () => {
        setIsLoadingQuests(true);
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `http://localhost:3000/api/npcs/${npc.id}/quests`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          if (response.ok && !isCancelled) {
            const data = await response.json();
            const specificQuest = data.available.find(
              (q: Quest) => q.title === dialogue.quest_title,
            );
            setQuests(specificQuest ? [specificQuest] : []);
            setActiveQuests(data.active || []);
          }
        } catch (error) {
          if (!isCancelled) {
            console.error("Failed to fetch quest:", error);
          }
        } finally {
          if (!isCancelled) {
            setIsLoadingQuests(false);
          }
        }
      };
      fetchSpecificQuest();
    } else {
      setQuests([]);
      setActiveQuests([]);
    }

    return () => {
      isCancelled = true;
    };
  }, [
    currentNode,
    dialogue?.show_quests,
    dialogue?.quest_title,
    fetchQuests,
    npc.id,
  ]);

  const handleAcceptQuest = async (questId: number) => {
    setIsAcceptingQuest(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/npcs/${npc.id}/quests/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quest_id: questId }),
        },
      );

      if (response.ok) {
        alert("Quest accepted! Check your quest log.");
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to accept quest");
      }
    } catch (error) {
      console.error("Failed to accept quest:", error);
      alert("Failed to accept quest");
    } finally {
      setIsAcceptingQuest(false);
    }
  };

  const handleOptionClick = async (nextNode: string) => {
    if (nextNode === "end") {
      onClose();
      return;
    }

    // Check if the next node is a quest node that might redirect
    const nextDialogueNode = npc.dialogue_tree[nextNode];
    if (
      nextDialogueNode &&
      (nextDialogueNode.show_quests || nextDialogueNode.quest_title) &&
      nextDialogueNode.if_no_work
    ) {
      // Prevent rendering until we know the correct node
      setCurrentNode(null);

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:3000/api/npcs/${npc.id}/dialogue/${nextNode}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.ok) {
          const dialogueData = await response.json();
          if (dialogueData.node && dialogueData.node !== nextNode) {
            // Backend redirected us to a different node
            setCurrentNode(dialogueData.node);
          } else {
            // No redirect, use the original node
            setCurrentNode(nextNode);
          }
          return;
        }
      } catch (error) {
        console.error("Failed to check dialogue redirect:", error);
      }

      // If fetch failed, still proceed to the original node
      setCurrentNode(nextNode);
      return;
    }

    setCurrentNode(nextNode);
  };

  if (!dialogue) {
    // Show the dialogue container with ellipses during loading/transition
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
              {npc.avatar_url ? (
                <Image
                  src={npc.avatar_url}
                  alt={npc.name}
                  width={48}
                  height={48}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                "👤"
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">{npc.name}</h3>
              <p className="text-xs text-gray-500">{npc.description}</p>
            </div>
            <Button onClick={onClose} variant="outline" className="text-xs">
              End Conversation
            </Button>
          </div>

          {/* Loading State */}
          <div className="flex-1 overflow-y-auto p-6 h-[600px]">
            <div className="bg-gray-100 rounded-lg p-4 mb-4 border-l-4 border-blue-500 min-h-[300px] flex items-center">
              <p className="text-gray-500 animate-pulse">...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
            {npc.avatar_url ? (
              <Image
                src={npc.avatar_url}
                alt={npc.name}
                width={48}
                height={48}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              "👤"
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800">{npc.name}</h3>
            <p className="text-xs text-gray-500">{npc.description}</p>
          </div>
          <Button onClick={onClose} variant="outline" className="text-xs">
            End Conversation
          </Button>
        </div>

        {/* Dialogue Content */}
        <div className="flex-1 overflow-y-auto p-6 h-[600px]">
          {/* NPC Speech */}
          <div className="bg-gray-100 rounded-lg p-4 mb-4 border-l-4 border-blue-500 min-h-[300px] flex items-start">
            <p className="text-gray-800">{dialogue.text}</p>
          </div>

          {/* Show Quests if requested */}
          {(dialogue.show_quests || dialogue.quest_title) && (
            <div className="mb-4">
              {isLoadingQuests ? (
                <div className="text-center text-gray-500 py-4">
                  Loading quests...
                </div>
              ) : quests.length > 0 ? (
                <div className="space-y-3">
                  {quests.map((quest) => (
                    <div
                      key={quest.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {quest.title}
                        </h4>
                        <div className="flex gap-2 text-xs">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {quest.reward_xp} XP
                          </span>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                            {quest.reward_gold} 🪙
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {quest.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 text-xs">
                          <span className="text-gray-500">
                            Level {quest.level_requirement}+
                          </span>
                          {quest.is_repeatable && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
                              Repeatable
                            </span>
                          )}
                          {quest.status && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                              {quest.status}
                            </span>
                          )}
                        </div>
                        <Button
                          onClick={() => handleAcceptQuest(quest.id)}
                          disabled={
                            isAcceptingQuest ||
                            quest.status === "ACTIVE" ||
                            quest.status === "COMPLETED"
                          }
                          className="text-xs"
                        >
                          {quest.status === "ACTIVE"
                            ? "Already Active"
                            : quest.status === "COMPLETED"
                              ? "Completed"
                              : isAcceptingQuest
                                ? "Accepting..."
                                : "Accept Quest"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {/* Player Response Options */}
          <div className="space-y-2 min-h-[300px]">
            {dialogue.options && !dialogue.end && (
              <>
                <p className="text-sm text-gray-500 mb-2">
                  What do you want to say?
                </p>
                {dialogue.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option.next)}
                    className="w-full text-left px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
                  >
                    <span className="text-gray-700">➤ {option.text}</span>
                  </button>
                ))}
              </>
            )}
          </div>

          {/* End conversation option */}
          {dialogue.end && (
            <div className="text-center pt-4">
              <Button onClick={onClose}>Close</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
