import React, { useState, useEffect } from 'react';
import {
  CityKey,
  MovingCostBreakdown,
  RelocationState,
  RelocationVerdict,
  SavedPlan,
  ScoredNeighbourhood,
} from '../types';
import {
  CITIES,
  EXPENSE_CATEGORIES,
  PROPERTIES,
  calculateMovingCosts,
  calculateWealthProjection,
  estimateExpenses,
  evaluateRelocationVerdict,
  formatINR,
  getTarget,
} from '../data/relocationData';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Clock,
  Car,
  MapPin,
  Building,
  ShieldCheck,
  Printer,
  Bookmark,
  Check,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Sliders,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  Info,
  HelpCircle,
  Briefcase,
  Wallet,
  PiggyBank,
  Compass,
  FileText,
  FolderOpen,
  X,
} from 'lucide-react';

interface RelocationBlueprintProps {
  state: RelocationState;
  chosenNeighbourhood: ScoredNeighbourhood;
  scoredNeighbourhoods: ScoredNeighbourhood[];
  onUpdateState: (updates: Partial<RelocationState>) => void;
  onGoStep: (step: number) => void;
}

export const RelocationBlueprint: React.FC<RelocationBlueprintProps> = ({
  state,
  chosenNeighbourhood,
  scoredNeighbourhoods,
  onUpdateState,
  onGoStep,
}) => {
  // Active Section Tab for progressive disclosure
  const [activeSection, setActiveSection] = useState<
    'verdict' | 'neighbourhoods' | 'finances' | 'wealth' | 'next_steps'
  >('verdict');

  // Local state for plan saving and scenario comparison
  const [planTitle, setPlanTitle] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [showOverrideInputs, setShowOverrideInputs] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [savedPlansList, setSavedPlansList] = useState<SavedPlan[]>([]);

  // Investment CAGR assumption: default 9% (moderate), options 6% (conservative), 12% (aggressive), or custom
  const [cagrOption, setCagrOption] = useState<'6' | '9' | '12' | 'custom'>('9');
  const [customCagr, setCustomCagr] = useState(state.investmentReturnRate || 9);

  const destCity = CITIES[state.city] || CITIES.blr;
  const wp = state.wp || {
    name: destCity.hubs[0][0],
    lat: destCity.hubs[0][1],
    lng: destCity.hubs[0][2],
  };

  // 1. Current City Baseline calculations
  const currentSal = state.currentSal || 72000;
  const currentExpenses = state.currentExpenses || 44000;
  const currentSavings = Math.max(0, currentSal - currentExpenses - state.com);
  const currentSavingsRate = Math.round((currentSavings / currentSal) * 100);

  // 2. Destination Financials
  const destEst = estimateExpenses(
    state.city,
    chosenNeighbourhood.a,
    wp,
    true,
    state
  );
  const destRent = destEst.e.rent;
  const destSavings = destEst.sav;
  const destSavingsRate = Math.round((destSavings / state.sal) * 100);
  const savingsDelta = destSavings - currentSavings;
  const salaryDelta = state.sal - currentSal;

  // 3. Moving & Initial Setup Budget (Separating Recoverable vs Non-Recoverable)
  const movingCosts: MovingCostBreakdown = calculateMovingCosts(
    state.from || 'Origin',
    state.city,
    destRent,
    state.prop,
    state
  );

  // 4. Intelligent Relocation Verdict (Multidimensional, not arbitrary)
  const verdict: RelocationVerdict = evaluateRelocationVerdict(
    state.city,
    chosenNeighbourhood,
    state,
    movingCosts
  );

  // Candidate comparison list (Shortlisted or top 3)
  const candidateList =
    state.sel.length > 0
      ? (state.sel
          .map((id) => scoredNeighbourhoods.find((n) => n.i === id))
          .filter(Boolean) as ScoredNeighbourhood[])
      : scoredNeighbourhoods.slice(0, 3);

  // Status visual themes
  const statusTheme = {
    highly_favourable: {
      bg: 'bg-[#E8F4EF]',
      border: 'border-[#176B50]/30',
      badgeBg: 'bg-[#176B50] text-white',
      text: 'text-[#176B50]',
      icon: CheckCircle2,
    },
    favourable_tradeoffs: {
      bg: 'bg-emerald-50/60',
      border: 'border-emerald-200',
      badgeBg: 'bg-emerald-700 text-white',
      text: 'text-emerald-800',
      icon: CheckCircle2,
    },
    marginal_gain: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-200',
      badgeBg: 'bg-amber-700 text-white',
      text: 'text-amber-800',
      icon: AlertTriangle,
    },
    high_financial_risk: {
      bg: 'bg-rose-50/70',
      border: 'border-rose-200',
      badgeBg: 'bg-[#BE123C] text-white',
      text: 'text-[#BE123C]',
      icon: XCircle,
    },
  }[verdict.status];

  const StatusIcon = statusTheme.icon;

  // Load saved plans for multi-scenario comparison
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ri_saved_plans_v2');
      if (stored) {
        setSavedPlansList(JSON.parse(stored));
      }
    } catch (e) {}
  }, [saveSuccessMsg]);

  // Handler to switch candidate neighbourhood in place with zero resets
  const handleSelectCandidate = (candidateId: number) => {
    onUpdateState({
      sel: [candidateId, ...state.sel.filter((id) => id !== candidateId)].slice(0, 3),
    });
  };

  // Handler for saving plan with structured snapshot metrics for side-by-side comparison
  const handleSavePlan = () => {
    const title =
      planTitle.trim() ||
      `${destCity.name} (${chosenNeighbourhood.a[0]}) · ${formatINR(state.sal)}/mo`;

    const activeCagr = cagrOption === 'custom' ? customCagr : Number(cagrOption);
    const wealth3Yr = calculateWealthProjection(destSavings, 36, activeCagr).totalWealth;

    const newPlan: SavedPlan = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      title,
      state: { ...state },
      snapshot: {
        cityName: destCity.name,
        workplaceName: wp.name,
        neighbourhoodName: chosenNeighbourhood.a[0],
        inHandSalary: state.sal,
        monthlyExpenses: destEst.tot,
        monthlySavings: destSavings,
        savingsRate: destSavingsRate,
        day1CashRequired: movingCosts.totalDay1CashRequired,
        nonRecoverableCost: movingCosts.totalNonRecoverableCost,
        peakCommuteMin: chosenNeighbourhood.peakMin ?? chosenNeighbourhood.drivingMin ?? 30,
        wealthProjection3Yr: wealth3Yr,
      },
    };

    try {
      const stored = localStorage.getItem('ri_saved_plans_v2');
      const list: SavedPlan[] = stored ? JSON.parse(stored) : [];
      const updated = [newPlan, ...list.slice(0, 8)];
      localStorage.setItem('ri_saved_plans_v2', JSON.stringify(updated));
      setSavedPlansList(updated);
      setSaveSuccessMsg('Blueprint saved to comparison library!');
      setPlanTitle('');
      setTimeout(() => setSaveSuccessMsg(''), 3500);
    } catch (e) {}
  };

  const handleLoadSavedPlan = (plan: SavedPlan) => {
    onUpdateState(plan.state);
    setIsCompareModalOpen(false);
  };

  const handleDeleteSavedPlan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = savedPlansList.filter((p) => p.id !== id);
      localStorage.setItem('ri_saved_plans_v2', JSON.stringify(updated));
      setSavedPlansList(updated);
    } catch (e) {}
  };

  // Moving cost override handlers
  const handleDepositMonthsChange = (months: number) => {
    onUpdateState({ depositMonthsOverride: Math.max(1, months) });
  };

  const handleBrokerageChange = (months: number) => {
    onUpdateState({ brokerageOverride: Math.round(destRent * months) });
  };

  const handleMoversChange = (amount: number) => {
    onUpdateState({ moversOverride: Math.max(0, amount) });
  };

  const handleSetupReserveChange = (amount: number) => {
    onUpdateState({ setupOverride: Math.max(0, amount) });
  };

  // Active CAGR for wealth projection
  const effectiveCagr = cagrOption === 'custom' ? customCagr : Number(cagrOption);
  const wealth1Yr = calculateWealthProjection(destSavings, 12, effectiveCagr);
  const wealth3Yr = calculateWealthProjection(destSavings, 36, effectiveCagr);
  const currentWealth1Yr = calculateWealthProjection(currentSavings, 12, effectiveCagr);
  const currentWealth3Yr = calculateWealthProjection(currentSavings, 36, effectiveCagr);

  return (
    <div className="space-y-6 max-w-4xl mx-auto print-page pb-16">
      {/* Blueprint Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5EAE5] no-print">
        <div>
          <div className="text-xs font-mono font-semibold text-[#176B50] mb-1 flex items-center gap-1.5">
            <span>STAGE 06</span>
            <span className="text-neutral-300">/</span>
            <span>YOUR RELOCATION BLUEPRINT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#18231E] font-heading tracking-tight">
            Relocation Decision Blueprint
          </h1>
          <p className="mt-1 text-xs text-[#5F6A63]">
            Personalized executive analysis comparing {state.from || 'Origin'} with {destCity.name} ({chosenNeighbourhood.a[0]}).
          </p>
        </div>

        {/* Global Blueprint Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {savedPlansList.length > 0 && (
            <button
              type="button"
              onClick={() => setIsCompareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#E8F4EF] text-[#176B50] border border-[#176B50]/20 hover:bg-[#d5ece1] transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Compare Scenarios ({savedPlansList.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E5EAE5] text-[#18231E] hover:bg-neutral-50 shadow-xs transition-colors"
            title="Export clean 2-page print PDF"
          >
            <Printer className="w-3.5 h-3.5 text-[#176B50]" />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={() => onGoStep(0)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-[#5F6A63] hover:text-[#18231E] hover:bg-neutral-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Scenario</span>
          </button>
        </div>
      </div>

      {/* 5-Section Navigational Pills (Progressive Disclosure) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#E5EAE5] no-print scrollbar-none">
        {[
          { id: 'verdict', label: '1. Relocation Verdict' },
          { id: 'neighbourhoods', label: '2. Recommended Neighbourhoods' },
          { id: 'finances', label: '3. Financial Breakdown' },
          { id: 'wealth', label: '4. Long-Term Wealth' },
          { id: 'next_steps', label: '5. Next Steps' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeSection === tab.id
                ? 'bg-[#176B50] text-white shadow-xs'
                : 'bg-white border border-[#E5EAE5] text-[#5F6A63] hover:text-[#18231E] hover:bg-neutral-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================= SECTION 1: YOUR RELOCATION VERDICT ================= */}
      {(activeSection === 'verdict' || typeof window === 'undefined') && (
        <section className="space-y-6 animate-in fade-in duration-150">
          {/* Main Executive Verdict Banner */}
          <div
            className={`p-6 sm:p-7 rounded-2xl border ${statusTheme.border} ${statusTheme.bg} space-y-4`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <StatusIcon className={`w-5 h-5 ${statusTheme.text}`} />
                <span
                  className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider leading-none whitespace-nowrap shrink-0 ${statusTheme.badgeBg}`}
                >
                  {verdict.badgeLabel}
                </span>
              </div>

              <div className="text-xs font-mono text-[#5F6A63]">
                Destination: <strong className="text-[#18231E]">{destCity.name}</strong> · Campus: <strong className="text-[#18231E]">{wp.name}</strong>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#18231E] tracking-tight">
                {verdict.headline}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#18231E]/80 leading-relaxed">
                {verdict.rationale}
              </p>
            </div>

            {/* Quick-Glance Top Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-black/10">
              <div className="p-3 bg-white/80 rounded-xl">
                <span className="text-[10px] font-mono uppercase text-[#5F6A63] block">
                  Monthly Surplus Delta
                </span>
                <span
                  className={`text-base font-bold font-mono ${
                    savingsDelta >= 0 ? 'text-[#176B50]' : 'text-[#BE123C]'
                  }`}
                >
                  {savingsDelta >= 0 ? `+${formatINR(savingsDelta)}` : formatINR(savingsDelta)}/mo
                </span>
              </div>

              <div className="p-3 bg-white/80 rounded-xl">
                <span className="text-[10px] font-mono uppercase text-[#5F6A63] block">
                  Savings Rate
                </span>
                <span className="text-base font-bold font-mono text-[#18231E]">
                  {destSavingsRate}% in-hand
                </span>
              </div>

              <div className="p-3 bg-white/80 rounded-xl">
                <span className="text-[10px] font-mono uppercase text-[#5F6A63] block">
                  Day-1 Liquid Cash
                </span>
                <span className="text-base font-bold font-mono text-[#18231E]">
                  {formatINR(movingCosts.totalDay1CashRequired)}
                </span>
              </div>

              <div className="p-3 bg-white/80 rounded-xl">
                <span className="text-[10px] font-mono uppercase text-[#5F6A63] block">
                  Peak Commute Drive
                </span>
                <span className="text-base font-bold font-mono text-[#18231E]">
                  {chosenNeighbourhood.peakMin ?? chosenNeighbourhood.drivingMin ?? 30} min
                </span>
              </div>
            </div>
          </div>

          {/* 4-Pillar Evaluation Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
              The 4 Decision Pillars (Detailed Assessment)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {Object.entries(verdict.pillars).map(([key, pillar]) => {
                const pillarColor = {
                  pass: {
                    border: 'border-[#176B50]/30',
                    bg: 'bg-white',
                    badge: 'bg-[#E8F4EF] text-[#176B50]',
                    icon: CheckCircle2,
                  },
                  warning: {
                    border: 'border-amber-300',
                    bg: 'bg-white',
                    badge: 'bg-amber-100 text-amber-800',
                    icon: AlertTriangle,
                  },
                  fail: {
                    border: 'border-rose-300',
                    bg: 'bg-white',
                    badge: 'bg-rose-100 text-[#BE123C]',
                    icon: XCircle,
                  },
                }[pillar.status];

                const Icon = pillarColor.icon;

                return (
                  <div
                    key={key}
                    className={`p-4 rounded-xl border ${pillarColor.border} ${pillarColor.bg} shadow-xs space-y-2`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#18231E]">
                        {pillar.label}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${pillarColor.badge}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{pillar.metric}</span>
                      </span>
                    </div>
                    <p className="text-xs text-[#5F6A63] leading-relaxed">
                      {pillar.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payback & Capital Amortization Callout */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5EAE5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
                Dual Relocation Payback Analysis
              </span>
              <span className="text-[10px] font-mono text-[#176B50] font-semibold">
                Transparent Liquidity vs Sunk Cost Split
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#5F6A63]">
                  1. Economic Sunk Cost Recovery
                </span>
                <div className="text-sm font-bold font-mono text-[#18231E]">
                  {verdict.economicPaybackMonths !== null
                    ? `${verdict.economicPaybackMonths} Months`
                    : 'Not Achievable'}
                </div>
                <p className="text-[11px] text-[#5F6A63]">
                  Recoups non-refundable expenses (brokerage, packers, travel, setup = {formatINR(movingCosts.totalNonRecoverableCost)}) from new monthly surplus.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#5F6A63]">
                  2. Day-1 Liquidity Recovery
                </span>
                <div className="text-sm font-bold font-mono text-[#18231E]">
                  {verdict.liquidityPaybackMonths !== null
                    ? `${verdict.liquidityPaybackMonths} Months`
                    : 'Not Achievable'}
                </div>
                <p className="text-[11px] text-[#5F6A63]">
                  Amortizes total upfront cash required on Day 1 ({formatINR(movingCosts.totalDay1CashRequired)}, including recoverable security deposits).
                </p>
              </div>
            </div>

            {savingsDelta <= 0 && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Notice: Because destination surplus does not exceed your current city surplus, upfront relocation expenses cannot be amortized through salary increment alone.
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================= SECTION 2: RECOMMENDED NEIGHBOURHOODS ================= */}
      {(activeSection === 'neighbourhoods' || typeof window === 'undefined') && (
        <section className="space-y-6 animate-in fade-in duration-150">
          {/* Primary Recommended Locality Feature Card */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#176B50] shadow-sm ring-1 ring-[#176B50]/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#176B50]">
                    TOP RECOMMENDED CORRIDOR
                  </span>
                  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider leading-none whitespace-nowrap bg-[#E8F4EF] text-[#176B50]">
                    {chosenNeighbourhood.badge}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-[#18231E] mt-1">
                  {chosenNeighbourhood.a[0]}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#5F6A63]">
                  Confidence: <strong className="text-[#176B50] capitalize">{chosenNeighbourhood.routeConfidence}</strong>
                </span>
              </div>
            </div>

            <p className="text-xs text-[#5F6A63] leading-relaxed">
              {chosenNeighbourhood.whyExplanation}
            </p>

            {/* Commute and Distance Grounding */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5]">
                <span className="text-[10px] text-[#5F6A63] uppercase font-bold">Estimated Peak Commute</span>
                <div className="font-mono font-bold text-sm text-[#176B50] mt-0.5">
                  ~{chosenNeighbourhood.peakMin ?? chosenNeighbourhood.drivingMin} min
                </div>
                <span className="text-[10px] text-[#5F6A63]">
                  (~{chosenNeighbourhood.baselineMin} min off-peak)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5]">
                <span className="text-[10px] text-[#5F6A63] uppercase font-bold">Road Network Distance</span>
                <div className="font-mono font-bold text-sm text-[#18231E] mt-0.5">
                  {chosenNeighbourhood.roadKm} km road
                </div>
                <span className="text-[10px] text-[#5F6A63]">
                  ({chosenNeighbourhood.straightLineKm} km air)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5]">
                <span className="text-[10px] text-[#5F6A63] uppercase font-bold">Monthly Housing Rent</span>
                <div className="font-mono font-bold text-sm text-[#18231E] mt-0.5">
                  {formatINR(chosenNeighbourhood.x.e.rent)}
                </div>
                <span className="text-[10px] text-[#5F6A63]">
                  {PROPERTIES[state.prop]?.[0]}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5]">
                <span className="text-[10px] text-[#5F6A63] uppercase font-bold">Refundable Deposit</span>
                <div className="font-mono font-bold text-sm text-[#18231E] mt-0.5">
                  {formatINR(chosenNeighbourhood.depositRequired)}
                </div>
                <span className="text-[10px] text-[#5F6A63]">
                  ({destCity.defaultDepositMonths} mo norm)
                </span>
              </div>
            </div>

            {/* Commute Data Integrity Note */}
            <div className="p-2.5 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] text-[11px] text-[#5F6A63] flex items-center justify-between">
              <span>
                Data Engine: <strong>{chosenNeighbourhood.routeSource}</strong> · Modeled peak rush-hour estimate (live sensor feed disconnected).
              </span>
            </div>
          </div>

          {/* Interactive Candidate Locality Switcher */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
                  Interactive Corridor Switcher (1-Click Recalculation)
                </h3>
                <p className="text-xs text-[#5F6A63]">
                  Click any candidate neighbourhood below to recalculate the Blueprint and map immediately with zero resets.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#176B50]">
                {candidateList.length} candidate options
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {candidateList.map((item) => {
                const isSelected = item.i === chosenNeighbourhood.i;
                return (
                  <button
                    key={item.i}
                    type="button"
                    onClick={() => handleSelectCandidate(item.i)}
                    className={`p-4 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-[#176B50] bg-[#E8F4EF]/70 ring-2 ring-[#176B50] shadow-xs'
                        : 'border-[#E5EAE5] bg-[#F8F9F7] hover:border-neutral-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase leading-none whitespace-nowrap bg-neutral-200 text-[#18231E]">
                        {item.badge}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold leading-none bg-[#176B50] text-white">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div className="font-bold text-sm text-[#18231E] truncate">
                      {item.a[0]}
                    </div>
                    <div className="text-[11px] text-[#5F6A63] mt-1">
                      Rent: <strong className="font-mono text-[#18231E]">{formatINR(item.x.e.rent)}</strong>
                    </div>
                    <div className="text-[11px] text-[#5F6A63]">
                      Peak Drive: <strong className="font-mono text-[#18231E]">~{item.peakMin ?? item.drivingMin} min</strong>
                    </div>
                    <div className="text-[11px] font-semibold text-[#176B50] mt-1">
                      Surplus: {formatINR(item.monthlySurplus)}/mo
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ================= SECTION 3: FINANCIAL BREAKDOWN ================= */}
      {(activeSection === 'finances' || typeof window === 'undefined') && (
        <section className="space-y-6 animate-in fade-in duration-150">
          {/* Executive Category Ledger Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-white border border-[#E5EAE5] shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                Total Day-1 Cash Required
              </span>
              <div className="text-xl font-bold font-mono text-[#18231E]">
                {formatINR(movingCosts.totalDay1CashRequired)}
              </div>
              <p className="text-[10px] text-[#5F6A63]">Full liquid cash outlay on moving day</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E5EAE5] shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#176B50]">
                Recoverable Capital Locked
              </span>
              <div className="text-xl font-bold font-mono text-[#176B50]">
                {formatINR(movingCosts.totalRecoverableCapital)}
              </div>
              <p className="text-[10px] text-[#176B50]/80">100% refundable upon tenancy exit</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E5EAE5] shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#BE123C]">
                Non-Recoverable Relocation Cost
              </span>
              <div className="text-xl font-bold font-mono text-[#BE123C]">
                {formatINR(movingCosts.totalNonRecoverableCost)}
              </div>
              <p className="text-[10px] text-[#5F6A63]">Sunk fee (brokerage, packers, setup)</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E5EAE5] shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                Estimated Monthly Outflow
              </span>
              <div className="text-xl font-bold font-mono text-[#18231E]">
                {formatINR(destEst.tot)}
              </div>
              <p className="text-[10px] text-[#5F6A63]">Recurring post-move living expenses</p>
            </div>
          </div>

          {/* Monthly Expense Delta Table */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
                  Monthly Recurring Outflow: {state.from || 'Origin'} vs. {destCity.name}
                </h3>
                <p className="text-xs text-[#5F6A63]">
                  Direct itemized comparison showing cost of living delta after relocation.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5EAE5] text-[#5F6A63] font-semibold">
                    <th className="py-2.5 px-3">Expense Category</th>
                    <th className="py-2.5 px-3 font-mono">{state.from || 'Current City'}</th>
                    <th className="py-2.5 px-3 font-mono">{destCity.name} ({chosenNeighbourhood.a[0]})</th>
                    <th className="py-2.5 px-3 text-right">Monthly Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EAE5]/60 font-mono">
                  {Object.keys(EXPENSE_CATEGORIES).map((key) => {
                    const cat = key as keyof typeof EXPENSE_CATEGORIES;
                    const destVal = destEst.e[cat] || 0;
                    const categoryWeight: Record<string, number> = {
                      rent: 0.44,
                      food: 0.20,
                      trans: 0.10,
                      util: 0.07,
                      net: 0.03,
                      pers: 0.06,
                      ent: 0.06,
                      oth: 0.04,
                    };
                    const currentVal = Math.round(currentExpenses * (categoryWeight[cat] || 0.1));
                    const delta = destVal - currentVal;

                    return (
                      <tr key={cat} className="hover:bg-[#F8F9F7] transition-colors">
                        <td className="py-2.5 px-3 font-sans font-medium text-[#18231E]">
                          {EXPENSE_CATEGORIES[cat]}
                        </td>
                        <td className="py-2.5 px-3 text-[#5F6A63]">
                          {formatINR(currentVal)}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#18231E]">
                          {formatINR(destVal)}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-bold ${
                            delta > 0
                              ? 'text-[#BE123C]'
                              : delta < 0
                              ? 'text-[#176B50]'
                              : 'text-[#5F6A63]'
                          }`}
                        >
                          {delta > 0 ? `+${formatINR(delta)}` : formatINR(delta)}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Total Outflow Row */}
                  <tr className="border-t-2 border-[#E5EAE5] bg-[#F8F9F7] font-bold">
                    <td className="py-3 px-3 font-sans text-[#18231E]">
                      Total Monthly Living Outflow
                    </td>
                    <td className="py-3 px-3 text-[#5F6A63]">
                      {formatINR(currentExpenses)}
                    </td>
                    <td className="py-3 px-3 text-[#18231E]">
                      {formatINR(destEst.tot)}
                    </td>
                    <td
                      className={`py-3 px-3 text-right ${
                        destEst.tot - currentExpenses > 0
                          ? 'text-[#BE123C]'
                          : 'text-[#176B50]'
                      }`}
                    >
                      {destEst.tot - currentExpenses > 0
                        ? `+${formatINR(destEst.tot - currentExpenses)}`
                        : formatINR(destEst.tot - currentExpenses)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Upfront Moving Budget with Clear Categorization */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
                  Upfront Moving Expenses (Recoverable vs Non-Recoverable)
                </h3>
                <p className="text-xs text-[#5F6A63]">
                  All values backed by transparent assumptions with custom override support.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowOverrideInputs(!showOverrideInputs)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5EAE5] text-xs font-semibold text-[#18231E] hover:bg-[#F8F9F7]"
              >
                <Sliders className="w-3.5 h-3.5 text-[#176B50]" />
                <span>{showOverrideInputs ? 'Hide Custom Inputs' : 'Edit Cost Assumptions'}</span>
              </button>
            </div>

            {/* Category A & B Side-by-Side Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category A: Recoverable */}
              <div className="p-4 rounded-xl bg-[#E8F4EF]/60 border border-[#176B50]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#176B50] uppercase tracking-wider">
                    Category A · Recoverable Capital
                  </span>
                  <span className="font-mono font-bold text-sm text-[#176B50]">
                    {formatINR(movingCosts.totalRecoverableCapital)}
                  </span>
                </div>
                <p className="text-[11px] text-[#5F6A63]">
                  Security deposit and utility bonds are returned on lease exit. This is a liquidity commitment, not a sunk economic loss.
                </p>

                <div className="space-y-2 pt-2 border-t border-[#176B50]/15 text-xs">
                  <div className="flex justify-between">
                    <span>Rental Security Deposit ({movingCosts.depositMonths} mo):</span>
                    <strong className="font-mono">{formatINR(movingCosts.securityDeposit)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Refundable Utility/Society Bonds:</span>
                    <strong className="font-mono">{formatINR(movingCosts.refundableUtilityDeposit)}</strong>
                  </div>
                </div>

                {showOverrideInputs && (
                  <div className="pt-2 border-t border-[#176B50]/15 flex items-center justify-between text-xs">
                    <span className="text-[#5F6A63]">Deposit Months Override:</span>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={movingCosts.depositMonths}
                      onChange={(e) => handleDepositMonthsChange(Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-white border border-[#E5EAE5] rounded text-right font-mono font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Category B: Non-Recoverable */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-[#E5EAE5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#BE123C] uppercase tracking-wider">
                    Category B · Sunk Relocation Costs
                  </span>
                  <span className="font-mono font-bold text-sm text-[#BE123C]">
                    {formatINR(movingCosts.totalNonRecoverableCost)}
                  </span>
                </div>
                <p className="text-[11px] text-[#5F6A63]">
                  Non-refundable expenses incurred directly to execute the move. These must be recouped from future salary surplus.
                </p>

                <div className="space-y-2 pt-2 border-t border-[#E5EAE5] text-xs">
                  <div className="flex justify-between">
                    <span>Brokerage Commission:</span>
                    <strong className="font-mono">{formatINR(movingCosts.brokerageFee)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Packers & Movers Freight:</span>
                    <strong className="font-mono">{formatINR(movingCosts.moversPackers)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Relocation Travel & Transit:</span>
                    <strong className="font-mono">{formatINR(movingCosts.travelAndTransit)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Initial Domestic Setup:</span>
                    <strong className="font-mono">{formatINR(movingCosts.initialSetupReserve)}</strong>
                  </div>
                </div>

                {showOverrideInputs && (
                  <div className="pt-2 border-t border-[#E5EAE5] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#5F6A63]">Brokerage Mode:</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleBrokerageChange(0)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            movingCosts.brokerageFee === 0 ? 'bg-[#176B50] text-white' : 'bg-white border'
                          }`}
                        >
                          0 (Direct)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBrokerageChange(1)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            movingCosts.brokerageFee > 0 ? 'bg-[#176B50] text-white' : 'bg-white border'
                          }`}
                        >
                          1 Mo Fee
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financial Safety & Emergency Reserve Runway Assessment */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
                  Financial Safety & Emergency Runway Assessment
                </h3>
                <p className="text-xs text-[#5F6A63]">
                  Distinguishes mandatory relocation cash from recommended financial safety cushions.
                </p>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#176B50]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5]">
                <span className="text-[10px] font-bold uppercase text-[#5F6A63]">
                  Day-1 Relocation Cash
                </span>
                <div className="font-mono font-bold text-base text-[#18231E] mt-0.5">
                  {formatINR(movingCosts.totalDay1CashRequired)}
                </div>
                <span className="text-[10px] text-[#5F6A63]">Mandatory on move day</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5]">
                <span className="text-[10px] font-bold uppercase text-[#5F6A63]">
                  3-Month Essential Reserve
                </span>
                <div className="font-mono font-bold text-base text-[#18231E] mt-0.5">
                  {formatINR(verdict.emergencyFund3Months)}
                </div>
                <span className="text-[10px] text-[#5F6A63]">Rent, food, utilities cushion</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#E8F4EF] border border-[#176B50]/20">
                <span className="text-[10px] font-bold uppercase text-[#176B50]">
                  Recommended Safe Runway
                </span>
                <div className="font-mono font-bold text-base text-[#176B50] mt-0.5">
                  {formatINR(verdict.safeRelocationRunwayRequired)}
                </div>
                <span className="text-[10px] text-[#176B50]/80">Day-1 Cash + 3mo cushion</span>
              </div>
            </div>

            {/* Interactive User Savings Readiness Input */}
            <div className="pt-3 border-t border-[#E5EAE5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <label className="font-bold text-[#18231E] block">
                  Your Available Relocation Savings:
                </label>
                <span className="text-[11px] text-[#5F6A63]">
                  Liquid capital you currently have ready for this move.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5F6A63] font-mono">₹</span>
                  <input
                    type="number"
                    step="10000"
                    placeholder="e.g. 300000"
                    value={state.availableSavings || ''}
                    onChange={(e) =>
                      onUpdateState({ availableSavings: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-40 pl-7 pr-3 py-1.5 bg-[#F8F9F7] border border-[#E5EAE5] rounded-xl font-mono font-bold text-xs"
                  />
                </div>
                {state.availableSavings !== undefined && state.availableSavings > 0 && (
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      state.availableSavings >= verdict.safeRelocationRunwayRequired
                        ? 'bg-[#E8F4EF] text-[#176B50]'
                        : state.availableSavings >= movingCosts.totalDay1CashRequired
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-rose-50 text-[#BE123C]'
                    }`}
                  >
                    {state.availableSavings >= verdict.safeRelocationRunwayRequired
                      ? 'Fully Funded Runway'
                      : state.availableSavings >= movingCosts.totalDay1CashRequired
                      ? 'Meets Day-1 (Tight Reserve)'
                      : `Capital Deficit of ${formatINR(
                          movingCosts.totalDay1CashRequired - state.availableSavings
                        )}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= SECTION 4: LONG-TERM WEALTH PROJECTION ================= */}
      {(activeSection === 'wealth' || typeof window === 'undefined') && (
        <section className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
                  Long-Term Wealth Accumulation & Compounding Forecast
                </h3>
                <p className="mt-1 text-xs text-[#5F6A63]">
                  Separates accumulated cash savings principal from compounding investment returns.
                </p>
              </div>

              {/* Selectable CAGR Model Selector */}
              <div className="flex items-center gap-1 bg-[#F8F9F7] p-1 rounded-xl border border-[#E5EAE5] text-xs">
                {[
                  { id: '6', label: '6% (FD/Debt)' },
                  { id: '9', label: '9% (Hybrid)' },
                  { id: '12', label: '12% (Index)' },
                  { id: 'custom', label: 'Custom' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => {
                      setCagrOption(tier.id as any);
                      if (tier.id !== 'custom') {
                        onUpdateState({ investmentReturnRate: Number(tier.id) });
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      cagrOption === tier.id
                        ? 'bg-[#176B50] text-white shadow-xs'
                        : 'text-[#5F6A63] hover:text-[#18231E]'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            {cagrOption === 'custom' && (
              <div className="p-3 bg-[#F8F9F7] rounded-xl border border-[#E5EAE5] flex items-center justify-between text-xs">
                <span className="font-bold text-[#18231E]">Custom Annual Return Rate:</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="18"
                    step="0.5"
                    value={customCagr}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCustomCagr(val);
                      onUpdateState({ investmentReturnRate: val });
                    }}
                    className="w-32"
                  />
                  <span className="font-mono font-bold text-[#176B50] w-12 text-right">
                    {customCagr}% p.a.
                  </span>
                </div>
              </div>
            )}

            {/* 1-Year & 3-Year Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1-Year Cumulative Capital */}
              <div className="p-4 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
                    1-Year Horizon ({effectiveCagr}% p.a.)
                  </span>
                  <Calendar className="w-4 h-4 text-[#176B50]" />
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#5F6A63]">Staying in {state.from || 'Origin'}:</span>
                    <span className="font-semibold text-[#18231E]">
                      {formatINR(currentWealth1Yr.totalWealth)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#176B50]">Moving to {destCity.name}:</span>
                    <span className="font-bold text-[#176B50] text-sm">
                      {formatINR(wealth1Yr.totalWealth)}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#5F6A63] pl-2 border-l-2 border-[#176B50]/30 space-y-0.5">
                    <div>• Cash Principal: {formatINR(wealth1Yr.uninvestedPrincipal)}</div>
                    <div>• Compounded Growth: {formatINR(wealth1Yr.investmentReturns)}</div>
                  </div>
                  <div className="pt-2 border-t border-[#E5EAE5] flex justify-between items-center text-xs">
                    <span className="font-sans font-semibold text-[#18231E]">1-Year Net Gain:</span>
                    <span
                      className={`font-bold ${
                        wealth1Yr.totalWealth - currentWealth1Yr.totalWealth >= 0
                          ? 'text-[#176B50]'
                          : 'text-[#BE123C]'
                      }`}
                    >
                      {wealth1Yr.totalWealth - currentWealth1Yr.totalWealth >= 0
                        ? `+${formatINR(wealth1Yr.totalWealth - currentWealth1Yr.totalWealth)}`
                        : formatINR(wealth1Yr.totalWealth - currentWealth1Yr.totalWealth)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3-Year Cumulative Capital */}
              <div className="p-4 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
                    3-Year Horizon ({effectiveCagr}% p.a.)
                  </span>
                  <TrendingUp className="w-4 h-4 text-[#176B50]" />
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#5F6A63]">Staying in {state.from || 'Origin'}:</span>
                    <span className="font-semibold text-[#18231E]">
                      {formatINR(currentWealth3Yr.totalWealth)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#176B50]">Moving to {destCity.name}:</span>
                    <span className="font-bold text-[#176B50] text-sm">
                      {formatINR(wealth3Yr.totalWealth)}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#5F6A63] pl-2 border-l-2 border-[#176B50]/30 space-y-0.5">
                    <div>• Cash Principal: {formatINR(wealth3Yr.uninvestedPrincipal)}</div>
                    <div>• Compounded Growth: {formatINR(wealth3Yr.investmentReturns)}</div>
                  </div>
                  <div className="pt-2 border-t border-[#E5EAE5] flex justify-between items-center text-xs">
                    <span className="font-sans font-semibold text-[#18231E]">3-Year Net Gain:</span>
                    <span
                      className={`font-bold ${
                        wealth3Yr.totalWealth - currentWealth3Yr.totalWealth >= 0
                          ? 'text-[#176B50]'
                          : 'text-[#BE123C]'
                      }`}
                    >
                      {wealth3Yr.totalWealth - currentWealth3Yr.totalWealth >= 0
                        ? `+${formatINR(wealth3Yr.totalWealth - currentWealth3Yr.totalWealth)}`
                        : formatINR(wealth3Yr.totalWealth - currentWealth3Yr.totalWealth)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Disclaimer on Wealth Projections */}
            <div className="p-3 bg-[#F8F9F7] rounded-xl border border-[#E5EAE5] text-[10px] text-[#5F6A63] flex items-start gap-2">
              <Info className="w-4 h-4 text-[#5F6A63] shrink-0 mt-0.5" />
              <span>
                <strong>Methodology Disclaimer:</strong> Projections illustrate theoretical wealth accumulation assuming steady monthly SIP investing at {effectiveCagr}% p.a. CAGR. Does not represent a guaranteed investment return or advice. Market volatility, inflation, and tax brackets will affect actual returns.
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ================= SECTION 5: YOUR NEXT STEPS ================= */}
      {(activeSection === 'next_steps' || typeof window === 'undefined') && (
        <section className="space-y-6 animate-in fade-in duration-150">
          {/* Offer Counter-Proposal Target Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#176B50]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#18231E]">
                Counter-Offer Target & Negotiation Baseline
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[#18231E]">
                  Recommended Minimum In-Hand Target
                </div>
                <p className="text-xs text-[#5F6A63] mt-0.5">
                  To guarantee a healthy 28% net savings rate in {chosenNeighbourhood.a[0]}, {destCity.name}.
                </p>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[#176B50] whitespace-nowrap">
                {formatINR(Math.round((destEst.tot + state.com) / 0.72))}
                <span className="text-xs font-normal text-[#5F6A63]">/mo in-hand</span>
              </div>
            </div>
          </div>

          {/* Relocation Execution Checklist */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
              Relocation Checklist & Timeline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] space-y-2">
                <span className="text-[10px] font-mono font-bold text-[#176B50]">
                  PHASE 1 · 4 WEEKS OUT
                </span>
                <ul className="space-y-1 text-[#5F6A63]">
                  <li>• Shortlist 3 gated societies in {chosenNeighbourhood.a[0]}</li>
                  <li>• Request company relocation bonus advance</li>
                  <li>• Book inter-city moving survey</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] space-y-2">
                <span className="text-[10px] font-mono font-bold text-[#176B50]">
                  PHASE 2 · 2 WEEKS OUT
                </span>
                <ul className="space-y-1 text-[#5F6A63]">
                  <li>• Confirm rental agreement & deposit terms</li>
                  <li>• Test route during peak morning hour</li>
                  <li>• Procure metro smart cards & transit pass</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] space-y-2">
                <span className="text-[10px] font-mono font-bold text-[#176B50]">
                  PHASE 3 · MOVE-IN WEEK
                </span>
                <ul className="space-y-1 text-[#5F6A63]">
                  <li>• Complete society move-in formalities</li>
                  <li>• Fiber broadband installation</li>
                  <li>• Establish cook / domestic helper routine</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Save Blueprint to Browser Storage */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-3 no-print">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
                Save This Relocation Blueprint
              </span>
              {saveSuccessMsg && (
                <span className="text-xs font-medium text-[#176B50] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {saveSuccessMsg}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                placeholder={`e.g. ${destCity.name} Offer A · ${chosenNeighbourhood.a[0]} (${formatINR(state.sal)})`}
                className="flex-1 px-4 py-2 bg-[#F8F9F7] border border-[#E5EAE5] rounded-xl text-xs font-medium text-[#18231E] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#176B50]/20 focus:border-[#176B50]"
              />
              <button
                type="button"
                onClick={handleSavePlan}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#176B50] hover:bg-[#125740] shadow-xs transition-colors shrink-0"
              >
                Save Blueprint
              </button>
            </div>
          </div>

          {/* Permanent Navigation & Parameter Editing */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E5EAE5] no-print">
            <button
              type="button"
              onClick={() => onGoStep(4)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#5F6A63] hover:text-[#18231E] hover:bg-neutral-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Revisit Financial Analysis</span>
            </button>

            <button
              type="button"
              onClick={() => onGoStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E5EAE5] text-[#18231E] hover:bg-neutral-50 shadow-xs transition-colors"
            >
              <span>Explore More Neighbourhoods</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* ================= SCENARIO COMPARISON MODAL ================= */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 no-print">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-[#E5EAE5] max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAE5]">
              <div>
                <h3 className="text-base font-bold font-heading text-[#18231E]">
                  Compare Relocation Scenarios
                </h3>
                <p className="text-xs text-[#5F6A63]">
                  Side-by-side comparison across saved relocation offers and city corridors.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-[#5F6A63] hover:text-[#18231E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5EAE5] text-[#5F6A63] font-semibold bg-[#F8F9F7]">
                    <th className="py-2.5 px-3">Scenario</th>
                    <th className="py-2.5 px-3">Destination Corridor</th>
                    <th className="py-2.5 px-3 font-mono">In-Hand Salary</th>
                    <th className="py-2.5 px-3 font-mono">Monthly Savings</th>
                    <th className="py-2.5 px-3 font-mono">Savings %</th>
                    <th className="py-2.5 px-3 font-mono">Day-1 Cash</th>
                    <th className="py-2.5 px-3 font-mono">Sunk Moving</th>
                    <th className="py-2.5 px-3 font-mono">Peak Drive</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EAE5] font-mono">
                  {savedPlansList.map((plan) => {
                    const snap = plan.snapshot;
                    return (
                      <tr key={plan.id} className="hover:bg-[#F8F9F7] transition-colors">
                        <td className="py-3 px-3 font-sans font-bold text-[#18231E]">
                          {plan.title}
                          <div className="text-[10px] font-normal text-[#5F6A63] font-mono">
                            {plan.timestamp}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-sans">
                          {snap ? `${snap.cityName} · ${snap.neighbourhoodName}` : plan.state.city.toUpperCase()}
                        </td>
                        <td className="py-3 px-3 font-bold text-[#18231E]">
                          {formatINR(snap?.inHandSalary || plan.state.sal)}
                        </td>
                        <td className="py-3 px-3 font-bold text-[#176B50]">
                          {snap ? formatINR(snap.monthlySavings) : '—'}
                        </td>
                        <td className="py-3 px-3">
                          {snap ? `${snap.savingsRate}%` : '—'}
                        </td>
                        <td className="py-3 px-3 text-[#5F6A63]">
                          {snap ? formatINR(snap.day1CashRequired) : '—'}
                        </td>
                        <td className="py-3 px-3 text-[#BE123C]">
                          {snap ? formatINR(snap.nonRecoverableCost) : '—'}
                        </td>
                        <td className="py-3 px-3">
                          {snap ? `~${snap.peakCommuteMin}m` : '—'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleLoadSavedPlan(plan)}
                              className="px-2.5 py-1 rounded bg-[#176B50] text-white text-[11px] font-semibold hover:bg-[#125740] font-sans"
                            >
                              Load
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteSavedPlan(plan.id, e)}
                              className="p-1 rounded text-neutral-400 hover:text-[#BE123C]"
                              title="Delete Scenario"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-[#E5EAE5] flex justify-end">
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-100 text-[#18231E] hover:bg-neutral-200"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
