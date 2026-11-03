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
  formatINR,
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
  Coffee,
  ShoppingBag,
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
    <div className="space-y-8 max-w-3xl">
      {/* Step Header */}
      <div>
        <div className="text-xs font-mono font-semibold text-[#176B50] mb-1.5 flex items-center gap-1.5">
          <span>04</span>
          <span className="text-neutral-300">/</span>
          <span>LIFESTYLE, HOUSING & LIVING EXPENSES</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#18231E] font-heading tracking-tight">
          How do you prefer to live?
        </h2>
        <p className="mt-2 text-sm text-[#5F6A63] leading-relaxed">
          Cost of living varies dramatically based on housing privacy, cooking habits, and daily commute mode. Fine-tune your preferences for realistic expenditure projections.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Accommodation Format */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
            1. Accommodation Structure
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
                      ? 'border-[#176B50] bg-[#E8F4EF] text-[#176B50] shadow-xs ring-1 ring-[#176B50]'
                      : 'border-[#E5EAE5] bg-[#F8F9F7] text-[#18231E] hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider">
                      {ACCOMMODATIONS[accKey]}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                  </div>
                  <p className="text-xs text-[#5F6A63] mt-1">
                    {accKey === 'alone'
                      ? 'Complete privacy in an independent 1 or 2 BHK.'
                      : accKey === 'share'
                      ? 'Private bedroom in a shared 2-3 BHK society flat.'
                      : 'Managed PG / co-living with meals & Wi-Fi included.'}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Specific Property Subtype */}
          <div className="pt-3 border-t border-[#E5EAE5] space-y-2">
            <label className="block text-xs font-semibold text-[#18231E]">
              Specific Property Configuration:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {matchingProperties.map((propKey) => {
                const isSelected = state.prop === propKey;
                const [label] = PROPERTIES[propKey];
                return (
                  <button
                    key={propKey}
                    type="button"
                    onClick={() => onUpdateState({ prop: propKey, ov: {} })}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      isSelected
                        ? 'border-[#176B50] bg-[#176B50] text-white shadow-xs'
                        : 'border-[#E5EAE5] bg-[#F8F9F7] text-[#5F6A63] hover:text-[#18231E] hover:bg-neutral-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Food & Dining Habits */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
            2. Dining & Groceries Routine
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(FOOD_HABITS) as FoodHabit[]).map((fKey) => {
              const isSelected = state.food === fKey;
              const habitLabel = FOOD_HABITS[fKey];
              return (
                <button
                  key={fKey}
                  type="button"
                  onClick={() => onUpdateState({ food: fKey, ov: {} })}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#176B50] bg-[#E8F4EF] text-[#176B50] shadow-xs ring-1 ring-[#176B50]'
                      : 'border-[#E5EAE5] bg-[#F8F9F7] text-[#18231E] hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider">
                      {habitLabel}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                  </div>
                  <p className="text-xs text-[#5F6A63] mt-1">
                    {fKey === 'cook'
                      ? 'Daily home meals with grocery deliveries & occasional dining.'
                      : fKey === 'mix'
                      ? 'Home breakfast & dinner, workday cafeterias & weekend delivery.'
                      : 'Frequent Zomato/Swiggy orders, cafes, and socializing.'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Daily Commute Mode */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
            3. Daily Work Commute Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {(Object.keys(TRANSPORT_MODES) as TransportMode[]).map((tKey) => {
              const isSelected = state.tr === tKey;
              const modeLabel = TRANSPORT_MODES[tKey];
              return (
                <button
                  key={tKey}
                  type="button"
                  onClick={() => onUpdateState({ tr: tKey, ov: {} })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#176B50] bg-[#E8F4EF] text-[#176B50] shadow-xs ring-1 ring-[#176B50]'
                      : 'border-[#E5EAE5] bg-[#F8F9F7] text-[#18231E] hover:bg-neutral-100'
                  }`}
                >
                  <div className="font-bold text-xs">{modeLabel}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Lifestyle & Discretionary Tier */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
            4. Discretionary Spending & Leisure Tier
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(LIFESTYLE_TIERS) as LifestyleTier[]).map((tierKey) => {
              const isSelected = state.life === tierKey;
              const tier = LIFESTYLE_TIERS[tierKey];
              return (
                <button
                  key={tierKey}
                  type="button"
                  onClick={() => onUpdateState({ life: tierKey, ov: {} })}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#176B50] bg-[#E8F4EF] text-[#176B50] shadow-xs ring-1 ring-[#176B50]'
                      : 'border-[#E5EAE5] bg-[#F8F9F7] text-[#18231E] hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider">
                      {tier.label}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                  </div>
                  <p className="text-xs text-[#5F6A63] mt-1">
                    {tier.desc}
                  </p>
                </button>
              );
            })}
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
          <span>Back to Neighbourhoods</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold text-white bg-[#176B50] hover:bg-[#125740] shadow-sm transition-all duration-150 active:scale-[0.98]"
        >
          <span>View Budget & Scenario Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
