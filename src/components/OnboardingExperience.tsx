import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  ArrowRight,
  Briefcase,
  Search,
  Check,
  Building,
  Sparkles,
  ArrowLeft,
  Navigation,
  Compass,
} from 'lucide-react';
import { CityKey, WorkplaceHub, RelocationState } from '../types';
import { CITIES, formatINR } from '../data/relocationData';

interface OnboardingExperienceProps {
  state: RelocationState;
  candidateWp: WorkplaceHub | null;
  onSelectCandidateWp: (wp: WorkplaceHub) => void;
  onUpdateState: (updates: Partial<RelocationState>) => void;
  onExploreMove: (fromCity: string, destCity: CityKey, annualLpa: number, monthlySal: number) => void;
  onConfirmWorkplace: () => void;
  onBackToOnboarding: () => void;
}

// Estimate realistic Indian post-tax in-hand monthly salary based on CTC LPA under New Tax Regime
export const lpaToMonthlyInHand = (lpa: number): number => {
  if (lpa <= 0) return 0;
  if (lpa <= 3) return Math.round((lpa * 100000) / 12);
  if (lpa <= 7) return Math.round((lpa * 100000 * 0.96) / 12);
  if (lpa <= 12) return Math.round((lpa * 100000 * 0.88) / 12);
  if (lpa <= 15) return Math.round((lpa * 100000 * 0.82) / 12);
  if (lpa <= 25) return Math.round((lpa * 100000 * 0.77) / 12);
  if (lpa <= 40) return Math.round((lpa * 100000 * 0.72) / 12);
  return Math.round((lpa * 100000 * 0.68) / 12);
};

