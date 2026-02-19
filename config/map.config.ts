export const leafletProviderOptions = {
  provider: "Thunderforest.Pioneer",
  apiKey: "e8e46a2ddbca469cac4ee44263a59783",
};

// --- Fix for Leaflet Icons in Next.js ---
// Leaflet's default icon paths break in bundlers, this fixes it.
const TANKARD_ICON_URL =
  "https://static.wikitide.net/terrascapewiki/6/65/Tavern_icon.png";
const TANKARD_ICON_RETINA_URL = "";
const TANKARD_ICON_SHADOW_URL = "";

export const MAP_DEFAULT_CENTER: [number, number] = [51.505, -0.09]; // London
const MAP_DEFAULT_ZOOM = 13;
export const MAP_VENUE_ZOOM = 16;
const MAP_SCROLL_WHEEL_ZOOM = true;
const MAP_DOUBLE_CLICK_ZOOM = false;
export const MAP_PAN_DURATION_MS = 1000;
const MAP_STYLE = { height: "100%", width: "100%" };
const VENUE_ICON_SIZE = [41, 41] as [number, number];
const VENUE_IN_RANGE_ICON_SIZE = [51, 51] as [number, number];

export const LOCATION_MARKER_TRANSITION_MS = 800;

// Map container options

export const mapContainerOptions = {
  center: MAP_DEFAULT_CENTER,
  zoom: MAP_DEFAULT_ZOOM,
  scrollWheelZoom: MAP_SCROLL_WHEEL_ZOOM,
  doubleClickZoom: MAP_DOUBLE_CLICK_ZOOM,
  style: MAP_STYLE,
};

// Map icon options

export const venueIconOptions = {
  iconUrl: TANKARD_ICON_URL,
  shadowUrl: TANKARD_ICON_SHADOW_URL,
  iconSize: VENUE_ICON_SIZE,
  iconAnchor: [41, 41] as [number, number],
  popupAnchor: [1, -34] as [number, number],
  tooltipAnchor: [16, -28] as [number, number],
  shadowSize: [41, 41] as [number, number],
};

export const venueInRangeIconOptions = {
  ...venueIconOptions,
  iconSize: VENUE_IN_RANGE_ICON_SIZE,
};

export const userIconOptions = {
  className: "custom-marker",
  html: '<div style="width: 16px; height: 16px; background-color: #ef4444; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
  iconSize: [16, 16] as [number, number],
  iconAnchor: [8, 8] as [number, number],
  popupAnchor: [0, -8] as [number, number],
};

export const friendIconOptions = {
  className: "custom-marker",
  html: '<div style="width: 16px; height: 16px; background-color: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
  iconSize: [16, 16] as [number, number],
  iconAnchor: [8, 8] as [number, number],
  popupAnchor: [0, -8] as [number, number],
};
