import React from 'react';
import { Compass, RotateCcw, Home, Sparkles } from 'lucide-react';
import { CITIES } from '../data/relocationData';
import { CityKey, WorkplaceHub } from '../types';

interface HeaderProps {
  fromCity: string;
  city: CityKey;
  workplace: WorkplaceHub | null;
  currentStep: number;
  isLanding: boolean;
  onGoLanding: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  fromCity,
  city,
  workplace,
  currentStep,
  isLanding,
  onGoLanding,
  onReset,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F8F9F5]/90 backdrop-blur-md border-b border-[#E2E6DD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={onGoLanding}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#21442E] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-base tracking-tight text-[#1A251E]">
                Relocation Intelligence
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                PRO
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              Data-backed relocation & affordability modeling
            </p>
          </div>
        </div>

        {/* Dynamic Context / Breadcrumb */}
        {!isLanding && (
          <div className="hidden md:flex items-center gap-2 text-xs text-neutral-600 bg-white px-3 py-1.5 rounded-full border border-[#E2E6DD] shadow-xs">
            <span className="text-neutral-400 font-medium">{fromCity}</span>
            <span className="text-neutral-300">→</span>
            <span className="font-semibold text-neutral-900">
              {CITIES[city].name}
            </span>
            {workplace && (
              <>
                <span className="text-neutral-300">·</span>
                <span className="text-neutral-600">Office: {workplace.name}</span>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!isLanding && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80 transition-colors"
              title="Reset plan to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {!isLanding && (
            <button
              onClick={onGoLanding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#E2E6DD] text-neutral-800 hover:bg-neutral-50 shadow-xs transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
