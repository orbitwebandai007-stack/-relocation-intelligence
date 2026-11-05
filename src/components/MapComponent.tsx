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
  Building,
  Edit3,
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
  onChangeWorkplace?: () => void;
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
  onChangeWorkplace,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const lastFramedKeyRef = useRef<string>('');

  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeRoute, setActiveRoute] = useState<RouteInfo | null>(null);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);
  const [mapZoom, setMapZoom] = useState(12);

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

    const handleZoomEnd = () => {
      setMapZoom(map.getZoom());
    };
    map.on('zoomend', handleZoomEnd);

    const resizeTimer = setTimeout(() => {
      map.resize();
    }, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
      map.off('zoomend', handleZoomEnd);
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

  // Camera framing function to smoothly show BOTH the selected residential neighbourhood and office
  // with accurately calculated padding, zoom, and headroom so neither point is clipped or shoved against the edges.
  const frameSelection = (
    neighbourhood: ScoredNeighbourhood | undefined,
    wp: WorkplaceHub | null,
    routeCoords?: [number, number][],
    duration = 850
  ) => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !neighbourhood || !wp) return;

    const bounds = new maplibregl.LngLatBounds();
    bounds.extend([neighbourhood.a[2], neighbourhood.a[1]]);
    bounds.extend([wp.lng, wp.lat]);

    // Extend bounds for any route road curvature if available
    if (routeCoords && Array.isArray(routeCoords) && routeCoords.length > 0) {
      routeCoords.forEach((coord) => {
        bounds.extend(coord);
      });
    }

    const nLat = neighbourhood.a[1];
    const wpLat = wp.lat;
    const boundsNorth = bounds.getNorth();

    // Determine whether the selected residential neighbourhood is in the northern portion of the framed area.
    // When the neighbourhood is in the north, its popup card (~245px height, anchored at bottom) extends upward,
    // requiring dedicated top padding so it remains completely visible below the top navigation bar.
    const isNeighbourhoodNearNorth =
      nLat >= wpLat || Math.abs(boundsNorth - nLat) < 0.045;

    const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const isMobile = vw < 640;
    const isTablet = vw >= 640 && vw < 1024;

    // Asymmetric padding to center both points in the open map canvas
    // (clearing the top-left HUD and the right PlannerPanel)
    let rightPad = isMobile ? 24 : 100;
    if (isPanelVisible) {
      rightPad = isMobile ? 24 : isTablet ? 450 : 500;
    }

    // Left padding provides comfortable clearance from the screen edge and top-left HUD
    const leftPad = isMobile ? 24 : isTablet ? 140 : 180;

    // Top padding: generous when neighbourhood is in the northern portion to clear the popup card
    let topPad: number;
    if (isNeighbourhoodNearNorth) {
      // Popup card is ~245px tall, plus offset 20px, plus top nav bar ~60px, plus 25px breathing margin
      const popupHeadroom = isMobile ? 220 : isTablet ? 290 : 335;
      topPad = Math.min(popupHeadroom, Math.max(180, Math.floor(vh * 0.42)));
    } else {
      // Workplace is at the northern top; office badge is only ~36px tall, needs standard navbar clearance
      topPad = isMobile ? 85 : isTablet ? 115 : 130;
    }

    // Bottom padding: ensures pins and labels don't touch the screen bottom
    const bottomPad = isMobile ? 70 : isTablet ? 95 : 110;

    map.fitBounds(bounds, {
      padding: {
        top: topPad,
        bottom: bottomPad,
        left: leftPad,
        right: rightPad,
      },
      maxZoom: 13.5,
      minZoom: 9.5,
      duration,
      essential: true,
    });
  };

  // Smooth camera transitions across flow phases (onboarding and workplace selection)
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
    }
  }, [
    flowPhase,
    city,
    candidateWp?.lat,
    candidateWp?.lng,
    mapLoaded,
  ]);

  // Frame BOTH selected neighbourhood and workplace whenever selection or panel visibility changes
  useEffect(() => {
    if (flowPhase !== 'recommendations' || !workplace || selectedId === null) return;
    const selectedNeighbourhood = neighbourhoods.find((n) => n.i === selectedId);
    if (!selectedNeighbourhood) return;

    const routeCoords =
      activeRoute && !activeRoute.isFallback && activeRoute.geometry?.coordinates?.length
        ? activeRoute.geometry.coordinates
        : undefined;
    const hasRoute = !!routeCoords;
    const frameKey = `${selectedId}-${workplace.name}-${workplace.lat.toFixed(4)}-${workplace.lng.toFixed(4)}-${isPanelVisible}-${hasRoute}`;
    if (lastFramedKeyRef.current === frameKey) return;
    lastFramedKeyRef.current = frameKey;

    frameSelection(
      selectedNeighbourhood,
      workplace,
      routeCoords,
      850
    );
  }, [
    selectedId,
    workplace?.lat,
    workplace?.lng,
    workplace?.name,
    flowPhase,
    mapLoaded,
    isPanelVisible,
    activeRoute,
  ]);

  // Dynamic route calculation for selected neighbourhood
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const routeSource = map.getSource(
      'commute-route'
    ) as maplibregl.GeoJSONSource | undefined;

    if (
      flowPhase !== 'recommendations' ||
      !workplace ||
      selectedId === null ||
      !layers.c
    ) {
      if (routeSource) {
        routeSource.setData({
          type: 'FeatureCollection',
          features: [],
        });
      }
      setActiveRoute(null);
      setIsRoutingLoading(false);
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

            // Gently adjust camera if the route road detour extends beyond previous bounds
            if (routeResult.geometry.coordinates && routeResult.geometry.coordinates.length > 0) {
              frameSelection(
                selectedNeighbourhood,
                workplace,
                routeResult.geometry.coordinates,
                600
              );
            }
          } else {
            routeSource.setData({
              type: 'FeatureCollection',
              features: [],
            });
          }
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
          <span class="custom-office-icon-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
              <path d="M9 22v-4h6v4"></path>
              <path d="M8 6h.01"></path>
              <path d="M16 6h.01"></path>
              <path d="M8 10h.01"></path>
              <path d="M16 10h.01"></path>
            </svg>
          </span>
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

    // Helper to generate the structured corridor match popup card
    const renderPopupCardHtml = (
      q: ScoredNeighbourhood,
      index: number,
      propertyType: PropertyType
    ): string => {
      const badgeColorMap: Record<string, string> = {
        'BEST FIT': 'bg-[#E8F4EF] text-[#176B50] border border-[#176B50]/20',
        'BEST SAVINGS': 'bg-[#E8F4EF] text-[#176B50] border border-[#176B50]/20',
        'LOWEST RENT': 'bg-blue-50 text-blue-700 border border-blue-200',
        'SHORTEST COMMUTE': 'bg-blue-50 text-blue-700 border border-blue-200',
        'GOOD ALTERNATIVE': 'bg-neutral-100 text-neutral-700 border border-neutral-200',
        'OVER BUDGET': 'bg-rose-50 text-[#BE123C] border border-rose-200',
        'LONG COMMUTE': 'bg-amber-50 text-amber-800 border border-amber-200',
      };
      const badgeColor =
        badgeColorMap[q.badge] || 'bg-neutral-100 text-neutral-700 border border-neutral-200';

      const roadKmDisplay =
        q.roadKm !== null && q.roadKm !== undefined
          ? `${q.roadKm} km road`
          : 'Modeled road';
      const straightKmDisplay = `${q.straightLineKm} km straight-line`;
      const peakMinDisplay =
        q.peakMin !== null && q.peakMin !== undefined
          ? `~${q.peakMin} min peak`
          : `~${q.drivingMin} min`;
      const baselineMinDisplay =
        q.baselineMin !== null && q.baselineMin !== undefined
          ? `~${q.baselineMin} min off-peak`
          : '';

      return `
        <div class="p-4 sm:p-5 text-[#18231E] font-sans w-[310px] sm:w-[340px] max-w-[88vw] select-none box-border">
          <!-- Header with Corridor Name and Unclipped Status Badge -->
          <div class="flex items-start justify-between gap-2.5 pb-3 border-b border-[#E5EAE5]">
            <div class="min-w-0 flex-1 pr-1">
              <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-[#176B50] block truncate">
                Corridor Match · Rank #${index + 1}
              </span>
              <h4 class="font-heading font-bold text-base text-[#18231E] leading-snug truncate mt-0.5" title="${q.a[0]}">
                ${q.a[0]}
              </h4>
            </div>
            <span class="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider leading-none whitespace-nowrap shrink-0 shadow-2xs ${badgeColor}">
              ${q.badge}
            </span>
          </div>

          <!-- Structured Cost & Commute Metrics -->
          <div class="py-3 space-y-2.5 text-xs">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[#5F6A63] shrink-0">${PROPERTIES[propertyType][0]} Rent:</span>
              <span class="font-bold font-mono text-sm text-[#18231E] shrink-0 whitespace-nowrap">
                ${formatINR(q.x.e.rent)}<span class="text-[10px] font-normal text-[#5F6A63]">/mo</span>
              </span>
            </div>

            <div class="flex items-center justify-between gap-2">
              <span class="text-[#5F6A63] shrink-0">Estimated Commute:</span>
              <div class="text-right shrink-0 whitespace-nowrap">
                <span class="font-bold font-mono text-sm text-[#176B50]">${peakMinDisplay}</span>
                ${
                  baselineMinDisplay
                    ? `<span class="block text-[10px] font-mono text-[#5F6A63]">(${baselineMinDisplay})</span>`
                    : ''
                }
              </div>
            </div>

            <div class="flex items-center justify-between gap-2">
              <span class="text-[#5F6A63] shrink-0">Road Network Distance:</span>
              <div class="text-right font-mono shrink-0 whitespace-nowrap">
                <span class="font-bold text-[#18231E]">${roadKmDisplay}</span>
                <span class="text-[10px] text-[#5F6A63] block">(${straightKmDisplay})</span>
              </div>
            </div>

            <div class="flex items-center justify-between gap-2 pt-2 border-t border-[#E5EAE5]/60">
              <span class="text-[#5F6A63] shrink-0">Upfront Deposit (Refundable):</span>
              <span class="font-mono font-bold text-[#18231E] shrink-0 whitespace-nowrap">${formatINR(q.depositRequired)}</span>
            </div>
          </div>

          <!-- Monthly Surplus Callout Banner -->
          <div class="p-2.5 sm:p-3 rounded-xl bg-[#E8F4EF] border border-[#176B50]/20 flex items-center justify-between gap-2 min-w-0">
            <span class="text-[11px] font-semibold text-[#176B50] truncate">Monthly Disposable Surplus:</span>
            <span class="font-mono font-bold text-xs sm:text-sm text-[#176B50] shrink-0 whitespace-nowrap">+${formatINR(q.monthlySurplus)}/mo</span>
          </div>

          <!-- Footnote -->
          <div class="mt-2 text-[9px] text-[#5F6A63] italic leading-tight">
            *Peak commute calibrated for Indian tech corridors; live sensor feed disconnected.
          </div>
        </div>
      `;
    };

    // PHASE 3: Recommendations Phase - Render Full Markers
    // Overlap Resolution: Check if workplace marker overlaps with any neighbourhood marker on the current map view
    let overlappingNeighbourhoodIndex = -1;
    let overlappingNeighbourhood: ScoredNeighbourhood | null = null;

    if (layers.w && workplace && (layers.n || layers.r)) {
      try {
        const wpPoint = map.project([workplace.lng, workplace.lat]);

        // Prioritize currently selected neighbourhood if it overlaps
        const selectedIndex = neighbourhoods.findIndex(
          (n) => n.i === selectedId && n.vis
        );
        if (selectedIndex !== -1) {
          const selNeighbourhood = neighbourhoods[selectedIndex];
          const nPoint = map.project([
            selNeighbourhood.a[2],
            selNeighbourhood.a[1],
          ]);
          const dx = Math.abs(wpPoint.x - nPoint.x);
          const dy = Math.abs(wpPoint.y - nPoint.y);
          // Pills are ~140px wide and ~34px high: overlap if dx < 130px and dy < 38px, or Euclidean distance < 110px
          if ((dx < 130 && dy < 38) || Math.hypot(dx, dy) < 110) {
            overlappingNeighbourhoodIndex = selectedIndex;
            overlappingNeighbourhood = selNeighbourhood;
          }
        }

        // If selected neighbourhood doesn't overlap, check closest visible neighbourhood
        if (!overlappingNeighbourhood) {
          let closestDist = Infinity;
          neighbourhoods.forEach((q, idx) => {
            if (!q.vis) return;
            const nPoint = map.project([q.a[2], q.a[1]]);
            const dx = Math.abs(wpPoint.x - nPoint.x);
            const dy = Math.abs(wpPoint.y - nPoint.y);
            const dist = Math.hypot(dx, dy);
            if (((dx < 130 && dy < 38) || dist < 110) && dist < closestDist) {
              closestDist = dist;
              overlappingNeighbourhoodIndex = idx;
              overlappingNeighbourhood = q;
            }
          });
        }
      } catch (err) {
        // Safe fallback if projection is unavailable during initial setup
      }
    }

    // 1. Confirmed Workplace Marker OR Combined Double Pill (if overlapping)
    if (layers.w && workplace) {
      if (overlappingNeighbourhood) {
        // In case of overlap, combine the office pill and the neighbourhood pill into a unified Double Pill!
        const targetNeighbourhood = overlappingNeighbourhood;
        const targetIndex = overlappingNeighbourhoodIndex;

        const doubleContainer = document.createElement('div');
        doubleContainer.className = 'relative flex items-center justify-center cursor-pointer';

        // Pulsing radar ring
        const radar = document.createElement('div');
        radar.className = 'radar-ring';
        doubleContainer.appendChild(radar);

        const isSelected = selectedId === targetNeighbourhood.i;
        const isShortlisted = shortlist.includes(targetNeighbourhood.i);
        const rentK = Math.round(targetNeighbourhood.x.e.rent / 1000);
        const badgeModifier =
          targetNeighbourhood.g === 0
            ? ''
            : targetNeighbourhood.g === 1
            ? 'is-consider'
            : 'is-stretch';

        const doublePillEl = document.createElement('div');
        doublePillEl.className = `custom-double-pill ${
          isSelected ? 'is-active' : ''
        } ${isShortlisted ? 'is-shortlisted' : ''}`;
        doublePillEl.innerHTML = `
          <!-- Office Segment (Always Visible) -->
          <div class="custom-double-pill-office" title="Target Workplace: ${workplace.name}">
            <span class="custom-office-icon-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                <path d="M9 22v-4h6v4"></path>
                <path d="M8 6h.01"></path>
                <path d="M16 6h.01"></path>
                <path d="M8 10h.01"></path>
                <path d="M16 10h.01"></path>
              </svg>
            </span>
            <span class="text-[10px] font-mono uppercase tracking-wider text-[#C8E6A0] font-bold hidden sm:inline">Office:</span>
            <span class="font-bold text-white tracking-tight max-w-[100px] sm:max-w-[130px] truncate">${workplace.name}</span>
          </div>

          <!-- Locality Segment -->
          <div class="custom-double-pill-locality" title="${targetNeighbourhood.a[0]} (Rank #${targetIndex + 1})">
            <span class="locality-marker-badge ${badgeModifier}">${targetIndex + 1}</span>
            <span class="locality-marker-name font-bold text-xs max-w-[95px] sm:max-w-[125px] truncate">${targetNeighbourhood.a[0].split(' ·')[0]}</span>
            ${layers.r ? `<span class="locality-marker-rent">₹${rentK}k</span>` : ''}
          </div>
        `;

        doubleContainer.appendChild(doublePillEl);

        doubleContainer.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectNeighbourhood(targetNeighbourhood.i);
        });

        const doubleMarker = new maplibregl.Marker({
          element: doubleContainer,
          anchor: 'center',
        })
          .setLngLat([workplace.lng, workplace.lat])
          .addTo(map);

        markersRef.current.push(doubleMarker);

        // If the overlapping neighbourhood is selected, open its popup right above the double pill
        if (isSelected) {
          popupRef.current = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 20,
            anchor: 'bottom',
            className: 'custom-map-popup',
            maxWidth: 'none',
          })
            .setLngLat([workplace.lng, workplace.lat])
            .setHTML(
              renderPopupCardHtml(
                targetNeighbourhood,
                targetIndex,
                propType
              )
            )
            .addTo(map);
        }
      } else {
        // No overlap: Render standard standalone Office Marker
        const officeContainer = document.createElement('div');
        officeContainer.className = 'relative flex items-center justify-center cursor-pointer';

        // Pulsing concentric radar ring
        const radar = document.createElement('div');
        radar.className = 'radar-ring';
        officeContainer.appendChild(radar);

        // Office badge label with distinct obsidian badge & building icon
        const officeEl = document.createElement('div');
        officeEl.className = 'custom-office-marker';
        officeEl.innerHTML = `
          <span class="custom-office-icon-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
              <path d="M9 22v-4h6v4"></path>
              <path d="M8 6h.01"></path>
              <path d="M16 6h.01"></path>
              <path d="M8 10h.01"></path>
              <path d="M16 10h.01"></path>
            </svg>
          </span>
          <span class="text-[10px] font-mono uppercase tracking-wider text-[#C8E6A0] font-bold">Office:</span>
          <span class="font-bold text-white tracking-tight">${workplace.name}</span>
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

    // 3. Scored Neighbourhood Markers (Unified pill markers with clear rank, name & rent)
    if (layers.n || layers.r) {
      neighbourhoods.forEach((q, index) => {
        if (!q.vis) return;

        // Skip if this neighbourhood was already combined into the Double Pill
        if (index === overlappingNeighbourhoodIndex) return;

        const isSelected = selectedId === q.i;
        const isShortlisted = shortlist.includes(q.i);
        const rentK = Math.round(q.x.e.rent / 1000);

        const badgeModifier =
          q.g === 0 ? '' : q.g === 1 ? 'is-consider' : 'is-stretch';

        const markerContainer = document.createElement('div');
        markerContainer.className = `locality-marker-pin ${
          isSelected ? 'is-active' : ''
        } ${isShortlisted ? 'is-shortlisted' : ''}`;

        markerContainer.innerHTML = `
          <span class="locality-marker-badge ${badgeModifier}">${index + 1}</span>
          <span class="locality-marker-name">${q.a[0].split(' ·')[0]}</span>
          ${
            layers.r
              ? `<span class="locality-marker-rent">₹${rentK}k</span>`
              : ''
          }
        `;

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

        // Open popup for selected neighbourhood with proper padding, width, and unclipped badges
        if (isSelected) {
          popupRef.current = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 20,
            anchor: 'bottom',
            className: 'custom-map-popup',
            maxWidth: 'none',
          })
            .setLngLat([q.a[2], q.a[1]])
            .setHTML(renderPopupCardHtml(q, index, propType))
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
    mapZoom,
  ]);

  const handleZoom = (delta: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.zoomTo(map.getZoom() + delta, { duration: 300 });
  };

  const selectedNeighbourhood = neighbourhoods.find((n) => n.i === selectedId);

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (flowPhase === 'recommendations' && selectedNeighbourhood && workplace) {
      lastFramedKeyRef.current = '';
      const routeCoords =
        activeRoute && !activeRoute.isFallback && activeRoute.geometry?.coordinates?.length
          ? activeRoute.geometry.coordinates
          : undefined;
      frameSelection(
        selectedNeighbourhood,
        workplace,
        routeCoords,
        650
      );
    } else {
      const centerLng = workplace ? workplace.lng : CITIES[city].center[1];
      const centerLat = workplace ? workplace.lat : CITIES[city].center[0];
      map.flyTo({
        center: [centerLng, centerLat],
        zoom: 12.2,
        duration: 600,
      });
    }
  };

  return (
    <div className={`relative h-full w-full overflow-hidden bg-[#F8F9F7] ${className}`}>
      {/* Map DOM Canvas */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Top-Left Floating Controls & Telemetry HUD Stack (Cleanly offset below floating header) */}
      <div className="absolute top-16 sm:top-20 left-3 sm:left-4 z-20 flex flex-col items-start gap-2.5 max-w-[calc(100vw-1.5rem)] pointer-events-none">
        {/* Top Control Bar: Office Banner + Hide/Show Panel + Zoom Controls */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Office Location Banner (Visible during recommendations phase) */}
          {flowPhase === 'recommendations' && workplace && onChangeWorkplace && (
            <div className="inline-flex items-center gap-2 pl-2.5 sm:pl-3 pr-2 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#E5EAE5] shadow-xs text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <Building className="w-3.5 h-3.5 text-[#176B50] shrink-0" />
                <span className="text-[#5F6A63] text-xs shrink-0 font-medium hidden sm:inline">Office:</span>
                <span
                  className="text-[#18231E] font-bold text-xs truncate max-w-[120px] sm:max-w-[180px] md:max-w-[240px]"
                  title={workplace.name}
                >
                  {workplace.name}
                </span>
              </div>
              <button
                type="button"
                onClick={onChangeWorkplace}
                className="shrink-0 px-2 py-0.5 rounded-lg text-[11px] font-bold text-[#176B50] bg-[#E8F4EF] hover:bg-[#d8ece3] transition-colors inline-flex items-center gap-1 cursor-pointer whitespace-nowrap active:scale-95"
                title="Change office location"
                aria-label="Change office location"
              >
                <Edit3 className="w-3 h-3" />
                <span>Change</span>
              </button>
            </div>
          )}

          {/* Hide / Show Panel Button (Only visible during recommendations phase) */}
          {flowPhase === 'recommendations' && onTogglePanel && (
            <button
              type="button"
              onClick={onTogglePanel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/95 backdrop-blur-md border border-[#E5EAE5] text-[#18231E] hover:bg-neutral-50 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
              title={isPanelVisible ? "Hide side panel to view full map" : "Show side panel"}
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
          <div className="flex items-center shadow-xs rounded-xl overflow-hidden bg-white/95 backdrop-blur-md border border-[#E5EAE5] shrink-0">
            <button
              type="button"
              onClick={() => handleZoom(1)}
              className="p-2 text-[#5F6A63] hover:text-[#18231E] hover:bg-neutral-100 transition-colors border-r border-[#E5EAE5] cursor-pointer"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(-1)}
              className="p-2 text-[#5F6A63] hover:text-[#18231E] hover:bg-neutral-100 transition-colors border-r border-[#E5EAE5] cursor-pointer"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={handleRecenter}
              className="p-2 text-[#5F6A63] hover:text-[#18231E] hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Recenter Map"
              aria-label="Recenter Map"
            >
              <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Floating Route Telemetry HUD Card (Positioned in stack directly below top bar with guaranteed spacing) */}
        {flowPhase === 'recommendations' && selectedNeighbourhood && workplace && layers.c && (
          <div className="pointer-events-auto w-[310px] sm:w-[350px] max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-[#E5EAE5] shadow-sm space-y-2.5 transition-all">
            <div className="flex items-start justify-between gap-2.5">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63] flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-[#176B50] shrink-0" />
                  <span>Active Road Route</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[#18231E]">
                  <span
                    className="truncate max-w-[110px] sm:max-w-[130px]"
                    title={selectedNeighbourhood.a[0]}
                  >
                    {selectedNeighbourhood.a[0]}
                  </span>
                  <span className="text-neutral-400 font-normal shrink-0">↔</span>
                  <span
                    className="truncate max-w-[110px] sm:max-w-[130px]"
                    title={workplace.name}
                  >
                    {workplace.name}
                  </span>
                </div>
              </div>

              {isRoutingLoading ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-[#176B50] bg-[#E8F4EF] px-2 py-0.5 rounded-md font-medium shrink-0 whitespace-nowrap">
                  <Loader2 className="w-3 h-3 animate-spin" /> Routing...
                </span>
              ) : activeRoute && !activeRoute.isFallback && activeRoute.distanceKm !== null ? (
                <span className="text-[10px] text-[#176B50] bg-[#E8F4EF] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider shrink-0 font-mono whitespace-nowrap">
                  OSRM Road
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-[#B45309] bg-amber-50 px-2 py-0.5 rounded-md font-medium shrink-0 whitespace-nowrap">
                  <AlertTriangle className="w-3 h-3" /> Modeled
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2.5 border-t border-[#E5EAE5]/60 text-xs">
              <div className="bg-[#F8F9F7] p-2 sm:p-2.5 rounded-xl border border-[#E5EAE5]/60">
                <div className="text-[10px] text-[#5F6A63] font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Car className="w-3 h-3 text-[#5F6A63] shrink-0" />
                  <span className="truncate">Distance</span>
                </div>
                <div className="text-sm font-bold font-mono text-[#18231E] mt-0.5 truncate">
                  {selectedNeighbourhood.roadKm !== null && selectedNeighbourhood.roadKm !== undefined
                    ? `${selectedNeighbourhood.roadKm} km`
                    : 'Modeled'}
                </div>
                <div className="text-[10px] font-mono text-[#5F6A63] truncate">
                  {selectedNeighbourhood.straightLineKm} km air
                </div>
              </div>

              <div className="bg-[#F8F9F7] p-2 sm:p-2.5 rounded-xl border border-[#E5EAE5]/60">
                <div className="text-[10px] text-[#5F6A63] font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#176B50] shrink-0" />
                  <span className="truncate">Peak Commute</span>
                </div>
                <div className="text-sm font-bold font-mono text-[#176B50] mt-0.5 truncate">
                  {selectedNeighbourhood.peakMin !== null && selectedNeighbourhood.peakMin !== undefined
                    ? `~${selectedNeighbourhood.peakMin} min`
                    : `~${selectedNeighbourhood.drivingMin} min`}
                </div>
                <div className="text-[10px] font-mono text-[#5F6A63] truncate">
                  {selectedNeighbourhood.baselineMin ? `~${selectedNeighbourhood.baselineMin} min off-peak` : 'Standard road'}
                </div>
              </div>
            </div>

            <div className="text-[9px] text-[#5F6A63] pt-1.5 border-t border-[#E5EAE5]/40 italic leading-tight">
              *Calibrated peak commute for Indian corridors; live sensors disconnected.
            </div>
          </div>
        )}
      </div>

      {/* Bottom Map Legend (Only visible in recommendations phase) */}
      {flowPhase === 'recommendations' && (
        <div className="absolute bottom-3 left-3 z-10 hidden sm:flex flex-wrap items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-sm border border-[#E5EAE5] rounded-xl text-[11px] text-[#5F6A63] shadow-xs">
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
      )}

      {/* Attribution Tag */}
      <div className="absolute bottom-1 right-2 sm:right-3 z-10 text-[10px] text-neutral-400 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded shadow-2xs pointer-events-none">
        © OpenStreetMap contributors · OSRM Road Routing
      </div>
    </div>
  );
};
