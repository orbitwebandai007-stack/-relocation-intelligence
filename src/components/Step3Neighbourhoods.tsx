import React, { useState, useMemo } from 'react';
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
  Bookmark,
  Star,
  Layers,
  ArrowRight,
  ArrowLeft,
  Car,
  Clock,
  Navigation,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Info,
  MapPin,
  TrendingUp,
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
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeRouteInfo, setActiveRouteInfo] = useState<RouteInfo | null>(null);

  // Map layer controls
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
        currentSel.shift();
        currentSel.push(idx);
      }
    }

    onUpdateState({ sel: currentSel });
  };

  // Filter and sort handlers
  const handleFilterChange = (filterUpdate: Partial<typeof state.f>) => {
    onUpdateState({
      f: {
        ...state.f,
        ...filterUpdate,
      },
    });
  };

  // Filtered and sorted neighbourhoods list
  const filteredNeighbourhoods = useMemo(() => {
    return scoredNeighbourhoods.filter((item) => {
      // 1. Text search
      if (state.f.q.trim()) {
        const query = state.f.q.toLowerCase();
        if (!item.a[0].toLowerCase().includes(query)) {
          return false;
        }
      }

      // 2. Affordability tier
      if (state.f.a === 'w' && item.g !== 0) return false;
      if (state.f.a === 'n' && item.g !== 1) return false;
      if (state.f.a === 'a' && item.g !== 2) return false;

      // 3. Commute limit
      if (state.f.c) {
        const maxCommute = Number(state.f.c);
        const minVal = item.drivingMin ?? item.x.min;
        if (minVal > maxCommute) return false;
      }

      return true;
    });
  }, [scoredNeighbourhoods, state.f]);

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-semibold text-[#176B50] mb-1 flex items-center gap-1.5">
            <span>03</span>
            <span className="text-neutral-300">/</span>
            <span>NEIGHBOURHOOD DISCOVERY & COMMUTE MATRIX</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#18231E] font-heading tracking-tight">
            Discover neighbourhoods near {state.wp?.name || currentCity.name}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#5F6A63]">
            Ranked by commute proximity, rent affordability, and savings potential. Select up to 3 localities to compare.
          </p>
        </div>

        {/* Shortlist Counter Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-3.5 py-1.5 rounded-full border border-[#E5EAE5] shadow-xs">
          <Bookmark className="w-3.5 h-3.5 text-[#176B50]" />
          <span className="text-xs font-semibold text-[#18231E]">
            Shortlisted: <span className="font-mono text-[#176B50]">{state.sel.length}</span>/3
          </span>
        </div>
      </div>

      {/* Two-Column Discovery Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Search, Filters & Locality Cards (5 of 12 columns) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search & Filter Controls */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#5F6A63] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={state.f.q}
                onChange={(e) => handleFilterChange({ q: e.target.value })}
                placeholder="Search area (e.g. Indiranagar, Cyber City...)"
                className="w-full pl-9 pr-3 py-2 bg-[#F8F9F7] border border-[#E5EAE5] rounded-xl text-xs font-medium text-[#18231E] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#176B50]/20 focus:border-[#176B50]"
              />
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                type="button"
                onClick={() => handleFilterChange({ a: '', c: '' })}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  state.f.a === '' && state.f.c === ''
                    ? 'bg-[#176B50] text-white shadow-xs'
                    : 'bg-[#F8F9F7] text-[#5F6A63] hover:text-[#18231E] border border-[#E5EAE5]'
                }`}
              >
                All Areas ({scoredNeighbourhoods.length})
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange({ a: 'w' })}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  state.f.a === 'w'
                    ? 'bg-[#176B50] text-white shadow-xs'
                    : 'bg-[#F8F9F7] text-[#5F6A63] hover:text-[#18231E] border border-[#E5EAE5]'
                }`}
              >
                Best Fit
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange({ c: '30' })}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  state.f.c === '30'
                    ? 'bg-[#176B50] text-white shadow-xs'
                    : 'bg-[#F8F9F7] text-[#5F6A63] hover:text-[#18231E] border border-[#E5EAE5]'
                }`}
              >
                &lt; 30m Commute
              </button>
            </div>
          </div>

          {/* Locality Cards List */}
          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredNeighbourhoods.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-[#E5EAE5] text-center space-y-2">
                <MapPin className="w-6 h-6 text-[#5F6A63] mx-auto opacity-40" />
                <p className="text-xs font-semibold text-[#18231E]">
                  No matching neighbourhoods found
                </p>
                <p className="text-xs text-[#5F6A63]">
                  Try clearing your search query or loosening filter limits.
                </p>
                <button
                  type="button"
                  onClick={() => handleFilterChange({ q: '', a: '', c: '' })}
                  className="mt-2 px-3 py-1 text-xs text-[#176B50] font-semibold bg-[#E8F4EF] rounded-lg"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredNeighbourhoods.map((item) => {
                const isSelected = activeNeighbourhoodId === item.i;
                const isShortlisted = state.sel.includes(item.i);
                const isExpanded = expandedId === item.i;

                // Affordability badge
                const badgeConfig =
                  item.g === 0
                    ? { label: 'Best Fit', bg: 'bg-[#E8F4EF] text-[#176B50]' }
                    : item.g === 1
                    ? { label: 'Consider', bg: 'bg-amber-50 text-[#B45309]' }
                    : { label: 'Stretch', bg: 'bg-red-50 text-[#BE123C]' };

                const commuteMin = item.drivingMin ?? item.x.min;
                const commuteKm = item.roadKm ?? item.x.rd;

                return (
                  <div
                    key={item.i}
                    onClick={() => setActiveNeighbourhoodId(item.i)}
                    className={`rounded-2xl border transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'border-[#176B50] bg-white ring-2 ring-[#176B50]/15 shadow-sm'
                        : 'border-[#E5EAE5] bg-white hover:border-neutral-300 shadow-xs'
                    }`}
                  >
                    {/* Top Row: Name, Commute & Bookmark */}
                    <div className="p-3.5 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-[#18231E] truncate">
                            {item.a[0]}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${badgeConfig.bg}`}
                          >
                            {badgeConfig.label}
                          </span>
                        </div>

                        {/* Commute & Distance */}
                        <div className="flex items-center gap-3 text-xs text-[#5F6A63] mt-1">
                          <span className="flex items-center gap-1 font-mono font-medium text-[#18231E]">
                            <Clock className="w-3.5 h-3.5 text-[#176B50]" />
                            {commuteMin} min
                          </span>
                          <span className="text-neutral-300">·</span>
                          <span className="font-mono text-[#5F6A63]">
                            {commuteKm} km road
                          </span>
                        </div>
                      </div>

                      {/* Right side: Rent & Shortlist Button */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div className="text-[10px] uppercase font-bold text-[#5F6A63]">
                            Rent ({PROPERTIES[state.prop]?.[0]})
                          </div>
                          <div className="text-xs font-bold font-mono text-[#18231E]">
                            {formatINR(item.x.e.rent)}
                            <span className="text-[10px] font-normal text-[#5F6A63]">/mo</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleToggleShortlist(item.i, e)}
                          title={
                            isShortlisted
                              ? 'Remove from shortlist'
                              : 'Add to shortlist (up to 3)'
                          }
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            isShortlisted
                              ? 'bg-[#176B50] text-white'
                              : 'bg-[#F8F9F7] text-[#5F6A63] hover:text-[#18231E] border border-[#E5EAE5]'
                          }`}
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 ${
                              isShortlisted ? 'fill-current' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Progressive Disclosure Toggle */}
                    <div className="px-3.5 pb-2.5 pt-0 flex items-center justify-between text-[11px] text-[#5F6A63] border-t border-[#E5EAE5]/60 mt-1">
                      <span className="truncate max-w-[220px]">
                        Surplus: <strong className="text-[#18231E] font-mono">{formatINR(item.x.sav)}/mo</strong>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(isExpanded ? null : item.i);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#176B50] hover:underline"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'View Breakdown'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* Expanded Progressive Details */}
                    {isExpanded && (
                      <div className="p-3.5 bg-[#F8F9F7] border-t border-[#E5EAE5] rounded-b-2xl space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-[#5F6A63]">Food & Groceries:</span>
                            <div className="font-mono font-bold text-[#18231E]">
                              {formatINR(item.x.e.food)}/mo
                            </div>
                          </div>
                          <div>
                            <span className="text-[#5F6A63]">Commute Cost:</span>
                            <div className="font-mono font-bold text-[#18231E]">
                              {formatINR(item.x.e.trans)}/mo
                            </div>
                          </div>
                          <div>
                            <span className="text-[#5F6A63]">Utilities & Wi-Fi:</span>
                            <div className="font-mono font-bold text-[#18231E]">
                              {formatINR(item.x.e.util + item.x.e.net)}/mo
                            </div>
                          </div>
                          <div>
                            <span className="text-[#5F6A63]">Total Monthly Outflow:</span>
                            <div className="font-mono font-bold text-[#18231E]">
                              {formatINR(item.x.tot)}/mo
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-[#5F6A63] italic pt-1 border-t border-[#E5EAE5]">
                          "{item.why}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Large Interactive Map (7 of 12 columns) */}
        <div className="lg:col-span-7 sticky top-20">
          <div className="bg-white rounded-2xl border border-[#E5EAE5] shadow-xs overflow-hidden relative flex flex-col h-[620px]">
            {/* Floating Top Map Layer Controls */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm p-1 rounded-xl border border-[#E5EAE5] shadow-xs text-xs font-medium">
              <button
                type="button"
                onClick={() => setLayers((l) => ({ ...l, n: !l.n }))}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  layers.n
                    ? 'bg-[#176B50] text-white shadow-xs'
                    : 'text-[#5F6A63] hover:text-[#18231E]'
                }`}
              >
                Localities
              </button>
              <button
                type="button"
                onClick={() => setLayers((l) => ({ ...l, w: !l.w }))}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  layers.w
                    ? 'bg-[#176B50] text-white shadow-xs'
                    : 'text-[#5F6A63] hover:text-[#18231E]'
                }`}
              >
                Office
              </button>
              <button
                type="button"
                onClick={() => setLayers((l) => ({ ...l, c: !l.c }))}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  layers.c
                    ? 'bg-[#176B50] text-white shadow-xs'
                    : 'text-[#5F6A63] hover:text-[#18231E]'
                }`}
              >
                Route
              </button>
              <button
                type="button"
                onClick={() => setLayers((l) => ({ ...l, t: !l.t }))}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  layers.t
                    ? 'bg-[#176B50] text-white shadow-xs'
                    : 'text-[#5F6A63] hover:text-[#18231E]'
                }`}
              >
                Metro
              </button>
            </div>

            {/* MapLibre Map Container */}
            <div className="flex-1 w-full h-full relative">
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
                className="w-full h-full"
              />
            </div>

            {/* Active Neighbourhood Floating Inspection Card */}
            {activeNeighbourhood && (
              <div className="absolute bottom-3 left-3 right-3 z-10 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-xl border border-[#E5EAE5] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#176B50] shrink-0" />
                    <h3 className="font-bold text-sm text-[#18231E] truncate max-w-[180px]">
                      {activeNeighbourhood.a[0]}
                    </h3>
                    <span className="text-xs text-[#5F6A63] truncate max-w-[160px]">
                      ↔ {state.wp?.name || 'Office'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#5F6A63] mt-1 font-mono">
                    <span className="truncate">
                      Travel: <strong className="text-[#18231E]">{routeDurationDisplay}</strong> ({routeDistanceDisplay})
                    </span>
                    <span className="text-neutral-300">·</span>
                    <span className="truncate">
                      Rent: <strong className="text-[#18231E]">{formatINR(activeNeighbourhood.x.e.rent)}</strong>/mo
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleToggleShortlist(activeNeighbourhood.i, e)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      state.sel.includes(activeNeighbourhood.i)
                        ? 'bg-[#176B50] text-white shadow-xs'
                        : 'bg-[#F8F9F7] text-[#18231E] border border-[#E5EAE5] hover:bg-neutral-100'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>
                      {state.sel.includes(activeNeighbourhood.i)
                        ? 'Shortlisted'
                        : 'Shortlist Area'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E5EAE5]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#5F6A63] hover:text-[#18231E] hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Salary</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold text-white bg-[#176B50] hover:bg-[#125740] shadow-sm transition-all duration-150 active:scale-[0.98]"
        >
          <span>Configure Lifestyle & Expenses</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
