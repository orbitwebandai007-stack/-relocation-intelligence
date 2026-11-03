import React, { useState } from 'react';
import {
  CityKey,
  MapLayersState,
  PropertyType,
  RelocationState,
  ScoredNeighbourhood,
  SortPriority,
} from '../types';
import {
  BASE,
  CITIES,
  PROPERTIES,
  formatINR,
  getTarget,
} from '../data/relocationData';
import { RouteInfo } from '../services/routingService';
import { MapComponent } from './MapComponent';
import {
  Search,
  Check,
  Layers,
  ArrowRight,
  ArrowLeft,
  Car,
  Clock,
  Navigation,
  SlidersHorizontal,
  ChevronDown,
  Info,
  ShieldCheck,
} from 'lucide-react';

interface Step3NeighbourhoodsProps {
  state: RelocationState;
  scoredNeighbourhoods: ScoredNeighbourhood[];
  onUpdateState: (updates: Partial<RelocationState>) => void;
  onNext: () => void;
  onBack: () => void;
  onRouteLoaded?: (areaName: string, route: RouteInfo) => void;
}

export const Step3Neighbourhoods: React.FC<Step3NeighbourhoodsProps> = ({
  state,
  scoredNeighbourhoods,
  onUpdateState,
  onNext,
  onBack,
  onRouteLoaded,
}) => {
  const [activeNeighbourhoodId, setActiveNeighbourhoodId] = useState<number | null>(
    state.sel.length > 0 ? state.sel[0] : scoredNeighbourhoods[0]?.i ?? null
  );
  const [activeRouteInfo, setActiveRouteInfo] = useState<RouteInfo | null>(null);

  // 3 Primary Map Layers required by user
  const [layers, setLayers] = useState<MapLayersState>({
    n: true, // Neighbourhood markers
    w: true, // Workplace marker
    c: true, // Commute routes
    r: true, // Rent price tags
    t: true, // Transit metro stations
  });

  const currentCity = CITIES[state.city];
  const targetSavings = getTarget(state);
  const availableBudget = state.sal - state.com - targetSavings;

  const activeNeighbourhood =
    scoredNeighbourhoods.find((n) => n.i === activeNeighbourhoodId) ||
    scoredNeighbourhoods[0];

  const handleRouteLoadedInternal = (areaName: string, route: RouteInfo) => {
    if (activeNeighbourhood && activeNeighbourhood.a[0] === areaName) {
      setActiveRouteInfo(route);
    }
    onRouteLoaded?.(areaName, route);
  };

  const isRouteValid =
    activeRouteInfo && !activeRouteInfo.isFallback && activeRouteInfo.distanceKm !== null
      ? true
      : activeNeighbourhood?.hasValidRoute &&
        activeNeighbourhood?.roadKm !== null &&
        activeNeighbourhood?.roadKm !== undefined;

  const currentRoadKm =
    activeRouteInfo && !activeRouteInfo.isFallback && activeRouteInfo.distanceKm !== null
      ? activeRouteInfo.distanceKm
      : activeNeighbourhood?.hasValidRoute &&
        activeNeighbourhood?.roadKm !== null &&
        activeNeighbourhood?.roadKm !== undefined
      ? activeNeighbourhood.roadKm
      : null;

  const currentDrivingMin =
    activeRouteInfo && !activeRouteInfo.isFallback && activeRouteInfo.durationMinutes !== null
      ? activeRouteInfo.durationMinutes
      : activeNeighbourhood?.hasValidRoute &&
        activeNeighbourhood?.drivingMin !== null &&
        activeNeighbourhood?.drivingMin !== undefined
      ? activeNeighbourhood.drivingMin
      : null;

  const routeDistanceDisplay =
    isRouteValid && currentRoadKm !== null ? `${currentRoadKm} km` : 'Route unavailable';
  const routeDurationDisplay =
    isRouteValid && currentDrivingMin !== null ? `${currentDrivingMin} min` : 'Route unavailable';

  const handleToggleShortlist = (idx: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const currentSel = [...state.sel];
    const exists = currentSel.indexOf(idx);

    if (exists >= 0) {
      currentSel.splice(exists, 1);
    } else {
      if (currentSel.length < 3) {
        currentSel.push(idx);
      } else {
        alert('You can shortlist up to 3 neighbourhoods for side-by-side comparison.');
        return;
      }
    }
    onUpdateState({ sel: currentSel });
  };

  const handleSelectPrimary = (idx: number) => {
    setActiveNeighbourhoodId(idx);
    const newSel = [idx, ...state.sel.filter((id) => id !== idx)].slice(0, 3);
    onUpdateState({ sel: newSel });
  };

  const clearFilters = () => {
    onUpdateState({
      f: { r: '', c: '', a: '', q: '', sortBy: 'score' },
    });
  };

  const handleSortChange = (sortBy: SortPriority) => {
    onUpdateState({
      f: { ...state.f, sortBy },
    });
  };

  const GROUP_TITLES = ['BEST FIT', 'WORTH CONSIDERING', 'STRETCH OPTIONS'];
  const GROUP_SUBTITLES = [
    'Fits budget and road commute comfortably',
    'Reasonable trade-off on driving distance or rent',
    'Exceeds commute or estimated budget limit',
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-1">
            03 · Discovery & Real Road Routing
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#19241D] tracking-tight">
            Explore neighbourhoods & road routes.
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Near {state.wp?.name || 'Office'}, {currentCity.name}. Net living allowance:{' '}
            <strong className="text-neutral-900">{formatINR(Math.max(0, availableBudget))}/mo</strong>{' '}
            after savings target and commitments.
          </p>
        </div>

        {/* Shortlisted counter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 font-medium">Shortlisted:</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#21442E] text-white">
            {state.sel.length} of 3
          </span>
        </div>
      </div>

      {/* Main 2-Column Discovery Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* Left Column: Filters, Active Inspector & Locality Cards (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Search, Sort & Quick Filters */}
          <div className="bg-white p-4 rounded-2xl border border-[#E2E6DD] shadow-xs space-y-3">
            {/* Search Input & Sort Selector */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search locality..."
                  value={state.f.q}
                  onChange={(e) =>
                    onUpdateState({ f: { ...state.f, q: e.target.value } })
                  }
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-[#E2E6DD] rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#21442E]/20"
                />
              </div>

              {/* Priority Sorting Dropdown (Requirement 3) */}
              <div className="relative shrink-0">
                <select
                  value={state.f.sortBy || 'score'}
                  onChange={(e) => handleSortChange(e.target.value as SortPriority)}
                  className="w-full sm:w-auto pl-3 pr-8 py-2 bg-neutral-50 border border-[#E2E6DD] rounded-xl text-xs font-semibold text-neutral-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#21442E]/20"
                >
                  <option value="score">Sort: Best Fit (Score)</option>
                  <option value="rent">Sort: Lowest Rent</option>
                  <option value="commute">Sort: Shortest Driving Commute</option>
                  <option value="savings">Sort: Highest Savings</option>
                  <option value="distance">Sort: Nearest Distance</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <select
                value={state.prop}
                onChange={(e) =>
                  onUpdateState({
                    prop: e.target.value as PropertyType,
                    ov: {},
                  })
                }
                className="p-2 bg-neutral-50 border border-[#E2E6DD] rounded-lg text-neutral-800 text-[11px] font-medium"
              >
                {(Object.keys(PROPERTIES) as PropertyType[]).map((pKey) => (
                  <option key={pKey} value={pKey}>
                    {PROPERTIES[pKey][0]}
                  </option>
                ))}
              </select>

              <select
                value={state.f.r}
                onChange={(e) =>
                  onUpdateState({ f: { ...state.f, r: e.target.value } })
                }
                className="p-2 bg-neutral-50 border border-[#E2E6DD] rounded-lg text-neutral-800 text-[11px] font-medium"
              >
                <option value="">Any rent</option>
                <option value="0">Under ₹8k</option>
                <option value="1">₹8k – 12k</option>
                <option value="2">₹12k – 18k</option>
                <option value="3">₹18k – 25k</option>
                <option value="4">Above ₹25k</option>
              </select>

              <select
                value={state.f.c}
                onChange={(e) =>
                  onUpdateState({ f: { ...state.f, c: e.target.value } })
                }
                className="p-2 bg-neutral-50 border border-[#E2E6DD] rounded-lg text-neutral-800 text-[11px] font-medium"
              >
                <option value="">Any commute</option>
                <option value="15">Under 15 min</option>
                <option value="30">Under 30 min</option>
                <option value="45">Under 45 min</option>
                <option value="60">Under 60 min</option>
              </select>

              <select
                value={state.f.a}
                onChange={(e) =>
                  onUpdateState({ f: { ...state.f, a: e.target.value } })
                }
                className="p-2 bg-neutral-50 border border-[#E2E6DD] rounded-lg text-neutral-800 text-[11px] font-medium"
              >
                <option value="">Any budget</option>
                <option value="w">Within budget</option>
                <option value="n">Near budget</option>
                <option value="a">Above budget</option>
              </select>
            </div>

            {/* 3 Map Layers (Requirement 5) */}
            <div className="pt-2 border-t border-[#E2E6DD] flex flex-wrap items-center gap-3 text-[11px] text-neutral-600">
              <span className="font-semibold text-neutral-700 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-neutral-500" /> Map Layers:
              </span>
              {[
                { k: 'n', label: 'Neighbourhoods' },
                { k: 'w', label: 'Workplace' },
                { k: 'c', label: 'Commute routes' },
                { k: 't', label: 'Metro' },
              ].map(({ k, label }) => (
                <label key={k} className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(layers as any)[k]}
                    onChange={(e) =>
                      setLayers({ ...layers, [k]: e.target.checked })
                    }
                    className="rounded text-[#21442E] focus:ring-[#21442E]"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Active Neighbourhood Inspector & Scoring Breakdown Panel (Requirement 4) */}
          {activeNeighbourhood && (
            <div className="bg-[#1C3325] text-white p-5 rounded-2xl shadow-sm space-y-3.5 border border-emerald-900/60">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">
                    Inspecting Locality & Road Route
                  </div>
                  <h3 className="text-xl font-heading font-extrabold text-white">
                    {activeNeighbourhood.a[0]}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-lg font-extrabold text-emerald-300">
                    {formatINR(activeNeighbourhood.x.e.rent)}
                    <span className="text-xs font-normal text-emerald-200/80">/mo</span>
                  </div>
                  <div className="text-[11px] text-emerald-300 font-bold">
                    Fit Score: {activeNeighbourhood.sc}/100
                  </div>
                </div>
              </div>

              {/* Road metrics summary */}
              <div className="flex items-center gap-3 bg-black/25 px-3 py-2 rounded-xl text-xs border border-white/10">
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <Car className="w-3.5 h-3.5" />
                  <span className="font-bold">
                    {routeDistanceDisplay}
                  </span>
                  <span className="text-neutral-400 text-[11px]">road distance</span>
                </div>
                <span className="text-white/20">|</span>
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-bold">
                    {routeDurationDisplay !== 'Route unavailable'
                      ? `~${routeDurationDisplay}`
                      : 'Route unavailable'}
                  </span>
                  <span className="text-neutral-400 text-[11px]">est. driving</span>
                </div>
              </div>

              {/* Transparent Recommendation Score Breakdown (Requirement 4: 40/30/20/10) */}
              <div className="bg-black/25 rounded-xl p-3 text-xs border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-300/90">
                  <span>Recommendation Scoring Weights</span>
                  <span>100% Total</span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  {/* Affordability: 40% */}
                  <div>
                    <div className="flex justify-between text-neutral-300 mb-0.5">
                      <span>Affordability (40% weight)</span>
                      <span className="font-semibold text-white">
                        {activeNeighbourhood.scoreBreakdown.affordability}/100
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-1.5 rounded-full"
                        style={{
                          width: `${activeNeighbourhood.scoreBreakdown.affordability}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Commute convenience: 30% */}
                  <div>
                    <div className="flex justify-between text-neutral-300 mb-0.5">
                      <span>Commute Convenience (30% weight)</span>
                      <span className="font-semibold text-white">
                        {activeNeighbourhood.scoreBreakdown.commute}/100
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-1.5 rounded-full"
                        style={{
                          width: `${activeNeighbourhood.scoreBreakdown.commute}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Savings potential: 20% */}
                  <div>
                    <div className="flex justify-between text-neutral-300 mb-0.5">
                      <span>Savings Potential (20% weight)</span>
                      <span className="font-semibold text-white">
                        {activeNeighbourhood.scoreBreakdown.savings}/100
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-1.5 rounded-full"
                        style={{
                          width: `${activeNeighbourhood.scoreBreakdown.savings}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Lifestyle match: 10% */}
                  <div>
                    <div className="flex justify-between text-neutral-300 mb-0.5">
                      <span>Lifestyle Synergy (10% weight)</span>
                      <span className="font-semibold text-white">
                        {activeNeighbourhood.scoreBreakdown.lifestyle}/100
                      </span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-1.5 rounded-full"
                        style={{
                          width: `${activeNeighbourhood.scoreBreakdown.lifestyle}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Why this neighbourhood narrative (Requirement 4) */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-emerald-100/90 leading-relaxed">
                <span className="font-bold text-white block mb-0.5">Why recommended:</span>
                {activeNeighbourhood.why}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSelectPrimary(activeNeighbourhood.i)}
                  className="flex-1 py-2 px-3 rounded-xl bg-white text-[#19241D] text-xs font-bold hover:bg-neutral-100 transition-colors shadow-xs"
                >
                  Select this neighbourhood
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleShortlist(activeNeighbourhood.i)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                    state.sel.includes(activeNeighbourhood.i)
                      ? 'bg-emerald-800 text-white border-emerald-600'
                      : 'border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  {state.sel.includes(activeNeighbourhood.i)
                    ? '✓ Shortlisted'
                    : '+ Shortlist'}
                </button>
              </div>
            </div>
          )}

          {/* Grouped Locality Cards List */}
          <div className="flex-1 overflow-y-auto max-h-[520px] space-y-4 pr-1 scrollbar-thin">
            {[0, 1, 2].map((groupVal) => {
              const items = scoredNeighbourhoods.filter(
                (q) => q.g === groupVal && q.vis
              );

              if (items.length === 0) return null;

              const badgeColors = [
                'bg-emerald-100 text-emerald-800 border-emerald-200',
                'bg-amber-100 text-amber-800 border-amber-200',
                'bg-red-100 text-red-800 border-red-200',
              ];

              return (
                <div key={groupVal} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeColors[groupVal]}`}
                    >
                      {GROUP_TITLES[groupVal]}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {GROUP_SUBTITLES[groupVal]}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {items.map((q) => {
                      const isSelected = activeNeighbourhoodId === q.i;
                      const isShortlisted = state.sel.includes(q.i);
                      const hasRoadDist =
                        q.hasValidRoute && q.roadKm !== null && q.roadKm !== undefined;
                      const roadDist = hasRoadDist ? `${q.roadKm} km road` : 'Route unavailable';
                      const drivingDuration =
                        q.hasValidRoute && q.drivingMin !== null && q.drivingMin !== undefined
                          ? `~${q.drivingMin} min driving`
                          : 'Route unavailable';

                      return (
                        <div
                          key={q.i}
                          onClick={() => {
                            setActiveNeighbourhoodId(q.i);
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#21442E] bg-emerald-50/40 shadow-sm ring-1 ring-[#21442E]'
                              : 'border-[#E2E6DD] bg-white hover:border-neutral-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-neutral-900">
                                  {q.a[0]}
                                </span>
                                <span className="text-[10px] font-bold bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                                  Score {q.sc}
                                </span>
                              </div>
                              <div className="text-[11px] text-neutral-500 mt-1 flex flex-wrap items-center gap-2">
                                <span>{PROPERTIES[state.prop][0]}</span>
                                <span>·</span>
                                <span className="font-semibold text-neutral-700 flex items-center gap-1">
                                  <Car className="w-3 h-3 text-neutral-400" />
                                  {roadDist}
                                </span>
                                <span>·</span>
                                <span className="font-semibold text-emerald-800 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-emerald-600" />
                                  {drivingDuration}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-extrabold text-sm text-neutral-900">
                                {formatINR(q.x.e.rent)}
                                <span className="text-[10px] font-normal text-neutral-500">/mo</span>
                              </div>
                              <div
                                className={`text-[11px] font-semibold ${
                                  q.x.sav >= 0 ? 'text-emerald-700' : 'text-red-600'
                                }`}
                              >
                                {q.x.sav >= 0 ? `+${formatINR(q.x.sav)} save` : `${formatINR(q.x.sav)} loss`}
                              </div>
                            </div>
                          </div>

                          {/* Card Footer badges */}
                          <div className="mt-2.5 pt-2 border-t border-[#E2E6DD] flex items-center justify-between">
                            <span className="text-[10px] text-neutral-400 font-medium">
                              Total exp: {formatINR(q.x.tot)}/mo
                            </span>

                            <button
                              type="button"
                              onClick={(e) => handleToggleShortlist(q.i, e)}
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors ${
                                isShortlisted
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                              }`}
                            >
                              {isShortlisted ? '✓ Shortlisted' : '+ Shortlist'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {scoredNeighbourhoods.filter((q) => q.vis).length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#E2E6DD]">
                <p className="text-xs text-neutral-500">
                  No neighbourhoods match these specific filters.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 text-xs font-semibold text-[#21442E] underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Map with Road Routes (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          {/* Small Route Information Card Near Map (Requirements 1-8) */}
          {activeNeighbourhood && (
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E2E6DD] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#21442E]/10 flex items-center justify-center text-[#21442E] shrink-0">
                  <Navigation className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                    Highlighted Route · {state.wp?.name || 'Office'}
                  </div>
                  <div className="text-base font-extrabold text-[#19241D] truncate">
                    {activeNeighbourhood.a[0]}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-5 sm:gap-6 bg-neutral-50 px-4 py-2 rounded-xl border border-[#E2E6DD]/80 shrink-0">
                {/* Road Distance */}
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Road Distance</span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-neutral-900 mt-0.5">
                    {routeDistanceDisplay}
                  </div>
                </div>

                <div className="h-7 w-px bg-neutral-200" />

                {/* Estimated Driving Time */}
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Est. Driving Time</span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-emerald-800 mt-0.5">
                    {routeDurationDisplay}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 min-h-[500px]">
            <MapComponent
              city={state.city}
              workplace={state.wp}
              neighbourhoods={scoredNeighbourhoods}
              selectedId={activeNeighbourhoodId}
              shortlist={state.sel}
              propType={state.prop}
              layers={layers}
              onSelectNeighbourhood={(id) => setActiveNeighbourhoodId(id)}
              onRouteLoaded={handleRouteLoadedInternal}
              className="h-full min-h-[500px] rounded-2xl"
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E2E6DD]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[#E2E6DD] bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#21442E] text-white font-semibold text-sm shadow-sm hover:bg-[#183423] transition-all"
        >
          <span>
            {state.sel.length > 0
              ? `Continue with ${state.sel.length} selected areas`
              : 'Continue to Lifestyle'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
