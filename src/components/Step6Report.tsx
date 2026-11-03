import React, { useState, useEffect } from 'react';
import {
  CityKey,
  RelocationState,
  SavedPlan,
  ScoredNeighbourhood,
} from '../types';
import {
  CITIES,
  EXPENSE_CATEGORIES,
  LIFESTYLE_TIERS,
  PROPERTIES,
  calculateNeighbourhoods,
  estimateExpenses,
  formatINR,
  getTarget,
} from '../data/relocationData';
import { MapComponent } from './MapComponent';
import {
  FileText,
  Bookmark,
  Printer,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Building,
  Trash2,
  FolderOpen,
  ArrowRight,
  ShieldCheck,
  Clock,
  Car,
  Check,
} from 'lucide-react';

interface Step6ReportProps {
  state: RelocationState;
  chosenNeighbourhood: ScoredNeighbourhood;
  scoredNeighbourhoods: ScoredNeighbourhood[];
  onUpdateState: (updates: Partial<RelocationState>) => void;
  onGoStep: (step: number) => void;
}

export const Step6Report: React.FC<Step6ReportProps> = ({
  state,
  chosenNeighbourhood,
  scoredNeighbourhoods,
  onUpdateState,
  onGoStep,
}) => {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [planTitle, setPlanTitle] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const currentCity = CITIES[state.city];
  const wp = state.wp || {
    name: currentCity.hubs[0][0],
    lat: currentCity.hubs[0][1],
    lng: currentCity.hubs[0][2],
  };

  // 1. Current Area Calculation with Overrides
  const currentEst = estimateExpenses(
    state.city,
    chosenNeighbourhood.a,
    wp,
    true,
    state
  );
  const targetSavings = getTarget(state);
  const savingsRate = Math.round((currentEst.sav / state.sal) * 100);

  // 2. Comparison Neighbourhoods (Shortlisted or top 3)
  const compareList =
    state.sel.length > 0
      ? (state.sel
          .map((id) => scoredNeighbourhoods.find((n) => n.i === id))
          .filter(Boolean) as ScoredNeighbourhood[])
      : scoredNeighbourhoods.slice(0, 3);

  // 3. Cross-City Comparison Calculation
  const otherCityKey: CityKey = state.city === 'blr' ? 'ncr' : 'blr';
  const otherCity = CITIES[otherCityKey];
  const otherHub = otherCity.hubs[0];
  const otherWp = {
    name: otherHub[0],
    lat: otherHub[1],
    lng: otherHub[2],
  };
  const otherCityScored = calculateNeighbourhoods(otherCityKey, otherWp, state);
  const otherCityTop = otherCityScored[0];
  const otherCityEst = otherCityTop ? otherCityTop.x : currentEst;

  const salaryNeededInOtherCity =
    otherCityEst.tot + state.com + targetSavings;

  // LocalStorage saved plans management
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ri_saved_plans_v2');
      if (stored) {
        setSavedPlans(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const handleSavePlan = () => {
    const title =
      planTitle.trim() ||
      `${currentCity.name} · ${chosenNeighbourhood.a[0]} (${formatINR(state.sal)})`;
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

    const updated = [newPlan, ...savedPlans.slice(0, 9)];
    setSavedPlans(updated);
    try {
      localStorage.setItem('ri_saved_plans_v2', JSON.stringify(updated));
      setSaveSuccessMsg('Plan saved to your browser!');
      setPlanTitle('');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (e) {}
  };

  const handleLoadPlan = (plan: SavedPlan) => {
    onUpdateState(plan.state);
  };

  const handleDeletePlan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedPlans.filter((p) => p.id !== id);
    setSavedPlans(updated);
    try {
      localStorage.setItem('ri_saved_plans_v2', JSON.stringify(updated));
    } catch (e) {}
  };

  return (
    <div className="space-y-8 max-w-4xl print-page">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5EAE5] no-print">
        <div>
          <div className="text-xs font-mono font-semibold text-[#176B50] mb-1 flex items-center gap-1.5">
            <span>06</span>
            <span className="text-neutral-300">/</span>
            <span>EXECUTIVE BRIEF & RELOCATION AUDIT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#18231E] font-heading tracking-tight">
            Relocation Executive Report
          </h2>
          <p className="mt-1 text-xs text-[#5F6A63]">
            Print-ready summary of your relocation plan, cost structure, and locality comparisons.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E5EAE5] text-[#18231E] hover:bg-neutral-50 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-[#176B50]" />
            <span>Print / PDF Export</span>
          </button>
        </div>
      </div>

      {/* Main Executive Summary Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5EAE5] pb-5">
          <div>
            <span className="text-xs font-mono font-bold text-[#176B50] uppercase tracking-wider">
              Primary Recommended Area
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#18231E] font-heading mt-1">
              {chosenNeighbourhood.a[0]}, {currentCity.name}
            </h3>
            <p className="text-xs text-[#5F6A63] mt-1 flex items-center gap-2">
              <span>Moving from: {state.from}</span>
              <span>·</span>
              <span>Office: {wp.name}</span>
            </p>
          </div>

          <div className="sm:text-right">
            <div className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
              Projected Bankable Surplus
            </div>
            <div
              className={`text-2xl sm:text-3xl font-bold font-mono mt-1 ${
                currentEst.sav >= 0 ? 'text-[#176B50]' : 'text-[#BE123C]'
              }`}
            >
              {formatINR(currentEst.sav)}
              <span className="text-xs font-normal text-[#5F6A63]">/mo</span>
            </div>
            <div className="text-xs text-[#5F6A63] mt-0.5">
              {savingsRate}% net savings rate
            </div>
          </div>
        </div>

        {/* 4 Essential Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
              Housing Rent ({PROPERTIES[state.prop]?.[0]})
            </div>
            <div className="text-lg font-bold font-mono text-[#18231E] mt-1">
              {formatINR(currentEst.e.rent)}/mo
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
              Road Commute Duration
            </div>
            <div className="text-lg font-bold font-mono text-[#18231E] mt-1">
              {chosenNeighbourhood.drivingMin ?? chosenNeighbourhood.x.min} min
            </div>
            <div className="text-[10px] text-[#5F6A63]">
              {chosenNeighbourhood.roadKm ?? chosenNeighbourhood.x.rd} km to office
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
              Total Living Outflow
            </div>
            <div className="text-lg font-bold font-mono text-[#18231E] mt-1">
              {formatINR(currentEst.tot)}/mo
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
              Annual Wealth Created
            </div>
            <div className="text-lg font-bold font-mono text-[#176B50] mt-1">
              {formatINR(Math.max(0, currentEst.sav * 12))}
            </div>
          </div>
        </div>

        {/* Upfront Capital Warning for Bengaluru */}
        {state.city === 'blr' && (
          <div className="p-4 rounded-xl bg-[#E8F4EF] border border-[#176B50]/20 text-xs space-y-1">
            <div className="font-bold text-[#18231E] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#176B50]" />
              <span>Upfront Capital & Rental Deposit Requirements:</span>
            </div>
            <p className="text-[#5F6A63] leading-relaxed">
              Bengaluru landlords generally require 6 to 10 months of rent upfront. For a {PROPERTIES[state.prop]?.[0]} in {chosenNeighbourhood.a[0]}, ensure you hold an upfront deposit reserve of <strong>{formatINR(currentEst.e.rent * 7)}–{formatINR(currentEst.e.rent * 10)}</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Locality Head-to-Head Comparison Table */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
          Neighbourhood Head-to-Head Benchmark
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5EAE5] text-[#5F6A63] font-semibold">
                <th className="py-2.5 px-3">Neighbourhood</th>
                <th className="py-2.5 px-3">Rent ({PROPERTIES[state.prop]?.[0]})</th>
                <th className="py-2.5 px-3">Road Commute</th>
                <th className="py-2.5 px-3">Total Expenses</th>
                <th className="py-2.5 px-3 text-right">Net Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAE5]/60">
              {compareList.map((item) => {
                const isCurrent = item.i === chosenNeighbourhood.i;
                return (
                  <tr
                    key={item.i}
                    className={`hover:bg-[#F8F9F7] transition-colors ${
                      isCurrent ? 'bg-[#E8F4EF]/50 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {isCurrent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#176B50]" />
                        )}
                        <span className="text-[#18231E]">{item.a[0]}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {formatINR(item.x.e.rent)}/mo
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {item.drivingMin ?? item.x.min} min ({item.roadKm ?? item.x.rd} km)
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {formatINR(item.x.tot)}/mo
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#176B50]">
                      {formatINR(item.x.sav)}/mo
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cross-City Purchasing Power Benchmark */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#176B50]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#18231E]">
            Cross-City Purchasing Power Parity ({otherCity.name})
          </h3>
        </div>

        <div className="p-4 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#18231E]">
              Equivalent Salary Required in {otherCity.name}
            </div>
            <p className="text-xs text-[#5F6A63] mt-0.5">
              To achieve the identical monthly savings surplus of {formatINR(currentEst.sav)}/mo in {otherCity.name} ({otherCityTop?.a[0] || 'Prime corridor'}).
            </p>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#18231E] whitespace-nowrap">
            {formatINR(salaryNeededInOtherCity)}
            <span className="text-xs font-normal text-[#5F6A63]">/mo in-hand</span>
          </div>
        </div>
      </div>

      {/* Save Plan & Bookmarking Card (no-print) */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-4 no-print">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
            Save This Relocation Plan
          </h3>
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
            placeholder={`e.g. ${currentCity.name} Offer A (${formatINR(state.sal)})`}
            className="flex-1 px-4 py-2 bg-[#F8F9F7] border border-[#E5EAE5] rounded-xl text-xs font-medium text-[#18231E] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#176B50]/20 focus:border-[#176B50]"
          />
          <button
            type="button"
            onClick={handleSavePlan}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#176B50] hover:bg-[#125740] shadow-xs transition-colors shrink-0"
          >
            Save Plan to Storage
          </button>
        </div>

        {/* Saved Plans List */}
        {savedPlans.length > 0 && (
          <div className="pt-3 border-t border-[#E5EAE5] space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6A63]">
              Previously Saved Plans ({savedPlans.length}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {savedPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => handleLoadPlan(plan)}
                  className="p-3 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] hover:border-neutral-300 cursor-pointer flex items-center justify-between transition-colors text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-semibold text-[#18231E] truncate">
                      {plan.title}
                    </div>
                    <div className="text-[10px] text-[#5F6A63]">
                      Saved {plan.timestamp}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDeletePlan(plan.id, e)}
                    className="p-1 text-neutral-400 hover:text-[#BE123C] transition-colors"
                    title="Delete plan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer (no-print) */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E5EAE5] no-print">
        <button
          type="button"
          onClick={() => onGoStep(4)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#5F6A63] hover:text-[#18231E] hover:bg-neutral-100 transition-colors"
        >
          <span>Modify Analysis & Overrides</span>
        </button>

        <button
          type="button"
          onClick={() => onGoStep(0)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#176B50] hover:bg-[#125740] shadow-sm transition-colors"
        >
          <span>Create Another Scenario</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
