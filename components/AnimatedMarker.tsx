import React, { useEffect, useRef, useState } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import { LOCATION_MARKER_TRANSITION_MS } from "@/config/map.config";

// Animated marker component with smooth transitions
export function AnimatedMarker({
  position,
  icon,
  children,
  onAnimatedPositionChange,
  transitionMs = LOCATION_MARKER_TRANSITION_MS,
}: {
  position: [number, number];
  icon: L.DivIcon;
  children: React.ReactNode;
  onAnimatedPositionChange?: (position: [number, number]) => void;
  transitionMs?: number;
}) {
  const markerRef = useRef<L.Marker | null>(null);
  const animationRef = useRef<number | null>(null);
  const callbackRef = useRef(onAnimatedPositionChange);
  const currentAnimatedPosRef = useRef(position); // Track current animated position

  // Keep callback ref updated without triggering effect
  useEffect(() => {
    callbackRef.current = onAnimatedPositionChange;
  }, [onAnimatedPositionChange]);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) {
      currentAnimatedPosRef.current = position;
      return;
    }

    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Start from current animated position (where marker actually is right now)
    const start = currentAnimatedPosRef.current;
    const end = position;

    // Check if we're already at the target
    if (start[0] === end[0] && start[1] === end[1]) {
      return;
    }

    const duration = transitionMs; // 800ms - faster than map's 1000ms
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic function for smoother deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      const lat = start[0] + (end[0] - start[0]) * eased;
      const lng = start[1] + (end[1] - start[1]) * eased;

      const newPos: [number, number] = [lat, lng];
      currentAnimatedPosRef.current = newPos;
      marker.setLatLng(newPos);

      // Notify parent of animated position change using ref
      if (callbackRef.current) {
        callbackRef.current(newPos);
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
        currentAnimatedPosRef.current = position;
        // Final position update
        if (callbackRef.current) {
          callbackRef.current(position);
        }
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [position]); // Only depend on position

  return (
    <Marker ref={markerRef} position={position} icon={icon}>
      {children}
    </Marker>
  );
}
