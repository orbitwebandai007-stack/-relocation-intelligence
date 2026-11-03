import React, { useState } from 'react';
import { CityKey, RelocationState, WorkplaceHub } from '../types';
import { CITIES } from '../data/relocationData';
import {
  MapPin,
  Search,
  Building,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  Sparkles,
  Check,
} from 'lucide-react';

interface Step1LocationProps {
  state: RelocationState;
  onUpdateState: (updates: Partial<RelocationState>) => void;
  onNext: () => void;
}

export const Step1Location: React.FC<Step1LocationProps> = ({
  state,
  onUpdateState,
  onNext,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');

  const currentCityData = CITIES[state.city];

  const handleCitySelect = (cityKey: CityKey) => {
    const defaultHub = CITIES[cityKey].hubs[0];
    onUpdateState({
      city: cityKey,
      wp: {
        name: defaultHub[0],
        lat: defaultHub[1],
        lng: defaultHub[2],
      },
      sel: [],
      f: { ...state.f, q: '' },
    });
  };

  const handleHubSelect = (hub: [string, number, number]) => {
    onUpdateState({
      wp: {
        name: hub[0],
        lat: hub[1],
        lng: hub[2],
      },
      sel: [],
    });
  };

  const handleSearchLocality = (value: string) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchError('');
      return;
    }

    const allLocations = [
      ...currentCityData.hubs.map((h) => ({ name: h[0], lat: h[1], lng: h[2] })),
      ...currentCityData.areas.map((a) => ({ name: a[0], lat: a[1], lng: a[2] })),
    ];

    const match = allLocations.find(
      (loc) => loc.name.toLowerCase().includes(value.trim().toLowerCase())
    );

    if (match) {
      onUpdateState({
        wp: {
          name: match.name,
          lat: match.lat,
          lng: match.lng,
        },
        sel: [],
      });
      setSearchError('');
    } else {
      setSearchError('Locality not found in index. Pick from the curated employment centers below.');
    }
  };

  const commonOrigins = [
    'Mumbai',
    'Pune',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Delhi NCR',
    'Bengaluru',
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Step Header */}
      <div>
        <div className="text-xs font-mono font-semibold text-[#176B50] mb-1.5 flex items-center gap-1.5">
          <span>01</span>
          <span className="text-neutral-300">/</span>
          <span>LOCATION & EMPLOYMENT CENTER</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#18231E] font-heading tracking-tight">
          Where is your next opportunity located?
        </h2>
        <p className="mt-2 text-sm text-[#5F6A63] leading-relaxed">
          Commute duration is the primary determinant of relocation satisfaction in Indian tech hubs. Select your target city and office center to measure exact road travel times.
        </p>
      </div>

      {/* Relocating From */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
          Where are you moving from?
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 text-[#5F6A63] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={state.from}
              onChange={(e) => onUpdateState({ from: e.target.value })}
              placeholder="e.g. Mumbai, Hyderabad, Pune..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F9F7] border border-[#E5EAE5] rounded-xl text-sm font-medium text-[#18231E] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#176B50]/20 focus:border-[#176B50]"
            />
          </div>
        </div>

        {/* Quick Origin Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-[#5F6A63] mr-1">Popular origins:</span>
          {commonOrigins.map((orig) => (
            <button
              key={orig}
              type="button"
              onClick={() => onUpdateState({ from: orig })}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                state.from === orig
                  ? 'bg-[#176B50] text-white'
                  : 'bg-[#F8F9F7] text-[#5F6A63] hover:text-[#18231E] hover:bg-neutral-100 border border-[#E5EAE5]'
              }`}
            >
              {orig}
            </button>
          ))}
        </div>
      </div>

      {/* Target Destination City */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
          Destination City
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Bengaluru Card */}
          <div
            onClick={() => handleCitySelect('blr')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all duration-150 ${
              state.city === 'blr'
                ? 'border-[#176B50] bg-white ring-2 ring-[#176B50]/15 shadow-sm'
                : 'border-[#E5EAE5] bg-white hover:border-neutral-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading font-bold text-base text-[#18231E]">
                Bengaluru
              </h3>
              {state.city === 'blr' && (
                <div className="w-5 h-5 rounded-full bg-[#176B50] text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
              )}
            </div>
            <p className="text-xs text-[#5F6A63] leading-relaxed mb-4">
              India’s primary tech ecosystem. Heavy traffic corridors with higher upfront rental deposit norms (6–10 months).
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-[#E5EAE5]/80">
              <div>
                <span className="text-[10px] text-[#5F6A63] uppercase">Avg 2 BHK:</span>
                <div className="font-mono font-bold text-[#18231E]">₹32,000/mo</div>
              </div>
              <div>
                <span className="text-[10px] text-[#5F6A63] uppercase">Deposit Norm:</span>
                <div className="font-mono font-bold text-[#18231E]">6-10 Months</div>
              </div>
            </div>
          </div>

          {/* Delhi NCR Card */}
          <div
            onClick={() => handleCitySelect('ncr')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all duration-150 ${
              state.city === 'ncr'
                ? 'border-[#176B50] bg-white ring-2 ring-[#176B50]/15 shadow-sm'
                : 'border-[#E5EAE5] bg-white hover:border-neutral-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading font-bold text-base text-[#18231E]">
                Delhi NCR
              </h3>
              {state.city === 'ncr' && (
                <div className="w-5 h-5 rounded-full bg-[#176B50] text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
              )}
            </div>
            <p className="text-xs text-[#5F6A63] leading-relaxed mb-4">
              Gurugram, Noida & Delhi. Wide expressways, rapid metro access, with lower upfront deposits (2 months typical).
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-[#E5EAE5]/80">
              <div>
                <span className="text-[10px] text-[#5F6A63] uppercase">Avg 2 BHK:</span>
                <div className="font-mono font-bold text-[#18231E]">₹28,000/mo</div>
              </div>
              <div>
                <span className="text-[10px] text-[#5F6A63] uppercase">Deposit Norm:</span>
                <div className="font-mono font-bold text-[#18231E]">2-3 Months</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workplace Hub Selection */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5EAE5] shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6A63]">
            Select your employer's office hub in {currentCityData.name}
          </label>
          <p className="text-xs text-[#5F6A63] mt-1">
            Pick from major business parks or search for your specific campus.
          </p>
        </div>

        {/* Primary Hub Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {currentCityData.hubs.map((hub) => {
            const isSelected = state.wp?.name === hub[0];
            return (
              <button
                key={hub[0]}
                type="button"
                onClick={() => handleHubSelect(hub)}
                className={`p-3.5 rounded-xl border text-left transition-all duration-150 flex items-center justify-between ${
                  isSelected
                    ? 'border-[#176B50] bg-[#E8F4EF] text-[#176B50] shadow-xs ring-1 ring-[#176B50]'
                    : 'border-[#E5EAE5] bg-[#F8F9F7] text-[#18231E] hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Briefcase className="w-4 h-4 shrink-0 text-[#176B50]" />
                  <span className="text-xs font-semibold truncate">{hub[0]}</span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 stroke-[2.5] text-[#176B50] shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Locality Search */}
        <div className="pt-3 border-t border-[#E5EAE5] space-y-2">
          <label className="block text-xs font-semibold text-[#18231E]">
            Can't find your office above? Search any area:
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#5F6A63] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchLocality(e.target.value)}
              placeholder={`Search localities in ${currentCityData.name}...`}
              className="w-full pl-10 pr-4 py-2 bg-[#F8F9F7] border border-[#E5EAE5] rounded-xl text-xs font-medium text-[#18231E] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#176B50]/20 focus:border-[#176B50]"
            />
          </div>
          {searchError && (
            <p className="text-xs text-[#BE123C] font-medium">{searchError}</p>
          )}
        </div>

        {/* Active Workplace Confirmation */}
        {state.wp && (
          <div className="p-3.5 rounded-xl bg-[#E8F4EF] border border-[#176B50]/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#176B50]" />
              <span className="text-[#5F6A63]">Confirmed Workplace:</span>
              <span className="font-bold text-[#18231E]">{state.wp.name}</span>
            </div>
            <span className="text-[11px] font-mono text-[#176B50] font-semibold">
              Ready for commute matrix
            </span>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4">
        <div className="text-xs text-[#5F6A63]">
          Step 1 of 6 · Next: Income & Take-Home Salary
        </div>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold text-white bg-[#176B50] hover:bg-[#125740] shadow-sm transition-all duration-150 active:scale-[0.98]"
        >
          <span>Continue to Salary</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
