import {
  AccommodationType,
  CityData,
  CityKey,
  EstimationResult,
  ExpenseBreakdown,
  ExpenseCategory,
  FoodHabit,
  LifestyleTier,
  MovingCostBreakdown,
  PropertyType,
  RelocationState,
  RelocationVerdict,
  ScoreBreakdown,
  ScoredNeighbourhood,
  ScoringWeights,
  SortPriority,
  TransitData,
  TransportMode,
  VerdictPillar,
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
  'BLUEPRINT',
] as const;

// Base rents benchmarked across 5 accommodation tiers:
// [PG base, Shared room, Private room, 1 BHK, 2 BHK]
export const BASE: Record<string, number[]> = {
  blr: [8000, 6000, 11000, 18000, 28000],
  ncr: [8500, 6000, 11000, 18000, 28000],
  bom: [11000, 9000, 16000, 26000, 42000],
  pun: [7000, 5000, 9000, 15000, 24000],
  hyd: [7000, 5000, 9500, 15000, 24000],
  che: [7000, 5000, 9500, 15000, 24000],
};

// Rich, extensible multi-city catalog supporting immediate addition of any Indian metropolis
export const CITIES: Record<string, CityData> = {
  blr: {
    key: 'blr',
    name: 'Bengaluru',
    stateName: 'Karnataka',
    center: [12.9716, 77.5946],
    depositMonthsRange: [6, 10],
    defaultDepositMonths: 8,
    standardBrokerageMonths: 1,
    acMonthlyModifier: 1500,
    description: 'India\'s tech capital with premier engineering clusters, moderate climate, but notable 6–10 month upfront deposit customs and corridor traffic.',
    hubs: [
      ['Outer Ring Road · Bellandur', 12.9387, 77.722],
      ['Whitefield · ITPL', 12.9698, 77.75],
      ['Electronic City', 12.8452, 77.6602],
      ['Manyata Tech Park', 13.045, 77.62],
      ['MG Road / CBD', 12.9756, 77.6068],
      ['Bagmane Tech Park', 12.978, 77.66],
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
    stateName: 'Delhi / Haryana / UP',
    center: [28.57, 77.18],
    depositMonthsRange: [2, 3],
    defaultDepositMonths: 2,
    standardBrokerageMonths: 1,
    acMonthlyModifier: 6500,
    description: 'Fast-paced corporate and financial hub with 16-lane expressways, extensive Metro reach, flexible 2-month deposits, but significant summer AC electricity spikes.',
    hubs: [
      ['Cyber City · Gurugram', 28.495, 77.089],
      ['Golf Course Road · Gurugram', 28.443, 77.101],
      ['Udyog Vihar · Gurugram', 28.5035, 77.079],
      ['Noida Sector 62', 28.627, 77.365],
      ['Noida Sector 18', 28.57, 77.322],
      ['Connaught Place · Delhi', 28.6315, 77.2167],
      ['Aerocity · Delhi', 28.551, 77.121],
    ],
    areas: [
      ['Cyber City · Gurugram', 28.495, 77.089, 1.7],
      ['Golf Course Road · Gurugram', 28.443, 77.101, 2.0],
      ['Sector 56 · Gurugram', 28.424, 77.106, 1.4],
      ['Udyog Vihar · Gurugram', 28.5035, 77.079, 1.2],
      ['Sohna Road · Gurugram', 28.41, 77.042, 1.0],
      ['Dwarka · Delhi', 28.5921, 77.046, 0.9],
      ['Saket · South Delhi', 28.5245, 77.2066, 1.5],
      ['Vasant Kunj · Delhi', 28.52, 77.159, 1.6],
      ['Connaught Place · Delhi', 28.6315, 77.2167, 2.0],
      ['Sector 62 · Noida', 28.627, 77.365, 1.0],
      ['Sector 18 · Noida', 28.57, 77.322, 1.3],
      ['Sector 137 · Noida', 28.509, 77.4, 0.8],
      ['Sector 50 · Noida', 28.572, 77.365, 1.1],
    ],
  },
  bom: {
    key: 'bom',
    name: 'Mumbai MMR',
    stateName: 'Maharashtra',
    center: [19.076, 72.8777],
    depositMonthsRange: [6, 10],
    defaultDepositMonths: 6,
    standardBrokerageMonths: 1,
    acMonthlyModifier: 3500,
    description: 'Financial capital with unmatched coastal energy, local train lifelines, but India\'s highest square-foot residential rentals and compact space standards.',
    hubs: [
      ['Bandra-Kurla Complex (BKC)', 19.0665, 72.8688],
      ['Lower Parel / Worli', 18.995, 72.825],
      ['Andheri East · SEEPZ', 19.1197, 72.875],
      ['Powai Tech Corridor', 19.1176, 72.906],
      ['Mindspace · Malad', 19.182, 72.836],
      ['Thane Corporate Hub', 19.2183, 72.9781],
    ],
    areas: [
      ['BKC / Bandra East', 19.0665, 72.8688, 1.9],
      ['Lower Parel', 18.995, 72.825, 2.1],
      ['Andheri West', 19.135, 72.829, 1.6],
      ['Andheri East', 19.1197, 72.875, 1.3],
      ['Powai', 19.1176, 72.906, 1.5],
      ['Goregaon East', 19.1663, 72.8596, 1.2],
      ['Malad West', 19.186, 72.848, 1.1],
      ['Thane West', 19.2183, 72.9781, 0.85],
    ],
  },
  pun: {
    key: 'pun',
    name: 'Pune',
    stateName: 'Maharashtra',
    center: [18.5204, 73.8567],
    depositMonthsRange: [2, 4],
    defaultDepositMonths: 3,
    standardBrokerageMonths: 1,
    acMonthlyModifier: 1800,
    description: 'Vibrant education and software hub with pleasant plateau weather, reasonable rental deposits, and self-contained IT townships in East and West corridors.',
    hubs: [
      ['Hinjewadi Phase 1 / Quadron', 18.5913, 73.7389],
      ['Kharadi · EON IT Park', 18.552, 73.945],
      ['Magarpatta City', 18.5135, 73.929],
      ['Baner · Balewadi High Street', 18.563, 73.784],
      ['Viman Nagar · Business Bay', 18.5679, 73.9143],
    ],
    areas: [
      ['Wakad', 18.5987, 73.7684, 1.0],
      ['Hinjewadi', 18.5913, 73.7389, 0.9],
      ['Baner', 18.563, 73.784, 1.25],
      ['Aundh', 18.558, 73.807, 1.3],
      ['Viman Nagar', 18.5679, 73.9143, 1.3],
      ['Kharadi', 18.552, 73.945, 1.1],
      ['Magarpatta City', 18.5135, 73.929, 1.2],
      ['Kothrud', 18.5074, 73.8077, 1.1],
    ],
  },
  hyd: {
    key: 'hyd',
    name: 'Hyderabad',
    stateName: 'Telangana',
    center: [17.385, 78.4867],
    depositMonthsRange: [2, 3],
    defaultDepositMonths: 2,
    standardBrokerageMonths: 0.5,
    acMonthlyModifier: 3000,
    description: 'Rapidly growing tech powerhouse with wide arterial ring roads, high-rise gated communities, generous living space, and landlord-friendly 2-month deposits.',
    hubs: [
      ['HITEC City · Cyber Towers', 17.4475, 78.3762],
      ['Gachibowli · Wipro Circle', 17.4401, 78.3489],
      ['Financial District · Nanakramguda', 17.414, 78.343],
      ['Madhapur IT Corridor', 17.4483, 78.3915],
      ['Kondapur Tech Hub', 17.464, 78.358],
    ],
    areas: [
      ['Gachibowli', 17.4401, 78.3489, 1.15],
      ['Madhapur', 17.4483, 78.3915, 1.25],
      ['Kondapur', 17.464, 78.358, 1.1],
      ['Nanakramguda', 17.414, 78.343, 1.2],
      ['Jubilee Hills', 17.4319, 78.4073, 1.7],
      ['Banjara Hills', 17.4156, 78.4357, 1.6],
      ['Kukatpally', 17.4938, 78.4018, 0.9],
      ['Tellapur', 17.472, 78.298, 0.85],
    ],
  },
  che: {
    key: 'che',
    name: 'Chennai',
    stateName: 'Tamil Nadu',
    center: [13.0827, 80.2707],
    depositMonthsRange: [4, 6],
    defaultDepositMonths: 5,
    standardBrokerageMonths: 1,
    acMonthlyModifier: 4000,
    description: 'Major SaaS, automotive, and deep tech capital along the scenic OMR corridor with strong cultural roots, metro reach, and moderate living expenses.',
    hubs: [
      ['OMR · Tidel Park', 12.9897, 80.2483],
      ['Sholinganallur Junction', 12.901, 80.227],
      ['Guindy Industrial Estate', 13.0067, 80.2026],
      ['Siruseri SIPCOT Tech Park', 12.825, 80.222],
      ['Ambattur Industrial Estate', 13.097, 80.162],
    ],
    areas: [
      ['Thoraipakkam · OMR', 12.935, 80.237, 1.0],
      ['Sholinganallur · OMR', 12.901, 80.227, 0.95],
      ['Perungudi', 12.965, 80.243, 1.1],
      ['Adyar', 13.0012, 80.2565, 1.5],
      ['Velachery', 12.9815, 80.218, 1.15],
      ['Anna Nagar', 13.085, 80.21, 1.4],
      ['Medavakkam', 12.918, 80.192, 0.85],
    ],
  },
};

// Key Metro and Transit Stations across Indian hubs
export const TRANSIT_STATIONS: Record<string, TransitData[]> = {
  blr: [
    ['Whitefield (Kadugodi) Metro', 12.9955, 77.7577],
    ['Baiyappanahalli Metro', 12.9907, 77.6523],
    ['Indiranagar Metro', 12.9783, 77.6386],
    ['MG Road Metro', 12.9756, 77.6068],
    ['Silk Board Metro (Upcoming)', 12.9174, 77.6238],
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
  bom: [
    ['Ghatkopar Metro', 19.086, 72.908],
    ['Andheri Metro / Railway', 19.1197, 72.8464],
    ['BKC Metro (Line 3)', 19.0665, 72.8688],
    ['Lower Parel Monorail', 18.995, 72.825],
  ],
  pun: [
    ['Hinjewadi Metro (Line 3)', 18.5913, 73.7389],
    ['Shivajinagar Metro', 18.5314, 73.8446],
    ['Kalyani Nagar Metro', 18.547, 73.903],
    ['Civil Court Interchange', 18.528, 73.856],
  ],
  hyd: [
    ['HITEC City Metro', 17.4475, 78.3762],
    ['Raidurg Metro', 17.4418, 78.378],
    ['Ameerpet Interchange', 17.4375, 78.4483],
    ['Miyapur Metro', 17.4968, 78.3547],
  ],
  che: [
    ['Guindy Metro', 13.0067, 80.2026],
    ['Chennai Central Metro', 13.0827, 80.2755],
    ['Airport Metro', 12.981, 80.163],
    ['Koyambedu Metro', 13.0732, 80.1943],
  ],
};

// Property mapping: [Label, Accommodation category, Base index (0-4), Multiplier]
export const PROPERTIES: Record<
  PropertyType,
  [string, AccommodationType, number, number]
> = {
  studio: ['Studio Apartment', 'alone', 3, 0.8],
  b1: ['1 BHK Independent', 'alone', 3, 1.0],
  b2: ['2 BHK Gated Community', 'alone', 4, 1.0],
  pr: ['Private Room in 3BHK', 'share', 2, 1.0],
  sr: ['Shared Bedroom in 2BHK', 'share', 1, 1.0],
  s2: ['Shared 2 BHK Flat', 'share', 4, 0.5],
  pg1: ['PG Single Occupancy', 'pg', 0, 1.0],
  pg2: ['PG Double Sharing', 'pg', 0, 0.7],
  pg3: ['PG Triple Sharing', 'pg', 0, 0.55],
};

export const ACCOMMODATIONS: Record<AccommodationType, string> = {
  alone: 'Living independently (Private Flat/Studio)',
  share: 'Sharing a flat with roommates',
  pg: 'Paying Guest (PG / Co-living)',
};

export const FOOD_HABITS: Record<FoodHabit, string> = {
  cook: 'Mostly cooking at home / Cook hired',
  mix: 'Mix of home cooking & casual dining',
  out: 'Predominantly dining out / Swiggy-Zomato',
};

export const TRANSPORT_MODES: Record<TransportMode, string> = {
  pub: 'Public transit (Metro / Bus feeder)',
  two: 'Two-wheeler (Bike / Scooter)',
  car: 'Personal Car / Fuel & Tolls',
  cab: 'App Cabs (Uber / Ola / Rapido)',
  combo: 'Smart Combo (Metro + Auto feeder)',
};

export const LIFESTYLE_TIERS: Record<
  LifestyleTier,
  { label: string; desc: string }
> = {
  bud: {
    label: 'Budget-conscious',
    desc: 'Mindful groceries, home-cooked food, frugal leisure activities',
  },
  mod: {
    label: 'Balanced Moderate',
    desc: 'Standard dining, weekend recreation, occasional entertainment',
  },
  comf: {
    label: 'Comfort & Convenience',
    desc: 'Premium groceries, regular dining, ride-hailing convenience',
  },
};

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, string> = {
  rent: 'Housing Rent',
  food: 'Food & Groceries',
  trans: 'Commute & Travel',
  util: 'Utilities (Power / Water)',
  net: 'High-speed Internet & Mobile',
  pers: 'Personal Care & Grooming',
  ent: 'Social & Leisure',
  oth: 'Household & Misc',
};

export const INITIAL_STATE: RelocationState = {
  v: 'land',
  st: 0,
  max: 0,
  tab: 'rep',
  city: 'blr',
  wp: {
    name: 'Outer Ring Road · Bellandur',
    lat: 12.9387,
    lng: 77.722,
  },
  sal: 95000, // Destination take-home
  currentSal: 72000, // Current take-home
  currentExpenses: 44000, // Current monthly living expenses
  tgt: 25000,
  tm: 'target',
  com: 0,
  acc: 'alone',
  prop: 'b1',
  food: 'mix',
  tr: 'combo',
  life: 'mod',
  maxc: 35,
  sel: [],
  ov: {},
  f: { r: '', c: '', a: '', q: '' },
  from: 'Pune',
};

// Utilities
export const formatINR = (n: number): string => {
  const rounded = Math.round(n);
  const prefix = rounded < 0 ? '-₹' : '₹';
  return prefix + Math.abs(rounded).toLocaleString('en-IN');
};

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
  const cityKey = BASE[city] ? city : 'blr';
  const baseCategoryIndex = PROPERTIES[prop][2];
  const propMultiplier = PROPERTIES[prop][3];
  return BASE[cityKey][baseCategoryIndex] * areaMultiplier * propMultiplier;
};

export const estimateExpenses = (
  city: CityKey,
  area: [string, number, number, number],
  wp: WorkplaceHub,
  useOverrides: boolean,
  state: RelocationState
): EstimationResult => {
  const cityData = CITIES[city] || CITIES.blr;
  const km = haversineDistance(area[1], area[2], wp.lat, wp.lng);
  const rd = +(km * 1.38).toFixed(1); // Calibrated real road distance multiplier
  const lm = { bud: 0.85, mod: 1.0, comf: 1.25 }[state.life];
  const accommodationCategory = PROPERTIES[state.prop][1];

  // Transportation calculations based on mode and road distance
  const pub = 800 + rd * 60;
  const cab = rd * 616;
  const tr = {
    pub,
    two: 1500 + rd * 70,
    car: 5000 + rd * 150,
    cab,
    combo: 0.55 * pub + 0.45 * cab,
  }[state.tr];

  // Traffic congestion calibration by transport mode
  const minutesPerKm = {
    pub: 3.2,
    two: 2.2,
    car: 2.9,
    cab: 2.9,
    combo: 2.8,
  }[state.tr];
  const min = Math.max(10, Math.round(rd * minutesPerKm + 5));

  // Food costs based on routine and lifestyle tier
  const foodBase = { cook: 6500, mix: 9000, out: 13000 }[state.food] * lm;

  // Utility costs including city-specific power adjustments (e.g. NCR AC power)
  const baseUtil =
    accommodationCategory === 'pg'
      ? 500
      : accommodationCategory === 'share'
      ? 1200
      : state.prop === 'b2'
      ? 3200
      : 2200;
  const util = baseUtil + (accommodationCategory !== 'pg' ? cityData.acMonthlyModifier : 0);

  // Internet & mobile
  const net = accommodationCategory === 'pg' ? 700 : 1100;

  // Personal & entertainment
  const pers = 3200 * lm;
  const ent = 3500 * lm;
  const oth = 2200;

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

  // Apply custom user overrides if enabled
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

/**
 * Transparent moving and setup cost estimation with explicit micro-market assumptions
 * and support for custom user overrides.
 */
export function calculateMovingCosts(
  fromCityName: string,
  destCityKey: CityKey,
  rentMonthly: number,
  propType: PropertyType,
  state: RelocationState
): MovingCostBreakdown {
  const cityData = CITIES[destCityKey] || CITIES.blr;

  // 1. Security Deposit: customizable months of rent based on local customs
  const depositMonths =
    state.depositMonthsOverride !== undefined
      ? state.depositMonthsOverride
      : cityData.defaultDepositMonths;
  const securityDeposit = Math.round(rentMonthly * depositMonths);

  // 2. Brokerage Fee: standard 1 month rent or direct owner (0)
  const brokerageMonths =
    state.brokerageOverride !== undefined
      ? state.brokerageOverride
      : cityData.standardBrokerageMonths;
  const brokerageFee = Math.round(rentMonthly * brokerageMonths);

  // 3. Inter-City Movers & Packers
  let defaultMovers = 22000;
  const isSameCity =
    fromCityName.toLowerCase().trim() === cityData.name.toLowerCase().trim();

  if (isSameCity) {
    defaultMovers = 9000;
  } else {
    // Distance tier based on common city pairs
    const lowerFrom = fromCityName.toLowerCase().trim();
    if (lowerFrom.includes('pune') && destCityKey === 'blr') defaultMovers = 24000;
    else if (lowerFrom.includes('mumbai') && destCityKey === 'blr') defaultMovers = 28000;
    else if (lowerFrom.includes('delhi') && destCityKey === 'blr') defaultMovers = 34000;
    else if (lowerFrom.includes('hyderabad') && destCityKey === 'blr') defaultMovers = 20000;
    else if (lowerFrom.includes('chennai') && destCityKey === 'blr') defaultMovers = 16000;
    else defaultMovers = 25000;
  }

  // Adjust moving cost by accommodation scale
  const isLarge = propType === 'b2';
  const isSmall = propType.startsWith('pg') || propType === 'sr';
  const scaleMultiplier = isLarge ? 1.3 : isSmall ? 0.6 : 1.0;
  const moversPackers =
    state.moversOverride !== undefined
      ? state.moversOverride
      : Math.round(defaultMovers * scaleMultiplier);

  // 4. Initial Setup Reserve (Wi-Fi installation, grocery buffer, kitchen stocking)
  const defaultSetup = propType.startsWith('pg') ? 8000 : 25000;
  const initialSetupReserve =
    state.setupOverride !== undefined ? state.setupOverride : defaultSetup;

  const totalMovingOutlay =
    securityDeposit + brokerageFee + moversPackers + initialSetupReserve;

  return {
    securityDeposit,
    depositMonths,
    brokerageFee,
    brokerageMonths,
    moversPackers,
    initialSetupReserve,
    totalMovingOutlay,
    assumptions: {
      depositRule: `${depositMonths} months rent (${cityData.depositMonthsRange[0]}–${cityData.depositMonthsRange[1]} mo typical for ${cityData.name})`,
      brokerageRule:
        brokerageMonths === 0
          ? '0 Brokerage (Direct owner / NoBroker)'
          : `${brokerageMonths} month rent (Standard local agent fee)`,
      movingDistanceTier: isSameCity
        ? 'Intra-city relocation vehicle & labor'
        : `Inter-city transport from ${fromCityName || 'Origin'} to ${cityData.name}`,
      setupRule: 'Wi-Fi security, domestic restocking & society move-in fee',
    },
  };
}

/**
 * Intelligent Relocation Verdict: Multidimensional evaluation across
 * 1. Surplus Growth, 2. Savings Rate Quality, 3. Liquidity/Payback Risk, 4. Commute Velocity.
 * No arbitrary scoreboards — pure grounded financial and lifestyle intelligence.
 */
export function evaluateRelocationVerdict(
  destCity: CityKey,
  chosenArea: ScoredNeighbourhood,
  state: RelocationState,
  movingCosts: MovingCostBreakdown
): RelocationVerdict {
  const cityData = CITIES[destCity] || CITIES.blr;
  const targetSavings = getTarget(state);

  // 1. Financial Baseline
  const currentSal = state.currentSal || 70000;
  const currentExpenses = state.currentExpenses || 42000;
  const currentSavings = Math.max(0, currentSal - currentExpenses - state.com);
  const currentSavingsRate = Math.round((currentSavings / currentSal) * 100);

  // 2. Destination Financials
  const destSavings = chosenArea.x.sav;
  const destSavingsRate = Math.round((destSavings / state.sal) * 100);
  const savingsDeltaMonthly = destSavings - currentSavings;
  const netAnnualRelocationGain = savingsDeltaMonthly * 12;

  // 3. Payback Period in months
  const paybackMonths =
    savingsDeltaMonthly > 0
      ? +(movingCosts.totalMovingOutlay / savingsDeltaMonthly).toFixed(1)
      : 999;

  // 4. Commute time
  const travelMin = chosenArea.drivingMin ?? chosenArea.x.min;

  // --- PILLAR EVALUATION ---
  // Pillar 1: Monthly Surplus Growth
  let surplusPillar: VerdictPillar;
  if (savingsDeltaMonthly >= 12000) {
    surplusPillar = {
      label: 'Monthly Surplus Growth',
      status: 'pass',
      metric: `+${formatINR(savingsDeltaMonthly)}/mo`,
      detail: `Your disposable savings grow significantly from ${formatINR(currentSavings)}/mo to ${formatINR(destSavings)}/mo.`,
    };
  } else if (savingsDeltaMonthly >= 0) {
    surplusPillar = {
      label: 'Monthly Surplus Growth',
      status: 'warning',
      metric: `+${formatINR(savingsDeltaMonthly)}/mo`,
      detail: `Surplus growth is modest. Relocation maintains savings parity with your current lifestyle.`,
    };
  } else {
    surplusPillar = {
      label: 'Monthly Surplus Growth',
      status: 'fail',
      metric: `${formatINR(savingsDeltaMonthly)}/mo`,
      detail: `Relocating reduces your monthly savings by ${formatINR(Math.abs(savingsDeltaMonthly))}/mo due to higher local rent.`,
    };
  }

  // Pillar 2: Savings Rate Health
  let ratePillar: VerdictPillar;
  if (destSavingsRate >= 28) {
    ratePillar = {
      label: 'Savings Rate Quality',
      status: 'pass',
      metric: `${destSavingsRate}% net`,
      detail: `Outstanding wealth retention; exceeds the standard 20% financial independence benchmark.`,
    };
  } else if (destSavingsRate >= 18) {
    ratePillar = {
      label: 'Savings Rate Quality',
      status: 'warning',
      metric: `${destSavingsRate}% net`,
      detail: `Healthy savings cushion, slightly below high-savings potential due to fixed liabilities.`,
    };
  } else {
    ratePillar = {
      label: 'Savings Rate Quality',
      status: 'fail',
      metric: `${destSavingsRate}% net`,
      detail: `Tight liquidity cushion; living expenses consume over 82% of your take-home pay.`,
    };
  }

  // Pillar 3: Upfront Liquidity Payback
  let liquidityPillar: VerdictPillar;
  if (paybackMonths <= 6) {
    liquidityPillar = {
      label: 'Upfront Capital Payback',
      status: 'pass',
      metric: `${paybackMonths} months`,
      detail: `Total moving outlay of ${formatINR(movingCosts.totalMovingOutlay)} is fully amortized by month ${Math.ceil(paybackMonths)}.`,
    };
  } else if (paybackMonths <= 14) {
    liquidityPillar = {
      label: 'Upfront Capital Payback',
      status: 'warning',
      metric: `${paybackMonths} months`,
      detail: `Requires ${paybackMonths} months of incremental savings to break even on moving freight and rental deposits.`,
    };
  } else {
    liquidityPillar = {
      label: 'Upfront Capital Payback',
      status: 'fail',
      metric: savingsDeltaMonthly <= 0 ? 'No Payback' : `${paybackMonths} months`,
      detail: `High upfront capital lock (${formatINR(movingCosts.totalMovingOutlay)}) takes over a year to recover.`,
    };
  }

  // Pillar 4: Daily Commute Velocity
  let commutePillar: VerdictPillar;
  if (travelMin <= state.maxc) {
    commutePillar = {
      label: 'Daily Commute Reality',
      status: 'pass',
      metric: `${travelMin} min one-way`,
      detail: `Well within your ${state.maxc} min threshold. Minimal fatigue and surge risk.`,
    };
  } else if (travelMin <= state.maxc + 15) {
    commutePillar = {
      label: 'Daily Commute Reality',
      status: 'warning',
      metric: `${travelMin} min one-way`,
      detail: `Borderline commute overhead (${travelMin} min). Peak hour rain or bottlenecks may push travel to 55+ min.`,
    };
  } else {
    commutePillar = {
      label: 'Daily Commute Reality',
      status: 'fail',
      metric: `${travelMin} min one-way`,
      detail: `Heavy transit penalty (${travelMin} min) exceeding your acceptable comfort radius.`,
    };
  }

  // --- OVERALL SYNTHESIS ---
  const passCount = [surplusPillar, ratePillar, liquidityPillar, commutePillar].filter(
    (p) => p.status === 'pass'
  ).length;
  const failCount = [surplusPillar, ratePillar, liquidityPillar, commutePillar].filter(
    (p) => p.status === 'fail'
  ).length;

  let status: RelocationVerdict['status'];
  let badgeLabel: string;
  let headline: string;
  let rationale: string;

  if (destSavings < 0 || failCount >= 2 || savingsDeltaMonthly < -5000) {
    status = 'high_financial_risk';
    badgeLabel = 'High Financial Risk';
    headline = 'Relocation creates negative cashflow or erodes savings';
    rationale = `Moving to ${chosenArea.a[0]}, ${cityData.name} at your current offer leaves a net monthly surplus of only ${formatINR(destSavings)}/mo. This results in a financial drain compared to staying in ${state.from}. We advise negotiating a higher in-hand package or selecting a more affordable residential corridor.`;
  } else if (passCount >= 3 && failCount === 0) {
    status = 'highly_favourable';
    badgeLabel = 'Highly Favourable';
    headline = 'Strong career and wealth expansion move';
    rationale = `This relocation generates ${formatINR(savingsDeltaMonthly)}/mo in incremental cashflow (${destSavingsRate}% savings rate) while keeping road commute to ${travelMin} minutes. The initial setup capital of ${formatINR(movingCosts.totalMovingOutlay)} is comfortably recouped in ${paybackMonths} months.`;
  } else if (commutePillar.status === 'fail' && surplusPillar.status === 'pass') {
    status = 'favourable_tradeoffs';
    badgeLabel = 'Favourable with Commute Trade-offs';
    headline = 'Substantial wealth gain with notable transit overhead';
    rationale = `Financially, your bankable surplus increases by ${formatINR(savingsDeltaMonthly)}/mo (+${formatINR(netAnnualRelocationGain)}/yr). However, the ${travelMin} min one-way drive to ${state.wp?.name || 'office'} represents a real daily time tax. Consider whether hybrid flexibility makes this viable.`;
  } else {
    status = 'marginal_gain';
    badgeLabel = 'Marginal Gain / Capital Intensive';
    headline = 'Viable lifestyle parity, but capital lock requires caution';
    rationale = `Monthly savings increase by ${formatINR(savingsDeltaMonthly)}/mo. While cashflow remains solvent, the ${cityData.defaultDepositMonths}-month rental deposit and moving costs lock ${formatINR(movingCosts.totalMovingOutlay)} upfront, taking ${paybackMonths} months to amortize.`;
  }

  return {
    status,
    badgeLabel,
    headline,
    rationale,
    pillars: {
      surplus: surplusPillar,
      savingsRate: ratePillar,
      liquidity: liquidityPillar,
      commute: commutePillar,
    },
    paybackMonths,
    netAnnualRelocationGain,
    currentSavings,
    destSavings,
    savingsDeltaMonthly,
    currentSavingsRate,
    destSavingsRate,
  };
}

export const calculateNeighbourhoods = (
  city: CityKey = 'blr',
  wp: WorkplaceHub | null,
  state: RelocationState,
  routeMap?: Map<string, RouteInfo>
): ScoredNeighbourhood[] => {
  const cityData = CITIES[city] || CITIES.blr;
  const defaultHub = cityData.hubs[0];
  const wpObj: WorkplaceHub = wp
    ? wp
    : {
        name: defaultHub[0],
        lat: defaultHub[1],
        lng: defaultHub[2],
      };

  const f = state.f;
  const target = getTarget(state);
  const areas = cityData.areas;
  const weights = state.weights || DEFAULT_SCORING_WEIGHTS;

  const bands: [number, number][] = [
    [0, 8000],
    [8000, 15000],
    [15000, 25000],
    [25000, 40000],
    [40000, 1000000],
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
        ? `~${drivingMin} min (${roadKm} km road drive)`
        : `~${x.min} min (${x.rd} km estimated)`;

    let why = '';
    if (g === 0) {
      why = `${areaSimpleName} is your top corridor match. It keeps housing rent (${formatINR(
        x.e.rent
      )}) balanced, offers a direct commute (${roadCommuteText}) and projects a monthly surplus of ${formatINR(
        x.sav
      )}/mo.`;
    } else if (g === 1) {
      why = `${areaSimpleName} is a viable alternative: rent is ${formatINR(
        x.e.rent
      )}/mo with a commute of ${roadCommuteText}, retaining ${formatINR(
        x.sav
      )}/mo in bankable surplus.`;
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
  return scored[0] || {
    i: 0,
    a: ['Central Corridor', 12.97, 77.59, 1.0],
    x: {
      km: 10,
      rd: 14,
      min: 30,
      e: { rent: 22000, food: 9000, trans: 3500, util: 2000, net: 1000, pers: 3000, ent: 3000, oth: 2000 },
      tot: 45500,
      sav: 49500,
    },
    hasValidRoute: false,
    g: 0,
    sc: 90,
    scoreBreakdown: { affordability: 90, commute: 85, savings: 90, lifestyle: 85 },
    why: 'Default selection',
    vis: true,
  };
};
