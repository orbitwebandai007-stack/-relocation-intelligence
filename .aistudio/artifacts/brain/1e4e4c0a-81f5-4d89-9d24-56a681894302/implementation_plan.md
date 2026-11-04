# Relocation Intelligence — Strategic Architecture & UX Overhaul

> **Status: COMPLETED & VERIFIED**
> All 7 strategic refinements implemented, TypeScript checked (`tsc --noEmit` exit 0), and production bundle verified (`npm run build`).

## Executive Summary

Relocation Intelligence is an executive decision-support platform designed to help professionals evaluate whether moving to another Indian city for a career move is financially, practically, and temporally worthwhile.

This revised specification incorporates all strategic refinements:
1. **Extensible City Architecture**: A scalable schema supporting any Indian tier-1/tier-2 city (Bengaluru, Delhi NCR, Mumbai, Pune, Hyderabad, Chennai) without structural refactoring.
2. **Transparent Financial Assumptions & Overrides**: Every cost (rent, security deposit, brokerage, moving logistics, initial setup) is backed by explicit micro-market assumptions with custom override support.
3. **Current City vs. Destination Delta**: A central comparative pillar measuring monthly outflow shifts, savings rate delta, and net relocation advantage.
4. **Intelligent Multidimensional Verdict**: Replaces arbitrary single-number scores with a four-pillar qualitative and quantitative viability evaluation.
5. **5-Section Blueprint Information Architecture**: Structured with progressive disclosure across Verdict, Recommended Neighbourhoods, Financial Breakdown, Long-Term Wealth, and Next Steps.
6. **Interactive In-Blueprint Neighbourhood Switching**: Seamlessly toggle between shortlisted localities directly on the Blueprint to evaluate alternate commute and rent impacts with zero journey resets.
7. **Strict Data Integrity**: 100% grounded in actual user state, OSRM road network geometries, calibrated living multipliers, and verified local cost baselines.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Key Refinements Incorporated for User Review:**
>
> - **Extensible City Schema**: `CityData` now defines city-specific parameters (`depositMonthsRange`, `defaultDepositMonths`, `standardBrokerageMonths`, `acPowerSensitivity`, `baseRents`, `hubs`, `areas`), enabling immediate extensibility to Mumbai, Pune, Hyderabad, and Chennai.
> - **Current City Baseline Integration**: Captures user's current city baseline (current monthly living expenses / current in-hand salary) to calculate exact Net Relocation Gain/Loss.
> - **Interactive In-Place Switching**: The Blueprint enables 1-click toggling between candidate neighbourhoods, immediately re-computing commute times and financial projections without leaving the report.
> - **Zero-Reset Guarantee**: The user's selections are never wiped; completion transitions gracefully into the interactive Blueprint.

---

## 1. Architectural Integration & Codebase Inspection

### Existing Codebase Assessment
- **State Store (`src/App.tsx`)**: Manages `RelocationState`, synced to `localStorage` key `'ri_v2'`. Contains `routeMap` for real OSRM driving routes.
- **Data Engine (`src/data/relocationData.ts`)**:
  - Contains `CITIES`, `BASE`, `PROPERTIES`, `ACCOMMODATIONS`, `FOOD_HABITS`, `TRANSPORT_MODES`, `LIFESTYLE_TIERS`.
  - Calculates expenses in `estimateExpenses()` and scoring in `calculateNeighbourhoods()`.
- **Routing Service (`src/services/routingService.ts`)**: Real turn-by-turn OSRM API integration with 220ms request throttling and localStorage caching (`ri_osrm_cache_v3`).
- **Map Workspace (`src/components/MapComponent.tsx`)**: MapLibre GL raster canvas with custom SVG markers, popups, route polyline layers, and transit markers.
- **Workflow Panel (`src/components/PlannerPanel.tsx`)**: Currently contains the step UI.

### Integration Strategy (Zero Regression)
1. **Extend `relocationData.ts`**:
   - Generalize `CityKey` to string union: `'blr' | 'ncr' | 'bom' | 'pun' | 'hyd' | 'che'`.
   - Add city configuration profiles for Mumbai, Pune, Hyderabad, Chennai alongside Bengaluru and Delhi NCR, including deposit profiles, AC electricity modifiers, and corridor hubs.
   - Introduce `calculateMovingCosts()` with transparent formulas and editable overrides.
   - Add `evaluateRelocationVerdict()` to compute an intelligent, multi-variable textual verdict.
2. **Harmonize User Journey**:
   - Step 0: Destination & Workplace Hub
   - Step 1: Compensation & Current City Baseline
   - Step 2: Locality Discovery & Commute Grounding
   - Step 3: Lifestyle & Housing Configuration
   - Step 4: Cashflow & What-If Simulations
   - Step 5: **Your Relocation Blueprint** (Full Executive Decision Portal)
