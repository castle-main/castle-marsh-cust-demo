// ── raw snapshot shapes (subset of what _extract.mjs writes) ──────

export interface RawSource {
  title: string;
  url: string;
}

export interface RawEvent {
  id: string;
  event_key: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  timeframe: string;
  sort_order: number;
  sources: RawSource[];
}

export interface RawContract {
  id: string;
  contract_key: string;
  event_key: string | null;
  event_id: string | null;
  title: string;
  short_title: string | null;
  display_title: string | null;
  description: string;
  platform: string;
  category: string;
  probability: number | null;
  volume: number | null;
  expiry_date: string | null;
  url: string;
  relevance_score: number | null;
  tags: string[];
  event_title: string;
  rationale: string;
  is_major: boolean;
  sort_order: number;
  allocation_pct: number | null;
  position: string | null;
  days_left: number | null;
  resolution: string | null;
  liquidity: string | null;
  contract_type: string | null;
  radar_label: string | null;
  loss_steps: { n: number; text: string }[];
  sources: RawSource[];
}

export interface RawCompany {
  id: string;
  name: string;
  website: string;
  industry: string | null;
  description: string | null;
  revenue_range: string | null;
  employee_count: string | null;
  regions: string[] | null;
  supplier_countries: string[] | null;
  supplier_types: string[] | null;
  customer_type: string | null;
  customer_countries: string[] | null;
  customer_segments: string[] | null;
  risk_factors: string[] | null;
  regulatory_agencies: string[] | null;
  congressional_committees: string[] | null;
  political_exposure_notes: string | null;
  raw_research: string | null;
  citations: string[] | null;
}

export interface RawDashboard {
  id: string;
  brief_headline: string | null;
  brief_summary: string | null;
  brief_points: string[] | null;
  dominant_risk_label: string | null;
  dominant_risk_bucket: string | null;
  risk_concerns: string[] | null;
  data_updated_at: string | null;
  created_at: string | null;
}

export interface RawEntry {
  company: RawCompany;
  dashboard: RawDashboard;
  events: RawEvent[];
  contracts: RawContract[];
  // optional presentation overrides (used for hand-curated showcase companies)
  valueChain?: { stage: string; eventKeys: string[] }[];
  chainLabel?: string;
  chainSpan?: string;
  programOverride?: number; // illustrative modeled-exposure total in $M
  profileOverride?: ProfileRow[];
  facetByEvent?: Record<string, string>; // finer risk facet per event (overrides the broad category)
  nameByEvent?: Record<string, string>; // concise display name per event (overrides the verbose pipeline title)
}

// ── view-model shapes (consumed by components) ────────────────────

export interface CardVM {
  id: string; // slug
  name: string;
  industryCaps: string;
  domain: string;
  blurb: string;
  thesis: string;
  risks: number;
  contracts: number;
  updated: string;
  dominant: string;
  mono: string;
  monoBg: string;
  monoFg: string;
}

export interface ProfileRow {
  k: string;
  v: string;
}
export interface FootprintRow {
  name: string;
  meta: string;
  region: string;
  dot: string;
}
export interface MixRow {
  label: string;
  pct: string;
  amt: string;
  color: string;
}
export interface DonutSeg {
  color: string;
  dash: string;
  offset: number;
}
export interface ChainStage {
  stage: string;
  total: string;
  flex: number;
  items: { id: string; name: string; meta: string }[];
}
export interface MarketLink {
  plat: string;
  title: string;
  price: string;
  url: string;
  position: string;
  liquidity: string;
}
export interface ExposureVM {
  id: string;
  name: string;
  type: string;
  severity: string; // critical | high | medium | low
  modeled: string;
  modeledRaw: number;
  prob: string;
  barPct: string;
  horizon: string;
  linked: string;
  summary: string;
  whereItHits: string;
  window: string;
  note: string;
  drivers: string[];
  markets: MarketLink[];
  sources: RawSource[];
}

export interface CompanyVM {
  id: string; // slug
  name: string;
  industryCaps: string;
  domain: string;
  mono: string;
  monoBg: string;
  monoFg: string;
  thesis: string;
  modeledTotal: string;
  risks: number;
  contracts: number;
  aboutLabel: string;
  aboutHead: string;
  aboutP1: string;
  profile: ProfileRow[];
  footprintLabel: string;
  footprintHead: string;
  footprint: FootprintRow[];
  donut: DonutSeg[];
  mix: MixRow[];
  chainLabel: string;
  chainSpan: string;
  chain: ChainStage[];
  exposures: ExposureVM[];
  keyConcerns: string[];
}
