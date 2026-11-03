import React from 'react';
import {
  AccommodationType,
  FoodHabit,
  LifestyleTier,
  PropertyType,
  RelocationState,
  TransportMode,
} from '../types';
import {
  ACCOMMODATIONS,
  FOOD_HABITS,
  LIFESTYLE_TIERS,
  PROPERTIES,
  TRANSPORT_MODES,
} from '../data/relocationData';
import {
  Home,
  Utensils,
  Car,
  Sparkles,
  Clock,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';

interface Step4LifestyleProps {
  state: RelocationState;
  onUpdateState: (updates: Partial<RelocationState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step4Lifestyle: React.FC<Step4LifestyleProps> = ({
  state,
  onUpdateState,
  onNext,
  onBack,
}) => {
  // When accommodation changes, set appropriate default property
  const handleAccommodationChange = (acc: AccommodationType) => {
    const defaultProp: Record<AccommodationType, PropertyType> = {
      alone: 'b1',
      share: 'pr',
      pg: 'pg1',
    };
    onUpdateState({
      acc,
      prop: defaultProp[acc],
      ov: {},
    });
  };

  // Property types filtered by current accommodation
  const matchingProperties = (
    Object.keys(PROPERTIES) as PropertyType[]
  ).filter((p) => PROPERTIES[p][1] === state.acc);

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-1">
          04 · Accommodation & Daily Habits
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#19241D] tracking-tight">
          Let’s understand your lifestyle.
        </h2>
        <p className="mt-1 text-sm text-neutral-600 max-w-2xl">
          Your cost of living isn’t just rent — groceries, social dining, commute mode, and comfort standards shape your real monthly outflow.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Accommodation Category */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E6DD] shadow-xs space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Where do you plan to stay?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(ACCOMMODATIONS) as AccommodationType[]).map((accKey) => {
              const isSelected = state.acc === accKey;
              return (
                <button
                  key={accKey}
                  type="button"
                  onClick={() => handleAccommodationChange(accKey)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#21442E] bg-emerald-50/50 shadow-xs ring-1 ring-[#21442E]'
                      : 'border-[#E2E6DD] bg-neutral-50 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900">
                      {ACCOMMODATIONS[accKey]}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#21442E] text-white flex items-center justify-center text-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Unit / Property Type Options */}
          <div className="pt-4 border-t border-[#E2E6DD]">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
              Specific property setup
            </label>
            <div className="flex flex-wrap gap-2">
              {matchingProperties.map((propKey) => {
                const isSelected = state.prop === propKey;
                return (
                  <button
                    key={propKey}
                    type="button"
                    onClick={() =>
                      onUpdateState({ prop: propKey, ov: {} })
                    }
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-[#21442E] text-white border-[#21442E] shadow-xs'
                        : 'bg-white text-neutral-700 border-[#E2E6DD] hover:bg-neutral-50'
                    }`}
                  >
                    {PROPERTIES[propKey][0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Food & Dining Habits */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E6DD] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-800" />
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              How do you usually eat?
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(FOOD_HABITS) as FoodHabit[]).map((fKey) => {
              const isSelected = state.food === fKey;
              return (
                <button
                  key={fKey}
                  type="button"
                  onClick={() => onUpdateState({ food: fKey, ov: {} })}
                  className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-[#21442E] bg-emerald-50/50 text-[#19241D] ring-1 ring-[#21442E]'
                      : 'border-[#E2E6DD] bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {FOOD_HABITS[fKey]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Daily Commute Transport Mode */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E6DD] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-emerald-800" />
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              How will you commute to the office?
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TRANSPORT_MODES) as TransportMode[]).map((tKey) => {
              const isSelected = state.tr === tKey;
              return (
                <button
                  key={tKey}
                  type="button"
                  onClick={() => onUpdateState({ tr: tKey, ov: {} })}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-[#21442E] text-white border-[#21442E] shadow-xs'
                      : 'bg-neutral-50 text-neutral-700 border-[#E2E6DD] hover:bg-neutral-100'
                  }`}
                >
                  {TRANSPORT_MODES[tKey]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Lifestyle Tier (Comfort Standard) */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E6DD] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-800" />
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Overall Lifestyle Tier
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(LIFESTYLE_TIERS) as LifestyleTier[]).map((lKey) => {
              const tier = LIFESTYLE_TIERS[lKey];
              const isSelected = state.life === lKey;
              return (
                <button
                  key={lKey}
                  type="button"
                  onClick={() => onUpdateState({ life: lKey, ov: {} })}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#21442E] bg-emerald-50/50 shadow-xs ring-1 ring-[#21442E]'
                      : 'border-[#E2E6DD] bg-neutral-50 hover:bg-neutral-100'
                  }`}
                >
                  <div className="font-bold text-sm text-neutral-900">
                    {tier.label}
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    {tier.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Max Acceptable Commute */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E6DD] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-800" />
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Maximum acceptable one-way commute duration
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {[15, 30, 45, 60].map((mins) => {
              const isSelected = state.maxc === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => onUpdateState({ maxc: mins })}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-[#21442E] text-white border-[#21442E] shadow-xs'
                      : 'bg-neutral-50 text-neutral-700 border-[#E2E6DD] hover:bg-neutral-100'
                  }`}
                >
                  {mins} mins
                </button>
              );
            })}
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
          <span>Calculate my monthly expenses</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
