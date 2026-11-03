import {
  AccommodationType,
  CityData,
  CityKey,
  ExpenseBreakdown,
  ExpenseCategory,
  FoodHabit,
  LifestyleTier,
  PropertyType,
  RelocationState,
  ScoreBreakdown,
  ScoredNeighbourhood,
  ScoringWeights,
  SortPriority,
  TransitData,
  TransportMode,
  WorkplaceHub,
} from '../types';
import { RouteInfo } from '../services/routingService';

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  affordability: 0.40,
  commute: 0.30,
  savings: 0.20,
  lifestyle: 0.10,
};

export const STEPS = [
  'LOCATION',
  'SALARY',
  'NEIGHBOURHOODS',
  'LIFESTYLE',
  'ANALYSIS',
  'REPORT',
] as const;

// Base rents benchmarked across 5 tiers:
// [PG base, Shared room, Private room, 1 BHK, 2 BHK]
export const BASE: Record<CityKey, number[]> = {
  blr: [8000, 6000, 11000, 18000, 28000],
  ncr: [8500, 6000, 11000, 18000, 28000],
};

export const CITIES: Record<CityKey, CityData> = {
  blr: {
    key: 'blr',
    name: 'Bengaluru',
    center: [12.9716, 77.5946],
    hubs: [
      ['Whitefield', 12.9698, 77.75],
      ['Outer Ring Road', 12.9387, 77.722],
      ['Electronic City', 12.8452, 77.6602],
      ['Manyata Tech Park', 13.045, 77.62],
      ['MG Road', 12.9756, 77.6068],
    ],
    areas: [
      ['Whitefield', 12.9698, 77.75, 1.0],
      ['Brookefield', 12.966, 77.716, 1.0],
      ['Marathahalli', 12.9569, 77.7011, 1.1],
      ['Bellandur', 12.926, 77.6762, 1.35],
      ['Sarjapur Road', 12.9068, 77.697, 1.2],
      ['HSR Layout', 12.9116, 77.6389, 1.4],
      ['Koramangala', 12.9352, 77.6245, 1.7],
      ['Indiranagar', 12.9784, 77.6408, 1.75],
      ['Electronic City', 12.8452, 77.6602, 0.8],
      ['Hebbal', 13.0358, 77.597, 1.0],
      ['Yelahanka', 13.1007, 77.5963, 0.8],
      ['Mahadevapura', 12.991, 77.696, 1.0],
      ['Outer Ring Road', 12.9387, 77.722, 1.3],
      ['MG Road', 12.9756, 77.6068, 1.9],
    ],
  },
  ncr: {
    key: 'ncr',
    name: 'Delhi NCR',
    center: [28.57, 77.18],
    hubs: [
      ['Cyber City, Gurugram', 28.495, 77.089],
      ['Golf Course Road', 28.443, 77.101],
      ['Udyog Vihar', 28.5035, 77.079],
      ['Noida Sector 62', 28.627, 77.365],
      ['Noida Sector 18', 28.57, 77.322],
      ['Connaught Place', 28.6315, 77.2167],
    ],
    areas: [
      ['Dwarka · Delhi', 28.5921, 77.046, 0.9],
      ['Rohini · Delhi', 28.7495, 77.0565, 0.8],
      ['Saket · Delhi', 28.5245, 77.2066, 1.5],
      ['Laxmi Nagar · Delhi', 28.6304, 77.2773, 0.75],
      ['Janakpuri · Delhi', 28.6219, 77.0878, 1.0],
      ['Vasant Kunj · Delhi', 28.52, 77.159, 1.6],
      ['Connaught Place · Delhi', 28.6315, 77.2167, 2.0],
      ['Rajouri Garden · Delhi', 28.6492, 77.1219, 1.1],
      ['Cyber City · Gurugram', 28.495, 77.089, 1.7],
      ['Golf Course Road · Gurugram', 28.443, 77.101, 2.0],
      ['Sector 56 · Gurugram', 28.424, 77.106, 1.4],
      ['Udyog Vihar · Gurugram', 28.5035, 77.079, 1.2],
      ['Sohna Road · Gurugram', 28.41, 77.042, 1.0],
      ['Sector 18 · Noida', 28.57, 77.322, 1.3],
      ['Sector 62 · Noida', 28.627, 77.365, 1.0],
      ['Sector 137 · Noida', 28.509, 77.4, 0.8],
      ['Sector 50 · Noida', 28.572, 77.365, 1.1],
      ['Sector 76 · Noida', 28.56, 77.38, 0.85],
    ],
  },
};

