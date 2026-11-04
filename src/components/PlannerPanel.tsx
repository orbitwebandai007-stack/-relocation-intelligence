import React, { useState, useMemo } from 'react';
import {
  AccommodationType,
  CityKey,
  ExpenseCategory,
  FoodHabit,
  LifestyleTier,
  PropertyType,
  RelocationState,
  SavedPlan,
  ScoredNeighbourhood,
  TransportMode,
} from '../types';
import {
  ACCOMMODATIONS,
  BASE,
  CITIES,
  EXPENSE_CATEGORIES,
  FOOD_HABITS,
  LIFESTYLE_TIERS,
  PROPERTIES,
  TRANSPORT_MODES,
  calculateNeighbourhoods,
  calculateRent,
  estimateExpenses,
  formatINR,
  getTarget,
} from '../data/relocationData';
import { RelocationBlueprint } from './RelocationBlueprint';
import {
  MapPin,
  Search,
  Building,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Wallet,
  PiggyBank,
  ShieldAlert,
  Bookmark,
  Star,
  Clock,
  Car,
  TrendingUp,
  RotateCcw,
  Printer,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Layers,
  Sparkles,
  Info,
  Compass,
  Eye,
} from 'lucide-react';

interface PlannerPanelProps {
  state: RelocationState;
  scoredNeighbourhoods: ScoredNeighbourhood[];
  chosenNeighbourhood: ScoredNeighbourhood;
  onUpdateState: (updates: Partial<RelocationState>) => void;
  onGoStep: (step: number) => void;
  onTogglePanel?: () => void;
}

