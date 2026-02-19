"use client";

interface OnlineStatusProps {
  lastActive: string;
  variant?: "badge" | "dot";
}

export const OnlineStatus: React.FC<OnlineStatusProps> = ({
  lastActive,
  variant = "dot",
}) => {
  const isUserOnline = (now: Date) => {
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    return new Date(lastActive) > fiveMinutesAgo;
  };

  const online = isUserOnline(new Date());

  if (variant === "badge") {
    return online ? (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-700 border border-green-200">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
        Online
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-500 border border-gray-200">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></span>
        Offline
      </span>
    );
  }

  // dot variant
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full ${
        online ? "bg-green-500" : "bg-gray-400"
      }`}
      title={online ? "Online" : "Offline"}
    ></span>
  );
};
