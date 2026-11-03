import React, { useState } from 'react';
import { CityKey, RelocationState, WorkplaceHub } from '../types';
import { CITIES } from '../data/relocationData';
import { MapPin, Search, Building, CheckCircle2, ArrowRight } from 'lucide-react';

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
      (loc) => loc.name.toLowerCase() === value.trim().toLowerCase()
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
      setSearchError('Locality not found in database — select from listed hubs or suggestions.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-1">
          01 · Opportunity & Work Hub
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#19241D] tracking-tight">
          Where is your next opportunity?
        </h2>
        <p className="mt-1 text-sm text-neutral-600 max-w-2xl">
          Let’s start with the city where you’ll be working. Pick your target city and employment center so we can measure commute and rent proximity accurately.
        </p>
      </div>

      {/* Relocating From (Origin City) */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E6DD] shadow-xs">
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
          Where are you moving from?
        </label>
        <div className="max-w-md flex items-center gap-2">
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={state.from}
              onChange={(e) => onUpdateState({ from: e.target.value })}
              placeholder="e.g. Lucknow, Pune, Kolkata, Hyderabad, Mumbai"
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-[#E2E6DD] rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#21442E]/20 focus:border-[#21442E]"
            />
          </div>
        </div>
      </div>

      {/* Destination City Selection */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
          Which city is your job in?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.keys(CITIES) as CityKey[]).map((cKey) => {
            const city = CITIES[cKey];
            const isSelected = state.city === cKey;
            return (
              <div
                key={cKey}
                onClick={() => handleCitySelect(cKey)}
                className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#21442E] bg-emerald-50/40 shadow-sm'
                    : 'border-[#E2E6DD] bg-white hover:border-neutral-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-neutral-900">
                      {city.name}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {city.areas.length} benchmarked neighbourhoods · {city.hubs.length} tech hubs
                    </p>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-[#21442E]" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-neutral-300" />
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {city.hubs.slice(0, 3).map((h) => (
                    <span
                      key={h[0]}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600"
                    >
                      {h[0]}
                    </span>
                  ))}
                  {city.hubs.length > 3 && (
                    <span className="text-[11px] font-medium px-1.5 py-0.5 text-neutral-400">
                      +{city.hubs.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workplace Hub Selector */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E6DD] shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
            Where is your workplace? Pick an employment hub
          </label>
          <p className="text-xs text-neutral-500 mb-3">
            Select the major commercial district or tech corridor closest to your new office.
          </p>
          <div className="flex flex-wrap gap-2">
            {currentCityData.hubs.map((hub) => {
              const isSelected = state.wp && state.wp.name === hub[0];
              return (
                <button
                  key={hub[0]}
                  type="button"
                  onClick={() => handleHubSelect(hub)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-[#21442E] text-white border-[#21442E] shadow-xs'
                      : 'bg-neutral-50 text-neutral-700 border-[#E2E6DD] hover:bg-neutral-100 hover:border-neutral-300'
                  }`}
                >
                  {hub[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Or Search Locality */}
        <div className="pt-4 border-t border-[#E2E6DD]">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
            …or search a specific office locality
          </label>
          <div className="max-w-md relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              list="localities-datalist"
              value={searchQuery}
              onChange={(e) => handleSearchLocality(e.target.value)}
              placeholder="e.g. Koramangala, Bellandur, Cyber City..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-[#E2E6DD] rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#21442E]/20 focus:border-[#21442E]"
            />
            <datalist id="localities-datalist">
              {currentCityData.areas.map((a) => (
                <option key={a[0]} value={a[0]} />
              ))}
            </datalist>
          </div>
          {searchError && (
            <p className="mt-1 text-xs text-amber-700">{searchError}</p>
          )}
          <p className="text-[11px] text-neutral-400 mt-1.5">
            Localities use curated geographic coordinates for accurate straight-line and route modeling.
          </p>
        </div>

        {/* Selected Hub Card */}
        {state.wp && (
          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#21442E] text-white flex items-center justify-center font-bold text-xs">
                HQ
              </div>
              <div>
                <div className="text-xs font-bold text-[#19241D]">
                  Selected Office Hub: {state.wp.name}
                </div>
                <div className="text-[11px] text-neutral-500 font-mono">
                  Coordinates: {state.wp.lat.toFixed(4)}° N, {state.wp.lng.toFixed(4)}° E
                </div>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full">
              Ready for commute analysis
            </span>
          </div>
        )}
      </div>

      {/* Continue Action */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          disabled={!state.wp}
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#21442E] text-white font-semibold text-sm shadow-sm hover:bg-[#183423] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <span>Continue to Salary</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
