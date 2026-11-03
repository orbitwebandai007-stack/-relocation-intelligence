import React from 'react';
import { RelocationState } from '../types';
import {
  CITIES,
  PROPERTIES,
  estimateExpenses,
  formatINR,
} from '../data/relocationData';
import {
  ArrowRight,
  MapPin,
  Building2,
  TrendingUp,
  Compass,
  CheckCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

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
  // Compute the 3 preview cards from original code:
  // blr - Whitefield, ncr - Sector 62 Noida, ncr - Cyber City Gurugram
  const previewData = [
    { cityKey: 'blr' as const, name: 'Whitefield' },
    { cityKey: 'ncr' as const, name: 'Sector 62 · Noida' },
    { cityKey: 'ncr' as const, name: 'Cyber City · Gurugram' },
  ].map(({ cityKey, name }) => {
    const city = CITIES[cityKey];
    const area =
      city.areas.find((a) => a[0] === name) ||
      city.areas.find((a) => a[0].startsWith(name)) ||
      city.areas[0];

    const est = estimateExpenses(
      cityKey,
      area,
      { name: area[0], lat: area[1], lng: area[2] },
      false,
      state
    );

    return {
      cityName: city.name,
      areaName: area[0],
      savings: est.sav,
    };
  });

  const features = [
    {
      title: 'Salary Affordability Modeling',
      desc: 'Calculate actual disposable take-home cash after income tax, provident fund, and living overheads.',
    },
    {
      title: 'Interactive City Geodata',
      desc: 'Live Leaflet basemaps with 32 curated neighbourhoods across Bengaluru and Delhi NCR.',
    },
    {
      title: 'Real-World Commute Proximity',
      desc: 'Straight-line distance, modeled road mileage, and transit duration matrix by mode.',
    },
    {
      title: 'Rent vs. Commute Trade-offs',
      desc: 'Visualize whether living near the office or staying in outer suburban hubs maximizes net savings.',
    },
    {
      title: 'Personalized Lifestyle Engine',
      desc: 'Fine-tune dining habits, accommodation formats (PG, shared, 1-2 BHK) and entertainment tiers.',
    },
    {
      title: 'Multi-Year Wealth Projections',
      desc: 'Forecast 1-year and 2-year cumulative bankable surplus across different scenarios.',
    },
  ];

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-200 text-[#21442E] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Know your salary. Understand your city. Make your move.</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#19241D] font-heading leading-[1.08]">
              Your next city deserves more than a salary comparison.
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 max-w-xl leading-relaxed">
              Understand what your salary can actually get you. Explore neighbourhoods, estimate living expenses and make smarter relocation decisions with live spatial intelligence.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={state.max > 0 ? onResumePlanning : onStartPlanning}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#21442E] text-white font-bold text-sm shadow-md hover:bg-[#183423] transition-all hover:scale-[1.02]"
              >
                <span>{state.max > 0 ? 'Resume Your Plan' : 'Plan Your Move'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#how"
                className="inline-flex items-center px-5 py-3.5 rounded-xl bg-white border border-[#E2E6DD] text-neutral-800 font-semibold text-sm hover:bg-neutral-50 shadow-xs transition-colors"
              >
                Explore how it works
              </a>
            </div>

            {/* Micro badges */}
            <div className="flex items-center gap-6 pt-2 text-xs text-neutral-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                <span>Bengaluru & Delhi NCR</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                <span>Interactive Leaflet Maps</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                <span>32 Curated Localities</span>
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Illustration Graphic (Preserving original concept with polished styling) */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-3xl border border-[#E2E6DD] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

              <svg viewBox="0 0 400 300" className="w-full h-auto">
                {/* Ground plane */}
                <rect x="0" y="215" width="400" height="85" fill="#EAECE5" opacity="0.7" rx="4" />
                <rect x="0" y="248" width="400" height="12" fill="#FFFFFF" />

                {/* Residential cluster */}
                <g fill="#8DA785">
                  <rect x="24" y="160" width="44" height="55" rx="3" />
                  <rect x="74" y="178" width="38" height="37" fill="#3B724B" rx="3" />
                  <rect x="118" y="150" width="46" height="65" rx="3" />
                </g>

                {/* Building windows */}
                <g fill="#FFFFFF" opacity="0.9">
                  {[0, 1, 2].map((i) => (
                    <React.Fragment key={i}>
                      <rect x="32" y={170 + i * 14} width="8" height="7" rx="1" />
                      <rect x="50" y={170 + i * 14} width="8" height="7" rx="1" />
                      <rect x="128" y={160 + i * 14} width="8" height="7" rx="1" />
                      <rect x="146" y={160 + i * 14} width="8" height="7" rx="1" />
                    </React.Fragment>
                  ))}
                </g>

                {/* Office skyscraper */}
                <rect x="296" y="95" width="76" height="120" fill="#21442E" rx="4" />
                <g fill="#FFFFFF" opacity="0.8">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <React.Fragment key={i}>
                      <rect x="308" y={108 + i * 16} width="14" height="7" rx="1" />
                      <rect x="338" y={108 + i * 16} width="14" height="7" rx="1" />
                    </React.Fragment>
                  ))}
                </g>

                {/* Transit polyline */}
                <path
                  d="M 46 257 C 130 257 190 232 300 232"
                  fill="none"
                  stroke="#E2B84B"
                  strokeWidth="3.5"
                  strokeDasharray="7 5"
                />
                <circle cx="46" cy="257" r="6" fill="#3B724B" stroke="#FFFFFF" strokeWidth="2.5" />
                <circle cx="300" cy="232" r="6" fill="#D94335" stroke="#FFFFFF" strokeWidth="2.5" />

                <text x="32" y="280" fontSize="10" fontWeight="700" fill="#697266">
                  HOME
                </text>
                <text x="286" y="280" fontSize="10" fontWeight="700" fill="#697266">
                  OFFICE
                </text>

                {/* Monthly Expenses Floating Card */}
                <g transform="translate(20, 20)">
                  <rect
                    width="170"
                    height="84"
                    fill="#FFFFFF"
                    stroke="#E2E6DD"
                    strokeWidth="1.5"
                    rx="8"
                  />
                  <text x="12" y="20" fontSize="10" fontWeight="700" fill="#697266">
                    MONTHLY EXPENSES
                  </text>
                  {[
                    ['Rent', 90, '#21442E'],
                    ['Food', 50, '#3B724B'],
                    ['Travel', 24, '#8DA785'],
                  ].map((r, i) => (
                    <React.Fragment key={r[0] as string}>
                      <text x="12" y={42 + i * 17} fontSize="9" fontWeight="600" fill="#1C221D">
                        {r[0]}
                      </text>
                      <rect
                        x="52"
                        y={34 + i * 17}
                        width={r[1] as number}
                        height="9"
                        fill={r[2] as string}
                        rx="2"
                      />
                    </React.Fragment>
                  ))}
                </g>

                {/* Take-Home Floating Card */}
                <g transform="translate(245, 30)">
                  <rect
                    width="135"
                    height="62"
                    fill="#FFFFFF"
                    stroke="#E2E6DD"
                    strokeWidth="1.5"
                    rx="8"
                  />
                  <text x="14" y="22" fontSize="10" fontWeight="700" fill="#697266">
                    TAKE-HOME
                  </text>
                  <text x="14" y="48" fontSize="20" fontWeight="800" fill="#1C221D">
                    ₹50,000
                  </text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem & Realities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-1">
          The Problem
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#19241D] tracking-tight">
          Same salary. Different cities. Different financial realities.
        </h2>
        <p className="mt-1 text-sm text-neutral-600 max-w-2xl">
          Salary alone doesn’t decide affordability — local rent premiums, commute mode, and daily expenses define how much wealth you actually accumulate.
        </p>

        {/* 3 City Benchmark Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {previewData.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-[#E2E6DD] shadow-xs space-y-3"
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                {item.cityName}
              </div>
              <h3 className="text-lg font-bold text-neutral-900 font-heading">
                {item.areaName}
              </h3>
              <div
                className={`text-3xl font-extrabold font-heading ${
                  item.savings >= 0 ? 'text-[#21442E]' : 'text-red-600'
                }`}
              >
                {formatINR(item.savings)}
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                estimated surplus left each month on {formatINR(state.sal)} take-home, living at {item.areaName} ({PROPERTIES[state.prop][0]}). Illustrative estimate.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-1">
          How It Works
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#19241D] tracking-tight">
          Three steps from uncertainty to clarity.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {[
            {
              num: '01',
              title: 'Tell us about your job.',
              desc: 'Select your destination city, employer office hub, and your expected monthly take-home salary.',
            },
            {
              num: '02',
              title: 'Discover where you can live.',
              desc: 'Explore an interactive geographic map filtering 32 curated neighbourhoods by rent, commute time, and affordability.',
            },
            {
              num: '03',
              title: 'Understand your financial future.',
              desc: 'Get an itemized lifestyle expense breakdown, 2-year wealth projections, and cross-city salary equivalents.',
            },
          ].map((step) => (
            <div
              key={step.num}
              className="bg-white p-6 rounded-2xl border border-[#E2E6DD] shadow-xs space-y-3"
            >
              <div className="text-3xl font-extrabold text-emerald-800 font-heading">
                {step.num}
              </div>
              <h3 className="font-heading font-bold text-base text-neutral-900">
                {step.title}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-1">
          Core Capabilities
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#19241D] tracking-tight">
          Engineered for decisive professionals.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {features.map((feat, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-[#E2E6DD] shadow-xs space-y-2 hover:border-neutral-300 transition-colors"
            >
              <h3 className="font-heading font-bold text-sm text-neutral-900">
                {feat.title}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported Locations & Final CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#21442E] text-white p-8 sm:p-10 rounded-3xl shadow-md space-y-6">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Supported Relocation Geographies
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading">
              Ready to evaluate your move?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Fully benchmarked for the primary tech corridors: Whitefield, ORR, Electronic City in Bengaluru; Cyber City Gurugram, Noida Sector 62 and central hubs across Delhi NCR.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/10 border border-white/10">
              <h3 className="font-bold text-base text-white">Bengaluru</h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                14 neighbourhoods · 5 tech employment corridors
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/10 border border-white/10">
              <h3 className="font-bold text-base text-white">Delhi NCR</h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                Delhi, Gurugram, Noida — 18 neighbourhoods · 6 commercial hubs
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onStartPlanning}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white text-[#21442E] font-bold text-sm shadow-md hover:bg-neutral-100 transition-all hover:scale-[1.02]"
            >
              <span>Start Your Relocation Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
