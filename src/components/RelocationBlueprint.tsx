import React, { useState } from 'react';
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

  // Local state for plan saving
  const [planTitle, setPlanTitle] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [showOverrideInputs, setShowOverrideInputs] = useState(false);

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

  // 3. Moving & Initial Setup Budget
  const movingCosts = calculateMovingCosts(
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

  // Handler to switch candidate neighbourhood in place with zero resets
  const handleSelectCandidate = (candidateId: number) => {
    onUpdateState({
      sel: [candidateId, ...state.sel.filter((id) => id !== candidateId)].slice(0, 3),
    });
  };

  // Handler for saving plan
  const handleSavePlan = () => {
    const title =
      planTitle.trim() ||
      `${destCity.name} (${chosenNeighbourhood.a[0]}) · ${formatINR(state.sal)}/mo`;
    const newPlan: SavedPlan = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      title,
      state: { ...state },
    };

    try {
      const stored = localStorage.getItem('ri_saved_plans_v2');
      const list: SavedPlan[] = stored ? JSON.parse(stored) : [];
      const updated = [newPlan, ...list.slice(0, 9)];
      localStorage.setItem('ri_saved_plans_v2', JSON.stringify(updated));
      setSaveSuccessMsg('Blueprint plan successfully saved to browser storage!');
      setPlanTitle('');
      setTimeout(() => setSaveSuccessMsg(''), 3500);
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
        <div className="flex items-center gap-2">
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
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusTheme.badgeBg}`}
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

            {/* Current vs Destination Delta Metric Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-black/10">
              <div className="p-3 rounded-xl bg-white/80 border border-black/5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                  Monthly In-Hand Shift
                </div>
                <div className="text-base font-bold font-mono text-[#18231E] mt-0.5">
                  {salaryDelta >= 0 ? `+${formatINR(salaryDelta)}` : formatINR(salaryDelta)}
                </div>
                <div className="text-[10px] text-[#5F6A63]">
                  {formatINR(currentSal)} ➔ {formatINR(state.sal)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/80 border border-black/5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                  Net Monthly Surplus Delta
                </div>
                <div
                  className={`text-base font-bold font-mono mt-0.5 ${
                    savingsDelta >= 0 ? 'text-[#176B50]' : 'text-[#BE123C]'
                  }`}
                >
                  {savingsDelta >= 0 ? `+${formatINR(savingsDelta)}` : formatINR(savingsDelta)}
                  <span className="text-[10px] font-normal text-[#5F6A63]">/mo</span>
                </div>
                <div className="text-[10px] text-[#5F6A63]">
                  {formatINR(currentSavings)} ➔ {formatINR(destSavings)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/80 border border-black/5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                  Savings Rate Quality
                </div>
                <div className="text-base font-bold font-mono text-[#18231E] mt-0.5">
                  {destSavingsRate}%
                </div>
                <div className="text-[10px] text-[#5F6A63]">
                  Shift from {currentSavingsRate}% in {state.from}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/80 border border-black/5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                  Upfront Capital Payback
                </div>
                <div className="text-base font-bold font-mono text-[#18231E] mt-0.5">
                  {savingsDelta > 0 ? `${verdict.paybackMonths} mo` : 'No Payback'}
                </div>
                <div className="text-[10px] text-[#5F6A63]">
                  To recoup {formatINR(movingCosts.totalMovingOutlay)} outlay
                </div>
              </div>
            </div>
          </div>

          {/* 4 Pillars Evaluation Health-Check Grid */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
              Four-Pillar Relocation Viability Audit
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.values(verdict.pillars).map((pillar) => {
                const isPass = pillar.status === 'pass';
                const isWarn = pillar.status === 'warning';
                return (
                  <div
                    key={pillar.label}
                    className="p-4 rounded-xl border border-[#E5EAE5] bg-[#F8F9F7] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#18231E]">
                        {pillar.label}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isPass
                            ? 'bg-[#E8F4EF] text-[#176B50]'
                            : isWarn
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-rose-50 text-[#BE123C]'
                        }`}
                      >
                        {pillar.metric}
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
        </section>
      )}

      {/* ================= SECTION 2: RECOMMENDED NEIGHBOURHOODS ================= */}
      {(activeSection === 'neighbourhoods' || typeof window === 'undefined') && (
        <section className="space-y-6 animate-in fade-in duration-150">
          {/* Active Recommended Locality Detail */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#176B50] shadow-sm space-y-5 ring-1 ring-[#176B50]/15">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E5EAE5] pb-4">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#176B50] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#176B50]" />
                  <span>PRIMARY RECOMMENDED NEIGHBOURHOOD</span>
                </div>
                <h2 className="text-2xl font-bold font-heading text-[#18231E] mt-1">
                  {chosenNeighbourhood.a[0]}, {destCity.name}
                </h2>
                <p className="text-xs text-[#5F6A63] mt-1">
                  Destination Corridor for office at <strong>{wp.name}</strong>
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                  Monthly Rent Benchmark
                </span>
                <div className="text-2xl font-bold font-mono text-[#18231E] mt-0.5">
                  {formatINR(destRent)}
                  <span className="text-xs font-normal text-[#5F6A63]">/mo</span>
                </div>
                <div className="text-[10px] text-[#5F6A63]">
                  {PROPERTIES[state.prop]?.[0]} configuration
                </div>
              </div>
            </div>

            {/* Commute and Rent Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#176B50]" />
                  <span>Road Commute</span>
                </div>
                <div className="text-base font-bold font-mono text-[#18231E] mt-1">
                  {chosenNeighbourhood.drivingMin ?? chosenNeighbourhood.x.min} mins
                </div>
                <div className="text-[10px] text-[#5F6A63]">
                  {chosenNeighbourhood.roadKm ?? chosenNeighbourhood.x.rd} km to desk
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63] flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-[#176B50]" />
                  <span>Monthly Outflow</span>
                </div>
                <div className="text-base font-bold font-mono text-[#18231E] mt-1">
                  {formatINR(destEst.tot)}
                </div>
                <div className="text-[10px] text-[#5F6A63]">
                  All living expenses + EMI
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#E8F4EF] border border-[#176B50]/20 col-span-2 sm:col-span-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#176B50] flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#176B50]" />
                  <span>Net Savings</span>
                </div>
                <div className="text-base font-bold font-mono text-[#176B50] mt-1">
                  {formatINR(destSavings)}/mo
                </div>
                <div className="text-[10px] text-[#5F6A63]">
                  {destSavingsRate}% net savings rate
                </div>
              </div>
            </div>

            {/* Why it fits & Honest trade-offs */}
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] text-xs space-y-1">
                <strong className="text-[#18231E] block">Why this neighbourhood is recommended:</strong>
                <p className="text-[#5F6A63] leading-relaxed">
                  {chosenNeighbourhood.why}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                <strong className="text-amber-900 block flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Practical Trade-offs to Expect:</span>
                </strong>
                <p className="text-amber-900/80 leading-relaxed">
                  {state.city === 'blr'
                    ? `Choosing ${chosenNeighbourhood.a[0]} requires locking ${formatINR(movingCosts.securityDeposit)} in rental deposit. Peak-hour bottleneck on arterial rings requires leaving 15 min early.`
                    : `In ${destCity.name}, rapid transit lines provide good access, but summer air conditioning bills can raise utility outflow by ₹4,500–₹6,500/mo.`}
                </p>
              </div>
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
                  Click any candidate neighbourhood below to recalculate the Blueprint and map immediately.
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
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#176B50] text-white">
                        ACTIVE
                      </span>
                    )}

                    <div className="font-bold text-sm text-[#18231E] pr-12 truncate">
                      {item.a[0]}
                    </div>
                    <div className="text-[11px] text-[#5F6A63] mt-1">
                      Rent: <strong className="font-mono text-[#18231E]">{formatINR(item.x.e.rent)}</strong>
                    </div>
                    <div className="text-[11px] text-[#5F6A63]">
                      Drive: <strong className="font-mono text-[#18231E]">{item.drivingMin ?? item.x.min} min</strong>
                    </div>
                    <div className="text-[11px] font-semibold text-[#176B50] mt-1">
                      Surplus: {formatINR(item.x.sav)}/mo
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
          {/* Current City vs Destination Outflow Comparison Table */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
                  Monthly Expense Breakdown: {state.from || 'Origin'} vs. {destCity.name}
                </h3>
                <p className="text-xs text-[#5F6A63]">
                  Itemized comparison showing real post-move cost of living delta.
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
                    // Proportional current city benchmark based on currentExpenses
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

          {/* Transparent Moving & Initial Setup Budget */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
                  Upfront Relocation Capital & Liquidity Requirement
                </h3>
                <p className="text-xs text-[#5F6A63]">
                  Itemized Day-1 costs with transparent micro-market assumptions.
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

            {/* Total Upfront Outlay Card */}
            <div className="p-4 rounded-xl bg-[#E8F4EF] border border-[#176B50]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#176B50]">
                  Total Day-1 Upfront Capital Required
                </div>
                <div className="text-2xl font-bold font-mono text-[#18231E] mt-0.5">
                  {formatINR(movingCosts.totalMovingOutlay)}
                </div>
                <p className="text-[11px] text-[#5F6A63] mt-0.5">
                  Deposit lock, broker fee, packers & initial domestic reserve.
                </p>
              </div>

              <div className="sm:text-right font-mono text-xs text-[#5F6A63]">
                <div>Amortized in: <strong className="text-[#18231E]">{verdict.paybackMonths} months</strong></div>
                <div>of net incremental savings</div>
              </div>
            </div>

            {/* 4 Moving Cost Line Items with Transparent Rules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* 1. Security Deposit */}
              <div className="p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#18231E]">Rental Security Deposit</span>
                  <span className="font-mono font-bold text-xs text-[#18231E]">
                    {formatINR(movingCosts.securityDeposit)}
                  </span>
                </div>
                <p className="text-[10px] text-[#5F6A63]">
                  Assumption: {movingCosts.assumptions.depositRule}
                </p>
                {showOverrideInputs && (
                  <div className="pt-2 border-t border-[#E5EAE5] flex items-center justify-between text-xs">
                    <span className="text-[#5F6A63]">Deposit Months:</span>
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

              {/* 2. Brokerage */}
              <div className="p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#18231E]">Brokerage Fee</span>
                  <span className="font-mono font-bold text-xs text-[#18231E]">
                    {formatINR(movingCosts.brokerageFee)}
                  </span>
                </div>
                <p className="text-[10px] text-[#5F6A63]">
                  Assumption: {movingCosts.assumptions.brokerageRule}
                </p>
                {showOverrideInputs && (
                  <div className="pt-2 border-t border-[#E5EAE5] flex items-center justify-between text-xs">
                    <span className="text-[#5F6A63]">Broker Fee Mode:</span>
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
                )}
              </div>

              {/* 3. Packers & Movers */}
              <div className="p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#18231E]">Packers & Movers Freight</span>
                  <span className="font-mono font-bold text-xs text-[#18231E]">
                    {formatINR(movingCosts.moversPackers)}
                  </span>
                </div>
                <p className="text-[10px] text-[#5F6A63]">
                  Assumption: {movingCosts.assumptions.movingDistanceTier}
                </p>
                {showOverrideInputs && (
                  <div className="pt-2 border-t border-[#E5EAE5] flex items-center justify-between text-xs">
                    <span className="text-[#5F6A63]">Custom Movers (₹):</span>
                    <input
                      type="number"
                      step="1000"
                      value={movingCosts.moversPackers}
                      onChange={(e) => handleMoversChange(Number(e.target.value))}
                      className="w-24 px-2 py-1 bg-white border border-[#E5EAE5] rounded text-right font-mono font-bold"
                    />
                  </div>
                )}
              </div>

              {/* 4. Setup Reserve */}
              <div className="p-3.5 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#18231E]">Initial Setup Reserve</span>
                  <span className="font-mono font-bold text-xs text-[#18231E]">
                    {formatINR(movingCosts.initialSetupReserve)}
                  </span>
                </div>
                <p className="text-[10px] text-[#5F6A63]">
                  Assumption: {movingCosts.assumptions.setupRule}
                </p>
                {showOverrideInputs && (
                  <div className="pt-2 border-t border-[#E5EAE5] flex items-center justify-between text-xs">
                    <span className="text-[#5F6A63]">Custom Setup (₹):</span>
                    <input
                      type="number"
                      step="1000"
                      value={movingCosts.initialSetupReserve}
                      onChange={(e) => handleSetupReserveChange(Number(e.target.value))}
                      className="w-24 px-2 py-1 bg-white border border-[#E5EAE5] rounded text-right font-mono font-bold"
                    />
                  </div>
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
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
                Long-Term Wealth Accumulation & Compounding Forecast
              </h3>
              <p className="mt-1 text-xs text-[#5F6A63]">
                Compares capital generated by staying in {state.from || 'Origin'} vs. relocating to {destCity.name} over 1 and 3-year timelines.
              </p>
            </div>

            {/* 1-Year & 3-Year Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1-Year Cumulative Capital */}
              <div className="p-4 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
                    1-Year Cumulative Wealth
                  </span>
                  <Calendar className="w-4 h-4 text-[#176B50]" />
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#5F6A63]">Staying in {state.from}:</span>
                    <span className="font-semibold text-[#18231E]">
                      {formatINR(currentSavings * 12)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#176B50]">Moving to {destCity.name}:</span>
                    <span className="font-bold text-[#176B50] text-sm">
                      {formatINR(destSavings * 12)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#E5EAE5] flex justify-between items-center text-xs">
                    <span className="font-sans font-semibold text-[#18231E]">1-Year Net Gain:</span>
                    <span
                      className={`font-bold ${
                        savingsDelta * 12 >= 0 ? 'text-[#176B50]' : 'text-[#BE123C]'
                      }`}
                    >
                      {savingsDelta * 12 >= 0
                        ? `+${formatINR(savingsDelta * 12)}`
                        : formatINR(savingsDelta * 12)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3-Year Cumulative Capital (Factoring 8% increment & 7% market return) */}
              <div className="p-4 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
                    3-Year Compounded Outlook
                  </span>
                  <TrendingUp className="w-4 h-4 text-[#176B50]" />
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#5F6A63]">Staying in {state.from}:</span>
                    <span className="font-semibold text-[#18231E]">
                      {formatINR(Math.round(currentSavings * 12 * 3.3))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#176B50]">Moving to {destCity.name}:</span>
                    <span className="font-bold text-[#176B50] text-sm">
                      {formatINR(Math.round(destSavings * 12 * 3.3))}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#E5EAE5] flex justify-between items-center text-xs">
                    <span className="font-sans font-semibold text-[#18231E]">3-Year Net Gain:</span>
                    <span
                      className={`font-bold ${
                        savingsDelta * 12 * 3.3 >= 0 ? 'text-[#176B50]' : 'text-[#BE123C]'
                      }`}
                    >
                      {savingsDelta * 12 * 3.3 >= 0
                        ? `+${formatINR(Math.round(savingsDelta * 12 * 3.3))}`
                        : formatINR(Math.round(savingsDelta * 12 * 3.3))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Break-even timeline note */}
            <div className="p-4 rounded-xl bg-[#E8F4EF] border border-[#176B50]/20 text-xs space-y-1">
              <div className="font-bold text-[#18231E] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#176B50]" />
                <span>Capital Amortization & Liquidity Milestone:</span>
              </div>
              <p className="text-[#5F6A63] leading-relaxed">
                {savingsDelta > 0 ? (
                  <>
                    At an incremental savings surplus of <strong>{formatINR(savingsDelta)}/mo</strong>, your upfront relocation expenditure of <strong>{formatINR(movingCosts.totalMovingOutlay)}</strong> is fully recouped by month <strong>{Math.ceil(verdict.paybackMonths)}</strong>. All subsequent savings represent pure compounding wealth.
                  </>
                ) : (
                  <>
                    Because destination savings do not exceed current lifestyle cashflow, the upfront moving cost will not amortize through monthly savings alone.
                  </>
                )}
              </p>
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
    </div>
  );
};
