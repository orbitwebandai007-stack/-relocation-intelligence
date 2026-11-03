/**
 * OSRM Road Routing Service for Relocation Intelligence
 * Connects to https://router.project-osrm.org with persistent caching
 * to calculate real road driving routes, distances (km), and travel durations (min).
 */

export interface RouteGeometry {
  type: string;
  coordinates: [number, number][]; // [lng, lat]
}

export interface RouteInfo {
  distanceMeters: number | null;
  distanceKm: number | null;
  durationSeconds: number | null;
  durationMinutes: number | null;
  geometry: RouteGeometry | null;
  isFallback: boolean;
  error?: string;
}

// In-memory cache for fast lookup during the active session
const inMemoryCache = new Map<string, RouteInfo>();

// LocalStorage cache key
const STORAGE_CACHE_KEY = 'ri_osrm_cache_v3';

// Load stored cache
function getStoredCache(): Record<string, RouteInfo> {
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

// Save to persistent storage with error catching
function saveToStoredCache(key: string, data: RouteInfo) {
  try {
    const cache = getStoredCache();
    cache[key] = data;
    // Keep max 250 routes to avoid exceeding storage limits
    const keys = Object.keys(cache);
    if (keys.length > 250) {
      delete cache[keys[0]];
    }
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    // Non-fatal if storage quota is full
  }
}

function makeCacheKey(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number
): string {
  return `${fromLng.toFixed(4)},${fromLat.toFixed(4)}_${toLng.toFixed(4)},${toLat.toFixed(4)}`;
}

/**
 * Creates an explicit unavailable route object when network or OSRM fails.
 * Does not substitute straight-line distance as road distance.
 */
export function createUnavailableRoute(errorMessage = 'Route unavailable'): RouteInfo {
  return {
    distanceMeters: null,
    distanceKm: null,
    durationSeconds: null,
    durationMinutes: null,
    geometry: null,
    isFallback: true,
    error: errorMessage,
  };
}

/**
 * Fetch driving route between two points using OSRM Route API.
 * Uses cached result if available to minimize requests to public demo server.
 */
export async function getDrivingRoute(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number
): Promise<RouteInfo> {
  const cacheKey = makeCacheKey(fromLng, fromLat, toLng, toLat);

  // 1. Check in-memory cache
  if (inMemoryCache.has(cacheKey)) {
    return inMemoryCache.get(cacheKey)!;
  }

  // 2. Check localStorage cache
  const stored = getStoredCache();
  if (stored[cacheKey]) {
    inMemoryCache.set(cacheKey, stored[cacheKey]);
    return stored[cacheKey];
  }

  // 3. Request OSRM Route API
  const endpoint = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OSRM HTTP status ${response.status}`);
    }

    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const primaryRoute = data.routes[0];
      // Extract the distance in metres from the OSRM response (routes[0].distance)
      const distMeters = Number(primaryRoute.distance);
      // Convert it into kilometres
      const distKm = +(distMeters / 1000).toFixed(1);
      const durSec = Number(primaryRoute.duration);
      const durMin = Math.max(1, Math.round(durSec / 60));

      const routeInfo: RouteInfo = {
        distanceMeters: Math.round(distMeters),
        distanceKm: distKm,
        durationSeconds: Math.round(durSec),
        durationMinutes: durMin,
        geometry: primaryRoute.geometry,
        isFallback: false,
      };

      // Cache the valid route result
      inMemoryCache.set(cacheKey, routeInfo);
      saveToStoredCache(cacheKey, routeInfo);

      return routeInfo;
    } else {
      throw new Error(data.message || 'Route unavailable');
    }
  } catch (err: any) {
    const msg =
      err.name === 'AbortError'
        ? 'Route request timed out.'
        : 'Route unavailable';

    const fallback = createUnavailableRoute(msg);
    // Cache the fallback temporarily in memory
    inMemoryCache.set(cacheKey, fallback);
    return fallback;
  }
}
