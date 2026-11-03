import React from 'react';
import {
  ExpenseCategory,
  FoodHabit,
  LifestyleTier,
  PropertyType,
  RelocationState,
  ScoredNeighbourhood,
  TransportMode,
} from '../types';
import {
  CITIES,
  EXPENSE_CATEGORIES,
  FOOD_HABITS,
  LIFESTYLE_TIERS,
  PROPERTIES,
  TRANSPORT_MODES,
  estimateExpenses,
  formatINR,
  getTarget,
} from '../data/relocationData';
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  Percent,
  Sliders,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

interface Step5AnalysisProps {
  state: RelocationState;
  chosenNeighbourhood: ScoredNeighbourhood;
  onUpdateState: (updates: Partial<RelocationState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step5Analysis: React.FC<Step5AnalysisProps> = ({
  state,
  chosenNeighbourhood,
  onUpdateState,
  onNext,
  onBack,
}) => {
  // Compute estimates using manual overrides (if present)
  const wp = state.wp || {
    name: CITIES[state.city].hubs[0][0],
    lat: CITIES[state.city].hubs[0][1],
    lng: CITIES[state.city].hubs[0][2],
  };

  const currentEst = estimateExpenses(
    state.city,
    chosenNeighbourhood.a,
    wp,
    true,
    state
  );

  const targetSavings = getTarget(state);
  const savingsRate = Math.round((currentEst.sav / state.sal) * 100);

  // Status classification
  const budgetStatus =
    currentEst.sav < 0
      ? {
          label: 'Over Budget',
          bg: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          desc: `Expenses and commitments exceed your salary by ${formatINR(
            Math.abs(currentEst.sav)
          )}/mo.`,
        }
      : currentEst.sav < targetSavings
      ? {
          label: 'Tight',
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: AlertTriangle,
          desc: `Estimated savings of ${formatINR(
            currentEst.sav
          )}/mo fall short of your ${formatINR(targetSavings)}/mo target.`,
        }
      : {
          label: 'Comfortable',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: CheckCircle,
          desc: `Estimated savings of ${formatINR(
            currentEst.sav
          )}/mo comfortably hit your ${formatINR(targetSavings)} target.`,
        };

  const handleExpenseChange = (category: ExpenseCategory, val: number) => {
    onUpdateState({
      ov: {
        ...state.ov,
        [category]: Math.max(0, val),
      },
    });
  };

  const handleResetOverrides = () => {
    onUpdateState({ ov: {} });
  };

  const StatusIcon = budgetStatus.icon;

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-1">
          05 · Financial Modeling & Simulation
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#19241D] tracking-tight">
          Here’s what your life could cost.
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Modeled for <strong className="text-neutral-900">{chosenNeighbourhood.a[0]}</strong>, {CITIES[state.city].name} · Office: {wp.name} · {PROPERTIES[state.prop][0]} · {LIFESTYLE_TIERS[state.life].label}.
        </p>
      </div>

      {/* Top 4 Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Take-Home */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E6DD] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Take-Home Salary
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-heading mt-1">
            {formatINR(state.sal)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Net monthly income
          </div>
        </div>

        {/* Est. Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E6DD] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Est. Monthly Outflow
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-heading mt-1">
            {formatINR(currentEst.tot + state.com)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {formatINR(currentEst.tot)} living + {formatINR(state.com)} commitments
          </div>
        </div>

        {/* Net Monthly Savings */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E6DD] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Monthly Net Savings
          </div>
          <div
            className={`text-2xl sm:text-3xl font-extrabold font-heading mt-1 ${
              currentEst.sav >= 0 ? 'text-emerald-700' : 'text-red-600'
            }`}
          >
            {formatINR(currentEst.sav)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Target: {formatINR(targetSavings)}/mo
          </div>
        </div>

        {/* Savings Rate % */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2E6DD] shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Savings Rate
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#21442E] font-heading mt-1">
            {savingsRate}%
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            of take-home salary
          </div>
        </div>
      </div>

      {/* Status banner */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${budgetStatus.bg}`}
      >
        <div className="flex items-center gap-2.5">
          <StatusIcon className="w-5 h-5 shrink-0" />
          <div className="text-xs sm:text-sm font-semibold">
            <span className="font-extrabold uppercase mr-1.5">
              {budgetStatus.label}:
            </span>
            {budgetStatus.desc}
          </div>
        </div>
        <span className="hidden sm:inline-block text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/60">
          Benchmark model
        </span>
      </div>

      {/* Editable Monthly Expense Rows */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E6DD] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E6DD] pb-3">
          <div>
            <h3 className="font-heading font-bold text-base text-neutral-900">
              Personalized Expense Breakdown
            </h3>
            <p className="text-xs text-neutral-500">
              Adjust any category to reflect your actual spending habits.
            </p>
          </div>
          {Object.keys(state.ov).length > 0 && (
            <button
              type="button"
              onClick={handleResetOverrides}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset custom edits</span>
            </button>
          )}
        </div>

        <div className="space-y-3 pt-2">
          {(Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[]).map((catKey) => {
            const amount = currentEst.e[catKey];
            const pct =
              currentEst.tot > 0
                ? Math.round((amount / currentEst.tot) * 100)
                : 0;

            return (
              <div
                key={catKey}
                className="grid grid-cols-12 items-center gap-3 py-1.5"
              >
                {/* Category Label */}
                <div className="col-span-4 sm:col-span-3 text-xs font-semibold text-neutral-800">
                  {EXPENSE_CATEGORIES[catKey]}
                </div>

                {/* Progress Bar */}
                <div className="col-span-5 sm:col-span-6 flex items-center gap-2">
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#21442E] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                    />
                  </div>
                  <span className="w-10 text-[11px] font-mono text-neutral-400 text-right">
                    {pct}%
                  </span>
                </div>

                {/* Input Number */}
                <div className="col-span-3 sm:col-span-3 flex justify-end">
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="250"
                      value={amount}
                      onChange={(e) =>
                        handleExpenseChange(catKey, Number(e.target.value))
                      }
                      className="w-full pl-6 pr-2.5 py-1 text-right text-xs font-bold text-neutral-900 bg-neutral-50 border border-[#E2E6DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#21442E]/20"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Year Savings Projections */}
      <div className="bg-[#FAFBF8] p-5 rounded-2xl border border-[#E2E6DD] space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Savings Wealth Projections (Unchanged Expenses)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-xl border border-[#E2E6DD]">
            <div className="text-[11px] text-neutral-500 font-medium">1 Month</div>
            <div className="text-lg font-bold text-neutral-900 mt-0.5">
              {formatINR(currentEst.sav)}
            </div>
            <div className="text-[10px] text-neutral-400">Monthly bankable surplus</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E6DD]">
            <div className="text-[11px] text-neutral-500 font-medium">1 Year (12 Months)</div>
            <div className="text-lg font-bold text-emerald-800 mt-0.5">
              {formatINR(currentEst.sav * 12)}
            </div>
            <div className="text-[10px] text-neutral-400">Cumulative 1-year corpus</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#E2E6DD]">
            <div className="text-[11px] text-neutral-500 font-medium">2 Years (24 Months)</div>
            <div className="text-lg font-bold text-emerald-800 mt-0.5">
              {formatINR(currentEst.sav * 24)}
            </div>
            <div className="text-[10px] text-neutral-400">Cumulative 2-year corpus</div>
          </div>
        </div>
      </div>

      {/* What-If Simulator Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E6DD] shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-800" />
          <h3 className="font-heading font-bold text-sm text-neutral-900">
            What-If Scenario Simulator
          </h3>
        </div>
        <p className="text-xs text-neutral-500">
          Simulate how lifestyle changes affect your monthly surplus. Note: changing simulator switches will reset manual edits.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Property */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
              Property
            </label>
            <select
              value={state.prop}
              onChange={(e) =>
                onUpdateState({ prop: e.target.value as PropertyType, ov: {} })
              }
              className="w-full p-2 bg-neutral-50 border border-[#E2E6DD] rounded-lg text-xs font-medium text-neutral-800"
            >
              {(Object.keys(PROPERTIES) as PropertyType[]).map((p) => (
                <option key={p} value={p}>
                  {PROPERTIES[p][0]}
                </option>
              ))}
            </select>
          </div>

          {/* Food */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
              Food Habits
            </label>
            <select
              value={state.food}
              onChange={(e) =>
                onUpdateState({ food: e.target.value as FoodHabit, ov: {} })
              }
              className="w-full p-2 bg-neutral-50 border border-[#E2E6DD] rounded-lg text-xs font-medium text-neutral-800"
            >
              {(Object.keys(FOOD_HABITS) as FoodHabit[]).map((f) => (
                <option key={f} value={f}>
                  {FOOD_HABITS[f]}
                </option>
              ))}
            </select>
          </div>

          {/* Transit */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
              Commute Mode
            </label>
            <select
              value={state.tr}
              onChange={(e) =>
                onUpdateState({ tr: e.target.value as TransportMode, ov: {} })
              }
              className="w-full p-2 bg-neutral-50 border border-[#E2E6DD] rounded-lg text-xs font-medium text-neutral-800"
            >
              {(Object.keys(TRANSPORT_MODES) as TransportMode[]).map((t) => (
                <option key={t} value={t}>
                  {TRANSPORT_MODES[t]}
                </option>
              ))}
            </select>
          </div>

          {/* Lifestyle */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
              Comfort Tier
            </label>
            <select
              value={state.life}
              onChange={(e) =>
                onUpdateState({ life: e.target.value as LifestyleTier, ov: {} })
              }
              className="w-full p-2 bg-neutral-50 border border-[#E2E6DD] rounded-lg text-xs font-medium text-neutral-800"
            >
              {(Object.keys(LIFESTYLE_TIERS) as LifestyleTier[]).map((l) => (
                <option key={l} value={l}>
                  {LIFESTYLE_TIERS[l].label}
                </option>
              ))}
            </select>
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
          <span>See my relocation report</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