export const OnboardingExperience: React.FC<OnboardingExperienceProps> = ({
  state,
  candidateWp,
  onSelectCandidateWp,
  onUpdateState,
  onExploreMove,
  onConfirmWorkplace,
  onBackToOnboarding,
}) => {
  const currentPhase = state.flowPhase || 'onboarding';

  // Phase 1 Local Form State
  const [fromCity, setFromCity] = useState(state.from || 'Lucknow');
  const [destCity, setDestCity] = useState<CityKey>(state.city || 'blr');
  const [lpa, setLpa] = useState<number>(state.annualLpa || 18);
  const [customMonthly, setCustomMonthly] = useState<number>(state.sal || 115000);
  const [isEditingMonthly, setIsEditingMonthly] = useState(false);
  const [formError, setFormError] = useState('');

  // Synchronize when a new journey starts or state is reset
  useEffect(() => {
    setFromCity(state.from || 'Lucknow');
    setDestCity(state.city || 'blr');
    setLpa(state.annualLpa || 18);
    setCustomMonthly(state.sal || 115000);
    setIsEditingMonthly(false);
    setFormError('');
  }, [state.journeyStartedAt, state.from, state.city, state.annualLpa, state.sal]);

  // Phase 2 Workplace Search State
  const [workplaceSearch, setWorkplaceSearch] = useState('');
  const [workplaceError, setWorkplaceError] = useState('');

  const destCityData = CITIES[destCity] || CITIES.blr;

  const handleLpaChange = (value: number) => {
    const safeLpa = Math.max(0, value);
    setLpa(safeLpa);
    if (!isEditingMonthly) {
      setCustomMonthly(lpaToMonthlyInHand(safeLpa));
    }
  };

  const handleExploreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromCity.trim()) {
      setFormError('Please enter your current city of residence.');
      return;
    }
    if (lpa <= 0 && customMonthly <= 0) {
      setFormError('Please enter your expected annual compensation.');
      return;
    }
    setFormError('');
    const finalMonthly = isEditingMonthly ? customMonthly : lpaToMonthlyInHand(lpa);
    onExploreMove(fromCity.trim(), destCity, lpa, finalMonthly);
  };

  const handleSearchWorkplace = (query: string) => {
    setWorkplaceSearch(query);
    if (!query.trim()) {
      setWorkplaceError('');
      return;
    }
    const qLower = query.toLowerCase().trim();
    // Search hubs and localities in destination city
    const allCandidates = [
      ...destCityData.hubs.map((h) => ({ name: h[0], lat: h[1], lng: h[2] })),
      ...destCityData.areas.map((a) => ({ name: a[0], lat: a[1], lng: a[2] })),
    ];
    const match = allCandidates.find((c) => c.name.toLowerCase().includes(qLower));
    if (match) {
      onSelectCandidateWp({
        name: match.name,
        lat: match.lat,
        lng: match.lng,
      });
      setWorkplaceError('');
    } else {
      setWorkplaceError('Corridor not in indexed hubs. Pick from the curated employment clusters below or click the map.');
    }
  };

  const popularOrigins = ['Lucknow', 'Pune', 'Kolkata', 'Jaipur', 'Indore', 'Ahmedabad', 'Chandigarh'];

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center p-4 sm:p-6">
      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* PHASE 1: ELEGANT CENTERED ONBOARDING CARD                                 */}
        {/* ========================================================================= */}
        {currentPhase === 'onboarding' && (
          <motion.div
            key="onboarding-card"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-2xl border border-[#E5EAE5] shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-6 sm:p-8 space-y-6"
          >
            {/* Card Header */}
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F4EF] text-[#176B50] text-[10px] font-bold uppercase tracking-wider font-mono">
                <Compass className="w-3 h-3 text-[#176B50]" />
                <span>Decision Intelligence</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#18231E] tracking-tight">
                Analyse your next career move.
              </h1>
              <p className="text-xs sm:text-sm text-[#5F6A63] leading-relaxed">
                Understand the financial impact of relocating for your next opportunity.
              </p>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleExploreSubmit} className="space-y-4">
              {/* Field 1: Moving from */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#5F6A63] flex items-center justify-between">
                  <span>Moving from:</span>
                  <span className="text-[10px] font-normal text-neutral-400">Current residence</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#5F6A63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                    placeholder="e.g. Lucknow, Pune, Kolkata..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8F9F7] border border-[#E5EAE5] rounded-xl text-sm font-semibold text-[#18231E] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#176B50]/20 focus:border-[#176B50]"
                  />
                </div>
                {/* Popular Origin Suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-[#5F6A63]">Quick select:</span>
                  {popularOrigins.slice(0, 5).map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setFromCity(city)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                        fromCity.toLowerCase() === city.toLowerCase()
                          ? 'bg-[#176B50] text-white'
                          : 'bg-[#F8F9F7] hover:bg-[#EAEFEA] text-[#5F6A63] border border-[#E5EAE5]'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 2: Moving to */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#5F6A63] flex items-center justify-between">
                  <span>Moving to:</span>
                  <span className="text-[10px] font-normal text-neutral-400">Target city</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#5F6A63] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={destCity}
                    onChange={(e) => setDestCity(e.target.value as CityKey)}
                    className="w-full pl-10 pr-8 py-2.5 bg-[#F8F9F7] border border-[#E5EAE5] rounded-xl text-sm font-semibold text-[#18231E] focus:outline-none focus:ring-2 focus:ring-[#176B50]/20 focus:border-[#176B50] appearance-none cursor-pointer"
                  >
                    {Object.entries(CITIES).map(([key, data]) => (
                      <option key={key} value={key}>
                        {data.name} · {data.stateName}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[#5F6A63]">
                    ▼
                  </div>
                </div>
              </div>

              {/* Field 3: Expected annual salary */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#5F6A63]">
                    Expected annual salary:
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsEditingMonthly(!isEditingMonthly)}
                    className="text-[10px] font-semibold text-[#176B50] hover:underline"
                  >
                    {isEditingMonthly ? 'Switch to LPA' : 'Custom Monthly In-Hand'}
                  </button>
                </div>

                {!isEditingMonthly ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold font-mono text-[#5F6A63]">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="3"
                        max="150"
                        step="0.5"
                        value={lpa}
                        onChange={(e) => handleLpaChange(Number(e.target.value))}
                        className="w-full pl-9 pr-14 py-2.5 bg-[#F8F9F7] border border-[#E5EAE5] rounded-xl text-sm font-bold font-mono text-[#18231E] focus:outline-none focus:ring-2 focus:ring-[#176B50]/20 focus:border-[#176B50]"
                        placeholder="18"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-[#5F6A63]">
                        LPA
                      </span>
                    </div>

                    {/* Calculated monthly in-hand helper */}
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#E8F4EF]/60 border border-[#176B50]/20 text-xs">
                      <span className="text-[#5F6A63]">Estimated monthly in-hand (post-tax):</span>
                      <span className="font-mono font-bold text-[#176B50]">
                        ≈ {formatINR(lpaToMonthlyInHand(lpa))}/mo
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold font-mono text-[#5F6A63]">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="15000"
                        step="2500"
                        value={customMonthly}
                        onChange={(e) => setCustomMonthly(Math.max(0, Number(e.target.value)))}
                        className="w-full pl-9 pr-16 py-2.5 bg-[#F8F9F7] border border-[#E5EAE5] rounded-xl text-sm font-bold font-mono text-[#18231E] focus:outline-none focus:ring-2 focus:ring-[#176B50]/20 focus:border-[#176B50]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#5F6A63]">
                        /month
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Primary CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#176B50] hover:bg-[#125740] active:scale-[0.99] text-white text-sm font-bold shadow-[0_4px_16px_rgba(23,107,80,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Explore my move</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 2: CONTEXTUAL FLOATING WORKPLACE SELECTION CARD                     */}
        {/* ========================================================================= */}
        {currentPhase === 'workplace_select' && (
          <motion.div
            key="workplace-card"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto w-full max-w-xl bg-white/95 backdrop-blur-xl rounded-2xl border border-[#E5EAE5] shadow-[0_20px_50px_rgba(0,0,0,0.14)] p-6 sm:p-7 space-y-5 my-auto max-h-[90vh] overflow-y-auto scrollbar-thin"
          >
            {/* Top Navigation & Step Indicator */}
            <div className="flex items-center justify-between pb-1 border-b border-[#E5EAE5]">
              <button
                type="button"
                onClick={onBackToOnboarding}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5F6A63] hover:text-[#18231E] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to parameters</span>
              </button>

              <div className="text-[11px] font-mono font-bold text-[#176B50] uppercase">
                {destCityData.name} · Workplace Pinning
              </div>
            </div>

            {/* Heading & Instructions */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#18231E] tracking-tight">
                Where will you be working?
              </h2>
              <p className="text-xs sm:text-sm text-[#5F6A63] leading-relaxed">
                Select your office location to discover neighbourhoods that fit your budget and commute preferences.
              </p>
            </div>

            {/* Selected Office Confirmation Banner */}
            {candidateWp ? (
              <div className="p-3.5 rounded-xl bg-[#E8F4EF] border border-[#176B50]/30 flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#176B50] text-[#C8E6A0] flex items-center justify-center shrink-0">
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase text-[#176B50] font-bold block">
                      Target Workplace Pin
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-[#18231E] truncate">
                      {candidateWp.name}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-[#176B50]">
                  <Check className="w-4 h-4" />
                  <span>Pinned</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2">
                <Navigation className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Click any major employment hub below, or click directly on the map to drop a pin.</span>
              </div>
            )}

            {/* Search Input for Corridor */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#5F6A63]">
                Search office address or IT corridor
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-[#5F6A63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={workplaceSearch}
                  onChange={(e) => handleSearchWorkplace(e.target.value)}
                  placeholder={`Search office hubs in ${destCityData.name}...`}
                  className="w-full pl-10 pr-4 py-2 bg-[#F8F9F7] border border-[#E5EAE5] rounded-xl text-xs sm:text-sm font-medium text-[#18231E] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#176B50]/20 focus:border-[#176B50]"
                />
              </div>
              {workplaceError && (
                <p className="text-[11px] text-amber-700 pt-0.5">{workplaceError}</p>
              )}
            </div>

            {/* Curated Employment Hub Chips */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#5F6A63] block">
                Popular tech corridors in {destCityData.name}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {destCityData.hubs.map((hub) => {
                  const isSelected = candidateWp?.name === hub[0];
                  return (
                    <button
                      key={hub[0]}
                      type="button"
                      onClick={() => {
                        onSelectCandidateWp({
                          name: hub[0],
                          lat: hub[1],
                          lng: hub[2],
                        });
                        setWorkplaceSearch('');
                        setWorkplaceError('');
                      }}
                      className={`text-left p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#176B50] text-white border-[#176B50] shadow-sm'
                          : 'bg-[#F8F9F7] text-[#18231E] border-[#E5EAE5] hover:border-[#176B50]/40 hover:bg-white'
                      }`}
                    >
                      <span className="truncate">{hub[0]}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-[#C8E6A0] shrink-0" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-[#5F6A63] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Map Click Hint */}
            <div className="text-[11px] text-[#5F6A63] flex items-center gap-1.5 pt-1">
              <span className="w-2 h-2 rounded-full bg-[#176B50]"></span>
              <span>Tip: You can also click anywhere on the background map to place a custom office pin.</span>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={!candidateWp}
                onClick={onConfirmWorkplace}
                className={`w-full py-3.5 px-6 rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                  candidateWp
                    ? 'bg-[#176B50] hover:bg-[#125740] text-white active:scale-[0.99] cursor-pointer'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
                }`}
              >
                <span>Confirm Workplace Location</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