// Transit stations
export const TRANSIT_STATIONS: Record<CityKey, TransitData[]> = {
  blr: [
    ['Whitefield (Kadugodi) Metro', 12.9955, 77.7577],
    ['Baiyappanahalli Metro', 12.9907, 77.6523],
    ['Indiranagar Metro', 12.9783, 77.6386],
    ['MG Road Metro', 12.9756, 77.6068],
  ],
  ncr: [
    ['Rajiv Chowk Metro', 28.6328, 77.2197],
    ['HUDA City Centre Metro', 28.4592, 77.0724],
    ['Sikanderpur Metro', 28.4817, 77.0934],
    ['Noida Sector 18 Metro', 28.5707, 77.3262],
    ['Noida Sector 62 Metro', 28.6271, 77.3722],
    ['Dwarka Sector 21 Metro', 28.5523, 77.0584],
    ['Saket Metro', 28.5206, 77.2013],
  ],
};

// Property mapping: [Label, Accommodation category, Base index (0-4), Multiplier]
export const PROPERTIES: Record<
  PropertyType,
  [string, AccommodationType, number, number]
> = {
  studio: ['Studio', 'alone', 3, 0.8],
  b1: ['1 BHK', 'alone', 3, 1.0],
  b2: ['2 BHK', 'alone', 4, 1.0],
  pr: ['Private room', 'share', 2, 1.0],
  sr: ['Shared room', 'share', 1, 1.0],
  s2: ['Shared 2 BHK', 'share', 4, 0.5],
  pg1: ['PG single', 'pg', 0, 1.0],
  pg2: ['PG double', 'pg', 0, 0.7],
  pg3: ['PG multi-sharing', 'pg', 0, 0.55],
};

export const ACCOMMODATIONS: Record<AccommodationType, string> = {
  alone: 'Living alone',
  share: 'Sharing an apartment',
  pg: 'PG accommodation',
};

export const FOOD_HABITS: Record<FoodHabit, string> = {
  cook: 'Mostly cooking',
  mix: 'Mix of cooking & eating out',
  out: 'Mostly eating out',
};

export const TRANSPORT_MODES: Record<TransportMode, string> = {
  pub: 'Public transport (Metro/Bus)',
  two: 'Two-wheeler',
  car: 'Personal car',
  cab: 'Cabs & Auto',
  combo: 'Combination (Metro + Auto)',
};

export const LIFESTYLE_TIERS: Record<
  LifestyleTier,
  { label: string; desc: string }
> = {
  bud: {
    label: 'Budget-conscious',
    desc: 'Mindful spending, domestic groceries, frugal social life',
  },
  mod: {
    label: 'Moderate',
    desc: 'Balanced lifestyle, regular dining, weekend outings',
  },
  comf: {
    label: 'Comfortable',
    desc: 'High convenience, premium groceries, frequent recreation',
  },
};

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, string> = {
  rent: 'Rent',
  food: 'Food & Groceries',
  trans: 'Transportation',
  util: 'Utilities (Elec/Water)',
  net: 'Internet & Mobile',
  pers: 'Personal Care',
  ent: 'Entertainment & Outing',
  oth: 'Miscellaneous',
};

export const INITIAL_STATE: RelocationState = {
  v: 'land',
  st: 0,
  max: 0,
  tab: 'rep',
  city: 'blr',
  wp: {
    name: 'Whitefield',
    lat: 12.9698,
    lng: 77.75,
  },
  sal: 50000,
  tgt: 10000,
  tm: 'target',
  com: 0,
  acc: 'alone',
  prop: 'b1',
  food: 'mix',
  tr: 'pub',
  life: 'mod',
  maxc: 30,
  sel: [],
  ov: {},
  f: { r: '', c: '', a: '', q: '' },
  from: 'Lucknow',
};

// Utilities
export const formatINR = (n: number): string =>
  '₹' + Math.round(n).toLocaleString('en-IN');

export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));

export const getTarget = (state: RelocationState): number =>
  state.tm === 'target' ? state.tgt : 0;

export const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const r = Math.PI / 180;
  const x =
    Math.sin(((lat2 - lat1) * r) / 2) ** 2 +
    Math.cos(lat1 * r) *
      Math.cos(lat2 * r) *
      Math.sin(((lon2 - lon1) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(x));
};