3. **Upgrade Blueprint View**:
   - Break into 5 clean visual tabs/cards with progressive disclosure.
   - Keep map synchronized with active neighbourhood switcher.

---

## 2. The 5-Section Relocation Blueprint Specification

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       YOUR RELOCATION BLUEPRINT                             │
│                  Executive Relocation Decision Audit                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
    ┌────────────────────────────────┼────────────────────────────────┐
    ▼                                ▼                                ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│ 1. RELOCATION        │ │ 2. RECOMMENDED       │ │ 3. FINANCIAL         │
│    VERDICT           │ │    NEIGHBOURHOODS    │ │    BREAKDOWN         │
│ • Viability Status   │ │ • Active Hub Route   │ │ • Current vs Dest    │
│ • Executive Summary  │ │ • Why It Fits        │ │ • Outflow Delta      │
│ • 4 Pillar Breakdown │ │ • Trade-offs         │ │ • Transparent Moving │
│ • Delta vs Current   │ │ • 1-Click Switcher   │ │   & Setup Budget     │
└──────────────────────┘ └──────────────────────┘ └──────────────────────┘
                                     │
    ┌────────────────────────────────┴────────────────────────────────┐
    ▼                                                                 ▼
┌──────────────────────────────────────┐ ┌──────────────────────────────────────┐
│ 4. LONG-TERM WEALTH PROJECTION       │ │ 5. YOUR NEXT STEPS                   │
│ • 1-Year & 3-Year Capital Trajectory │ │ • Offer Counter-Proposal Target      │
│ • Staying vs Relocating Delta        │ │ • Relocation Checklist & Timeline    │
│ • Capital Lock vs Liquidity Curve    │ │ • Export PDF / Save Plan / Revisit   │
└──────────────────────────────────────┘ └──────────────────────────────────────┘
```

### Section 1: Your Relocation Verdict
- **Viability Status Badge**:
  - `Highly Favourable`: Strong surplus growth, healthy savings rate (>25%), acceptable commute (<40 min), upfront deposit amortizes in <4 months.
  - `Favourable with Commute Trade-offs`: Significant wealth gain but daily commute is high (>45 min) or requires transit compromise.
  - `Marginal Gain / High Capital Lock`: Modest monthly savings increase (<10%) wiped out by 8–10 months deposit lock and moving expenses for 12+ months.
  - `Financial Deficit / High Risk`: Monthly outflow exceeds in-hand salary; savings rate drops below current baseline.
- **Executive Rationale**: 2–3 sentences explaining *why* based on concrete math (salary, rent tier, deposit burden, and commute minutes).
- **Core Delta Metric Strip**:
  - Monthly In-Hand Delta: Destination Take-Home vs Current Take-Home.
  - Net Monthly Savings Delta: ₹ change in bankable monthly surplus.
  - Savings Rate Shift: e.g. `24% in Pune` ➔ `38% in Bengaluru`.
  - Upfront Capital Payback Period: Months of surplus required to recoup initial moving + deposit lock.

### Section 2: Recommended Neighbourhoods
- **Primary Recommendation Card**:
  - Locality Name + Sub-corridor context.
  - OSRM Road Distance & Peak Driving Time to office desk.
  - Rent benchmark for selected configuration (e.g., 2 BHK in HSR Layout: ₹38,000/mo).
  - Qualitative rationale: Why this locality wins over others in the corridor.
  - Honest trade-offs: Specific compromises (traffic corridor pinch point, higher deposit, water tanker reliance).
- **Interactive In-Blueprint Switcher**:
  - Shortlisted candidate localities displayed as responsive comparison cards.
  - Clicking any candidate switches the active Blueprint focus, dynamically updating all financial charts, commute routes, and wealth projections in real time.

### Section 3: Financial Breakdown & Transparent Assumptions
- **Current City vs Destination Outflow Comparison**:
  - Side-by-side comparison table across 8 expense categories: Rent, Food, Commute, Utilities, Internet, Personal, Leisure, and Commitments.
  - Clear Delta column (`+₹ / -₹`).
- **Transparent Moving & Setup Capital Matrix**:
  - *Security Deposit*: e.g., `8 months rent (Bengaluru standard)` = ₹3,04,000 [Editable input].
  - *Brokerage*: e.g., `1 month rent (standard broker fee)` = ₹38,000 [Editable toggle: Standard broker / Direct Owner ₹0].
  - *Inter-City Packers & Movers*: Modeled by distance tier (e.g. Pune to Bengaluru ~₹24,000) [Editable input].
  - *Initial Setup & Utility Deposits*: Wi-Fi, kitchen restocking, society move-in charges = ₹25,000 [Editable input].
  - *Total Day-1 Liquidity Required*: Explicit sum preventing unexpected relocation cash crunches.
- **Transparent Assumptions Note**: Clear disclaimers detailing micro-market sources, seasonality modifiers (e.g. NCR summer AC power spike), and user override indicators.

### Section 4: Long-Term Wealth Projection
- **Wealth Accumulation Trajectory**:
  - 1-Year Cumulative Capital: Destination Surplus vs Current Baseline Surplus.
  - 3-Year Compounded Wealth Outlook (factoring 8% annual increment and 7% investment return).
  - Break-Even Milestone: Exact calendar month when cumulative new savings exceed all upfront moving and deposit lock costs.

### Section 5: Your Next Steps
- **Counter-Offer Baseline**: Minimum post-tax salary required to ensure the relocation achieves at least a 25% net savings rate.
- **Relocation Checklist**: 3-stage timeline (4 Weeks Out, 2 Weeks Out, Move-in Week).
- **Permanent Decision Actions**:
  - Download Print-Ready PDF / Relocation Brief.
  - Save Plan to Browser Storage (with custom label).
  - Revisit & Edit Parameters (jumps back to specific step with zero data loss).
  - Start New Scenario (with clear confirmation prompt).

---

## 3. Scalable Multi-City Architecture

```typescript
export type CityKey = 'blr' | 'ncr' | 'bom' | 'pun' | 'hyd' | 'che';

