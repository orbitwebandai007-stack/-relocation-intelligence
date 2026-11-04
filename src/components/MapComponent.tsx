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
  Map as MapIcon,
  Eye,
  EyeOff,
} from 'lucide-react';

interface MapComponentProps {
  city: CityKey;
  workplace: WorkplaceHub | null;
  candidateWp?: WorkplaceHub | null;
  flowPhase?: 'onboarding' | 'workplace_select' | 'recommendations';
  neighbourhoods: ScoredNeighbourhood[];
  selectedId: number | null;
  shortlist: number[];
  propType: PropertyType;
  layers: MapLayersState;
  currentStep?: number;
  onSelectNeighbourhood: (id: number) => void;
  onRouteLoaded?: (areaName: string, route: RouteInfo) => void;
  onMapClickForWorkplace?: (lat: number, lng: number) => void;
  className?: string;
  isPanelVisible?: boolean;
  onTogglePanel?: () => void;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  city,
  workplace,
  candidateWp = null,
  flowPhase = 'recommendations',
  neighbourhoods,
  selectedId,
  shortlist,
  propType,
  layers,
  currentStep = 2,
  onSelectNeighbourhood,
  onRouteLoaded,
  onMapClickForWorkplace,
  className = 'h-full w-full',
  isPanelVisible = true,
  onTogglePanel,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeRoute, setActiveRoute] = useState<RouteInfo | null>(null);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);

  // Initialize MapLibre GL map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (typeof window !== 'undefined') {
      maplibregl.config.WORKER_URL = '/maplibre-gl-worker.mjs';
    }

    const currentCityData = CITIES[city] || CITIES.blr;
    
    // Pan-India view if in onboarding phase, otherwise city or office center
    const isInitialOnboarding = flowPhase === 'onboarding';
    const centerLng = isInitialOnboarding
      ? 78.9629
      : workplace
      ? workplace.lng
      : currentCityData.center[1];
    const centerLat = isInitialOnboarding
      ? 20.5937
      : workplace
      ? workplace.lat
      : currentCityData.center[0];
    const initialZoom = isInitialOnboarding ? 4.7 : 11.8;

    // High quality light, low-contrast raster basemap
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
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
            paint: {
              'raster-saturation': -0.55,
              'raster-contrast': -0.1,
              'raster-brightness-min': 0.05,
            },
          },
        ],
      },
      center: [centerLng, centerLat],
      zoom: initialZoom,
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
          'line-color': '#18231E',
          'line-width': 6,
          'line-opacity': 0.65,
        },
      });

      // Inner road line with distinct pine color
      map.addLayer({
        id: 'commute-line-inner',
        type: 'line',
        source: 'commute-route',
        paint: {
          'line-color': '#176B50',
          'line-width': 4,
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

  // Click handler for workplace placement when in workplace_select phase
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      if (flowPhase === 'workplace_select' && onMapClickForWorkplace) {
        onMapClickForWorkplace(e.lngLat.lat, e.lngLat.lng);
      }
    };

    if (flowPhase === 'workplace_select') {
      map.getCanvas().style.cursor = 'crosshair';
    } else {
      map.getCanvas().style.cursor = '';
    }

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [mapLoaded, flowPhase, onMapClickForWorkplace]);

  // Smooth camera transitions across flow phases
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const currentCityData = CITIES[city] || CITIES.blr;

    if (flowPhase === 'onboarding') {
      map.flyTo({
        center: [78.9629, 20.5937],
        zoom: 4.7,
        duration: 1200,
        essential: true,
      });
    } else if (flowPhase === 'workplace_select') {
      if (candidateWp) {
        map.flyTo({
          center: [candidateWp.lng, candidateWp.lat],
          zoom: 12.8,
          duration: 800,
          essential: true,
        });
      } else {
        map.flyTo({
          center: [currentCityData.center[1], currentCityData.center[0]],
          zoom: 11.8,
          duration: 1200,
          essential: true,
        });
      }
    } else if (flowPhase === 'recommendations') {
      if (workplace) {
        map.flyTo({
          center: [workplace.lng, workplace.lat],
          zoom: currentStep === 0 ? 13 : 12.2,
          duration: 900,
          essential: true,
        });
      }
    }
  }, [
    flowPhase,
    city,
    workplace?.lat,
    workplace?.lng,
    candidateWp?.lat,
    candidateWp?.lng,
    mapLoaded,
    currentStep,
  ]);

  // Dynamic route calculation for selected neighbourhood
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
              map.setPaintProperty('commute-line-inner', 'line-color', '#176B50');
              map.setPaintProperty('commute-line-inner', 'line-dasharray', [1, 0]);
            }
          } else {
            routeSource.setData({
              type: 'FeatureCollection',
              features: [],
            });
          }
        }

        // Fit map bounds to frame road route on desktop
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
            padding: { top: 80, bottom: 80, left: 80, right: isPanelVisible ? 440 : 80 },
            maxZoom: 14.5,
            duration: 700,
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
  }, [selectedId, workplace?.lat, workplace?.lng, mapLoaded, layers.c, isPanelVisible]);

  // Update Markers: Lamar-style circular badge markers & Workplace marker with pulsing radar
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

    // PHASE 1: In initial onboarding, remove all markers completely
    if (flowPhase === 'onboarding') {
      return;
    }

    // PHASE 2: In workplace selection, render only candidate workplace marker if present
    if (flowPhase === 'workplace_select') {
      const activeCandidate = candidateWp || workplace;
      if (activeCandidate) {
        const officeContainer = document.createElement('div');
        officeContainer.className = 'relative flex items-center justify-center cursor-pointer';

        // Pulsing radar ring
        const radar = document.createElement('div');
        radar.className = 'radar-ring';
        officeContainer.appendChild(radar);

        // Office badge label
        const officeEl = document.createElement('div');
        officeEl.className = 'custom-office-marker';
        officeEl.innerHTML = `
          <span class="w-2.5 h-2.5 rounded-full bg-[#C8E6A0]"></span>
          <span>Target Office · ${activeCandidate.name}</span>
        `;
        officeContainer.appendChild(officeEl);

        const officeMarker = new maplibregl.Marker({
          element: officeContainer,
          anchor: 'center',
        })
          .setLngLat([activeCandidate.lng, activeCandidate.lat])
          .addTo(map);

        markersRef.current.push(officeMarker);
      }
      return;
    }

    // PHASE 3: Recommendations Phase - Render Full Markers
    // 1. Confirmed Workplace Marker
    if (layers.w && workplace) {
      const officeContainer = document.createElement('div');
      officeContainer.className = 'relative flex items-center justify-center cursor-pointer';

      // Pulsing concentric radar ring
      const radar = document.createElement('div');
      radar.className = 'radar-ring';
      officeContainer.appendChild(radar);

      // Office badge label
      const officeEl = document.createElement('div');
      officeEl.className = 'custom-office-marker';
      officeEl.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full bg-[#C8E6A0]"></span>
        <span>Office · ${workplace.name}</span>
      `;
      officeContainer.appendChild(officeEl);

      const officeMarker = new maplibregl.Marker({
        element: officeContainer,
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

    // 3. Scored Neighbourhood Markers (Lamar-style circular badge markers)
    if (layers.n || layers.r) {
      neighbourhoods.forEach((q, index) => {
        if (!q.vis) return;

        const isSelected = selectedId === q.i;
        const isShortlisted = shortlist.includes(q.i);
        const rentK = Math.round(q.x.e.rent / 1000);

        const badgeClass =
          q.g === 0
            ? ''
            : q.g === 1
            ? 'is-consider'
            : 'is-stretch';

        const markerContainer = document.createElement('div');
        markerContainer.className = 'relative flex items-center gap-1.5 cursor-pointer group';

        // Lamar circular badge node with number
        const badgeNode = document.createElement('div');
        badgeNode.className = `lamar-badge-marker ${badgeClass} ${
          isSelected ? 'is-active' : ''
        }`;
        badgeNode.innerText = `${index + 1}`;
        markerContainer.appendChild(badgeNode);

        // Locality name + rent pill label
        const labelPill = document.createElement('div');
        labelPill.className = `custom-locality-marker ${
          isSelected ? 'is-active' : ''
        } ${isShortlisted ? 'is-shortlisted' : ''}`;
        labelPill.innerHTML = `
          <span>${q.a[0].split(' ·')[0]}</span>
          ${
            layers.r
              ? `<span class="text-[10px] font-bold opacity-80 pl-1 border-l border-neutral-300">₹${rentK}k</span>`
              : ''
          }
        `;
        markerContainer.appendChild(labelPill);

        markerContainer.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectNeighbourhood(q.i);
        });

        const marker = new maplibregl.Marker({
          element: markerContainer,
          anchor: 'center',
        })
          .setLngLat([q.a[2], q.a[1]])
          .addTo(map);

        markersRef.current.push(marker);

        // Open popup for selected neighbourhood
        if (isSelected) {
          const badgeColorMap: Record<string, string> = {
            'BEST FIT': 'bg-[#E8F4EF] text-[#176B50]',
            'BEST SAVINGS': 'bg-[#E8F4EF] text-[#176B50]',
            'LOWEST RENT': 'bg-blue-50 text-blue-700',
            'SHORTEST COMMUTE': 'bg-blue-50 text-blue-700',
            'GOOD ALTERNATIVE': 'bg-neutral-100 text-neutral-700',
            'OVER BUDGET': 'bg-rose-100 text-rose-700',
            'LONG COMMUTE': 'bg-amber-100 text-amber-800',
          };
          const badgeColor = badgeColorMap[q.badge] || 'bg-neutral-100 text-neutral-700';

          const roadKmDisplay = q.roadKm !== null && q.roadKm !== undefined ? `${q.roadKm} km road` : 'Modeled road';
          const straightKmDisplay = `${q.straightLineKm} km straight-line`;
          const peakMinDisplay = q.peakMin !== null && q.peakMin !== undefined ? `~${q.peakMin} min peak` : `~${q.drivingMin} min`;
          const baselineMinDisplay = q.baselineMin !== null && q.baselineMin !== undefined ? `~${q.baselineMin} min off-peak` : '';

          const popupHtml = `
            <div class="p-3.5 text-[#18231E] font-sans max-w-[280px]">
              <div class="flex items-center justify-between gap-2 mb-2">
                <h4 class="font-bold text-sm text-[#18231E] leading-tight">${q.a[0]}</h4>
                <span class="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider leading-none whitespace-nowrap shrink-0 ${badgeColor}">
                  ${q.badge}
                </span>
              </div>
              <div class="text-xs text-[#5F6A63] space-y-1 mb-2">
                <div class="flex justify-between">
                  <span>${PROPERTIES[propType][0]} Rent:</span>
                  <span class="font-bold font-mono text-[#18231E]">${formatINR(q.x.e.rent)}/mo</span>
                </div>
                <div class="flex justify-between">
                  <span>Distance:</span>
                  <span class="font-bold font-mono text-[#18231E]">${roadKmDisplay} <span class="text-[10px] font-normal text-[#5F6A63]">(${straightKmDisplay})</span></span>
                </div>
                <div class="flex justify-between">
                  <span>Estimated Commute:</span>
                  <span class="font-bold font-mono text-[#176B50]">${peakMinDisplay} ${baselineMinDisplay ? `<span class="text-[10px] font-normal text-[#5F6A63]">(${baselineMinDisplay})</span>` : ''}</span>
                </div>
                <div class="flex justify-between text-[11px] pt-1 border-t border-[#E5EAE5]/60">
                  <span class="text-[#5F6A63]">Upfront Deposit (Refundable):</span>
                  <span class="font-mono font-semibold text-[#18231E]">${formatINR(q.depositRequired)}</span>
                </div>
              </div>
              <div class="pt-1.5 border-t border-[#E5EAE5] text-[11px] text-[#5F6A63] flex justify-between">
                <span>Monthly Disposable Surplus:</span>
                <strong class="font-mono text-[#176B50]">${formatINR(q.monthlySurplus)}/mo</strong>
              </div>
              <div class="mt-1 text-[9px] text-[#5F6A63] italic">
                *Peak-hour estimate; live sensor feed disconnected.
              </div>
            </div>
          `;

          popupRef.current = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 24,
            className: 'custom-map-popup',
          })
            .setLngLat([q.a[2], q.a[1]])
            .setHTML(popupHtml)
            .addTo(map);
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
    mapLoaded,
    propType,
    activeRoute,
  ]);

  const handleZoom = (delta: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.zoomTo(map.getZoom() + delta, { duration: 300 });
  };

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const centerLng = workplace ? workplace.lng : CITIES[city].center[1];
    const centerLat = workplace ? workplace.lat : CITIES[city].center[0];
    map.flyTo({
      center: [centerLng, centerLat],
      zoom: 12.2,
      duration: 600,
    });
  };

  const selectedNeighbourhood = neighbourhoods.find((n) => n.i === selectedId);

  return (
    <div className={`relative h-full w-full overflow-hidden bg-[#F8F9F7] ${className}`}>
      {/* Map DOM Canvas */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Lamar-Style Top-Left Floating Map Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        {/* Hide / Show Panel Button (Inspired by Lamar's Hide button) */}
        {onTogglePanel && (
          <button
            type="button"
            onClick={onTogglePanel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/95 backdrop-blur-md border border-[#E5EAE5] text-[#18231E] hover:bg-neutral-50 shadow-xs transition-all active:scale-95"
          >
            {isPanelVisible ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-[#5F6A63]" />
                <span className="hidden sm:inline">Hide Panel</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-[#176B50]" />
                <span>Show Panel</span>
              </>
            )}
          </button>
        )}

        {/* Zoom & Recenter Controls */}
        <div className="flex items-center shadow-xs rounded-xl overflow-hidden bg-white/95 backdrop-blur-md border border-[#E5EAE5]">
          <button
            type="button"
            onClick={() => handleZoom(1)}
            className="p-2 text-[#5F6A63] hover:text-[#18231E] hover:bg-neutral-100 transition-colors border-r border-[#E5EAE5]"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(-1)}
            className="p-2 text-[#5F6A63] hover:text-[#18231E] hover:bg-neutral-100 transition-colors border-r border-[#E5EAE5]"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRecenter}
            className="p-2 text-[#5F6A63] hover:text-[#18231E] hover:bg-neutral-100 transition-colors"
            title="Recenter Map"
            aria-label="Recenter Map"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Route Telemetry HUD Card (Top Left below controls, when route exists) */}
      {selectedNeighbourhood && workplace && layers.c && (
        <div className="absolute top-16 left-4 z-10 max-w-xs sm:max-w-sm bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#E5EAE5] shadow-sm space-y-2 transition-all">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                Active Road Route
              </div>
              <div className="text-xs font-bold text-[#18231E] flex items-center gap-1.5 truncate">
                <Navigation className="w-3.5 h-3.5 text-[#176B50] shrink-0" />
                <span className="truncate">{selectedNeighbourhood.a[0]} ↔ {workplace.name}</span>
              </div>
            </div>
            {isRoutingLoading ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#176B50] bg-[#E8F4EF] px-2 py-0.5 rounded-md font-medium shrink-0">
                <Loader2 className="w-3 h-3 animate-spin" /> Routing...
              </span>
            ) : activeRoute && !activeRoute.isFallback && activeRoute.distanceKm !== null ? (
              <span className="text-[10px] text-[#176B50] bg-[#E8F4EF] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0 font-mono">
                OSRM Road
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#B45309] bg-amber-50 px-2 py-0.5 rounded-md font-medium shrink-0">
                <AlertTriangle className="w-3 h-3" /> Route unavailable
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E5EAE5]/60 text-xs">
            <div>
              <div className="text-[10px] text-[#5F6A63] font-semibold uppercase tracking-wider flex items-center gap-1">
                <Car className="w-3 h-3 text-[#5F6A63]" /> Road Distance
              </div>
              <div className="text-sm font-bold font-mono text-[#18231E] mt-0.5">
                {selectedNeighbourhood.roadKm !== null && selectedNeighbourhood.roadKm !== undefined
                  ? `${selectedNeighbourhood.roadKm} km`
                  : 'Modeled'}
              </div>
              <div className="text-[10px] font-mono text-[#5F6A63]">
                {selectedNeighbourhood.straightLineKm} km air
              </div>
            </div>

            <div>
              <div className="text-[10px] text-[#5F6A63] font-semibold uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#176B50]" /> Peak Commute
              </div>
              <div className="text-sm font-bold font-mono text-[#176B50] mt-0.5">
                {selectedNeighbourhood.peakMin !== null && selectedNeighbourhood.peakMin !== undefined
                  ? `~${selectedNeighbourhood.peakMin} min`
                  : `~${selectedNeighbourhood.drivingMin} min`}
              </div>
              <div className="text-[10px] font-mono text-[#5F6A63]">
                {selectedNeighbourhood.baselineMin ? `~${selectedNeighbourhood.baselineMin} min off-peak` : 'Standard road'}
              </div>
            </div>
          </div>
          <div className="text-[9px] text-[#5F6A63] pt-1 border-t border-[#E5EAE5]/40 italic">
            *Modeled peak estimate; live traffic sensors disconnected.
          </div>
        </div>
      )}

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-sm border border-[#E5EAE5] rounded-xl text-[11px] text-[#5F6A63] shadow-xs">
        <span className="font-semibold text-[#18231E]">Badges:</span>
        <span className="inline-flex items-center gap-1 font-medium text-[#176B50]">
          <span className="w-2 h-2 rounded-full bg-[#176B50]"></span> Best Fit / Savings
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-blue-700">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span> Commute / Rent
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-neutral-600">
          <span className="w-2 h-2 rounded-full bg-neutral-400"></span> Alternative
        </span>
        <span className="inline-flex items-center gap-1 pl-1 border-l border-[#E5EAE5] font-medium text-[#37526D]">
          <span className="w-2 h-2 rotate-45 bg-[#37526D] inline-block"></span> Metro
        </span>
      </div>

      {/* Attribution Tag */}
      <div className="absolute bottom-1 right-2 z-10 text-[10px] text-neutral-400 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded shadow-2xs">
        © OpenStreetMap contributors · OSRM Road Routing
      </div>
    </div>
  );
};