export const calculateRent = (
  city: CityKey,
  areaMultiplier: number,
  prop: PropertyType
): number => {
  const baseCategoryIndex = PROPERTIES[prop][2];
  const propMultiplier = PROPERTIES[prop][3];
  return BASE[city][baseCategoryIndex] * areaMultiplier * propMultiplier;
};

export const estimateExpenses = (
  city: CityKey,
  area: [string, number, number, number],
  wp: WorkplaceHub,
  useOverrides: boolean,
  state: RelocationState
) => {
  const km = haversineDistance(area[1], area[2], wp.lat, wp.lng);
  const rd = km * 1.4; // modeled road distance
  const lm = { bud: 0.85, mod: 1.0, comf: 1.25 }[state.life];
  const accommodationCategory = PROPERTIES[state.prop][1];

  // Transportation calculations
  const pub = 800 + rd * 60;
  const cab = rd * 616;
  const tr = {
    pub,
    two: 1500 + rd * 70,
    car: 5000 + rd * 150,
    cab,
    combo: 0.6 * pub + 0.4 * cab,
  }[state.tr];

  // Estimated commute time in minutes based on traffic speed benchmarks
  const minutesPerKm = {
    pub: 3.2,
    two: 2.4,
    car: 2.8,
    cab: 2.8,
    combo: 3.0,
  }[state.tr];
  const min = Math.max(10, Math.round(rd * minutesPerKm + 5));

  // Food costs
  const foodBase = { cook: 6000, mix: 8500, out: 12000 }[state.food] * lm;

  // Utility costs
  const util =
    accommodationCategory === 'pg'
      ? 500
      : accommodationCategory === 'share'
      ? 1000
      : state.prop === 'b2'
      ? 3000
      : 2000;

  // Internet & mobile
  const net = accommodationCategory === 'pg' ? 700 : 1000;

  // Personal & entertainment
  const pers = 3000 * lm;
  const ent = 3000 * lm;
  const oth = 2000;

  const e: ExpenseBreakdown = {
    rent: Math.round(calculateRent(city, area[3], state.prop)),
    food: Math.round(foodBase),
    trans: Math.round(tr),
    util: Math.round(util),
    net: Math.round(net),
    pers: Math.round(pers),
    ent: Math.round(ent),
    oth: Math.round(oth),
  };

  if (useOverrides && state.ov) {
    for (const key of Object.keys(e) as ExpenseCategory[]) {
      if (state.ov[key] !== undefined && state.ov[key] !== null) {
        e[key] = state.ov[key]!;
      }
    }
  }

  const tot = Object.values(e).reduce((s, v) => s + v, 0);
  const sav = state.sal - tot - state.com;

  return {
    km,
    rd,
    min,
    e,
    tot,
    sav,
  };
};