export const PlannerPanel: React.FC<PlannerPanelProps> = ({
  state,
  scoredNeighbourhoods,
  chosenNeighbourhood,
  onUpdateState,
  onGoStep,
  onTogglePanel,
}) => {
  const currentCity = CITIES[state.city] || CITIES.blr;
  const wp = state.wp || {
    name: currentCity.hubs[0][0],
    lat: currentCity.hubs[0][1],
    lng: currentCity.hubs[0][2],
  };

  // Local state for Step 0 (Location search)
  const [hubSearch, setHubSearch] = useState('');
  const [hubSearchErr, setHubSearchErr] = useState('');

  // Local state for Current Baseline toggle in Step 1
  const [showBaselineDetails, setShowBaselineDetails] = useState(false);
  const [showFactors, setShowFactors] = useState(false);

  // Calculate live financial figures
  const currentEst = estimateExpenses(
    state.city,
    chosenNeighbourhood.a,
    wp,
    true,
    state
  );
  const targetSavings = getTarget(state);
  const savingsRate = Math.round((currentEst.sav / state.sal) * 100);
  const availableBudget = state.sal - state.com - targetSavings;

  // Step 0 Handlers
  const handleCitySelect = (cityKey: CityKey) => {
    const selectedCity = CITIES[cityKey] || CITIES.blr;
    const defaultHub = selectedCity.hubs[0];
    onUpdateState({
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

  const handleHubSearch = (value: string) => {
    setHubSearch(value);
    if (!value.trim()) {
      setHubSearchErr('');
      return;
    }
    const allLocations = [
      ...currentCity.hubs.map((h) => ({ name: h[0], lat: h[1], lng: h[2] })),
      ...currentCity.areas.map((a) => ({ name: a[0], lat: a[1], lng: a[2] })),
    ];
    const match = allLocations.find((loc) =>
      loc.name.toLowerCase().includes(value.trim().toLowerCase())
    );
    if (match) {
      onUpdateState({
        wp: { name: match.name, lat: match.lat, lng: match.lng },
        sel: [],
      });
      setHubSearchErr('');
    } else {
      setHubSearchErr('Hub not found. Choose from the curated hubs above or select a major corridor.');
    }
  };

  // Step 2 Shortlist Handler
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

  // Step 3 Accommodation change
  const handleAccommodationChange = (acc: AccommodationType) => {
    const defaultProp: Record<AccommodationType, PropertyType> = {
      alone: 'b1',
      share: 'pr',
      pg: 'pg1',
    };
    onUpdateState({
      acc,
      prop: defaultProp[acc],
    });
  };

  const matchingProperties = (
    Object.keys(PROPERTIES) as PropertyType[]
  ).filter((p) => PROPERTIES[p][1] === state.acc);

  // Step 4 Override handlers
  const handleExpenseOverride = (cat: ExpenseCategory, value: number) => {
    onUpdateState({
      ov: {
        ...state.ov,
        [cat]: Math.max(0, value),
      },
    });
  };

  // Filtered neighbourhoods for Step 2
  const filteredNeighbourhoods = useMemo(() => {
    return scoredNeighbourhoods.filter((item) => {
      if (state.f.q.trim()) {
        const query = state.f.q.toLowerCase();
        if (!item.a[0].toLowerCase().includes(query)) return false;
      }
      if (state.f.a === 'w' && item.g !== 0) return false;
      if (state.f.a === 'n' && item.g !== 1) return false;
      if (state.f.a === 'a' && item.g !== 2) return false;
      if (state.f.c) {
        const maxCommute = Number(state.f.c);
        const minVal = item.drivingMin ?? item.x.min;
        if (minVal > maxCommute) return false;
      }
      return true;
    });
  }, [scoredNeighbourhoods, state.f]);

  // Cities list for destination switcher
  const availableCities = Object.values(CITIES);

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden bg-white">
      {/* Mobile Top Bar: Quick navigation to view map on small viewports */}
      <div className="sm:hidden flex items-center justify-between px-4 py-2.5 border-b border-[#E5EAE5] bg-[#F8F9F7] shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#18231E]">
          <Compass className="w-3.5 h-3.5 text-[#176B50]" />
          <span>Decision Panel</span>
        </div>
        {onTogglePanel && (
          <button
            type="button"
            onClick={onTogglePanel}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#176B50] bg-white border border-[#E5EAE5] shadow-2xs hover:bg-[#E8F4EF] transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Map</span>
          </button>
        )}
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 scrollbar-thin">
        {/* ================= STEP 0: LOCATION ================= */}
        {state.st === 0 && (
          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#176B50] mb-1">
                Step 01 · Destination & Workplace Hub
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#18231E] font-heading tracking-tight">
                Where is your relocation destination?
              </h2>
              <p className="text-xs text-[#5F6A63] mt-1 leading-relaxed">
                Commute duration in Indian tech corridors shapes daily quality of life. Select your target city and employment center.
              </p>
            </div>

            {/* Moving from */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                Relocating From (Current City)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#5F6A63] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={state.from}
                  onChange={(e) => onUpdateState({ from: e.target.value })}
                  placeholder="e.g. Pune, Mumbai, Hyderabad, Kolkata..."
                  className="w-full pl-9 pr-3 py-2 bg-[#F8F9F7] border border-[#E5EAE5] rounded-xl text-xs font-semibold text-[#18231E] focus:outline-none focus:ring-2 focus:ring-[#176B50]/20 focus:border-[#176B50]"
                />
              </div>
            </div>

            {/* Scalable Multi-City Destination Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                  Target Destination City
                </label>
                <span className="text-[10px] font-mono text-[#176B50]">
                  {availableCities.length} Cities Supported
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableCities.map((c) => {
                  const isSelected = state.city === c.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => handleCitySelect(c.key)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#176B50] bg-[#E8F4EF] text-[#176B50] ring-1 ring-[#176B50] shadow-xs'
                          : 'border-[#E5EAE5] bg-[#F8F9F7] text-[#18231E] hover:bg-neutral-100'
                      }`}
                    >
                      <div className="font-bold text-xs truncate">{c.name}</div>
                      <div className="text-[10px] text-[#5F6A63] mt-0.5 truncate">
                        Deposit: {c.depositMonthsRange[0]}–{c.depositMonthsRange[1]} mo
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Curated Employment Hubs for Selected City */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                Workplace Tech Park / Campus in {currentCity.name}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentCity.hubs.map((hub) => {
                  const isSelected = state.wp?.name === hub[0];
                  return (
                    <button
                      key={hub[0]}
                      type="button"
                      onClick={() =>
                        onUpdateState({
                          wp: { name: hub[0], lat: hub[1], lng: hub[2] },
                          sel: [],
                        })
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between text-xs ${
                        isSelected
                          ? 'border-[#176B50] bg-[#E8F4EF] text-[#176B50] font-semibold'
                          : 'border-[#E5EAE5] bg-[#F8F9F7] text-[#18231E] hover:bg-neutral-100'
                      }`}
                    >
                      <span className="truncate">{hub[0]}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 stroke-[2.5] text-[#176B50] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Hub Search */}
            <div className="space-y-1.5 pt-2 border-t border-[#E5EAE5]">
              <label className="text-xs font-semibold text-[#18231E]">
                Or search specific tech park / business district:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-[#5F6A63] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={hubSearch}
                  onChange={(e) => handleHubSearch(e.target.value)}
                  placeholder={`Search corridors in ${currentCity.name}...`}
                  className="w-full pl-9 pr-3 py-2 bg-[#F8F9F7] border border-[#E5EAE5] rounded-xl text-xs font-medium text-[#18231E] focus:outline-none focus:ring-2 focus:ring-[#176B50]/20 focus:border-[#176B50]"
                />
              </div>
              {hubSearchErr && (
                <p className="text-[11px] text-[#BE123C]">{hubSearchErr}</p>
              )}
            </div>

            {/* Active Confirmation */}
            {state.wp && (
              <div className="p-3 rounded-xl bg-[#E8F4EF] border border-[#176B50]/20 flex items-center justify-between text-xs">
                <span className="text-[#5F6A63]">Confirmed Office:</span>
                <span className="font-bold text-[#176B50] truncate">
                  {state.wp.name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 1: SALARY & BASELINE ================= */}
        {state.st === 1 && (
          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#176B50] mb-1">
                Step 02 · Compensation & Current Baseline
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#18231E] font-heading tracking-tight">
                Establish in-hand cashflow.
              </h2>
              <p className="text-xs text-[#5F6A63] mt-1 leading-relaxed">
                Enter your destination monthly take-home salary and current city living baseline to calculate your true relocation gain.
              </p>
            </div>

            {/* Destination Take-home Salary Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#176B50]">
                    Destination In-Hand Take-Home ({currentCity.name})
                  </label>
                  <p className="text-[10px] text-[#5F6A63]">
                    Net monthly credited after New Tax Regime & PF (not CTC / 12)
                  </p>
                </div>
                <span className="font-mono font-bold text-base text-[#176B50]">
                  {formatINR(state.sal)}/mo
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#5F6A63]">
                  ₹
                </span>
                <input
                  type="number"
                  min="15000"
                  step="2500"
                  value={state.sal}
                  onChange={(e) =>
                    onUpdateState({ sal: Math.max(0, Number(e.target.value)) })
                  }
                  className="w-full pl-8 pr-3 py-2.5 bg-[#F8F9F7] border border-[#E5EAE5] rounded-xl text-base font-bold font-mono text-[#18231E] focus:outline-none focus:ring-2 focus:ring-[#176B50]/20 focus:border-[#176B50]"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {[60000, 80000, 100000, 130000, 160000, 200000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onUpdateState({ sal: val })}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      state.sal === val
                        ? 'bg-[#176B50] text-white'
                        : 'bg-[#F8F9F7] border border-[#E5EAE5] text-[#5F6A63]'
                    }`}
                  >
                    {formatINR(val)}
                  </button>
                ))}
              </div>
            </div>

            {/* Current City Baseline (For accurate Delta comparison) */}
            <div className="p-4 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#18231E] block">
                    Current City Baseline ({state.from || 'Origin'})
                  </span>
                  <span className="text-[10px] text-[#5F6A63]">
                    Used to compare your current savings vs. destination relocation reality.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] font-semibold text-[#5F6A63] block mb-1">
                    Current Take-Home (₹)
                  </label>
                  <input
                    type="number"
                    step="2000"
                    value={state.currentSal}
                    onChange={(e) =>
                      onUpdateState({ currentSal: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-[#E5EAE5] rounded-lg text-xs font-mono font-bold text-[#18231E]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-[#5F6A63] block mb-1">
                    Current Monthly Expenses (₹)
                  </label>
                  <input
                    type="number"
                    step="2000"
                    value={state.currentExpenses}
                    onChange={(e) =>
                      onUpdateState({ currentExpenses: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full px-3 py-1.5 bg-white border border-[#E5EAE5] rounded-lg text-xs font-mono font-bold text-[#18231E]"
                  />
                </div>
              </div>

              <div className="text-[11px] text-[#5F6A63] flex justify-between pt-1 border-t border-[#E5EAE5]/60">
                <span>Current Monthly Savings:</span>
                <strong className="font-mono text-[#18231E]">
                  {formatINR(Math.max(0, state.currentSal - state.currentExpenses - state.com))}/mo
                </strong>
              </div>
            </div>

            {/* Non-negotiable Commitments */}
            <div className="space-y-2 pt-2 border-t border-[#E5EAE5]">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                  Fixed Commitments (Loans / EMIs / Family support)
                </label>
                <span className="font-mono font-bold text-xs text-[#18231E]">
                  {formatINR(state.com)}/mo
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#5F6A63]">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={state.com}
                  onChange={(e) =>
                    onUpdateState({ com: Math.max(0, Number(e.target.value)) })
                  }
                  className="w-full pl-8 pr-3 py-2 bg-[#F8F9F7] border border-[#E5EAE5] rounded-xl text-xs font-bold font-mono text-[#18231E] focus:outline-none focus:ring-2 focus:ring-[#176B50]/20 focus:border-[#176B50]"
                />
              </div>
            </div>

            {/* Target Savings Mode */}
            <div className="space-y-2 pt-2 border-t border-[#E5EAE5]">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                  Monthly Savings Target
                </label>
                <span className="font-mono font-bold text-xs text-[#176B50]">
                  {formatINR(state.tgt)}/mo
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max={Math.max(10000, state.sal - state.com)}
                step="2500"
                value={state.tgt}
                onChange={(e) => onUpdateState({ tgt: Number(e.target.value) })}
                className="w-full h-2 bg-neutral-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Liquid Savings Readiness (Optional) */}
            <div className="space-y-2 pt-2 border-t border-[#E5EAE5]">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                    Available Relocation Savings (Optional)
                  </label>
                  <p className="text-[10px] text-[#5F6A63]">
                    Liquid capital you currently have ready for moving day.
                  </p>
                </div>
                {state.availableSavings ? (
                  <span className="font-mono font-bold text-xs text-[#176B50]">
                    {formatINR(state.availableSavings)}
                  </span>
                ) : null}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#5F6A63]">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  placeholder="e.g. 250000"
                  value={state.availableSavings || ''}
                  onChange={(e) =>
                    onUpdateState({
                      availableSavings: Math.max(0, Number(e.target.value)),
                    })
                  }
                  className="w-full pl-8 pr-3 py-2 bg-[#F8F9F7] border border-[#E5EAE5] rounded-xl text-xs font-bold font-mono text-[#18231E] focus:outline-none focus:ring-2 focus:ring-[#176B50]/20 focus:border-[#176B50]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: DISCOVERY ================= */}
        {state.st === 2 && (
          <div className="space-y-5">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#176B50] mb-1">
                Step 03 · Locality Discovery & Ranking
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#18231E] font-heading tracking-tight">
                Corridors in {currentCity.name}
              </h2>
              <p className="text-xs text-[#5F6A63] mt-1">
                Click any neighbourhood below or on the map to evaluate road commute to {wp.name}.
              </p>
            </div>

            {/* Search & Filter bar */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-[#5F6A63] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={state.f.q}
                  onChange={(e) =>
                    onUpdateState({ f: { ...state.f, q: e.target.value } })
                  }
                  placeholder={`Search corridors in ${currentCity.name}...`}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#F8F9F7] border border-[#E5EAE5] rounded-xl text-xs font-medium text-[#18231E] focus:outline-none focus:ring-2 focus:ring-[#176B50]/20 focus:border-[#176B50]"
                />
              </div>

              {/* Quick filter tabs */}
              <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => onUpdateState({ f: { ...state.f, a: '', c: '' } })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                    state.f.a === '' && state.f.c === ''
                      ? 'bg-[#176B50] text-white'
                      : 'bg-[#F8F9F7] border border-[#E5EAE5] text-[#5F6A63]'
                  }`}
                >
                  All ({scoredNeighbourhoods.length})
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateState({ f: { ...state.f, a: 'w' } })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                    state.f.a === 'w'
                      ? 'bg-[#176B50] text-white'
                      : 'bg-[#F8F9F7] border border-[#E5EAE5] text-[#5F6A63]'
                  }`}
                >
                  Best Fit
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateState({ f: { ...state.f, c: '35' } })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                    state.f.c === '35'
                      ? 'bg-[#176B50] text-white'
                      : 'bg-[#F8F9F7] border border-[#E5EAE5] text-[#5F6A63]'
                  }`}
                >
                  &lt; 35 min
                </button>
              </div>
            </div>

            {/* Currently Active Locality Card */}
            {chosenNeighbourhood && (
              <div className="p-4 rounded-2xl border border-[#176B50] bg-white ring-2 ring-[#176B50]/15 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#176B50] shrink-0">
                        Primary Selection
                      </span>
                      <span
                        className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider leading-none whitespace-nowrap shrink-0 ${
                          chosenNeighbourhood.badgeTone === 'emerald'
                            ? 'bg-[#E8F4EF] text-[#176B50]'
                            : chosenNeighbourhood.badgeTone === 'blue'
                            ? 'bg-blue-50 text-blue-700'
                            : chosenNeighbourhood.badgeTone === 'rose'
                            ? 'bg-rose-50 text-[#BE123C]'
                            : chosenNeighbourhood.badgeTone === 'amber'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {chosenNeighbourhood.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#18231E] mt-1 truncate" title={chosenNeighbourhood.a[0]}>
                      {chosenNeighbourhood.a[0]}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleToggleShortlist(chosenNeighbourhood.i, e)}
                    className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap active:scale-95 ${
                      state.sel.includes(chosenNeighbourhood.i)
                        ? 'bg-[#176B50] text-white shadow-2xs'
                        : 'bg-[#F8F9F7] border border-[#E5EAE5] text-[#18231E] hover:bg-neutral-100'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>
                      {state.sel.includes(chosenNeighbourhood.i)
                        ? 'Shortlisted'
                        : 'Shortlist'}
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] min-w-0">
                    <span className="text-[10px] text-[#5F6A63] uppercase font-semibold block truncate">
                      Rent ({PROPERTIES[state.prop]?.[0]}):
                    </span>
                    <div className="font-mono font-bold text-[#18231E] mt-0.5 truncate">
                      {formatINR(chosenNeighbourhood.x.e.rent)}/mo
                    </div>
                    <span className="text-[10px] text-[#5F6A63] block truncate mt-0.5">
                      Deposit: {formatINR(chosenNeighbourhood.depositRequired)} (Refundable)
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] min-w-0">
                    <span className="text-[10px] text-[#5F6A63] uppercase font-semibold block truncate">
                      Peak Commute:
                    </span>
                    <div className="font-mono font-bold text-[#176B50] mt-0.5 truncate">
                      ~{chosenNeighbourhood.peakMin ?? chosenNeighbourhood.drivingMin} min
                    </div>
                    <span className="text-[10px] text-[#5F6A63] block truncate mt-0.5">
                      {chosenNeighbourhood.roadKm !== null && chosenNeighbourhood.roadKm !== undefined ? `${chosenNeighbourhood.roadKm} km road` : 'Modeled road'} ({chosenNeighbourhood.straightLineKm} km air)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 gap-2">
                  <span className="text-[#5F6A63] truncate">Monthly Disposable Surplus:</span>
                  <span className="font-mono font-bold text-[#176B50] shrink-0 whitespace-nowrap">
                    {formatINR(chosenNeighbourhood.monthlySurplus)}/mo
                  </span>
                </div>

                {/* Expandable Why This Recommendation */}
                <div className="pt-2 border-t border-[#E5EAE5]">
                  <button
                    type="button"
                    onClick={() => setShowFactors(!showFactors)}
                    className="w-full flex items-center justify-between text-[11px] font-semibold text-[#176B50] hover:text-[#125740] cursor-pointer"
                  >
                    <span>Why this recommendation?</span>
                    {showFactors ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {showFactors && (
                    <div className="mt-2 p-2.5 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] text-[11px] space-y-1.5 text-[#5F6A63]">
                      <p className="font-medium text-[#18231E] break-words leading-relaxed">
                        {chosenNeighbourhood.whyExplanation}
                      </p>
                      <div className="space-y-1 pt-1.5 border-t border-[#E5EAE5]/60 text-[10px] leading-tight">
                        <div>• <strong>Affordability:</strong> {chosenNeighbourhood.factors.rentRatioText}</div>
                        <div>• <strong>Commute:</strong> {chosenNeighbourhood.factors.commuteText}</div>
                        <div>• <strong>Net Surplus:</strong> {chosenNeighbourhood.factors.surplusText}</div>
                        <div>• <strong>Capital Lock:</strong> {chosenNeighbourhood.factors.depositText}</div>
                        <div>• <strong>Source:</strong> {chosenNeighbourhood.routeSource} (Confidence: {chosenNeighbourhood.routeConfidence})</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Compact Locality List */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63] block">
                Ranked Corridors ({filteredNeighbourhoods.length})
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {filteredNeighbourhoods.map((item, idx) => {
                  const isSelected = item.i === chosenNeighbourhood.i;
                  return (
                    <div
                      key={item.i}
                      onClick={() =>
                        onUpdateState({
                          sel: [item.i, ...state.sel.filter((x) => x !== item.i)].slice(0, 3),
                        })
                      }
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-[#176B50] bg-[#E8F4EF] font-semibold text-[#18231E]'
                          : 'border-[#E5EAE5] bg-[#F8F9F7] text-[#5F6A63] hover:text-[#18231E]'
                      }`}
                    >
                      <div className="min-w-0 flex-1 flex items-center gap-2 mr-2">
                        <span className="w-5 h-5 rounded-full bg-white border border-[#E5EAE5] text-[10px] font-mono flex items-center justify-center shrink-0 shadow-2xs">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="text-[#18231E] block truncate font-medium">{item.a[0]}</span>
                          <span className="text-[9px] font-mono text-[#5F6A63] block truncate">
                            {item.badge}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-right whitespace-nowrap">
                        <span className="text-[#5F6A63]">~{item.peakMin ?? item.drivingMin}m</span>
                        <span className="font-bold text-[#18231E]">
                          ₹{Math.round(item.x.e.rent / 1000)}k
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: LIFESTYLE ================= */}
        {state.st === 3 && (
          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#176B50] mb-1">
                Step 04 · Lifestyle & Housing Standards
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#18231E] font-heading tracking-tight">
                Living Preferences
              </h2>
              <p className="text-xs text-[#5F6A63] mt-1 leading-relaxed">
                Define accommodation type, domestic food routine, and daily commute mode.
              </p>
            </div>

            {/* Accommodation Structure */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                1. Accommodation Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(ACCOMMODATIONS) as AccommodationType[]).map((accKey) => (
                  <button
                    key={accKey}
                    type="button"
                    onClick={() => handleAccommodationChange(accKey)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      state.acc === accKey
                        ? 'border-[#176B50] bg-[#E8F4EF] text-[#176B50]'
                        : 'border-[#E5EAE5] bg-[#F8F9F7] text-[#18231E]'
                    }`}
                  >
                    {ACCOMMODATIONS[accKey].split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Property configuration */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                Specific Configuration:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {matchingProperties.map((propKey) => (
                  <button
                    key={propKey}
                    type="button"
                    onClick={() => onUpdateState({ prop: propKey })}
                    className={`px-2 py-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                      state.prop === propKey
                        ? 'border-[#176B50] bg-[#176B50] text-white'
                        : 'border-[#E5EAE5] bg-[#F8F9F7] text-[#5F6A63]'
                    }`}
                  >
                    {PROPERTIES[propKey][0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Upfront Deposit Preview Badge */}
            <div className="p-3 rounded-xl bg-[#E8F4EF] border border-[#176B50]/20 flex items-center justify-between text-xs">
              <span className="text-[#5F6A63]">Estimated Security Deposit in {currentCity.name}:</span>
              <span className="font-mono font-bold text-[#176B50]">
                ~{formatINR(calculateRent(state.city, 1.2, state.prop) * currentCity.defaultDepositMonths)}
                <span className="text-[10px] font-normal text-[#5F6A63]"> ({currentCity.defaultDepositMonths} mo)</span>
              </span>
            </div>

            {/* Food Habits */}
            <div className="space-y-2 pt-2 border-t border-[#E5EAE5]">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                2. Cooking & Food Routine
              </label>
              <div className="space-y-1.5">
                {(Object.keys(FOOD_HABITS) as FoodHabit[]).map((fKey) => (
                  <button
                    key={fKey}
                    type="button"
                    onClick={() => onUpdateState({ food: fKey })}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between ${
                      state.food === fKey
                        ? 'border-[#176B50] bg-[#E8F4EF] text-[#176B50]'
                        : 'border-[#E5EAE5] bg-[#F8F9F7] text-[#18231E]'
                    }`}
                  >
                    <span>{FOOD_HABITS[fKey]}</span>
                    {state.food === fKey && (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Commute Mode */}
            <div className="space-y-2 pt-2 border-t border-[#E5EAE5]">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                3. Commute Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(TRANSPORT_MODES) as TransportMode[]).map((tKey) => (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => onUpdateState({ tr: tKey })}
                    className={`p-2 rounded-xl border text-left text-xs truncate ${
                      state.tr === tKey
                        ? 'border-[#176B50] bg-[#E8F4EF] text-[#176B50] font-semibold'
                        : 'border-[#E5EAE5] bg-[#F8F9F7] text-[#18231E]'
                    }`}
                  >
                    {TRANSPORT_MODES[tKey].split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Lifestyle Tier */}
            <div className="space-y-2 pt-2 border-t border-[#E5EAE5]">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                4. Discretionary Leisure Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(LIFESTYLE_TIERS) as LifestyleTier[]).map((tierKey) => (
                  <button
                    key={tierKey}
                    type="button"
                    onClick={() => onUpdateState({ life: tierKey })}
                    className={`p-2 rounded-xl border text-xs font-semibold text-center ${
                      state.life === tierKey
                        ? 'border-[#176B50] bg-[#E8F4EF] text-[#176B50]'
                        : 'border-[#E5EAE5] bg-[#F8F9F7] text-[#18231E]'
                    }`}
                  >
                    {LIFESTYLE_TIERS[tierKey].label.split('-')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: ANALYSIS ================= */}
        {state.st === 4 && (
          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#176B50] mb-1">
                Step 05 · Cashflow & What-If Simulations
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#18231E] font-heading tracking-tight">
                Financial Breakdown
              </h2>
              <p className="text-xs text-[#5F6A63] mt-1">
                Estimated outflow in {chosenNeighbourhood.a[0]}, {currentCity.name}. Adjust sliders to test budget variations.
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                  Destination Take-Home
                </span>
                <div className="font-mono font-bold text-sm text-[#18231E] mt-0.5">
                  {formatINR(state.sal)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                  Total Outflow
                </span>
                <div className="font-mono font-bold text-sm text-[#18231E] mt-0.5">
                  {formatINR(currentEst.tot)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                  Fixed Commitments
                </span>
                <div className="font-mono font-bold text-sm text-[#18231E] mt-0.5">
                  {formatINR(state.com)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#E8F4EF] border border-[#176B50]/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#176B50]">
                  Net Monthly Surplus
                </span>
                <div className="font-mono font-bold text-sm text-[#176B50] mt-0.5">
                  {formatINR(currentEst.sav)}
                </div>
              </div>
            </div>

            {/* Outflow Category Bars */}
            <div className="space-y-2 pt-2 border-t border-[#E5EAE5]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                Monthly Outflow Distribution
              </span>
              <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden flex">
                <div
                  style={{
                    width: `${Math.min(100, (currentEst.e.rent / state.sal) * 100)}%`,
                  }}
                  className="bg-[#176B50] h-full"
                />
                <div
                  style={{
                    width: `${Math.min(100, (currentEst.e.food / state.sal) * 100)}%`,
                  }}
                  className="bg-[#2D8A68] h-full"
                />
                <div
                  style={{
                    width: `${Math.min(100, (currentEst.e.trans / state.sal) * 100)}%`,
                  }}
                  className="bg-[#8DA785] h-full"
                />
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      (currentEst.sav > 0 ? (currentEst.sav / state.sal) * 100 : 0)
                    )}%`,
                  }}
                  className="bg-[#C8E6A0] h-full"
                />
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#5F6A63]">
                <span>Rent: <strong className="font-mono text-[#18231E]">{formatINR(currentEst.e.rent)}</strong></span>
                <span>Food: <strong className="font-mono text-[#18231E]">{formatINR(currentEst.e.food)}</strong></span>
                <span>Transit: <strong className="font-mono text-[#18231E]">{formatINR(currentEst.e.trans)}</strong></span>
              </div>
            </div>

            {/* What-If Sliders */}
            <div className="space-y-3 pt-2 border-t border-[#E5EAE5]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#18231E]">What-If Rent Override:</span>
                <span className="font-mono font-bold text-[#18231E]">
                  {formatINR(currentEst.e.rent)}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="80000"
                step="1000"
                value={currentEst.e.rent}
                onChange={(e) => handleExpenseOverride('rent', Number(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="font-bold text-[#18231E]">What-If Food Override:</span>
                <span className="font-mono font-bold text-[#18231E]">
                  {formatINR(currentEst.e.food)}
                </span>
              </div>
              <input
                type="range"
                min="3000"
                max="35000"
                step="1000"
                value={currentEst.e.food}
                onChange={(e) => handleExpenseOverride('food', Number(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* ================= STEP 5: RELOCATION BLUEPRINT ================= */}
        {state.st === 5 && (
          <RelocationBlueprint
            state={state}
            chosenNeighbourhood={chosenNeighbourhood}
            scoredNeighbourhoods={scoredNeighbourhoods}
            onUpdateState={onUpdateState}
            onGoStep={onGoStep}
          />
        )}
      </div>

      {/* Sticky Bottom Navigation Footer Inside Panel */}
      <div className="p-4 bg-white border-t border-[#E5EAE5] flex items-center justify-between gap-3 shrink-0">
        {state.st > 0 && state.st < 5 ? (
          <button
            type="button"
            onClick={() => onGoStep(state.st - 1)}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#5F6A63] hover:text-[#18231E] hover:bg-[#F8F9F7] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {state.st < 4 ? (
          <button
            type="button"
            onClick={() => onGoStep(state.st + 1)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#176B50] hover:bg-[#125740] shadow-xs transition-all active:scale-95"
          >
            <span>
              {state.st === 0
                ? 'Continue to Salary'
                : state.st === 1
                ? 'Discover Localities'
                : state.st === 2
                ? 'Configure Lifestyle'
                : 'Analyze Budget'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : state.st === 4 ? (
          <button
            type="button"
            onClick={() => onGoStep(5)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#176B50] hover:bg-[#125740] shadow-xs transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C8E6A0]" />
            <span>Generate Relocation Blueprint</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          /* Step 5 Footer: Never auto-reset! Provide explicit actions */
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onGoStep(4)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#5F6A63] hover:text-[#18231E] hover:bg-neutral-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Edit Inputs</span>
            </button>
            <button
              type="button"
              onClick={() => onGoStep(2)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#176B50] hover:bg-[#125740] shadow-xs transition-all"
            >
              <span>Explore More Corridors</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
