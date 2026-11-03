import React, { useState, useEffect, useMemo } from 'react';
import { RelocationState, ScoredNeighbourhood } from './types';
import {
  CITIES,
  INITIAL_STATE,
  calculateNeighbourhoods,
  getChosenNeighbourhood,
} from './data/relocationData';
import { RouteInfo, getDrivingRoute } from './services/routingService';
import { Header } from './components/Header';
import { Stepper } from './components/Stepper';
import { SidebarSummary } from './components/SidebarSummary';
import { LandingPage } from './components/LandingPage';
import { Step1Location } from './components/Step1Location';
import { Step2Salary } from './components/Step2Salary';
import { Step3Neighbourhoods } from './components/Step3Neighbourhoods';
import { Step4Lifestyle } from './components/Step4Lifestyle';
import { Step5Analysis } from './components/Step5Analysis';
import { Step6Report } from './components/Step6Report';

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const areas = CITIES[state.city].areas;
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

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9F5] text-[#1E231F] selection:bg-[#21442E]/15">
      {/* Top Application Header */}
      <Header
        fromCity={state.from}
        city={state.city}
        workplace={state.wp}
        currentStep={state.st}
        isLanding={isLanding}
        onGoLanding={() => updateState({ v: 'land' })}
        onReset={handleReset}
      />

      {/* 6-Step Visual Navigation Bar */}
      {!isLanding && (
        <Stepper
          currentStep={state.st}
          maxStep={state.max}
          onGoStep={goToStep}
        />
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLanding ? (
          <LandingPage
            state={state}
            onStartPlanning={() => goToStep(0)}
            onResumePlanning={() => goToStep(state.st)}
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Step Content Card */}
            <div className="flex-1 w-full min-w-0">
              {state.st === 0 && (
                <Step1Location
                  state={state}
                  onUpdateState={updateState}
                  onNext={() => goToStep(1)}
                />
              )}

              {state.st === 1 && (
                <Step2Salary
                  state={state}
                  onUpdateState={updateState}
                  onNext={() => goToStep(2)}
                  onBack={() => goToStep(0)}
                />
              )}

              {state.st === 2 && (
                <Step3Neighbourhoods
                  state={state}
                  scoredNeighbourhoods={scoredNeighbourhoods}
                  onUpdateState={updateState}
                  onNext={() => goToStep(3)}
                  onBack={() => goToStep(1)}
                  onRouteLoaded={handleRouteLoaded}
                />
              )}

              {state.st === 3 && (
                <Step4Lifestyle
                  state={state}
                  onUpdateState={updateState}
                  onNext={() => goToStep(4)}
                  onBack={() => goToStep(2)}
                />
              )}

              {state.st === 4 && (
                <Step5Analysis
                  state={state}
                  chosenNeighbourhood={chosenNeighbourhood}
                  onUpdateState={updateState}
                  onNext={() => goToStep(5)}
                  onBack={() => goToStep(3)}
                />
              )}

              {state.st === 5 && (
                <Step6Report
                  state={state}
                  chosenNeighbourhood={chosenNeighbourhood}
                  scoredNeighbourhoods={scoredNeighbourhoods}
                  onUpdateState={updateState}
                  onGoStep={goToStep}
                />
              )}
            </div>

            {/* Sticky Sidebar: Shown on steps 0, 1, 3, 4 (excluded on Step 2 map & Step 5 report for maximum screen width) */}
            {(state.st === 0 ||
              state.st === 1 ||
              state.st === 3 ||
              state.st === 4) && <SidebarSummary state={state} />}
          </div>
        )}
      </main>

      {/* Clean Global Footer */}
      <footer className="border-t border-[#E2E6DD] bg-white py-6 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900">
              Relocation Intelligence
            </span>
            <span>·</span>
            <span>Spatial financial modeling for Bengaluru & Delhi NCR</span>
          </div>
          <div className="text-neutral-400 text-center sm:text-right">
            Illustrative estimates · Benchmarked Nov 2026 · Built for professional relocation decisions
          </div>
        </div>
      </footer>
    </div>
  );
}
