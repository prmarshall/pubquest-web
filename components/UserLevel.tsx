"use client";
import React from "react";

interface UserLevelProps {
  level: number;
  variant?: "badge" | "inline" | "text";
  className?: string;
}

export const UserLevel: React.FC<UserLevelProps> = ({
  level,
  variant = "badge",
  className = "",
}) => {
  // Badge variant - styled badge with border
  if (variant === "badge") {
    return (
      <span
        className={`inline-block px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 border border-blue-200 font-semibold ${className}`}
      >
        Lv.{level}
      </span>
    );
  }

  // Inline variant - simple colored text for compact displays
  if (variant === "inline") {
    return (
      <span className={`text-xs text-blue-600 ${className}`}>Lv.{level}</span>
    );
  }

  // Text variant - plain text for descriptions
  if (variant === "text") {
    return <span className={className}>Level {level}</span>;
  }

  return null;
};
