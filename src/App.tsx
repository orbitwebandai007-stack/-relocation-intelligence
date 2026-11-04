import React, { useState, useEffect, useMemo } from 'react';
import { CityKey, MapLayersState, RelocationState, ScoredNeighbourhood } from './types';
import {
  CITIES,
  INITIAL_STATE,
  calculateNeighbourhoods,
  getChosenNeighbourhood,
} from './data/relocationData';
import { RouteInfo, getDrivingRoute } from './services/routingService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { MapComponent } from './components/MapComponent';
import { PlannerPanel } from './components/PlannerPanel';
import { Compass } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<RelocationState>(() => {
    try {
      const stored = localStorage.getItem('ri_v2');
      if (stored) {
        return { ...INITIAL_STATE, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('LocalStorage error on init', e);
    }
    return INITIAL_STATE;
  });

  // Save state to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem('ri_v2', JSON.stringify(state));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [state]);

  const updateState = (updates: Partial<RelocationState>) => {
    setState((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const goToStep = (stepNumber: number) => {
    setState((prev) => ({
      ...prev,
      v: 'step',
      st: stepNumber,
      max: Math.max(prev.max, stepNumber),
    }));
  };

  const handleReset = () => {
    if (confirm('Reset your relocation plan to initial defaults?')) {
      setState(INITIAL_STATE);
      try {
        localStorage.removeItem('ri_v2');
      } catch (e) {}
    }
  };

  // In-memory route dictionary for OSRM driving routes
  const [routeMap, setRouteMap] = useState<Map<string, RouteInfo>>(new Map());

  const handleRouteLoaded = (areaName: string, route: RouteInfo) => {
    setRouteMap((prev) => {
      const next = new Map(prev);
      next.set(areaName, route);
      return next;
    });
  };

  // Prefetch OSRM driving routes for all neighbourhoods in the city with throttling
  useEffect(() => {
    const currentWp = state.wp;
    if (!currentWp) return;
    const cityData = CITIES[state.city] || CITIES.blr;
    const areas = cityData.areas;
    let isCancelled = false;

    const prefetch = async () => {
      for (const area of areas) {
        if (isCancelled) break;
        if (!routeMap.has(area[0])) {
          try {
            const route = await getDrivingRoute(
              currentWp.lng,
              currentWp.lat,
              area[2],
              area[1]
            );
            if (!isCancelled) {
              setRouteMap((prev) => new Map(prev).set(area[0], route));
            }
            // 220ms delay to prevent bursting requests to the public OSRM server
            await new Promise((r) => setTimeout(r, 220));
          } catch (e) {}
        }
      }
    };

    prefetch();

    return () => {
      isCancelled = true;
    };
  }, [state.wp?.lat, state.wp?.lng, state.city]);

  // Live scored neighbourhoods calculation based on current state and OSRM road routes
  const scoredNeighbourhoods = useMemo(() => {
    return calculateNeighbourhoods(state.city, state.wp, state, routeMap);
  }, [
    state.city,
    state.wp,
    state.sal,
    state.tgt,
    state.tm,
    state.com,
    state.prop,
    state.food,
    state.tr,
    state.life,
    state.maxc,
    state.f,
    state.weights,
    routeMap,
  ]);

  const chosenNeighbourhood = useMemo(() => {
    return getChosenNeighbourhood(state, scoredNeighbourhoods);
  }, [state.sel, scoredNeighbourhoods]);

  const isLanding = state.v === 'land';

  // Map layer controls & panel visibility for the Lamar map-first planner layout
  const [layers, setLayers] = useState<MapLayersState>({
    n: true, // Neighbourhood markers
    w: true, // Workplace marker
    c: true, // Commute routes
    r: true, // Rent price tags
    t: true, // Transit metro stations
  });
  const [isPanelVisible, setIsPanelVisible] = useState(true);

  // Quick city change handler
  const handleSelectCity = (cityKey: CityKey) => {
    const selectedCity = CITIES[cityKey] || CITIES.blr;
    const defaultHub = selectedCity.hubs[0];
    updateState({
      city: cityKey,
      wp: {
        name: defaultHub[0],
        lat: defaultHub[1],
        lng: defaultHub[2],
      },
      sel: [],
      f: { ...state.f, q: '' },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9F7] text-[#18231E] selection:bg-[#176B50]/15 selection:text-[#176B50]">
      {/* Top Application Header */}
      <Header
        fromCity={state.from}
        city={state.city}
        workplace={state.wp}
        currentStep={state.st}
        maxStep={state.max}
        isLanding={isLanding}
        onGoLanding={() => updateState({ v: 'land' })}
        onGoStep={goToStep}
        onSelectCity={handleSelectCity}
        onReset={handleReset}
      />

      {/* Main Experience Router */}
      {isLanding ? (
        /* 1. UBER-INSPIRED LANDING PAGE */
        <main className="flex-1 w-full mx-auto">
          <LandingPage
            state={state}
            onStartPlanning={() => goToStep(0)}
            onResumePlanning={() => goToStep(state.st)}
          />

          {/* Minimal SaaS Style Footer */}
          <Footer
            onStartPlanning={() => goToStep(0)}
            onReset={handleReset}
          />
        </main>
      ) : (
        /* 2. LAMAR-INSPIRED MAP-FIRST DASHBOARD */
        <div className="relative flex-1 w-full h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] overflow-hidden">
          {/* Main Map Canvas (approx 70-75% width or full viewport background) */}
          <div className="absolute inset-0 z-0">
            <MapComponent
              city={state.city}
              workplace={state.wp}
              neighbourhoods={scoredNeighbourhoods}
              selectedId={chosenNeighbourhood.i}
              shortlist={state.sel}
              propType={state.prop}
              layers={layers}
              currentStep={state.st}
              onSelectNeighbourhood={(id) => {
                updateState({
                  sel: [id, ...state.sel.filter((x) => x !== id)].slice(0, 3),
                });
                setIsPanelVisible(true);
              }}
              onRouteLoaded={handleRouteLoaded}
              isPanelVisible={isPanelVisible}
              onTogglePanel={() => setIsPanelVisible(!isPanelVisible)}
              className="h-full w-full"
            />
          </div>

          {/* Floating Right Interaction Panel (Expands to executive width for Relocation Blueprint) */}
          {isPanelVisible ? (
            <div
              className={`absolute top-2 right-2 bottom-2 left-2 sm:left-auto sm:top-3 sm:right-3 sm:bottom-3 ${
                state.st === 5
                  ? 'w-auto sm:w-[680px] lg:w-[840px] max-w-[95vw]'
                  : 'w-auto sm:w-[420px] lg:w-[450px]'
              } z-20 rounded-2xl border border-[#E5EAE5] shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white overflow-hidden flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-right-4`}
            >
              <PlannerPanel
                state={state}
                scoredNeighbourhoods={scoredNeighbourhoods}
                chosenNeighbourhood={chosenNeighbourhood}
                onUpdateState={updateState}
                onGoStep={goToStep}
              />
            </div>
          ) : (
            /* Floating Button to re-open decision panel when hidden */
            <button
              type="button"
              onClick={() => setIsPanelVisible(true)}
              className="absolute bottom-5 right-5 z-20 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#176B50] hover:bg-[#125740] text-white text-xs font-semibold shadow-xl transition-all active:scale-95 duration-150"
            >
              <Compass className="w-4 h-4 text-[#C8E6A0]" />
              <span>Open Decision Panel</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
