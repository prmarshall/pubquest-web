import React, { useEffect, useState } from "react";
import { logger } from "@/services/LogService";

export const SystemLogs = () => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Subscribe to the logger
    const unsubscribe = logger.subscribe((msg) => {
      setLogs((prev) => [`> ${msg}`, ...prev]);
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 font-mono text-xs overflow-hidden flex flex-col h-[600px]">
      <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-2">
        <span className="text-gray-500 uppercase tracking-widest font-bold">
          System Logs
        </span>
        <button
          onClick={() => setLogs([])}
          className="text-gray-500 hover:text-white transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {logs.map((log, i) => (
          <div
            key={i}
            className="break-words text-gray-300 border-b border-gray-800/50 pb-1 last:border-0"
          >
            {log}
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-gray-600 italic mt-4 text-center">
            Ready for commands...
          </p>
        )}
      </div>
    </div>
  );
};
