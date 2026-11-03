import React from 'react';
import { RelocationState } from '../types';
import {
  CITIES,
  LIFESTYLE_TIERS,
  PROPERTIES,
  formatINR,
  getTarget,
} from '../data/relocationData';
import {
  MapPin,
  Wallet,
  PiggyBank,
  Home,
  Bookmark,
  Building,
  Compass,
} from 'lucide-react';

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
      <div className="sticky top-20 bg-white rounded-2xl border border-[#E5EAE5] p-5 shadow-xs space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5EAE5] pb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#176B50]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#18231E]">
              Plan Summary
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#176B50] bg-[#E8F4EF] px-2 py-0.5 rounded font-medium">
            Live
          </span>
        </div>

        {/* Content list */}
        <div className="space-y-4 text-xs">
          {/* Destination & Workplace */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#F8F9F7] border border-[#E5EAE5] flex items-center justify-center shrink-0 text-[#176B50] mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                Target City
              </div>
              <div className="font-bold text-[#18231E] text-sm truncate">
                {currentCity.name}
              </div>
              <div className="text-[#5F6A63] text-[11px] truncate mt-0.5">
                {state.wp ? `Office: ${state.wp.name}` : 'Select workplace hub'}
              </div>
            </div>
          </div>

          {/* Monthly Salary */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#E8F4EF] flex items-center justify-center shrink-0 text-[#176B50] mt-0.5">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                In-Hand Cashflow
              </div>
              <div className="font-bold text-[#18231E] text-sm font-mono">
                {formatINR(state.sal)}
                <span className="text-[#5F6A63] text-xs font-normal">/mo</span>
              </div>
              <div className="text-[#5F6A63] text-[11px] mt-0.5">
                {state.com > 0
                  ? `${formatINR(state.com)} fixed debt/commitments`
                  : 'Zero existing debt'}
              </div>
            </div>
          </div>

          {/* Target Savings */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#F8F9F7] border border-[#E5EAE5] flex items-center justify-center shrink-0 text-[#B45309] mt-0.5">
              <PiggyBank className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                Target Savings
              </div>
              <div className="font-semibold text-[#18231E] font-mono">
                {state.tm === 'target'
                  ? `${formatINR(state.tgt)}/mo`
                  : 'Maximize surplus'}
              </div>
              <div className="text-[#5F6A63] text-[11px] mt-0.5">
                Max housing budget: ~{formatINR(Math.max(0, availableBudget))}/mo
              </div>
            </div>
          </div>

          {/* Lifestyle configuration */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#F8F9F7] border border-[#E5EAE5] flex items-center justify-center shrink-0 text-[#18231E] mt-0.5">
              <Home className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                Accommodation & Living
              </div>
              <div className="font-semibold text-[#18231E] truncate">
                {PROPERTIES[state.prop]?.[0] || '1 BHK'}
              </div>
              <div className="text-[#5F6A63] text-[11px] mt-0.5">
                {LIFESTYLE_TIERS[state.life]?.label || 'Moderate'} tier lifestyle
              </div>
            </div>
          </div>

          {/* Shortlisted Localities */}
          {shortlistedNames.length > 0 && (
            <div className="pt-3 border-t border-[#E5EAE5]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63]">
                  Shortlisted ({shortlistedNames.length}/3)
                </span>
                <Bookmark className="w-3.5 h-3.5 text-[#176B50]" />
              </div>
              <div className="space-y-1.5">
                {shortlistedNames.map((name) => (
                  <div
                    key={name}
                    className="p-2 rounded-lg bg-[#F8F9F7] border border-[#E5EAE5] text-xs font-medium text-[#18231E] flex items-center justify-between"
                  >
                    <span className="truncate">{name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#176B50]" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
