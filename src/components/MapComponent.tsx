import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import {
  CityKey,
  MapLayersState,
  PropertyType,
  ScoredNeighbourhood,
  WorkplaceHub,
} from '../types';
import {
  CITIES,
  PROPERTIES,
  TRANSIT_STATIONS,
  formatINR,
} from '../data/relocationData';
import {
  RouteInfo,
  getDrivingRoute,
} from '../services/routingService';
import {
  ZoomIn,
  ZoomOut,
  Compass,
  Navigation,
  Clock,
  Car,
  AlertTriangle,
  Loader2,
  Layers,
} from 'lucide-react';

interface MapComponentProps {
  city: CityKey;
  workplace: WorkplaceHub | null;
  neighbourhoods: ScoredNeighbourhood[];
  selectedId: number | null;
  shortlist: number[];
  propType: PropertyType;
  layers: MapLayersState;
  onSelectNeighbourhood: (id: number) => void;
  onRouteLoaded?: (areaName: string, route: RouteInfo) => void;
  className?: string;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  city,
  workplace,
  neighbourhoods,
  selectedId,
  shortlist,
  propType,
  layers,
  onSelectNeighbourhood,
  onRouteLoaded,
  className = 'h-full min-h-[480px] w-full',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeRoute, setActiveRoute] = useState<RouteInfo | null>(null);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);

  // Initialize MapLibre GL map with OpenStreetMap standard raster tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (typeof window !== 'undefined') {
      maplibregl.config.WORKER_URL = '/maplibre-gl-worker.mjs';
    }

    const centerLng = workplace ? workplace.lng : CITIES[city].center[1];
    const centerLat = workplace ? workplace.lat : CITIES[city].center[0];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            maxzoom: 19,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [centerLng, centerLat],
      zoom: 12.5,
      attributionControl: false,
    });

    map.on('load', () => {
      // Add route GeoJSON source
      map.addSource('commute-route', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // Casing layer for contrast over roads
      map.addLayer({
        id: 'commute-line-casing',
        type: 'line',
        source: 'commute-route',
        paint: {
          'line-color': '#0B2313',
          'line-width': 6.5,
          'line-opacity': 0.7,
        },
      });

      // Inner road line
      map.addLayer({
        id: 'commute-line-inner',
        type: 'line',
        source: 'commute-route',
        paint: {
          'line-color': '#2E7D32',
          'line-width': 4.5,
          'line-opacity': 0.95,
        },
      });

      setMapLoaded(true);
    });

    map.on('error', (e: any) => {
      if (e?.error?.message && !e.error.message.includes('abort')) {
        console.warn('MapLibre event:', e.error.message);
      }
    });

    mapInstanceRef.current = map;

    const handleResize = () => {
      map.resize();
    };
    window.addEventListener('resize', handleResize);

    const resizeTimer = setTimeout(() => {
      map.resize();
    }, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [city]);

  // Center update when workplace changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    if (workplace) {
      map.flyTo({
        center: [workplace.lng, workplace.lat],
        zoom: 12.5,
        essential: true,
      });
    } else {
      map.flyTo({
        center: [CITIES[city].center[1], CITIES[city].center[0]],
        zoom: 12,
        essential: true,
      });
    }
  }, [workplace?.lat, workplace?.lng, city, mapLoaded]);

  // Real Road Routing Calculation via OSRM
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const routeSource = map.getSource(
      'commute-route'
    ) as maplibregl.GeoJSONSource | undefined;

    if (!workplace || selectedId === null || !layers.c) {
      if (routeSource) {
        routeSource.setData({
          type: 'FeatureCollection',
          features: [],
        });
      }
      setActiveRoute(null);
      return;
    }

    const selectedNeighbourhood = neighbourhoods.find((n) => n.i === selectedId);
    if (!selectedNeighbourhood) return;

    let isMounted = true;
    setIsRoutingLoading(true);

    const fetchRoute = async () => {
      try {
        const routeResult = await getDrivingRoute(
          workplace.lng,
          workplace.lat,
          selectedNeighbourhood.a[2],
          selectedNeighbourhood.a[1]
        );

        if (!isMounted) return;

        setActiveRoute(routeResult);
        setIsRoutingLoading(false);

        // Notify parent callback so all components see real OSRM road numbers
        onRouteLoaded?.(selectedNeighbourhood.a[0], routeResult);

        // Update GeoJSON route geometry on the MapLibre map only if valid road route exists
        if (routeSource) {
          if (!routeResult.isFallback && routeResult.geometry) {
            routeSource.setData({
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  geometry: routeResult.geometry,
                  properties: {},
                },
              ],
            });

            if (map.getLayer('commute-line-inner')) {
              map.setPaintProperty('commute-line-inner', 'line-color', '#2E7D32');
              map.setPaintProperty('commute-line-inner', 'line-dasharray', [1, 0]);
            }
          } else {
            routeSource.setData({
              type: 'FeatureCollection',
              features: [],
            });
          }
        }

        // Fit map bounds to comfortably frame the real road route
        if (
          !routeResult.isFallback &&
          routeResult.geometry &&
          routeResult.geometry.coordinates &&
          routeResult.geometry.coordinates.length > 0
        ) {
          const bounds = new maplibregl.LngLatBounds();
          routeResult.geometry.coordinates.forEach((coord: [number, number]) => {
            bounds.extend(coord);
          });

          map.fitBounds(bounds, {
            padding: { top: 70, bottom: 80, left: 70, right: 70 },
            maxZoom: 14.5,
            duration: 650,
          });
        }
      } catch (err) {
        if (!isMounted) return;
        setIsRoutingLoading(false);
      }
    };

    fetchRoute();

    return () => {
      isMounted = false;
    };
  }, [selectedId, workplace?.lat, workplace?.lng, mapLoaded, layers.c]);

  // Update Markers and Popups
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    // Clear existing markers & popup
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    // 1. Workplace Marker
    if (layers.w && workplace) {
      const officeEl = document.createElement('div');
      officeEl.className = 'custom-office-marker';
      officeEl.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Office · ${workplace.name}</span>
      `;

      const officeMarker = new maplibregl.Marker({
        element: officeEl,
        anchor: 'center',
      })
        .setLngLat([workplace.lng, workplace.lat])
        .addTo(map);

      markersRef.current.push(officeMarker);
    }

    // 2. Transit Stations
    if (layers.t) {
      const stations = TRANSIT_STATIONS[city] || [];
      stations.forEach(([name, lat, lng]) => {
        const transitEl = document.createElement('div');
        transitEl.className = 'custom-transit-marker';
        transitEl.title = `Metro Station: ${name}`;

        const transitMarker = new maplibregl.Marker({
          element: transitEl,
          anchor: 'center',
        })
          .setLngLat([lng, lat])
          .addTo(map);

        markersRef.current.push(transitMarker);
      });
    }

    // 3. Neighbourhood Markers
    if (layers.n || layers.r) {
      neighbourhoods.forEach((q) => {
        if (!q.vis) return;

        const isSelected = selectedId === q.i;
        const isShortlisted = shortlist.includes(q.i);
        const rentK = Math.round(q.x.e.rent / 1000);

        const dotClass =
          q.g === 0
            ? 'marker-dot-best'
            : q.g === 1
            ? 'marker-dot-consider'
            : 'marker-dot-stretch';

        const markerEl = document.createElement('div');
        markerEl.className = `custom-locality-marker ${
          isSelected ? 'is-active' : ''
        } ${isShortlisted ? 'is-shortlisted' : ''}`;
        markerEl.innerHTML = `
          ${layers.n ? `<span class="marker-dot ${dotClass}"></span>` : ''}
          <span>${q.a[0].split(' ·')[0]}</span>
          ${
            layers.r
              ? `<span class="text-[10px] font-bold opacity-80 pl-1 border-l border-neutral-300">₹${rentK}k</span>`
              : ''
          }
        `;

        markerEl.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectNeighbourhood(q.i);
        });

        const marker = new maplibregl.Marker({
          element: markerEl,
          anchor: 'center',
        })
          .setLngLat([q.a[2], q.a[1]])
          .addTo(map);

        markersRef.current.push(marker);

        // Open popup for selected neighbourhood
        if (isSelected) {
          const fitLabel =
            q.g === 0
              ? '<span class="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">Best Fit</span>'
              : q.g === 1
              ? '<span class="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">Worth Considering</span>'
              : '<span class="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold">Stretch</span>';

          const hasRealRoute = activeRoute
            ? !activeRoute.isFallback && activeRoute.distanceKm !== null
            : q.roadKm !== null && q.roadKm !== undefined;

          const displayDistance = hasRealRoute
            ? activeRoute?.distanceKm !== null && activeRoute?.distanceKm !== undefined
              ? `${activeRoute.distanceKm} km road`
              : `${q.roadKm} km road`
            : 'Route unavailable';

          const displayDuration = hasRealRoute
            ? activeRoute?.durationMinutes !== null && activeRoute?.durationMinutes !== undefined
              ? `~${activeRoute.durationMinutes} min driving`
              : `~${q.drivingMin} min driving`
            : 'Route unavailable';

          const popupHtml = `
            <div class="p-3.5 text-neutral-800 font-sans max-w-[260px]">
              <div class="flex items-center justify-between gap-2 mb-1.5">
                <h4 class="font-bold text-sm text-neutral-900 leading-tight">${
                  q.a[0]
                }</h4>
                ${fitLabel}
              </div>
              <div class="text-xs text-neutral-600 space-y-1 mb-2.5">
                <div class="flex justify-between">
                  <span>${PROPERTIES[propType][0]} Est:</span>
                  <span class="font-semibold text-neutral-900">${formatINR(
                    q.x.e.rent * 0.85
                  )} – ${formatINR(q.x.e.rent * 1.15)}</span>
                </div>
                <div class="flex justify-between">
                  <span>Road distance:</span>
                  <span className="font-bold text-neutral-800">${displayDistance}</span>
                </div>
                <div class="flex justify-between">
                  <span>Driving estimate:</span>
                  <span className="font-bold text-emerald-800">${displayDuration}</span>
                </div>
                <div class="flex justify-between">
                  <span>Est. monthly savings:</span>
                  <span className="font-bold ${
                    q.x.sav >= 0 ? 'text-emerald-700' : 'text-red-700'
                  }">${formatINR(q.x.sav)}/mo</span>
                </div>
              </div>
              <div class="text-[10px] text-neutral-500 italic pt-1 border-t border-neutral-100">
                Score: ${q.sc}/100 · Road distance via OSRM
              </div>
            </div>
          `;

          const popup = new maplibregl.Popup({
            offset: 16,
            closeButton: false,
          })
            .setLngLat([q.a[2], q.a[1]])
            .setHTML(popupHtml)
            .addTo(map);

          popupRef.current = popup;
        }
      });
    }
  }, [
    neighbourhoods,
    selectedId,
    shortlist,
    layers,
    workplace,
    city,
    propType,
    mapLoaded,
    activeRoute,
    onSelectNeighbourhood,
  ]);

  const handleZoom = (delta: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (delta > 0) {
      map.zoomIn();
    } else {
      map.zoomOut();
    }
  };

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (workplace) {
      map.flyTo({ center: [workplace.lng, workplace.lat], zoom: 12.5 });
    } else {
      map.flyTo({
        center: [CITIES[city].center[1], CITIES[city].center[0]],
        zoom: 12,
      });
    }
  };

  const selectedNeighbourhood = neighbourhoods.find((n) => n.i === selectedId);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#E2E6DD] bg-neutral-100 shadow-sm ${className}`}
      style={{ minHeight: '520px' }}
    >
      {/* Map DOM Container */}
      <div
        ref={mapContainerRef}
        className="h-full w-full"
        style={{ minHeight: '520px' }}
      />

      {/* Floating Route Info HUD Card (Top Left) */}
      {selectedNeighbourhood && workplace && layers.c && (
        <div className="absolute top-4 left-4 z-10 max-w-sm bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-[#E2E6DD] shadow-md space-y-2 transition-all">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Selected Neighbourhood
              </div>
              <div className="text-sm font-extrabold text-[#19241D] flex items-center gap-1.5 truncate">
                <Navigation className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="truncate">{selectedNeighbourhood.a[0]}</span>
              </div>
            </div>
            {isRoutingLoading ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-medium shrink-0">
                <Loader2 className="w-3 h-3 animate-spin" /> Routing...
              </span>
            ) : activeRoute && !activeRoute.isFallback && activeRoute.distanceKm !== null ? (
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0">
                OSRM Road Route
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md font-medium shrink-0">
                <AlertTriangle className="w-3 h-3" /> Route unavailable
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100 text-xs">
            <div>
              <div className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                <Car className="w-3 h-3 text-neutral-400" /> Road Distance
              </div>
              <div className="text-base font-extrabold text-neutral-900 mt-0.5">
                {activeRoute && !activeRoute.isFallback && activeRoute.distanceKm !== null
                  ? `${activeRoute.distanceKm} km`
                  : selectedNeighbourhood.roadKm !== null && selectedNeighbourhood.roadKm !== undefined
                  ? `${selectedNeighbourhood.roadKm} km`
                  : 'Route unavailable'}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" /> Est. Driving Time
              </div>
              <div className="text-base font-extrabold text-emerald-800 mt-0.5">
                {activeRoute && !activeRoute.isFallback && activeRoute.durationMinutes !== null
                  ? `${activeRoute.durationMinutes} min`
                  : selectedNeighbourhood.drivingMin !== null && selectedNeighbourhood.drivingMin !== undefined
                  ? `${selectedNeighbourhood.drivingMin} min`
                  : 'Route unavailable'}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-neutral-400 border-t border-neutral-100 pt-1 leading-normal">
            Highlighted driving route from {workplace.name} to {selectedNeighbourhood.a[0]}.
          </div>
        </div>
      )}

      {/* Floating Map Zoom / Recenter Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 shadow-md rounded-lg overflow-hidden bg-white/95 backdrop-blur-sm border border-[#E2E6DD]">
        <button
          type="button"
          onClick={() => handleZoom(1)}
          className="p-2 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 transition-colors border-b border-neutral-100"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleZoom(-1)}
          className="p-2 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 transition-colors border-b border-neutral-100"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          className="p-2 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
          title="Recenter Map"
          aria-label="Recenter Map"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-sm border border-[#E2E6DD] rounded-lg text-[11px] text-neutral-600 shadow-sm">
        <span className="font-semibold text-neutral-800">Legend:</span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]"></span> Best Fit
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span> Worth
          Considering
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></span> Stretch
        </span>
        <span className="inline-flex items-center gap-1 pl-1 border-l border-neutral-200">
          <span className="w-2.5 h-2.5 rotate-45 bg-[#3B6B92] inline-block"></span>{' '}
          Metro
        </span>
      </div>

      {/* OpenStreetMap Attribution Tag */}
      <div className="absolute bottom-1 right-2 z-10 text-[10px] text-neutral-500 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded shadow-2xs pointer-events-auto">
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-neutral-800">OpenStreetMap contributors</a> · OSRM Routing
      </div>
    </div>
  );
};
