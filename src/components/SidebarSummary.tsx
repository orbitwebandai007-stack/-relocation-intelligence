import React from 'react';
import { RelocationState } from '../types';
import {
  CITIES,
  LIFESTYLE_TIERS,
  PROPERTIES,
  formatINR,
  getTarget,
} from '../data/relocationData';
import { Building2, MapPin, Wallet, PiggyBank, Home, Bookmark } from 'lucide-react';

interface SidebarSummaryProps {
  state: RelocationState;
}

export const SidebarSummary: React.FC<SidebarSummaryProps> = ({ state }) => {
  const currentCity = CITIES[state.city];
  const targetSavings = getTarget(state);
  const availableBudget = state.sal - state.com - targetSavings;

  const shortlistedNames = state.sel
    .map((idx) => currentCity.areas[idx]?.[0])
    .filter(Boolean);

  return (
    <aside className="hidden lg:block w-80 shrink-0">
      <div className="sticky top-24 bg-white rounded-2xl border border-[#E2E6DD] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E6DD] pb-3">
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-neutral-500">
            Your Plan So Far
          </h3>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
            Live Estimate
          </span>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* City & Workplace */}
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-600 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Destination
              </div>
              <div className="font-bold text-neutral-900 text-sm">
                {currentCity.name}
              </div>
              <div className="text-neutral-500 text-[11px]">
                {state.wp ? `Office in ${state.wp.name}` : 'Workplace not picked'}
              </div>
            </div>
          </div>

          {/* Monthly Income & Available Budget */}
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 text-[#21442E] mt-0.5">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Take-Home Salary
              </div>
              <div className="font-bold text-neutral-900 text-sm">
                {formatINR(state.sal)}
                <span className="text-neutral-500 text-xs font-normal">/mo</span>
              </div>
              <div className="text-neutral-500 text-[11px]">
                {state.com > 0 ? `${formatINR(state.com)} commitments` : 'Zero debt/commitments'}
              </div>
            </div>
          </div>

          {/* Savings Target */}
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 text-amber-700 mt-0.5">
              <PiggyBank className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Target Savings
              </div>
              <div className="font-semibold text-neutral-900">
                {state.tm === 'target'
                  ? `${formatINR(state.tgt)}/mo`
                  : 'Calculate maximum'}
              </div>
              <div className="text-neutral-500 text-[11px]">
                Housing budget: ~{formatINR(Math.max(0, availableBudget))}/mo
              </div>
            </div>
          </div>

          {/* Accommodation & Lifestyle */}
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-600 mt-0.5">
              <Home className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Stay & Lifestyle
              </div>
              <div className="font-semibold text-neutral-900">
                {PROPERTIES[state.prop][0]}
              </div>
              <div className="text-neutral-500 text-[11px]">
                {LIFESTYLE_TIERS[state.life].label} · Max {state.maxc} min commute
              </div>
            </div>
          </div>

          {/* Shortlisted Localities */}
          <div className="flex items-start gap-2.5 pt-2 border-t border-[#E2E6DD]">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 text-blue-700 mt-0.5">
              <Bookmark className="w-3.5 h-3.5" />
            </div>
            <div className="w-full">
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex justify-between">
                <span>Shortlist</span>
                <span>{state.sel.length}/3</span>
              </div>
              {shortlistedNames.length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {shortlistedNames.map((name, i) => (
                    <li
                      key={i}
                      className="font-medium text-neutral-800 text-[11px] flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      <span>{name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-neutral-400 text-[11px] italic mt-0.5">
                  Top-ranked neighbourhood will be used automatically.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer snippet */}
        <div className="p-3 bg-neutral-50 rounded-xl text-[10px] text-neutral-500 leading-normal border border-[#E2E6DD]">
          <span className="font-semibold text-neutral-700">Prototype benchmark:</span> Figures are illustrative estimates for planning guidance.
        </div>
      </div>
    </aside>
  );
};
