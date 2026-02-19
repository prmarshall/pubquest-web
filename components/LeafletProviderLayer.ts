"use client";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
// We import the plugin here so it patches L
import "leaflet-providers";

interface LeafletProviderLayerProps {
  provider: string; // e.g. "Stadia.StamenToner"
  apiKey?: string;
  opacity?: number;
}

export const LeafletProviderLayer = ({
  provider,
  apiKey,
  opacity = 1,
}: LeafletProviderLayerProps) => {
  const map = useMap();

  useEffect(() => {
    // @ts-expect-error - The library adds .provider to tileLayer, but TS doesn't know
    const layer = L.tileLayer.provider(provider, {
      apikey: apiKey,
      opacity,
    });

    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, provider, opacity, apiKey]);

  return null;
};
