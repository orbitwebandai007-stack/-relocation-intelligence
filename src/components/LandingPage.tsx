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
  onStartPlanning: () => void;
  onResumePlanning: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  state,
  onStartPlanning,
  onResumePlanning,
}) => {
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
      {/* 1. UBER-INSPIRED HERO WITH MAP BACKGROUND */}
      <section className="relative min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] w-full overflow-hidden flex flex-col justify-center pt-12 sm:pt-20 lg:pt-24 pb-14 sm:pb-20">
        {/* Full-bleed light subtle low-contrast map background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          {/* Detailed Street Grid SVG simulation with low contrast and street labels */}
          <svg
            className="w-full h-full object-cover opacity-85"
            viewBox="0 0 1440 800"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background base tone */}
            <rect width="1440" height="800" fill="#F8F9F7" />

            {/* Subtle arterial roads and blocks */}
            <g stroke="#EAEFE8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 0 160 L 1440 220" />
              <path d="M 0 420 L 1440 480" />
              <path d="M 0 680 L 1440 700" />
              <path d="M 400 0 L 520 800" />
              <path d="M 850 0 L 910 800" />
              <path d="M 1200 0 L 1260 800" />
            </g>

            {/* Minor streets grid */}
            <g stroke="#EEF2EC" strokeWidth="4" strokeLinecap="round">
              <path d="M 100 0 L 100 800" />
              <path d="M 250 0 L 250 800" />
              <path d="M 600 0 L 600 800" />
              <path d="M 720 0 L 720 800" />
              <path d="M 1020 0 L 1020 800" />
              <path d="M 1120 0 L 1120 800" />
              <path d="M 1340 0 L 1340 800" />

              <path d="M 0 80 L 1440 80" />
              <path d="M 0 280 L 1440 280" />
              <path d="M 0 360 L 1440 360" />
              <path d="M 0 540 L 1440 540" />
              <path d="M 0 620 L 1440 620" />
              <path d="M 0 760 L 1440 760" />
            </g>

            {/* Diagonal avenue lines */}
            <path
              d="M 680 800 L 1180 180"
              stroke="#E2E9E0"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M 500 650 L 1440 380"
              stroke="#E2E9E0"
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* Subtle street name typography (Uber style) */}
            <g fill="#A8B4A6" fontSize="11" fontFamily="'Inter', sans-serif" fontWeight="500">
              <text x="880" y="140" transform="rotate(7 880 140)">Outer Ring Road</text>
              <text x="960" y="320" transform="rotate(-5 960 320)">Bellandur Main Rd</text>
              <text x="1150" y="240" transform="rotate(35 1150 240)">Sarjapur Expressway</text>
              <text x="760" y="490">100 Feet Rd · Indiranagar</text>
              <text x="900" y="660">Old Airport Road</text>
              <text x="1220" y="580">Whitefield Corridor</text>
              <text x="1050" y="740">HAL Airport Runway</text>
            </g>

            {/* Real Road Route Connection (Uber style orange/pine gradient line) */}
            <g>
              {/* Outer soft glow route casing */}
              <path
                d="M 940 680 L 960 520 L 1120 380 L 1220 320 L 1240 240"
                stroke="#176B50"
                strokeWidth="6"
                strokeOpacity="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Main solid route */}
              <path
                d="M 940 680 L 960 520 L 1120 380 L 1220 320 L 1240 240"
                stroke="#176B50"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Animated pulsating dash track */}
              <path
                d="M 940 680 L 960 520 L 1120 380 L 1220 320 L 1240 240"
                stroke="#C8E6A0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="6 12"
                className="animate-pulse"
              />
            </g>

            {/* Origin Marker (Workplace Hub with soft pulsing concentric radar rings) */}
            <g transform="translate(940, 680)">
              <circle r="45" fill="#176B50" fillOpacity="0.06" />
              <circle r="28" fill="#176B50" fillOpacity="0.12" />
              <circle r="12" fill="#176B50" />
              <circle r="4.5" fill="#FFFFFF" />
            </g>

            {/* Destination Marker with Concentric Radar Rings & Uber Tag */}
            <g transform="translate(1240, 240)">
              <circle r="48" fill="#176B50" fillOpacity="0.08" />
              <circle r="26" fill="#176B50" fillOpacity="0.18" />
              <circle r="9" fill="#176B50" />
              <circle r="3.5" fill="#C8E6A0" />
            </g>
          </svg>

          {/* Destination Callout Badge on Map (like Uber's DESTINATION tag) */}
          <div className="absolute top-[210px] right-[230px] hidden sm:flex items-center gap-1.5 bg-white px-2.5 py-1 rounded shadow-xs border border-[#E5EAE5] text-[10px] font-mono font-bold tracking-wider text-[#18231E]">
            <span className="text-[#176B50]">DESTINATION:</span>
            <span>INDIRANAGAR</span>
          </div>

          <div className="absolute top-[660px] right-[490px] hidden sm:flex items-center gap-1.5 bg-white px-2.5 py-1 rounded shadow-xs border border-[#E5EAE5] text-[10px] font-mono font-bold tracking-wider text-[#18231E]">
            <span className="text-[#176B50]">OFFICE:</span>
            <span>BELLANDUR TECH CAMPUS</span>
          </div>
        </div>

        {/* Seamless Soft Fade Gradient from Left to Right (Uber Aesthetic) */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#F8F9F7] via-[#F8F9F7]/95 via-45% to-transparent pointer-events-none" />

        {/* HERO FOREGROUND CONTENT */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center gap-8 sm:gap-12 my-auto">
          <div className="max-w-2xl space-y-4 sm:space-y-6">
            {/* Pill kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-[#E5EAE5] text-xs font-medium text-[#18231E] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#176B50]" />
              <span className="text-[#5F6A63]">Map-first relocation intelligence · Worthwhile</span>
              <span className="font-semibold text-[#18231E]">· BLR & Delhi NCR</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[60px] font-bold tracking-tight text-[#18231E] font-heading leading-[1.12] sm:leading-[1.06] text-balance">
              Your next move deserves better decisions.
            </h1>

            {/* Supporting Copy */}
            <p className="text-sm sm:text-base lg:text-lg text-[#5F6A63] leading-relaxed max-w-xl">
              Understand what your salary means in another city. Compare neighbourhoods, estimate living costs and discover how much you could actually save.
            </p>

            {/* Uber-Inspired Route Capsule Selector Bar */}
            <div className="inline-flex flex-col sm:flex-row items-stretch sm:items-center bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-[#E5EAE5] shadow-xs gap-2 max-w-2xl w-full">
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5]/60 flex-1 min-w-0">
                <MapPin className="w-4 h-4 text-[#5F6A63] shrink-0" />
                <span className="text-xs font-semibold text-[#18231E] truncate">
                  From: {state.from || 'Mumbai / Pune'}
                </span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#F8F9F7] border border-[#E5EAE5]/60 flex-1 min-w-0">
                <Navigation className="w-4 h-4 text-[#176B50] shrink-0" />
                <span className="text-xs font-semibold text-[#18231E] truncate">
                  To: {CITIES[state.city].name} ({state.wp ? state.wp.name : 'Choose Hub'})
                </span>
              </div>

              <button
                type="button"
                onClick={onStartPlanning}
                className="h-11 sm:w-11 sm:h-10 rounded-xl bg-[#176B50] hover:bg-[#125740] text-white flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95 gap-2 px-4 sm:px-0"
                title="Start Planning"
              >
                <span className="sm:hidden text-xs font-semibold">Start Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Floating Telemetry Card (Uber Reference Style) */}
          <div className="max-w-2xl w-full">
            <div className="bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#E5EAE5] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-5 text-xs w-full md:w-auto">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63] truncate">
                    Distance
                  </div>
                  <div className="text-sm sm:text-base font-bold font-mono text-[#18231E] mt-0.5 truncate">
                    14.8 KM
                  </div>
                </div>

                <div className="border-l border-[#E5EAE5] pl-2.5 sm:pl-4 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#5F6A63] truncate">
                    Commute
                  </div>
                  <div className="text-sm sm:text-base font-bold font-mono text-[#18231E] mt-0.5 truncate">
                    24 MINS
                  </div>
                </div>

                <div className="border-l border-[#E5EAE5] pl-2.5 sm:pl-4 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#176B50] truncate">
                    Net Surplus
                  </div>
                  <div className="text-sm sm:text-base font-bold font-mono text-[#176B50] mt-0.5 truncate">
                    +₹48.5k<span className="text-[10px] font-normal text-[#5F6A63]">/mo</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 shrink-0 justify-start md:justify-end">
                <button
                  type="button"
                  onClick={onStartPlanning}
                  className="px-4 sm:px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#176B50] hover:bg-[#125740] shadow-xs transition-all active:scale-[0.98] text-center whitespace-nowrap"
                >
                  Start relocation plan
                </button>

                {state.max > 0 && (
                  <button
                    type="button"
                    onClick={onResumePlanning}
                    className="px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-semibold text-[#18231E] bg-[#F8F9F7] border border-[#E5EAE5] hover:bg-neutral-100 transition-colors text-center whitespace-nowrap shadow-2xs"
                  >
                    Resume plan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
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
                  onClick={onStartPlanning}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#176B50] hover:bg-[#125740] shadow-xs transition-colors"
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