export const calculateNeighbourhoods = (
  city: CityKey = 'blr',
  wp: WorkplaceHub | null,
  state: RelocationState,
  routeMap?: Map<string, RouteInfo>
): ScoredNeighbourhood[] => {
  const defaultHub = CITIES[city].hubs[0];
  const wpObj: WorkplaceHub = wp
    ? wp
    : {
        name: defaultHub[0],
        lat: defaultHub[1],
        lng: defaultHub[2],
      };

  const f = state.f;
  const target = getTarget(state);
  const areas = CITIES[city].areas;
  const weights = state.weights || DEFAULT_SCORING_WEIGHTS;

  const bands: [number, number][] = [
    [0, 8000],
    [8000, 12000],
    [12000, 18000],
    [18000, 25000],
    [25000, 1000000],
  ];

  const availableLivingBudget = Math.max(1, state.sal - state.com - target);

  const list: ScoredNeighbourhood[] = areas.map((a, i) => {
    const x = estimateExpenses(city, a, wpObj, false, state);
    const route = routeMap?.get(a[0]);

    // Use actual road distance and driving duration from OSRM if validly fetched
    const hasValidRoute = Boolean(route && !route.isFallback && route.distanceKm !== null);
    const roadKm = hasValidRoute ? (route?.distanceKm ?? null) : null;
    const drivingMin = hasValidRoute ? (route?.durationMinutes ?? null) : null;

    // Use drivingMin for scoring if available, else baseline benchmark
    const effectiveDrivingMin = drivingMin ?? x.min;

    // 1. Affordability Score (40%): Rent relative to available living allowance
    const rentRatio = x.e.rent / availableLivingBudget;
    const affordabilityScore = clamp(
      Math.round(100 * (1 - Math.max(0, rentRatio - 0.25) / 0.75)),
      0,
      100
    );

    // 2. Commute Convenience Score (30%): Driving duration vs max acceptable commute
    const commuteScore = clamp(
      Math.round(100 * (1 - Math.max(0, effectiveDrivingMin - state.maxc) / 45)),
      0,
      100
    );

    // 3. Savings Potential Score (20%): Monthly surplus vs target savings
    const savingsRatio =
      target > 0 ? x.sav / target : x.sav / (state.sal * 0.2);
    const savingsScore = clamp(Math.round(50 + savingsRatio * 50), 0, 100);

    // 4. Lifestyle Match Score (10%): Area multiplier vs preferred lifestyle tier
    const lifestyleScore =
      state.life === 'bud'
        ? a[3] <= 1.1
          ? 100
          : a[3] <= 1.3
          ? 70
          : 40
        : state.life === 'comf'
        ? a[3] >= 1.2
          ? 100
          : a[3] >= 1.0
          ? 75
          : 50
        : a[3] >= 0.85 && a[3] <= 1.4
        ? 100
        : 65;

    // Weighted Combined Score
    const sc = Math.round(
      affordabilityScore * weights.affordability +
        commuteScore * weights.commute +
        savingsScore * weights.savings +
        lifestyleScore * weights.lifestyle
    );

    const fo = x.sav >= target;
    const fn = x.sav >= target - 3000;
    const co = effectiveDrivingMin <= state.maxc;
    const cn = effectiveDrivingMin <= state.maxc + 15;
    const g: 0 | 1 | 2 = fo && co ? 0 : fn && cn ? 1 : 2;

    const areaSimpleName = a[0].split(' ·')[0];
    const roadCommuteText =
      roadKm !== null && drivingMin !== null
        ? `~${drivingMin} min (${roadKm} km road distance)`
        : 'Route unavailable';

    let why = '';
    if (g === 0) {
      why = `${areaSimpleName} is your best fit because it keeps rent (${formatINR(
        x.e.rent
      )}) within your budget, offers a manageable commute (${roadCommuteText}) and allows you to meet your monthly savings target with an estimated ${formatINR(
        x.sav
      )}/mo surplus.`;
    } else if (g === 1) {
      why = `${areaSimpleName} offers a viable trade-off: rent is ${formatINR(
        x.e.rent
      )}/mo with a commute of ${roadCommuteText}, retaining ${formatINR(
        x.sav
      )}/mo in net savings.`;
    } else {
      why = `${areaSimpleName} stretches your parameters: commute (${roadCommuteText}) or rent leaves a tighter savings cushion (${formatINR(
        x.sav
      )}/mo).`;
    }

    // Filter checks
    const rentPass =
      !f.r ||
      (x.e.rent >= bands[Number(f.r)][0] && x.e.rent < bands[Number(f.r)][1]);
    const commutePass =
      !f.c || (drivingMin !== null && drivingMin <= Number(f.c));
    const affordPass =
      !f.a || (f.a === 'w' ? fo : f.a === 'n' ? !fo && fn : !fn);
    const queryPass =
      !f.q || a[0].toLowerCase().includes(f.q.toLowerCase());
    const vis = rentPass && commutePass && affordPass && queryPass;

    return {
      i,
      a,
      x,
      route,
      roadKm,
      drivingMin,
      hasValidRoute,
      g,
      sc,
      scoreBreakdown: {
        affordability: affordabilityScore,
        commute: commuteScore,
        savings: savingsScore,
        lifestyle: lifestyleScore,
      },
      why,
      vis,
    };
  });

  // Sort neighbourhoods according to user's priorities
  const sortBy = f.sortBy || 'score';
  return list.sort((p, q) => {
    switch (sortBy) {
      case 'rent':
        return p.x.e.rent - q.x.e.rent;
      case 'commute':
        return (p.drivingMin ?? 999) - (q.drivingMin ?? 999);
      case 'savings':
        return q.x.sav - p.x.sav;
      case 'distance':
        return (p.roadKm ?? 999) - (q.roadKm ?? 999);
      case 'score':
      default:
        return q.sc - p.sc;
    }
  });
};

export const getChosenNeighbourhood = (
  state: RelocationState,
  scored: ScoredNeighbourhood[]
): ScoredNeighbourhood => {
  if (state.sel.length > 0) {
    const found = scored.find((r) => r.i === state.sel[0]);
    if (found) return found;
  }
  return scored[0];
};
