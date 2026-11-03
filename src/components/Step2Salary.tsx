import React from 'react';
import { RelocationState } from '../types';
import { formatINR, getTarget } from '../data/relocationData';
import {
  Wallet,
  PiggyBank,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Info,
  BadgePercent,
  Check,
} from 'lucide-react';

interface Step2SalaryProps {
  state: RelocationState;
  onUpdateState: (updates: Partial<RelocationState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2Salary: React.FC<Step2SalaryProps> = ({
  state,
  onUpdateState,
  onNext,
  onBack,
}) => {
  const targetSavings = getTarget(state);
  const remainingBudget = state.sal - state.com - targetSavings;
  const isSalaryTooLow = state.sal < 10000;
  const isTargetTooHigh = state.tm === 'target' && state.tgt >= state.sal;
  const isInvalid = isSalaryTooLow || isTargetTooHigh;

  const quickSalaries = [40000, 60000, 85000, 120000, 160000, 220000];

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Step Header */}
      <div>
        <div className="text-xs font-mono font-semibold text-[#176B50] mb-1.5 flex items-center gap-1.5">
          <span>02</span>
          <span className="text-neutral-300">/</span>
          <span>INCOME & SAVINGS TARGET</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#18231E] font-heading tracking-tight">
          Let’s establish your monthly cashflow.
        </h2>
        <p className="mt-2 text-sm text-[#5F6A63] leading-relaxed">
          Base your relocation calculations on real monthly take-home salary—the actual cash hitting your bank account after income tax, employee PF, and professional tax.
        </p>
      </div>

      {/* Salary Input Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
              Monthly In-Hand Take-Home
            </label>
            <div className="text-2xl sm:text-3xl font-bold text-[#176B50] font-heading">
              {formatINR(state.sal)}
              <span className="text-xs font-normal text-[#5F6A63]"> / month</span>
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#5F6A63]">
              ₹
            </span>
            <input
              type="number"
              min="10000"
              step="2500"
              value={state.sal}
              onChange={(e) =>
                onUpdateState({ sal: Math.max(0, Number(e.target.value)) })
              }
              className="w-full pl-8 pr-4 py-3 bg-[#F8F9F7] border border-[#E5EAE5] rounded-xl text-lg font-bold font-mono text-[#18231E] focus:outline-none focus:ring-2 focus:ring-[#176B50]/20 focus:border-[#176B50]"
            />
          </div>

          {/* Range Slider */}
          <div className="mt-4">
            <input
              type="range"
              min="20000"
              max="300000"
              step="5000"
              value={state.sal}
              onChange={(e) => onUpdateState({ sal: Number(e.target.value) })}
              className="w-full h-2 bg-neutral-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#5F6A63] mt-1 font-mono">
              <span>₹20,000</span>
              <span>₹1,00,000</span>
              <span>₹2,00,000</span>
              <span>₹3,00,000+</span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-4 border-t border-[#E5EAE5]">
            <span className="text-[11px] text-[#5F6A63] mr-1">Presets:</span>
            {quickSalaries.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onUpdateState({ sal: val })}
                className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
                  state.sal === val
                    ? 'bg-[#176B50] text-white'
                    : 'bg-[#F8F9F7] text-[#5F6A63] hover:text-[#18231E] hover:bg-neutral-100 border border-[#E5EAE5]'
                }`}
              >
                {formatINR(val)}
              </button>
            ))}
          </div>
        </div>

        {/* Existing Commitments (Loans / EMIs / Remittances) */}
        <div className="pt-4 border-t border-[#E5EAE5] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
                Existing Non-Negotiable Commitments
              </label>
              <p className="text-xs text-[#5F6A63] mt-0.5">
                Education loans, home EMIs, family remittances that occur regardless of city.
              </p>
            </div>
            <span className="text-sm font-bold font-mono text-[#18231E]">
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
              placeholder="0"
              className="w-full pl-8 pr-4 py-2.5 bg-[#F8F9F7] border border-[#E5EAE5] rounded-xl text-sm font-bold font-mono text-[#18231E] focus:outline-none focus:ring-2 focus:ring-[#176B50]/20 focus:border-[#176B50]"
            />
          </div>
        </div>
      </div>

      {/* Target Savings Strategy Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-5">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
          Monthly Savings Objective
        </label>

        {/* Strategy Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => onUpdateState({ tm: 'target' })}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              state.tm === 'target'
                ? 'border-[#176B50] bg-[#E8F4EF] text-[#176B50] ring-1 ring-[#176B50]'
                : 'border-[#E5EAE5] bg-[#F8F9F7] text-[#18231E] hover:bg-neutral-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                Fixed Target Target
              </span>
              {state.tm === 'target' && (
                <Check className="w-4 h-4 stroke-[2.5]" />
              )}
            </div>
            <p className="text-xs text-[#5F6A63]">
              Specify an explicit rupee amount or savings percentage you want to lock away every month.
            </p>
          </div>

          <div
            onClick={() => onUpdateState({ tm: 'calc' })}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              state.tm === 'calc'
                ? 'border-[#176B50] bg-[#E8F4EF] text-[#176B50] ring-1 ring-[#176B50]'
                : 'border-[#E5EAE5] bg-[#F8F9F7] text-[#18231E] hover:bg-neutral-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                Maximize Surplus
              </span>
              {state.tm === 'calc' && (
                <Check className="w-4 h-4 stroke-[2.5]" />
              )}
            </div>
            <p className="text-xs text-[#5F6A63]">
              Show whatever surplus remains after necessary rent, food, and commute costs in each area.
            </p>
          </div>
        </div>

        {/* Target Savings Amount (Shown only in target mode) */}
        {state.tm === 'target' && (
          <div className="pt-3 border-t border-[#E5EAE5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#18231E]">
                Monthly Savings Goal:
              </span>
              <span className="text-sm font-bold font-mono text-[#176B50]">
                {formatINR(state.tgt)} / month
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

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-[#5F6A63]">Quick percentages:</span>
              {[0.2, 0.3, 0.4, 0.5].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() =>
                    onUpdateState({ tgt: Math.round(state.sal * pct) })
                  }
                  className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#F8F9F7] border border-[#E5EAE5] text-[#5F6A63] hover:text-[#18231E]"
                >
                  {pct * 100}% ({formatINR(Math.round(state.sal * pct))})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Derived Housing & Living Pool */}
        <div className="p-4 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#5F6A63]">
              Allocated Housing & Living Pool
            </div>
            <div className="text-xs text-[#5F6A63] mt-0.5">
              Available for rent, utilities, food & transportation.
            </div>
          </div>
          <div className="text-lg font-bold font-mono text-[#18231E]">
            ~{formatINR(Math.max(0, remainingBudget))}/mo
          </div>
        </div>

        {isInvalid && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
            <span>
              {isSalaryTooLow
                ? 'Minimum salary must be at least ₹10,000/mo.'
                : 'Target savings cannot exceed or equal take-home salary.'}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#5F6A63] hover:text-[#18231E] hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Location</span>
        </button>

        <button
          type="button"
          disabled={isInvalid}
          onClick={onNext}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold text-white shadow-sm transition-all duration-150 active:scale-[0.98] ${
            isInvalid
              ? 'bg-neutral-300 cursor-not-allowed'
              : 'bg-[#176B50] hover:bg-[#125740]'
          }`}
        >
          <span>Discover Neighbourhoods</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
