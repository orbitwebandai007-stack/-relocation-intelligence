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
  ShieldCheck,
  Check,
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
          badgeClass: 'bg-red-50 text-[#BE123C] border-red-200',
          desc: `Expenses and commitments exceed your salary by ${formatINR(
            Math.abs(currentEst.sav)
          )}/mo.`,
        }
      : currentEst.sav < targetSavings
      ? {
          label: 'Below Target Savings',
          badgeClass: 'bg-amber-50 text-[#B45309] border-amber-200',
          desc: `Surplus of ${formatINR(
            currentEst.sav
          )}/mo is below your target of ${formatINR(targetSavings)}/mo.`,
        }
      : {
          label: 'Healthy Financial Surplus',
          badgeClass: 'bg-[#E8F4EF] text-[#176B50] border-[#176B50]/20',
          desc: `You meet all expenses and save ${formatINR(
            currentEst.sav
          )}/mo (${savingsRate}% savings rate).`,
        };

  const handleExpenseOverride = (cat: ExpenseCategory, value: number) => {
    onUpdateState({
      ov: {
        ...state.ov,
        [cat]: Math.max(0, value),
      },
    });
  };

  const handleResetOverrides = () => {
    onUpdateState({ ov: {} });
  };

  const hasOverrides = Object.keys(state.ov).length > 0;

  // Multi-year savings projections
  const oneYearSavings = Math.max(0, currentEst.sav * 12);
  const threeYearSavings = Math.max(0, currentEst.sav * 36);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Step Header */}
      <div>
        <div className="text-xs font-mono font-semibold text-[#176B50] mb-1.5 flex items-center gap-1.5">
          <span>05</span>
          <span className="text-neutral-300">/</span>
          <span>BUDGET BREAKDOWN & SCENARIO ANALYSIS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#18231E] font-heading tracking-tight">
          Financial Realities in {chosenNeighbourhood.a[0]}
        </h2>
        <p className="mt-2 text-sm text-[#5F6A63] leading-relaxed">
          Comprehensive cashflow model reflecting your chosen accommodation ({PROPERTIES[state.prop]?.[0]}), daily commute, and dining habits. Adjust expense sliders below to test what-if scenarios.
        </p>
      </div>

      {/* Top Level Financial Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Salary */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5F6A63]">
            Monthly In-Hand
          </div>
          <div className="text-2xl font-bold font-mono text-[#18231E]">
            {formatINR(state.sal)}
          </div>
          <div className="text-xs text-[#5F6A63]">Net take-home income</div>
        </div>

        {/* Card 2: Total Living Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5F6A63]">
            Living Outflow
          </div>
          <div className="text-2xl font-bold font-mono text-[#18231E]">
            {formatINR(currentEst.tot)}
          </div>
          <div className="text-xs text-[#5F6A63]">Rent + food + transit + bills</div>
        </div>

        {/* Card 3: Fixed Commitments */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5F6A63]">
            Fixed Commitments
          </div>
          <div className="text-2xl font-bold font-mono text-[#18231E]">
            {formatINR(state.com)}
          </div>
          <div className="text-xs text-[#5F6A63]">Existing debt / remittances</div>
        </div>

        {/* Card 4: Net Surplus */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5F6A63]">
            Bankable Surplus
          </div>
          <div
            className={`text-2xl font-bold font-mono ${
              currentEst.sav >= 0 ? 'text-[#176B50]' : 'text-[#BE123C]'
            }`}
          >
            {formatINR(currentEst.sav)}
          </div>
          <div className="text-xs text-[#5F6A63]">
            {savingsRate}% monthly savings rate
          </div>
        </div>
      </div>

      {/* Financial Health Status Banner */}
      <div
        className={`p-4 rounded-2xl border ${budgetStatus.badgeClass} flex items-center justify-between gap-4`}
      >
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-current" />
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider">
              {budgetStatus.label}
            </h4>
            <p className="text-xs mt-0.5 opacity-90">{budgetStatus.desc}</p>
          </div>
        </div>
        <div className="text-xs font-mono font-bold shrink-0">
          Target: {formatINR(targetSavings)}/mo
        </div>
      </div>

      {/* Visual Cashflow Progress Bar */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
          Cashflow Distribution
        </h3>

        {/* Stacked Bar */}
        <div className="h-4 w-full bg-neutral-100 rounded-full overflow-hidden flex">
          <div
            style={{
              width: `${Math.min(100, (currentEst.e.rent / state.sal) * 100)}%`,
            }}
            className="bg-[#176B50] h-full"
            title={`Rent: ${formatINR(currentEst.e.rent)}`}
          />
          <div
            style={{
              width: `${Math.min(100, (currentEst.e.food / state.sal) * 100)}%`,
            }}
            className="bg-[#2D8A68] h-full"
            title={`Food: ${formatINR(currentEst.e.food)}`}
          />
          <div
            style={{
              width: `${Math.min(100, (currentEst.e.trans / state.sal) * 100)}%`,
            }}
            className="bg-[#44A782] h-full"
            title={`Commute: ${formatINR(currentEst.e.trans)}`}
          />
          <div
            style={{
              width: `${Math.min(
                100,
                ((currentEst.e.util + currentEst.e.net) / state.sal) * 100
              )}%`,
            }}
            className="bg-[#8DA785] h-full"
            title={`Utilities: ${formatINR(
              currentEst.e.util + currentEst.e.net
            )}`}
          />
          <div
            style={{
              width: `${Math.min(
                100,
                ((currentEst.e.pers + currentEst.e.ent + currentEst.e.oth) /
                  state.sal) *
                  100
              )}%`,
            }}
            className="bg-neutral-300 h-full"
            title={`Discretionary: ${formatINR(
              currentEst.e.pers + currentEst.e.ent + currentEst.e.oth
            )}`}
          />
          {currentEst.sav > 0 && (
            <div
              style={{
                width: `${Math.min(100, (currentEst.sav / state.sal) * 100)}%`,
              }}
              className="bg-[#C8E6A0] h-full"
              title={`Savings: ${formatINR(currentEst.sav)}`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#176B50]" />
            <span className="text-[#5F6A63]">Rent:</span>
            <span className="font-mono font-bold text-[#18231E]">
              {formatINR(currentEst.e.rent)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D8A68]" />
            <span className="text-[#5F6A63]">Food:</span>
            <span className="font-mono font-bold text-[#18231E]">
              {formatINR(currentEst.e.food)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#44A782]" />
            <span className="text-[#5F6A63]">Commute:</span>
            <span className="font-mono font-bold text-[#18231E]">
              {formatINR(currentEst.e.trans)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8DA785]" />
            <span className="text-[#5F6A63]">Utilities & Wi-Fi:</span>
            <span className="font-mono font-bold text-[#18231E]">
              {formatINR(currentEst.e.util + currentEst.e.net)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C8E6A0]" />
            <span className="text-[#5F6A63]">Net Savings:</span>
            <span className="font-mono font-bold text-[#176B50]">
              {formatINR(currentEst.sav)}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Expense Sliders (What-If Simulator) */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
              Interactive Scenario Overrides
            </h3>
            <p className="text-xs text-[#5F6A63] mt-0.5">
              Customize benchmark figures to reflect specific rental quotes or known bills.
            </p>
          </div>
          {hasOverrides && (
            <button
              type="button"
              onClick={handleResetOverrides}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#176B50] hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Benchmarks</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rent Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#18231E]">Monthly Rent</span>
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
          </div>

          {/* Food Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#18231E]">Food & Dining</span>
              <span className="font-mono font-bold text-[#18231E]">
                {formatINR(currentEst.e.food)}
              </span>
            </div>
            <input
              type="range"
              min="4000"
              max="35000"
              step="1000"
              value={currentEst.e.food}
              onChange={(e) => handleExpenseOverride('food', Number(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Commute Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#18231E]">Commute & Transit</span>
              <span className="font-mono font-bold text-[#18231E]">
                {formatINR(currentEst.e.trans)}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="25000"
              step="500"
              value={currentEst.e.trans}
              onChange={(e) => handleExpenseOverride('trans', Number(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Utilities Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#18231E]">Utilities & Wi-Fi</span>
              <span className="font-mono font-bold text-[#18231E]">
                {formatINR(currentEst.e.util + currentEst.e.net)}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="15000"
              step="500"
              value={currentEst.e.util + currentEst.e.net}
              onChange={(e) => handleExpenseOverride('util', Number(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Multi-Year Wealth Accumulation Projections */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#176B50]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#18231E]">
            Cumulative Wealth Accumulation (No Inflation Assumption)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#5F6A63]">
              1-Year Bankable Surplus
            </div>
            <div className="text-2xl font-bold font-mono text-[#176B50] mt-1">
              {formatINR(oneYearSavings)}
            </div>
            <div className="text-xs text-[#5F6A63] mt-1">
              Cumulative cash after all rent and lifestyle costs
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#5F6A63]">
              3-Year Cumulative Capital
            </div>
            <div className="text-2xl font-bold font-mono text-[#176B50] mt-1">
              {formatINR(threeYearSavings)}
            </div>
            <div className="text-xs text-[#5F6A63] mt-1">
              Available for investment portfolio or home downpayment
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#5F6A63] hover:text-[#18231E] hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lifestyle</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold text-white bg-[#176B50] hover:bg-[#125740] shadow-sm transition-all duration-150 active:scale-[0.98]"
        >
          <span>Generate Executive Report</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