export interface CityProfile {
  key: CityKey;
  name: string;
  state: string;
  tier: 1 | 2;
  center: [number, number]; // [lat, lng]
  depositMonthsRange: [number, number]; // [min, max]
  defaultDepositMonths: number;
  standardBrokerageMonths: number;
  acPowerMonthlyCost: number; // Seasonal utility modifier
  description: string;
  hubs: [string, number, number][]; // [name, lat, lng]
  areas: AreaData[]; // [name, lat, lng, multiplier]
}
```

This clean abstraction separates city-specific parameters into self-contained profiles, allowing any new Indian city to be added with its local deposit customs, tech campuses, and micro-market rent multipliers without touching application logic.

---

## 4. Prioritised Implementation Plan

### Phase 1: Scalable Data Model & Transparent Calculations
- Update `CityKey` and implement extensible `CityProfile` structure in `relocationData.ts` (Bengaluru, Delhi NCR, Mumbai, Pune, Hyderabad, Chennai).
- Implement `calculateMovingCosts()` with transparent formulas and override hooks.
- Implement `evaluateRelocationVerdict()` evaluating solvency, savings rate, liquidity coverage, and commute friction.

### Phase 2: User Journey & Baseline Capture
- Enrich Step 0 / Step 1 to capture current living baseline (origin city, current monthly expenses or salary) for the Current vs. Destination comparison.
- Improve workplace search with fuzzy matching across all tech hubs and business districts.
- Ensure state persistence preserves all custom overrides.

### Phase 3: The 5-Section "Relocation Blueprint" Portal
- Create `src/components/RelocationBlueprint.tsx` matching the 5-section information architecture.
- Wire interactive neighbourhood switching to update calculations dynamically.
- Implement the Current City vs. Destination Delta breakdown.
- Integrate moving costs with editable inputs.
- Wire PDF export, local plan saving, and parameter editing.

### Phase 4: UX & Map Polish
- Maintain map-first presence with synchronized route drawing when switching candidate neighbourhoods in the Blueprint.
- Enforce strict typography hierarchy (`Plus Jakarta Sans` headings, `JetBrains Mono` tabular metrics).
- Compile, verify linting, and validate that zero runtime regressions occur.

---

## Verification & Acceptance Criteria
1. **Multi-City Readiness**: Schema supports BLR, NCR, BOM, PUN, HYD, CHE seamlessly.
2. **Transparent Financials**: All rent, deposits, brokerage, and movers show clear assumptions and allow user overrides.
3. **Current vs. Destination Comparison**: Direct delta displays monthly savings and percentage change.
4. **Intelligent Verdict**: Natural language evaluation explaining viability based on 4 real pillars, not arbitrary fit scores.
5. **Interactive Blueprint**: Shortlisted neighbourhoods can be switched directly on the Blueprint with instant reactive recalculation.
6. **No Journey Reset**: Completing the process transitions directly into the Relocation Blueprint with all selections preserved.
7. **Build & Lint**: Zero compilation or lint errors; full state persistence across page reloads.
