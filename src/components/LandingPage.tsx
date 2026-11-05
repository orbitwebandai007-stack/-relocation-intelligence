import React, { useState } from 'react';
import { RelocationState } from '../types';
import {
  CITIES,
  formatINR,
  estimateExpenses,
} from '../data/relocationData';
import {
  ArrowRight,
  MapPin,
  Building2,
  TrendingUp,
  Compass,
  CheckCircle,
  Car,
  Clock,
  Sparkles,
  ShieldCheck,
  Calculator,
  Layers,
  ArrowUpRight,
  Percent,
  Check,
  ChevronRight,
  Navigation,
} from 'lucide-react';
import {
  ChamferCard,
  DotGlyph,
  TechWindow,
  DepositLockIsometric,
  CommuteVelocityIsometric,
  PurchasingPowerIsometric,
  HubBaselineIsometric,
  RoutingMatrixIsometric,
  ExecutiveReportIsometric,
  CompensationAuditIsometric,
} from './TechCard';

interface LandingPageProps {
  state: RelocationState;
  hasUnfinishedPlan?: boolean;
  onStartNewPlan?: () => void;
  onResumePlan?: () => void;
  onStartPlanning?: () => void;
  onResumePlanning?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  state,
  hasUnfinishedPlan = false,
  onStartNewPlan,
  onResumePlan,
  onStartPlanning,
  onResumePlanning,
}) => {
  const handleStartNew = onStartNewPlan || onStartPlanning || (() => {});
  const handleResume = onResumePlan || onResumePlanning || (() => {});
  const [selectedCityTab, setSelectedCityTab] = useState<'blr' | 'ncr'>('blr');

  // Interactive showcase areas for Bengaluru & Delhi NCR
  const showcaseAreas = {
    blr: [
      {
        name: 'Indiranagar',
        hub: 'MG Road (12 min)',
        rent1BHK: '₹28,000',
        rent2BHK: '₹44,000',
        vibe: 'Walkable, tree-lined, social hubs, 100ft Rd cafes & metro access',
        commuteScore: 92,
      },
      {
        name: 'HSR Layout',
        hub: 'ORR & Bellandur (18 min)',
        rent1BHK: '₹22,000',
        rent2BHK: '₹36,000',
        vibe: 'Startup corridor, peaceful sectors, parks & quick ORR campus transit',
        commuteScore: 95,
      },
      {
        name: 'Whitefield',
        hub: 'ITPL & Outer Ring Road (15 min)',
        rent1BHK: '₹16,000',
        rent2BHK: '₹28,000',
        vibe: 'Gated high-rises, international schools & purple line metro connectivity',
        commuteScore: 88,
      },
      {
        name: 'Bellandur',
        hub: 'EcoSpace & RMZ Ecoworld (10 min)',
        rent1BHK: '₹20,000',
        rent2BHK: '₹34,000',
        vibe: 'Immediate proximity to major tech campuses on the tech ring road',
        commuteScore: 90,
      },
    ],
    ncr: [
      {
        name: 'Cyber City · Gurugram',
        hub: 'DLF CyberHub & Udyog Vihar (8 min)',
        rent1BHK: '₹26,000',
        rent2BHK: '₹42,000',
        vibe: 'Rapid Metro, corporate headquarters, luxury towers & nightlife',
        commuteScore: 94,
      },
      {
        name: 'Golf Course Road · Gurugram',
        hub: 'Cyber City (14 min)',
        rent1BHK: '₹32,000',
        rent2BHK: '₹55,000',
        vibe: 'Ultra-prime residential, wide boulevards & premium club amenities',
        commuteScore: 91,
      },
      {
        name: 'Sector 62 · Noida',
        hub: 'Noida IT Hub & Sector 18 (12 min)',
        rent1BHK: '₹14,000',
        rent2BHK: '₹24,000',
        vibe: 'Organized sectors, blue line metro & affordable gated towers',
        commuteScore: 89,
      },
      {
        name: 'Saket · South Delhi',
        hub: 'Connaught Place & Aerocity (22 min)',
        rent1BHK: '₹24,000',
        rent2BHK: '₹38,000',
        vibe: 'Green enclaves, Yellow Line metro, heritage & premier malls',
        commuteScore: 87,
      },
    ],
  };

  return (
    <div className="space-y-20 sm:space-y-28 lg:space-y-36">
      {/* 1. ARCHITECTURAL TECH HERO SECTION MATCHING SPEC CARDS & REFERENCE */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-5rem)] flex flex-col justify-center py-6 sm:py-8 lg:py-10">
        {/* ChamferCard Tech Container */}
        <ChamferCard
          notchSize={28}
          className="w-full shadow-xs hover:shadow-md transition-shadow"
          innerClassName="p-6 sm:p-8 lg:p-10 flex flex-col justify-between h-full w-full"
        >
          {/* Tech Card Spec Header (matching other sections) */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E5EAE5]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#176B50] animate-pulse" />
              <span className="font-mono text-xs font-bold tracking-wider text-[#18231E] uppercase">
                WORTHWHILE SPEC: RELOCATION INTELLIGENCE // 06 METRO HUBS
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline font-mono text-[10px] text-[#5F6A63] uppercase tracking-wider">
                SYS_VER 3.4 // LIVE MODEL
              </span>
              <DotGlyph type="reticle" className="w-4 h-4 text-[#18231E]" />
            </div>
          </div>

          {/* 2-Column Responsive Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* LEFT COLUMN: Headline, Mission Copy, Actions, Route Capsule */}
            <div className="lg:col-span-7 space-y-6 z-10">
              {/* Subtle Domain Kicker */}
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-[#176B50]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#176B50]" />
                <span>WORTHWHILE // RELOCATION INTELLIGENCE</span>
              </div>

              {/* Display Headline matching reference bold uppercase rhythm */}
              <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight text-[#18231E] font-heading leading-[1.12] text-balance uppercase">
                FOCUS ON YOUR CAREER, WE'LL HANDLE YOUR CITY MOVE.
              </h1>

              {/* Mission / Context Paragraph matching reference founder intro style */}
              <p className="text-sm sm:text-base text-[#47544C] leading-relaxed max-w-xl font-normal">
                Hi, we built <strong className="font-semibold text-[#18231E]">Worthwhile</strong> so Indian tech professionals never get trapped by the annual CTC illusion. Our engine calculates real in-hand salary, hidden rental deposit locks, peak traffic commute corridors, and true monthly savings across 6 major Indian tech hubs before you sign the offer.
              </p>

              {/* Action Buttons: Start Relocation Plan & Resume Plan - Guaranteed no clipping or overflow */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Primary Button */}
                  <button
                    type="button"
                    onClick={handleStartNew}
                    className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#18231E] hover:bg-[#176B50] shadow-xs hover:shadow-md transition-all active:scale-[0.98] text-center whitespace-nowrap cursor-pointer inline-flex items-center gap-2.5"
                  >
                    <span>Start Relocation Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Secondary Button */}
                  {hasUnfinishedPlan && (
                    <button
                      type="button"
                      onClick={handleResume}
                      className="px-5 py-3.5 rounded-xl text-xs sm:text-sm font-semibold text-[#18231E] bg-white border border-[#18231E]/25 hover:border-[#176B50] hover:bg-[#F8F9F7] transition-all text-center whitespace-nowrap shadow-2xs active:scale-[0.98] cursor-pointer inline-flex items-center gap-2 group"
                      title="Resume your unfinished relocation plan where you left off"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#176B50] animate-pulse shrink-0" />
                      <span>Resume Plan</span>
                      <span className="text-[10px] font-mono font-medium text-[#176B50] bg-[#176B50]/10 px-2 py-0.5 rounded-md group-hover:bg-[#176B50]/15 transition-colors">
                        {state.flowPhase === "workplace_select"
                          ? "Stage 2"
                          : state.flowPhase === "onboarding"
                          ? "Stage 1"
                          : `Stage ${state.st + 1}`}
                      </span>
                    </button>
                  )}
                </div>

                {/* Micro-copy matching reference ("No credit card required") */}
                <div className="text-[11px] font-medium text-[#5F6A63] flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>Free for Indian tech professionals</span>
                  <span>·</span>
                  <span>No account required</span>
                  <span>·</span>
                  <span className="text-[#176B50] font-semibold">Immediate precision breakdown</span>
                </div>
              </div>

              {/* Quick Origin & Destination Route Capsule */}
              <div className="pt-2">
                <div className="inline-flex flex-col sm:flex-row items-stretch sm:items-center bg-[#F8F9F7] p-2 rounded-2xl border border-[#E5EAE5] shadow-2xs gap-2 max-w-xl w-full">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#E5EAE5] flex-1 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-[#5F6A63] shrink-0" />
                    <span className="text-xs font-medium text-[#18231E] truncate">
                      From: <span className="font-semibold">{state.from || "Lucknow"}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#E5EAE5] flex-1 min-w-0">
                    <Navigation className="w-3.5 h-3.5 text-[#176B50] shrink-0" />
                    <span className="text-xs font-medium text-[#18231E] truncate">
                      To: <span className="font-semibold">{CITIES[state.city]?.name || "Bengaluru"}</span> {state.wp ? `(${state.wp.name})` : "(All Hubs)"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartNew}
                    className="h-9 px-4 rounded-xl bg-[#176B50] hover:bg-[#125740] text-white text-xs font-semibold flex items-center justify-center shrink-0 shadow-2xs transition-transform active:scale-95 gap-1.5 cursor-pointer"
                    title="Start relocation plan for this route"
                  >
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: The Editorial Green-and-White Risograph Tech Illustration */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <TechWindow className="w-full max-w-[440px] rounded-2xl border border-[#E5EAE5] bg-[#F4F9F6] p-2 overflow-hidden shadow-2xs group">
                <img
                  src="/assets/images/relocation_confusion_map.jpg"
                  alt="Worthwhile · Relocation Intelligence - Modeling salary, rent, deposit, and commute factors"
                  className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />

                {/* Floating Technical Status Badge */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#E5EAE5] shadow-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#176B50]" />
                    <span className="text-[11px] font-bold text-[#18231E] truncate">Worthwhile Decision Matrix</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-[#176B50] shrink-0">Relocation Intelligence</span>
                </div>
              </TechWindow>
            </div>
          </div>
        </ChamferCard>
      </section>

      {/* 2. THE PROBLEM: THE SALARY ILLUSION */}
      <section id="problem" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#E5EAE5] pt-16 scroll-mt-20 sm:scroll-mt-24">
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#176B50] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#176B50]" />
            <span>THE TRAP // THE SALARY ILLUSION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#18231E] font-heading">
            Why a 30% CTC hike can leave you with less cash in hand.
          </h2>
          <p className="mt-3 text-base text-[#5F6A63] leading-relaxed">
            Most job switchers evaluate offers on annual CTC. But moving between cities introduces hidden capital locks and non-linear cost multipliers that raw numbers obscure.
          </p>
        </div>

        {/* 3 Architectural Chamfered Spec Cards (Icon Design Spotlight Reference Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Deposit Lock */}
          <ChamferCard>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5EAE5]">
              <span className="font-mono text-xs font-bold tracking-wider text-[#18231E] uppercase">
                THE 10-MONTH DEPOSIT LOCK
              </span>
              <DotGlyph type="stepped" className="w-4 h-4 text-[#18231E]" />
            </div>

            <div className="py-4 flex-1">
              <p className="text-xs sm:text-[13px] text-[#5F6A63] leading-relaxed">
                Bengaluru landlords frequently mandate 6 to 10 months of rent upfront as an interest-free deposit. Locking ₹3,00,000–₹4,50,000 upfront in dead capital wipes out months of initial hike cashflow.
              </p>
            </div>

            <TechWindow>
              <DepositLockIsometric />
            </TechWindow>
          </ChamferCard>

          {/* Card 2: Commute Velocity */}
          <ChamferCard>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5EAE5]">
              <span className="font-mono text-xs font-bold tracking-wider text-[#18231E] uppercase">
                COMMUTE VELOCITY & SURGE
              </span>
              <DotGlyph type="arrow" className="w-4 h-4 text-[#18231E]" />
            </div>

            <div className="py-4 flex-1">
              <p className="text-xs sm:text-[13px] text-[#5F6A63] leading-relaxed">
                Living 12 km from Cyber City Gurugram or Outer Ring Road Bengaluru isn't a 20-minute drive. Peak hours easily double fuel, cab surge, and wear overhead to ₹12,000+/mo.
              </p>
            </div>

            <TechWindow>
              <CommuteVelocityIsometric />
            </TechWindow>
          </ChamferCard>

          {/* Card 3: Purchasing Power */}
          <ChamferCard>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5EAE5]">
              <span className="font-mono text-xs font-bold tracking-wider text-[#18231E] uppercase">
                PURCHASING POWER VARIANCE
              </span>
              <DotGlyph type="square" className="w-4 h-4 text-[#18231E]" />
            </div>

            <div className="py-4 flex-1">
              <p className="text-xs sm:text-[13px] text-[#5F6A63] leading-relaxed">
                Groceries, domestic help, weekend dining, and society maintenance charges vary by up to 35% between Noida, Gurugram, Central Bengaluru, and Whitefield.
              </p>
            </div>

            <TechWindow>
              <PurchasingPowerIsometric />
            </TechWindow>
          </ChamferCard>
        </div>
      </section>

      {/* 3. HOW RELOCATION INTELLIGENCE WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#E5EAE5] pt-16 scroll-mt-20 sm:scroll-mt-24">
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#176B50] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#176B50]" />
            <span>THE ENGINE // ALGORITHMIC PRECISION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#18231E] font-heading">
            Algorithmic precision across 6 structured steps.
          </h2>
          <p className="mt-3 text-base text-[#5F6A63] leading-relaxed">
            We replace vague forum opinions and broker estimates with reproducible road network measurements, calibrated lifestyle indices, and validated neighbourhood rent bands.
          </p>
        </div>

        {/* 3 Architectural Chamfered Spec Cards (Icon Design Spotlight Reference Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Engine Card 1 */}
          <ChamferCard>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5EAE5]">
              <span className="font-mono text-xs font-bold tracking-wider text-[#18231E] uppercase">
                01. HUB & TAKE-HOME BASELINE
              </span>
              <DotGlyph type="reticle" className="w-4 h-4 text-[#18231E]" />
            </div>

            <div className="py-4 flex-1">
              <p className="text-xs sm:text-[13px] text-[#5F6A63] leading-relaxed">
                Pin your employer's exact tech campus or business hub. Enter your monthly in-hand cashflow and non-negotiable debt commitments to establish your true baseline.
              </p>
            </div>

            <TechWindow>
              <HubBaselineIsometric />
            </TechWindow>
          </ChamferCard>

          {/* Engine Card 2 */}
          <ChamferCard>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5EAE5]">
              <span className="font-mono text-xs font-bold tracking-wider text-[#18231E] uppercase">
                02. OSRM ROAD MATRIX & SCORING
              </span>
              <DotGlyph type="cross" className="w-4 h-4 text-[#18231E]" />
            </div>

            <div className="py-4 flex-1">
              <p className="text-xs sm:text-[13px] text-[#5F6A63] leading-relaxed">
                Our routing engine calculates turn-by-turn road distance and driving duration from every residential area to your desk, weighting affordability, commute, and savings.
              </p>
            </div>

            <TechWindow>
              <RoutingMatrixIsometric />
            </TechWindow>
          </ChamferCard>

          {/* Engine Card 3 */}
          <ChamferCard>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5EAE5]">
              <span className="font-mono text-xs font-bold tracking-wider text-[#18231E] uppercase">
                03. SCENARIOS & EXECUTIVE BRIEF
              </span>
              <DotGlyph type="grid" className="w-4 h-4 text-[#18231E]" />
            </div>

            <div className="py-4 flex-1">
              <p className="text-xs sm:text-[13px] text-[#5F6A63] leading-relaxed">
                Simulate lifestyle trade-offs (cooking vs dining out, 1 BHK vs 2 BHK) and export a clean relocation brief with counter-offer requirements.
              </p>
            </div>

            <TechWindow>
              <ExecutiveReportIsometric />
            </TechWindow>
          </ChamferCard>
        </div>
      </section>

      {/* 4. NEIGHBOURHOOD DISCOVERY SPOTLIGHT */}
      <section id="neighbourhoods" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#E5EAE5] pt-16 scroll-mt-20 sm:scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#176B50] mb-2">
              Locality Intelligence
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#18231E] font-heading">
              Benchmark neighbourhoods before you sign a lease.
            </h2>
            <p className="mt-2 text-sm text-[#5F6A63]">
              Curated rental bands, commute scores, and lifestyle attributes across target corridors.
            </p>
          </div>

          {/* City Segmented Switcher */}
          <div className="inline-flex w-full sm:w-auto p-1 bg-white rounded-xl border border-[#E5EAE5] shadow-xs">
            <button
              type="button"
              onClick={() => setSelectedCityTab('blr')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold transition-all text-center ${
                selectedCityTab === 'blr'
                  ? 'bg-[#176B50] text-white shadow-xs'
                  : 'text-[#5F6A63] hover:text-[#18231E]'
              }`}
            >
              Bengaluru Corridors
            </button>
            <button
              type="button"
              onClick={() => setSelectedCityTab('ncr')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold transition-all text-center ${
                selectedCityTab === 'ncr'
                  ? 'bg-[#176B50] text-white shadow-xs'
                  : 'text-[#5F6A63] hover:text-[#18231E]'
              }`}
            >
              Delhi NCR Corridors
            </button>
          </div>
        </div>

        {/* Locality Showcase Cards with Chamfered Spec-Sheet Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {showcaseAreas[selectedCityTab].map((area) => (
            <ChamferCard key={area.name} notchSize={18}>
              <div className="flex items-center justify-between pb-3 border-b border-[#E5EAE5]">
                <span className="font-mono text-xs font-bold tracking-wider text-[#18231E] uppercase">
                  {area.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E8F4EF] text-[#176B50] font-bold">
                  Score {area.commuteScore}
                </span>
              </div>

              <div className="py-3 flex-1 space-y-2">
                <span className="text-[11px] font-mono text-[#5F6A63] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#176B50]" />
                  {area.hub}
                </span>
                <p className="text-xs text-[#5F6A63] leading-relaxed">
                  {area.vibe}
                </p>
              </div>

              {/* Technical rent spec window */}
              <div className="border border-[#E5EAE5] bg-[#FBFDFB] p-2.5 space-y-1.5 font-mono text-xs mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#5F6A63]">1 BHK:</span>
                  <span className="font-bold text-[#18231E]">{area.rent1BHK}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#5F6A63]">2 BHK:</span>
                  <span className="font-bold text-[#176B50]">{area.rent2BHK}</span>
                </div>
              </div>
            </ChamferCard>
          ))}
        </div>
      </section>

      {/* 5. CITY COMPARISONS: BENGALURU VS DELHI NCR */}
      <section id="cities" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#E5EAE5] pt-16 scroll-mt-20 sm:scroll-mt-24">
        <div className="max-w-3xl mb-10">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#176B50] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#176B50]" />
            <span>CITY REALITIES // COST & COMMUTE DYNAMICS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#18231E] font-heading">
            Bengaluru vs. Delhi NCR: The Relocation Equation
          </h2>
          <p className="mt-3 text-base text-[#5F6A63] leading-relaxed">
            Both hubs represent India’s economic engines, but their living costs and infrastructure dynamics require fundamentally different planning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bengaluru Card */}
          <ChamferCard notchSize={24}>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5EAE5]">
              <div>
                <span className="font-mono text-xs font-bold tracking-wider text-[#18231E] uppercase">
                  BENGALURU // KARNATAKA TECH CAPITAL
                </span>
              </div>
              <DotGlyph type="stepped" className="w-4 h-4 text-[#18231E]" />
            </div>

            <div className="py-4 space-y-3 flex-1 text-xs sm:text-[13px] text-[#5F6A63]">
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#176B50] mt-1.5 shrink-0" />
                <span><strong className="text-[#18231E]">High Upfront Capital:</strong> Expect 8–10 months deposit in Indiranagar/Koramangala, 4–6 months in Whitefield.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#176B50] mt-1.5 shrink-0" />
                <span><strong className="text-[#18231E]">Commute Bottlenecks:</strong> Silk Board, Marathahalli & Hebbal traffic corridors penalize living &gt;10 km from office.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#176B50] mt-1.5 shrink-0" />
                <span><strong className="text-[#18231E]">Pleasant Climate:</strong> Substantially lower air conditioning electricity bills across 9 months of the year.</span>
              </div>
            </div>

            <div className="border border-[#E5EAE5] bg-[#FBFDFB] p-2.5 sm:p-3 grid grid-cols-3 gap-1 sm:gap-2 font-mono text-center text-xs mt-2">
              <div className="border-r border-[#E5EAE5] pr-1 sm:pr-2">
                <div className="text-[9px] sm:text-[10px] text-[#5F6A63] uppercase truncate">Avg 2BHK</div>
                <div className="font-bold text-[#18231E] text-[11px] sm:text-xs mt-0.5 truncate">₹32,000</div>
              </div>
              <div className="border-r border-[#E5EAE5] pr-1 sm:pr-2">
                <div className="text-[9px] sm:text-[10px] text-[#5F6A63] uppercase truncate">Deposit</div>
                <div className="font-bold text-[#176B50] text-[11px] sm:text-xs mt-0.5 truncate">8–10 Mo.</div>
              </div>
              <div>
                <div className="text-[9px] sm:text-[10px] text-[#5F6A63] uppercase truncate">AC Power</div>
                <div className="font-bold text-[#18231E] text-[11px] sm:text-xs mt-0.5 truncate">Low (~₹1.5k)</div>
              </div>
            </div>
          </ChamferCard>

          {/* Delhi NCR Card */}
          <ChamferCard notchSize={24}>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5EAE5]">
              <div>
                <span className="font-mono text-xs font-bold tracking-wider text-[#18231E] uppercase">
                  DELHI NCR // NATIONAL CAPITAL REGION
                </span>
              </div>
              <DotGlyph type="arrow" className="w-4 h-4 text-[#18231E]" />
            </div>

            <div className="py-4 space-y-3 flex-1 text-xs sm:text-[13px] text-[#5F6A63]">
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#176B50] mt-1.5 shrink-0" />
                <span><strong className="text-[#18231E]">Flexible Rental Deposits:</strong> Typically 2 months rent deposit in Gurugram, Noida, and South Delhi.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#176B50] mt-1.5 shrink-0" />
                <span><strong className="text-[#18231E]">Rapid Arterial Transit:</strong> Delhi Metro Yellow/Blue lines and 16-lane expressways allow longer transit radii.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#176B50] mt-1.5 shrink-0" />
                <span><strong className="text-[#18231E]">Seasonal Utilities:</strong> Extreme summers require high air conditioning power consumption (₹4,500–₹8,000/mo).</span>
              </div>
            </div>

            <div className="border border-[#E5EAE5] bg-[#FBFDFB] p-2.5 sm:p-3 grid grid-cols-3 gap-1 sm:gap-2 font-mono text-center text-xs mt-2">
              <div className="border-r border-[#E5EAE5] pr-1 sm:pr-2">
                <div className="text-[9px] sm:text-[10px] text-[#5F6A63] uppercase truncate">Avg 2BHK</div>
                <div className="font-bold text-[#18231E] text-[11px] sm:text-xs mt-0.5 truncate">₹28,000</div>
              </div>
              <div className="border-r border-[#E5EAE5] pr-1 sm:pr-2">
                <div className="text-[9px] sm:text-[10px] text-[#5F6A63] uppercase truncate">Deposit</div>
                <div className="font-bold text-[#176B50] text-[11px] sm:text-xs mt-0.5 truncate">2 Mo.</div>
              </div>
              <div>
                <div className="text-[9px] sm:text-[10px] text-[#5F6A63] uppercase truncate">AC Power</div>
                <div className="font-bold text-[#18231E] text-[11px] sm:text-xs mt-0.5 truncate">High (~₹6.5k)</div>
              </div>
            </div>
          </ChamferCard>
        </div>
      </section>

      {/* 6. OFFER EVALUATION FRAMEWORK */}
      <section id="evaluation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#E5EAE5] pt-16 pb-24 sm:pb-32 lg:pb-36 scroll-mt-20 sm:scroll-mt-24">
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#176B50] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#176B50]" />
            <span>NEGOTIATION INTELLIGENCE // OFFER PARITY AUDIT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#18231E] font-heading">
            Evaluating an offer? Calculate your counter-offer baseline.
          </h2>
          <p className="mt-3 text-base text-[#5F6A63] leading-relaxed">
            A relocation offer is only worth taking if your <strong>net bankable surplus</strong> exceeds your current lifestyle savings. Use our parity formula to confirm whether the relocation bonus and in-hand package justify the move.
          </p>
        </div>

        {/* 2 Architectural Chamfered Spec Cards (Icon Design Spotlight Reference Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card 1: Parity Modeling & Isometric Parity Vector */}
          <div className="lg:col-span-7">
            <ChamferCard notchSize={24}>
              <div className="flex items-center justify-between pb-3.5 border-b border-[#E5EAE5]">
                <span className="font-mono text-xs font-bold tracking-wider text-[#18231E] uppercase">
                  COMPENSATION AUDIT & DISPOSABLE SURPLUS
                </span>
                <DotGlyph type="reticle" className="w-4 h-4 text-[#18231E]" />
              </div>

              <div className="py-4 flex-1">
                <p className="text-xs sm:text-[13px] text-[#5F6A63] leading-relaxed">
                  Moving between Bengaluru and Delhi NCR introduces non-linear rent inflators, upfront deposit locks, and commute overhead. Our model isolates fixed liabilities to establish the exact post-tax in-hand hike required to maintain or grow your savings rate.
                </p>
              </div>

              <TechWindow>
                <CompensationAuditIsometric />
              </TechWindow>
            </ChamferCard>
          </div>

          {/* Card 2: Counter-Offer Rules of Thumb & Direct CTA */}
          <div className="lg:col-span-5">
            <ChamferCard notchSize={24}>
              <div className="flex items-center justify-between pb-3.5 border-b border-[#E5EAE5]">
                <span className="font-mono text-xs font-bold tracking-wider text-[#18231E] uppercase">
                  COUNTER-OFFER BENCHMARKS
                </span>
                <DotGlyph type="stepped" className="w-4 h-4 text-[#18231E]" />
              </div>

              <div className="py-4 space-y-2.5 flex-1">
                <div className="p-3 bg-[#FBFDFB] border border-[#E5EAE5] flex items-center justify-between font-mono text-xs">
                  <span className="text-[#5F6A63]">Min. In-Hand Hike</span>
                  <span className="font-bold text-[#18231E]">+25% to +35%</span>
                </div>
                <div className="p-3 bg-[#FBFDFB] border border-[#E5EAE5] flex items-center justify-between font-mono text-xs">
                  <span className="text-[#5F6A63]">Rental Deposit Lock</span>
                  <span className="font-bold text-[#18231E]">₹2.5L – ₹4.0L</span>
                </div>
                <div className="p-3 bg-[#FBFDFB] border border-[#E5EAE5] flex items-center justify-between font-mono text-xs">
                  <span className="text-[#5F6A63]">Settling Reserve</span>
                  <span className="font-bold text-[#18231E]">₹50k – ₹80k</span>
                </div>
                <div className="p-3 bg-[#FBFDFB] border border-[#E5EAE5] flex items-center justify-between font-mono text-xs">
                  <span className="text-[#5F6A63]">Parity Multiplier</span>
                  <span className="font-bold text-[#176B50]">1.28x Base Cost</span>
                </div>
              </div>

              {/* Action Box */}
              <div className="border border-[#E5EAE5] bg-[#FBFDFB] p-3.5 space-y-2 mt-2">
                <button
                  type="button"
                  onClick={handleStartNew}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#176B50] hover:bg-[#125740] shadow-xs transition-colors cursor-pointer"
                >
                  <span>Run Compensation Audit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <div className="text-[10px] font-mono text-[#5F6A63] text-center">
                  CALIBRATED FOR BLR & DELHI NCR
                </div>
              </div>
            </ChamferCard>
          </div>
        </div>
      </section>
    </div>
  );
};

