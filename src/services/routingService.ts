/**
 * OSRM Road Routing Service for Relocation Intelligence
 * Connects to https://router.project-osrm.org with persistent caching.
 * Explicitly distinguishes:
 * 1. Straight-line distance (haversine)
 * 2. Road distance (actual OSRM driving geometry)
 * 3. Baseline off-peak routing duration (free-flow)
 * 4. Modeled peak-hour duration (calibrated for Indian tech corridors)
 * 5. Data confidence & traffic source clarity
 */

export interface RouteGeometry {
  type: string;
  coordinates: [number, number][]; // [lng, lat]
}

export interface RouteInfo {
  distanceMeters: number | null;
  distanceKm: number | null;
  roadKm: number | null;
  straightLineKm: number;
  durationSeconds: number | null;
  baselineDurationMin: number | null; // Free-flow baseline from OSRM
  estimatedPeakDurationMin: number | null; // Calibrated peak-hour estimate
  durationMinutes: number | null; // Default to estimatedPeakDurationMin for safety
  geometry: RouteGeometry | null;
  isFallback: boolean;
  dataSource: string;
  trafficNote: string;
  confidence: 'high' | 'modeled';
  error?: string;
}

// Haversine straight-line distance helper
export function computeStraightLineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const p = 0.017453292519943295; // Math.PI / 180
  const c = Math.cos;
  const a =
    0.5 -
    c((lat2 - lat1) * p) / 2 +
    (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;
  return +(12742 * Math.asin(Math.sqrt(a))).toFixed(1);
}

// In-memory cache for fast lookup during the active session
const inMemoryCache = new Map<string, RouteInfo>();

// LocalStorage cache key
const STORAGE_CACHE_KEY = 'ri_osrm_cache_v4';

function getStoredCache(): Record<string, RouteInfo> {
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveToStoredCache(key: string, data: RouteInfo) {
  try {
    const cache = getStoredCache();
    cache[key] = data;
    const keys = Object.keys(cache);
    if (keys.length > 300) {
      delete cache[keys[0]];
    }
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    // Non-fatal if quota is full
  }
}

export function clearRouteStorageCache() {
  try {
    inMemoryCache.clear();
    localStorage.removeItem(STORAGE_CACHE_KEY);
  } catch (e) {}
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
 * Creates an explicit fallback route when network or OSRM fails.
 * Grounded in calibrated straight-line geometry with clear modeled labels.
 */
export function createUnavailableRoute(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
  errorMessage = 'Route unavailable'
): RouteInfo {
  const straightLine = computeStraightLineKm(fromLat, fromLng, toLat, toLng);
  // Calibrated urban road factor (~1.38x) for Indian metros
  const modeledRoadKm = +(straightLine * 1.38).toFixed(1);
  const modeledBaselineMin = Math.max(10, Math.round(modeledRoadKm * 2.2));
  const modeledPeakMin = Math.round(modeledBaselineMin * 1.55);

  return {
    distanceMeters: Math.round(modeledRoadKm * 1000),
    distanceKm: modeledRoadKm,
    roadKm: modeledRoadKm,
    straightLineKm: straightLine,
    durationSeconds: modeledPeakMin * 60,
    baselineDurationMin: modeledBaselineMin,
    estimatedPeakDurationMin: modeledPeakMin,
    durationMinutes: modeledPeakMin,
    geometry: null,
    isFallback: true,
    dataSource: 'Modeled Corridor Network Model',
    trafficNote: 'Live traffic & turn-by-turn road unavailable; using calibrated corridor baseline.',
    confidence: 'modeled',
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
  const straightLine = computeStraightLineKm(fromLat, fromLng, toLat, toLng);

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
      const distMeters = Number(primaryRoute.distance);
      const roadKm = +(distMeters / 1000).toFixed(1);
      const durSec = Number(primaryRoute.duration);
      const baselineMin = Math.max(1, Math.round(durSec / 60));

      // Calibrate realistic peak-hour duration for Indian metropolitan corridors
      // Off-peak free-flow speeds on major arteries are typically ~30-40 km/h,
      // while peak hour congested speeds average ~15-20 km/h (a ~1.5x to 1.7x factor).
      const peakMultiplier = roadKm > 15 ? 1.5 : roadKm > 8 ? 1.6 : 1.45;
      const peakMin = Math.round(baselineMin * peakMultiplier);

      const routeInfo: RouteInfo = {
        distanceMeters: Math.round(distMeters),
        distanceKm: roadKm,
        roadKm,
        straightLineKm: straightLine,
        durationSeconds: Math.round(durSec),
        baselineDurationMin: baselineMin,
        estimatedPeakDurationMin: peakMin,
        durationMinutes: peakMin, // Use peak duration by default for honest commute planning
        geometry: primaryRoute.geometry,
        isFallback: false,
        dataSource: 'OSRM OpenStreetMap Road Engine',
        trafficNote: 'Estimated peak commute (OSRM free-flow road baseline + calibrated Indian metro peak multiplier; live sensor feed disconnected).',
        confidence: 'high',
      };

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
        : 'Route service unavailable';

    const fallback = createUnavailableRoute(
      fromLng,
      fromLat,
      toLng,
      toLat,
      msg
    );
    inMemoryCache.set(cacheKey, fallback);
    return fallback;
  }
}
