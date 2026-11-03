import React, { useState, useEffect } from 'react';
import {
  CityKey,
  RelocationState,
  SavedPlan,
  ScoredNeighbourhood,
} from '../types';
import {
  CITIES,
  EXPENSE_CATEGORIES,
  LIFESTYLE_TIERS,
  PROPERTIES,
  calculateNeighbourhoods,
  estimateExpenses,
  formatINR,
  getTarget,
} from '../data/relocationData';
import { MapComponent } from './MapComponent';
import {
  FileText,
  GitCompare,
  Bookmark,
  Printer,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MapPin,
  Building,
  Trash2,
  FolderOpen,
} from 'lucide-react';

interface Step6ReportProps {
  state: RelocationState;
  chosenNeighbourhood: ScoredNeighbourhood;
  scoredNeighbourhoods: ScoredNeighbourhood[];
  onUpdateState: (updates: Partial<RelocationState>) => void;
  onGoStep: (step: number) => void;
}

export const Step6Report: React.FC<Step6ReportProps> = ({
  state,
  chosenNeighbourhood,
  scoredNeighbourhoods,
  onUpdateState,
  onGoStep,
}) => {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const currentCity = CITIES[state.city];
  const wp = state.wp || {
    name: currentCity.hubs[0][0],
    lat: currentCity.hubs[0][1],
    lng: currentCity.hubs[0][2],
  };

  // 1. Current Area Calculation with Overrides
  const currentEst = estimateExpenses(
    state.city,
    chosenNeighbourhood.a,
    wp,
    true,
    state
  );
  const targetSavings = getTarget(state);

  // 2. Alternative Recommendations (Top 3 other neighbourhoods)
  const alternatives = scoredNeighbourhoods
    .filter((q) => q.i !== chosenNeighbourhood.i)
    .slice(0, 3);

  // 3. Comparison Neighbourhoods (Shortlisted or top 3)
  const compareList =
    state.sel.length > 0
      ? state.sel
          .map((id) => scoredNeighbourhoods.find((n) => n.i === id))
          .filter(Boolean) as ScoredNeighbourhood[]
      : scoredNeighbourhoods.slice(0, 3);

  // 4. Cross-City Comparison Calculation
  const otherCityKey: CityKey = state.city === 'blr' ? 'ncr' : 'blr';
  const otherCity = CITIES[otherCityKey];
  const otherHub = otherCity.hubs[0];
  const otherWp = {
    name: otherHub[0],
    lat: otherHub[1],
    lng: otherHub[2],
  };
  const otherCityScored = calculateNeighbourhoods(otherCityKey, otherWp, state);
  const otherCityTop = otherCityScored[0];
  const otherCityEst = otherCityTop.x;

  const salaryNeededInOtherCity =
    otherCityEst.tot + state.com + targetSavings;

  // LocalStorage saved plans management
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ri_saved_plans');
      if (stored) {
        setSavedPlans(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('LocalStorage unavailable');
    }
  }, []);

  const handleSaveCurrentPlan = () => {
    const newPlan: SavedPlan = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      title: `${currentCity.name} · ${chosenNeighbourhood.a[0]} · ${formatINR(
        state.sal
      )}/mo`,
      state: JSON.parse(JSON.stringify(state)),
    };

    const updated = [newPlan, ...savedPlans.slice(0, 9)];
    setSavedPlans(updated);
    try {
      localStorage.setItem('ri_saved_plans', JSON.stringify(updated));
      setSaveSuccessMsg('Plan saved to browser successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 3500);
    } catch (e) {
      alert('Could not save to local storage.');
    }
  };

  const handleLoadPlan = (plan: SavedPlan) => {
    onUpdateState({
      ...plan.state,
      v: 'step',
      st: 5,
      tab: 'rep',
    });
  };

  const handleDeletePlan = (id: string) => {
    const updated = savedPlans.filter((p) => p.id !== id);
    setSavedPlans(updated);
    try {
      localStorage.setItem('ri_saved_plans', JSON.stringify(updated));
    } catch (e) {}
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-800 mb-1">
            06 · Executive Relocation Intelligence Report
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#19241D] tracking-tight">
            Understand your next move.
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Comprehensive financial feasibility, commute analytics and lifestyle modeling.
          </p>
        </div>

        {/* Print / Save Actions */}
        <div className="flex items-center gap-2 no-print">
          <button
            type="button"
            onClick={handleSaveCurrentPlan}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-[#E2E6DD] text-neutral-800 hover:bg-neutral-50 shadow-xs transition-colors"
          >
            <Bookmark className="w-4 h-4 text-emerald-700" />
            <span>Save Plan</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#21442E] text-white hover:bg-[#183423] shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-emerald-300" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="border-b border-[#E2E6DD] flex gap-2 no-print">
        {[
          { key: 'rep', label: 'Executive Overview', icon: FileText },
          { key: 'cmp', label: 'Area & City Comparison', icon: GitCompare },
          { key: 'plan', label: 'Saved Plans & Actions', icon: Bookmark },
        ].map(({ key, label, icon: Icon }) => {
          const isActive = state.tab === key;
          return (
            <button
              key={key}
              onClick={() => onUpdateState({ tab: key as any })}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all -mb-px ${
                isActive
                  ? 'border-[#21442E] text-[#21442E]'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: EXECUTIVE OVERVIEW ================= */}
      {state.tab === 'rep' && (
        <div className="space-y-6">
          {/* Top KPI Banner */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E2E6DD] shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Primary Pick
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 font-heading mt-1">
                {chosenNeighbourhood.a[0]}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                {currentCity.name} · Score {chosenNeighbourhood.sc}/100
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E2E6DD] shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Est. Living Rent
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 font-heading mt-1">
                {formatINR(currentEst.e.rent)}
                <span className="text-xs font-normal text-neutral-500">/mo</span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                {PROPERTIES[state.prop][0]}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E2E6DD] shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Monthly Net Savings
              </div>
              <div
                className={`text-xl sm:text-2xl font-extrabold font-heading mt-1 ${
                  currentEst.sav >= 0 ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {formatINR(currentEst.sav)}
                <span className="text-xs font-normal text-neutral-500">/mo</span>
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                {Math.round((currentEst.sav / state.sal) * 100)}% of salary
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E2E6DD] shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Road Commute (OSRM)
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 font-heading mt-1">
                {chosenNeighbourhood.hasValidRoute && chosenNeighbourhood.drivingMin !== null && chosenNeighbourhood.drivingMin !== undefined
                  ? `${chosenNeighbourhood.drivingMin} min`
                  : 'Route unavailable'}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                {chosenNeighbourhood.hasValidRoute && chosenNeighbourhood.roadKm !== null && chosenNeighbourhood.roadKm !== undefined
                  ? `${chosenNeighbourhood.roadKm} km road distance`
                  : 'Route unavailable'}
              </div>
            </div>
          </div>

          {/* Location & Mini Map Section */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E6DD] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E6DD] pb-3">
              <div>
                <h3 className="font-heading font-bold text-base text-neutral-900">
                  Spatial Location & Real Road Route
                </h3>
                <p className="text-xs text-neutral-500">
                  {chosenNeighbourhood.a[0]} ↔ Office in {wp.name}
                </p>
              </div>
              <div className="text-xs font-semibold text-neutral-600 flex items-center gap-3">
                <span>
                  Road distance:{' '}
                  {chosenNeighbourhood.hasValidRoute && chosenNeighbourhood.roadKm !== null && chosenNeighbourhood.roadKm !== undefined
                    ? `${chosenNeighbourhood.roadKm} km`
                    : 'Route unavailable'}
                </span>
                <span>·</span>
                <span>
                  Est. Driving:{' '}
                  {chosenNeighbourhood.hasValidRoute && chosenNeighbourhood.drivingMin !== null && chosenNeighbourhood.drivingMin !== undefined
                    ? `${chosenNeighbourhood.drivingMin} min`
                    : 'Route unavailable'}
                </span>
              </div>
            </div>

            <div className="h-80 w-full overflow-hidden rounded-xl border border-[#E2E6DD]">
              <MapComponent
                city={state.city}
                workplace={wp}
                neighbourhoods={scoredNeighbourhoods}
                selectedId={chosenNeighbourhood.i}
                shortlist={state.sel}
                propType={state.prop}
                layers={{ n: true, r: true, w: true, c: true, t: true }}
                onSelectNeighbourhood={() => {}}
                className="h-full min-h-[320px]"
              />
            </div>
          </div>

          {/* Top 3 Alternative Localities */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E6DD] shadow-xs space-y-4">
            <div>
              <h3 className="font-heading font-bold text-base text-neutral-900">
                Alternative Recommendations in {currentCity.name}
              </h3>
              <p className="text-xs text-neutral-500">
                Neighbourhoods with strong score balances for comparison.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {alternatives.map((alt) => {
                const rentDiff = alt.x.e.rent - currentEst.e.rent;
                const distDiff = alt.x.km - currentEst.km;

                return (
                  <div
                    key={alt.i}
                    className="p-4 rounded-xl border border-[#E2E6DD] bg-neutral-50/70 hover:bg-white hover:shadow-xs transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-sm text-neutral-900">
                        {alt.a[0]}
                      </div>
                      <span className="text-[10px] font-bold text-neutral-500 bg-neutral-200/60 px-1.5 py-0.5 rounded">
                        Score {alt.sc}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-neutral-600">
                      <div>
                        Rent: <strong className="text-neutral-900">{formatINR(alt.x.e.rent)}</strong>
                        <span className="text-[11px] text-neutral-400 pl-1">
                          ({rentDiff < 0 ? `₹${Math.abs(rentDiff)} lower` : `+₹${rentDiff}`})
                        </span>
                      </div>
                      <div>
                        Distance: <span>{alt.x.km.toFixed(1)} km</span>
                        <span className="text-[11px] text-neutral-400 pl-1">
                          ({distDiff < 0 ? 'closer' : 'farther'})
                        </span>
                      </div>
                      <div>
                        Est. savings: <strong className="text-emerald-700">{formatINR(alt.x.sav)}</strong>/mo
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strategic Outlook Narrative */}
          <div className="bg-[#21442E] text-white p-6 rounded-2xl shadow-sm space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Relocation Strategic Outlook
            </div>
            <p className="text-sm text-emerald-50 leading-relaxed">
              {currentEst.sav >= targetSavings ? (
                <>
                  <strong>{chosenNeighbourhood.a[0]}</strong> appears to comfortably fit your financial parameters. After meeting your estimated living expenses of {formatINR(currentEst.tot)}/mo and commitments of {formatINR(state.com)}/mo, you will retain an estimated <strong>{formatINR(currentEst.sav)}/month</strong>, successfully hitting your {formatINR(targetSavings)} target.
                </>
              ) : (
                <>
                  At <strong>{chosenNeighbourhood.a[0]}</strong>, estimated monthly savings of <strong>{formatINR(currentEst.sav)}/month</strong> fall short of your {formatINR(targetSavings)} target. To close this gap, consider opting for shared accommodation, a more economical commute route, or exploring nearby alternative localities.
                </>
              )}
            </p>
            <p className="text-[11px] text-emerald-300/80 pt-2 border-t border-emerald-800/80">
              Disclaimer: All calculations are illustrative prototype estimates benchmarked for Bengaluru & Delhi NCR (Nov 2026). They do not constitute certified financial or housing advice.
            </p>
          </div>
        </div>
      )}

      {/* ================= TAB 2: COMPARE ================= */}
      {state.tab === 'cmp' && (
        <div className="space-y-6">
          {/* Side-by-side Neighbourhoods Comparison Table */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E6DD] shadow-xs space-y-4">
            <div>
              <h3 className="font-heading font-bold text-base text-neutral-900">
                Shortlisted Neighbourhood Comparison ({compareList.length} areas)
              </h3>
              <p className="text-xs text-neutral-500">
                Side-by-side cost and commute metrics for your preferred locations.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E6DD] bg-neutral-50">
                    <th className="py-2.5 px-3 font-bold text-neutral-500 uppercase">
                      Metric
                    </th>
                    {compareList.map((q) => (
                      <th
                        key={q.i}
                        className="py-2.5 px-3 font-extrabold text-neutral-900 text-sm"
                      >
                        {q.a[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E6DD]">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-neutral-600">
                      Indicative Rent
                    </td>
                    {compareList.map((q) => (
                      <td key={q.i} className="py-2.5 px-3 font-bold text-neutral-900">
                        {formatINR(q.x.e.rent)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-neutral-600">
                      Food & Groceries
                    </td>
                    {compareList.map((q) => (
                      <td key={q.i} className="py-2.5 px-3 text-neutral-700">
                        {formatINR(q.x.e.food)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-neutral-600">
                      Transport & Commute
                    </td>
                    {compareList.map((q) => (
                      <td key={q.i} className="py-2.5 px-3 text-neutral-700">
                        {formatINR(q.x.e.trans)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-neutral-600">
                      Total Monthly Expenses
                    </td>
                    {compareList.map((q) => (
                      <td key={q.i} className="py-2.5 px-3 font-bold text-neutral-900">
                        {formatINR(q.x.tot)}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-emerald-50/40">
                    <td className="py-2.5 px-3 font-bold text-[#21442E]">
                      Estimated Net Savings
                    </td>
                    {compareList.map((q) => (
                      <td
                        key={q.i}
                        className={`py-2.5 px-3 font-extrabold text-sm ${
                          q.x.sav >= 0 ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {formatINR(q.x.sav)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-neutral-600">
                      Road Distance (km)
                    </td>
                    {compareList.map((q) => (
                      <td key={q.i} className="py-2.5 px-3 font-semibold text-neutral-800">
                        {q.hasValidRoute && q.roadKm !== null && q.roadKm !== undefined
                          ? `${q.roadKm} km`
                          : 'Route unavailable'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-neutral-600">
                      Driving Commute (OSRM)
                    </td>
                    {compareList.map((q) => (
                      <td key={q.i} className="py-2.5 px-3 font-bold text-emerald-800">
                        {q.hasValidRoute && q.drivingMin !== null && q.drivingMin !== undefined
                          ? `~${q.drivingMin} min`
                          : 'Route unavailable'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-neutral-600">
                      Overall Recommendation Fit
                    </td>
                    {compareList.map((q) => (
                      <td key={q.i} className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-md ${
                            q.g === 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : q.g === 1
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {['Best fit', 'Worth considering', 'Stretch'][q.g]}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Rent vs Commute Scatter Plot */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E6DD] shadow-xs space-y-4">
            <div>
              <h3 className="font-heading font-bold text-base text-neutral-900">
                Rent vs. Commute Distance Trade-off Analysis
              </h3>
              <p className="text-xs text-neutral-500">
                Areas closer to employment centers typically command higher rents; outer hubs save on rent but increase commute time and transit costs.
              </p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl border border-[#E2E6DD] flex flex-col items-center">
              <svg viewBox="0 0 500 240" className="w-full max-w-xl h-auto">
                {/* Axes */}
                <line x1="50" y1="200" x2="480" y2="200" stroke="#CBD5E1" strokeWidth="2" />
                <line x1="50" y1="20" x2="50" y2="200" stroke="#CBD5E1" strokeWidth="2" />

                {/* Gridlines */}
                {[50, 100, 150].map((y) => (
                  <line
                    key={y}
                    x1="50"
                    y1={y}
                    x2="480"
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Axis Labels */}
                <text x="260" y="230" fontSize="11" fill="#64748B" textAnchor="middle" fontWeight="600">
                  Straight-line Distance (km) →
                </text>
                <text x="15" y="25" fontSize="11" fill="#64748B" fontWeight="600">
                  Rent ↑
                </text>

                {/* Plot Data Points for Compare List */}
                {compareList.map((q) => {
                  const px = 50 + (Math.min(q.x.km, 25) / 25) * 400;
                  const py = 200 - (Math.min(q.x.e.rent, 35000) / 35000) * 170;

                  return (
                    <g key={q.i} className="cursor-pointer">
                      <circle
                        cx={px}
                        cy={py}
                        r="7"
                        fill="#21442E"
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                      />
                      <text
                        x={px + 10}
                        y={py + 4}
                        fontSize="11"
                        fontWeight="700"
                        fill="#1E293B"
                      >
                        {q.a[0].split(' ·')[0]} ({formatINR(q.x.e.rent)})
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="text-[11px] text-neutral-400 mt-2 text-center">
                Visualizing trade-offs between proximity to workplace and monthly housing expenditure.
              </div>
            </div>
          </div>

          {/* Cross-City Relocation Comparison Table */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E6DD] shadow-xs space-y-4">
            <div>
              <h3 className="font-heading font-bold text-base text-neutral-900">
                Cross-City Macro Comparison
              </h3>
              <p className="text-xs text-neutral-500">
                Comparing your chosen lifestyle in {currentCity.name} vs. an equivalent setup in {otherCity.name} ({otherHub[0]}).
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E6DD] bg-neutral-50">
                    <th className="py-2.5 px-3 font-bold text-neutral-500 uppercase">
                      Metric
                    </th>
                    <th className="py-2.5 px-3 font-extrabold text-neutral-900">
                      {currentCity.name} ({chosenNeighbourhood.a[0]})
                    </th>
                    <th className="py-2.5 px-3 font-extrabold text-neutral-900">
                      {otherCity.name} ({otherCityTop.a[0]})
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E6DD]">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-neutral-600">
                      Indicative Rent
                    </td>
                    <td className="py-2.5 px-3 font-bold text-neutral-900">
                      {formatINR(currentEst.e.rent)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-neutral-900">
                      {formatINR(otherCityEst.e.rent)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-neutral-600">
                      Commute & Transport
                    </td>
                    <td className="py-2.5 px-3 text-neutral-700">
                      {formatINR(currentEst.e.trans)}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-700">
                      {formatINR(otherCityEst.e.trans)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-neutral-600">
                      Total Monthly Expenses
                    </td>
                    <td className="py-2.5 px-3 font-bold text-neutral-900">
                      {formatINR(currentEst.tot)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-neutral-900">
                      {formatINR(otherCityEst.tot)}
                    </td>
                  </tr>
                  <tr className="bg-neutral-50">
                    <td className="py-2.5 px-3 font-bold text-neutral-800">
                      Monthly Savings
                    </td>
                    <td className="py-2.5 px-3 font-extrabold text-emerald-700">
                      {formatINR(currentEst.sav)}
                    </td>
                    <td className="py-2.5 px-3 font-extrabold text-emerald-700">
                      {formatINR(otherCityEst.sav)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-neutral-600">
                      Savings Rate
                    </td>
                    <td className="py-2.5 px-3 text-neutral-800 font-semibold">
                      {Math.round((currentEst.sav / state.sal) * 100)}%
                    </td>
                    <td className="py-2.5 px-3 text-neutral-800 font-semibold">
                      {Math.round((otherCityEst.sav / state.sal) * 100)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-neutral-800">
              <span className="font-extrabold text-[#21442E]">
                Salary needed in {otherCity.name} for an identical financial outcome:
              </span>{' '}
              <strong className="text-neutral-900 text-sm">
                {formatINR(salaryNeededInOtherCity)} / month
              </strong>{' '}
              (computed as expenses {formatINR(otherCityEst.tot)} + commitments {formatINR(state.com)} + savings target {formatINR(targetSavings)}).
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: MY PLAN ================= */}
      {state.tab === 'plan' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E2E6DD] shadow-xs space-y-4">
            <div>
              <h3 className="font-heading font-bold text-base text-neutral-900">
                Plan Management & Export
              </h3>
              <p className="text-xs text-neutral-500">
                Save plans to revisit alternatives, compare compensation packages or export a printable PDF.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleSaveCurrentPlan}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#21442E] text-white text-xs font-bold hover:bg-[#183423] transition-colors"
              >
                <Bookmark className="w-4 h-4 text-emerald-300" />
                <span>Save This Current Plan</span>
              </button>

              <button
                type="button"
                onClick={() => onGoStep(0)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E6DD] bg-neutral-50 text-neutral-700 text-xs font-bold hover:bg-neutral-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-neutral-500" />
                <span>Edit Relocation Details (Step 1)</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E6DD] bg-neutral-50 text-neutral-700 text-xs font-bold hover:bg-neutral-100 transition-colors"
              >
                <Printer className="w-4 h-4 text-neutral-500" />
                <span>Export / Print to PDF</span>
              </button>
            </div>
          </div>

          {/* Saved Plans History */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E6DD] shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-neutral-900 uppercase tracking-wider text-xs text-neutral-500">
              Previously Saved Plans ({savedPlans.length})
            </h3>

            {savedPlans.length > 0 ? (
              <div className="divide-y divide-[#E2E6DD]">
                {savedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-sm text-neutral-900">
                        {plan.title}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Saved on {plan.timestamp}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleLoadPlan(plan)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-50 text-[#21442E] hover:bg-emerald-100 rounded-lg transition-colors"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Load</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePlan(plan.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-neutral-400 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-neutral-50 rounded-xl text-neutral-500 text-xs">
                No saved plans yet. Click "Save This Current Plan" above to store your plan in this browser.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Persistent Bottom Disclaimer */}
      <div className="p-4 bg-white rounded-2xl border border-[#E2E6DD] text-center text-xs text-neutral-500">
        All figures are illustrative prototype estimates (data type: illustrative; benchmark: Bengaluru & Delhi NCR Nov 2026). Commute distances and times are modeled with spatial geocoding and road speed benchmarks. Not financial or legal relocation advice.
      </div>
    </div>
  );
};
