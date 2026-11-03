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

  const quickSalaries = [35000, 50000, 75000, 100000, 150000, 200000];

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-1">
          02 · Income & Target Savings
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#19241D] tracking-tight">
          Let’s understand your income.
        </h2>
        <p className="mt-1 text-sm text-neutral-600 max-w-2xl">
          Your take-home salary is the net cash credited to your bank account after income tax, provident fund (PF), and deductions. Enter monthly take-home — not annual CTC.
        </p>
      </div>

      {/* Salary Input Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E6DD] shadow-xs space-y-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Monthly take-home salary
            </label>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#21442E] font-heading">
              {formatINR(state.sal)}
              <span className="text-xs font-normal text-neutral-500"> / month</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-400">
                ₹
              </span>
              <input
                type="number"
                min="10000"
                step="1000"
                value={state.sal}
                onChange={(e) =>
                  onUpdateState({ sal: Math.max(0, Number(e.target.value)) })
                }
                className="w-full pl-8 pr-4 py-2.5 bg-neutral-50 border border-[#E2E6DD] rounded-xl text-base font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#21442E]/20 focus:border-[#21442E]"
              />
            </div>
          </div>

          {/* Range Slider */}
          <div className="mt-4">
            <input
              type="range"
              min="15000"
              max="250000"
              step="2500"
              value={state.sal}
              onChange={(e) => onUpdateState({ sal: Number(e.target.value) })}
              className="w-full h-2 bg-neutral-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-neutral-400 mt-1 font-mono">
              <span>₹15,000</span>
              <span>₹75,000</span>
              <span>₹1,50,000</span>
              <span>₹2,50,000+</span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-neutral-400 font-medium mr-1">
              Popular benchmarks:
            </span>
            {quickSalaries.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onUpdateState({ sal: val })}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  state.sal === val
                    ? 'bg-[#21442E] text-white border-[#21442E] font-semibold'
                    : 'bg-neutral-50 text-neutral-600 border-[#E2E6DD] hover:bg-neutral-100'
                }`}
              >
                {formatINR(val)}
              </button>
            ))}
          </div>

          {isSalaryTooLow && (
            <p className="mt-2 text-xs text-red-600 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Please enter at least ₹10,000 monthly take-home.</span>
            </p>
          )}
        </div>

        {/* Savings Target Mode */}
        <div className="pt-6 border-t border-[#E2E6DD] space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
              Monthly savings goal strategy
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onUpdateState({ tm: 'target' })}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  state.tm === 'target'
                    ? 'border-[#21442E] bg-emerald-50/50 shadow-xs'
                    : 'border-[#E2E6DD] bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <div className="font-bold text-xs text-neutral-900 flex items-center gap-2">
                  <PiggyBank className="w-4 h-4 text-[#21442E]" />
                  <span>Set a specific savings target</span>
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">
                  Specify how much you aim to invest or bank each month.
                </div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateState({ tm: 'calc' })}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  state.tm === 'calc'
                    ? 'border-[#21442E] bg-emerald-50/50 shadow-xs'
                    : 'border-[#E2E6DD] bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <div className="font-bold text-xs text-neutral-900 flex items-center gap-2">
                  <BadgePercent className="w-4 h-4 text-[#21442E]" />
                  <span>Calculate what I can save</span>
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">
                  Model expenses first and discover potential surplus automatically.
                </div>
              </button>
            </div>
          </div>

          {state.tm === 'target' && (
            <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-700">
                  Target Monthly Savings
                </label>
                <span className="text-sm font-extrabold text-[#21442E]">
                  {formatINR(state.tgt)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-400">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={state.tgt}
                  onChange={(e) =>
                    onUpdateState({ tgt: Math.max(0, Number(e.target.value)) })
                  }
                  className="w-full pl-8 pr-4 py-2 bg-white border border-[#E2E6DD] rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#21442E]/20"
                />
              </div>
              {isTargetTooHigh && (
                <p className="text-xs text-red-600">
                  Target savings must be strictly less than monthly take-home.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Existing Commitments (Loans, Family Support, EMIs) */}
        <div className="pt-6 border-t border-[#E2E6DD] space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Existing monthly commitments (optional — loans, family support, EMIs)
          </label>
          <div className="max-w-md relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-400">
              ₹
            </span>
            <input
              type="number"
              min="0"
              step="500"
              value={state.com}
              onChange={(e) =>
                onUpdateState({ com: Math.max(0, Number(e.target.value)) })
              }
              placeholder="0"
              className="w-full pl-8 pr-4 py-2 bg-neutral-50 border border-[#E2E6DD] rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#21442E]/20"
            />
          </div>
          <p className="text-[11px] text-neutral-400">
            Leave 0 if you don’t have monthly education loan, vehicle loan or remittance commitments.
          </p>
        </div>
      </div>

      {/* Available Budget Breakdown Card */}
      <div className="p-5 rounded-2xl bg-[#21442E] text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-emerald-300">
            Estimated Net Living & Rent Allowance
          </div>
          <div className="text-3xl font-extrabold font-heading mt-0.5">
            {formatINR(Math.max(0, remainingBudget))}
            <span className="text-xs text-emerald-200/80 font-normal"> / month</span>
          </div>
          <p className="text-xs text-emerald-100/70 mt-1 max-w-lg">
            This is the maximum available for rent, food, commute and bills while hitting your {state.tm === 'target' ? `${formatINR(state.tgt)} target` : 'savings goal'}.
          </p>
        </div>

        <div className="text-right text-xs text-emerald-200/90 font-mono space-y-0.5 border-t sm:border-t-0 sm:border-l border-emerald-700/50 pt-2 sm:pt-0 sm:pl-4">
          <div>Take-home: {formatINR(state.sal)}</div>
          {state.com > 0 && <div>- Commitments: {formatINR(state.com)}</div>}
          {state.tm === 'target' && <div>- Target: {formatINR(state.tgt)}</div>}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
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
          disabled={isInvalid}
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#21442E] text-white font-semibold text-sm shadow-sm hover:bg-[#183423] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <span>Find where I can live</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
