import { RouteInfo } from './services/routingService';

export type CityKey = 'blr' | 'ncr' | 'bom' | 'pun' | 'hyd' | 'che' | string;

export type AccommodationType = 'alone' | 'share' | 'pg';

export type PropertyType =
  | 'studio'
  | 'b1'
  | 'b2'
  | 'pr'
  | 'sr'
  | 's2'
  | 'pg1'
  | 'pg2'
  | 'pg3';

export type FoodHabit = 'cook' | 'mix' | 'out';

export type TransportMode = 'pub' | 'two' | 'car' | 'cab' | 'combo';

export type LifestyleTier = 'bud' | 'mod' | 'comf';

export type ExpenseCategory =
  | 'rent'
  | 'food'
  | 'trans'
  | 'util'
  | 'net'
  | 'pers'
  | 'ent'
  | 'oth';

export type SortPriority =
  | 'score'
  | 'rent'
  | 'commute'
  | 'savings'
  | 'distance';

export interface WorkplaceHub {
  name: string;
  lat: number;
  lng: number;
}

export type AreaData = [string, number, number, number]; // [name, lat, lng, multiplier]
export type TransitData = [string, number, number]; // [name, lat, lng]

export interface CityData {
  key: CityKey;
  name: string;
  stateName: string;
  center: [number, number];
  depositMonthsRange: [number, number]; // [min, max]
  defaultDepositMonths: number;
  standardBrokerageMonths: number;
  acMonthlyModifier: number;
  description: string;
  hubs: [string, number, number][];
  areas: AreaData[];
}

export interface ExpenseBreakdown {
  rent: number;
  food: number;
  trans: number;
  util: number;
  net: number;
  pers: number;
  ent: number;
  oth: number;
}

export interface EstimationResult {
  km: number;
  rd: number;
  min: number;
  e: ExpenseBreakdown;
  tot: number;
  sav: number;
}

export interface ScoringWeights {
  affordability: number; // default 0.40
  commute: number; // default 0.30
  savings: number; // default 0.20
  lifestyle: number; // default 0.10
}

export interface ScoreBreakdown {
  affordability: number;
  commute: number;
  savings: number;
  lifestyle: number;
}

export interface ScoredNeighbourhood {
  i: number;
  a: AreaData;
  x: EstimationResult;
  route?: RouteInfo | null;
  roadKm?: number | null;
  drivingMin?: number | null;
  hasValidRoute: boolean;
  g: 0 | 1 | 2; // 0 = Best fit, 1 = Worth considering, 2 = Stretch
  sc: number;
  scoreBreakdown: ScoreBreakdown;
  why: string;
  vis: boolean;
}

export interface MovingCostBreakdown {
  securityDeposit: number;
  depositMonths: number;
  brokerageFee: number;
  brokerageMonths: number;
  moversPackers: number;
  initialSetupReserve: number;
  totalMovingOutlay: number;
  assumptions: {
    depositRule: string;
    brokerageRule: string;
    movingDistanceTier: string;
    setupRule: string;
  };
}

export type VerdictStatus =
  | 'highly_favourable'
  | 'favourable_tradeoffs'
  | 'marginal_gain'
  | 'high_financial_risk';

export interface VerdictPillar {
  label: string;
  status: 'pass' | 'warning' | 'fail';
  metric: string;
  detail: string;
}

export interface RelocationVerdict {
  status: VerdictStatus;
  badgeLabel: string;
  headline: string;
  rationale: string;
  pillars: {
    surplus: VerdictPillar;
    savingsRate: VerdictPillar;
    liquidity: VerdictPillar;
    commute: VerdictPillar;
  };
  paybackMonths: number;
  netAnnualRelocationGain: number;
  currentSavings: number;
  destSavings: number;
  savingsDeltaMonthly: number;
  currentSavingsRate: number;
  destSavingsRate: number;
}

export interface FilterState {
  r: string; // rent band index or ''
  c: string; // max commute or ''
  a: string; // 'w' (within), 'n' (near), 'a' (above) or ''
  q: string; // search query
  sortBy?: SortPriority;
}

export interface MapLayersState {
  n: boolean; // neighbourhood markers
  w: boolean; // workplace marker
  c: boolean; // commute routes
  r?: boolean; // rental estimates pill
  t?: boolean; // transit stations
}

export interface SavedPlan {
  id: string;
  timestamp: string;
  title: string;
  state: RelocationState;
}

export interface RelocationState {
  v: 'land' | 'step';
  st: number; // 0 to 5
  max: number; // highest step reached
  tab: 'rep' | 'cmp' | 'plan';
  city: CityKey;
  wp: WorkplaceHub | null;
  sal: number; // Destination in-hand monthly salary
  currentSal: number; // Current city in-hand monthly salary
  currentExpenses: number; // Current city monthly living expenses
  tgt: number; // Monthly savings goal
  tm: 'target' | 'calc';
  com: number; // Fixed debt / EMI commitments
  acc: AccommodationType;
  prop: PropertyType;
  food: FoodHabit;
  tr: TransportMode;
  life: LifestyleTier;
  maxc: number;
  sel: number[]; // shortlisted neighbourhood indices
  ov: Partial<Record<ExpenseCategory, number>>;
  // Transparent moving cost overrides
  depositMonthsOverride?: number;
  brokerageOverride?: number;
  moversOverride?: number;
  setupOverride?: number;
  f: FilterState;
  from: string; // Origin city
  weights?: ScoringWeights;
}
