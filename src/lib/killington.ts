import { RawEntry } from "./types";
import killingtonData from "@/data/killington.json";

// Real Anon Technologies dashboard, pulled from dashboard.castle.tech
// (generated_dashboards 910c2811-6022-4bd6-ab10-d20cc64d8672) — 24 risks / 59 markets.
const base = killingtonData as unknown as RawEntry;

// Added risk: SEC making quarterly reporting optional. Linked to the live Kalshi market
// KXSECQUARTERLY-26MAR-27APR01 (last price 26% as of 6/24/2026). For an investor-facing
// alt-data vendor this is a demand catalyst — less official disclosure widens the gap Anon fills.
const SEC_QUARTERLY_EVENT = {
  id: "evt-sec-quarterly",
  event_key: "evt-sec-quarterly",
  title: "SEC makes quarterly reporting optional",
  description:
    "An SEC final rule making quarterly (10-Q) reporting optional would sharply cut how often public companies disclose financials — reshaping the information landscape Anon's investor-facing retail intelligence operates in.",
  category: "regulatory_actions",
  severity: "high",
  timeframe: "By Jan 1, 2027",
  sort_order: 100,
  sources: [
    {
      title: "Kalshi — Will the SEC eliminate the quarterly reporting requirement?",
      url: "https://kalshi.com/markets/kxsecquarterly/will-the-sec-eliminate-the-quarterly-reporting-requirement/kxsecquarterly-26mar?op_market_ticker=KXSECQUARTERLY-26MAR-27APR01",
    },
  ],
};

const SEC_QUARTERLY_CONTRACT = {
  id: "kalshi-KXSECQUARTERLY-26MAR-27APR01",
  contract_key: "kalshi-KXSECQUARTERLY-26MAR-27APR01",
  event_key: "evt-sec-quarterly",
  event_id: "evt-sec-quarterly",
  title:
    "Will the SEC announce a final rule making quarterly reporting optional for public companies before Jan 1, 2027?",
  short_title: "SEC Makes Quarterly Reporting Optional",
  display_title: null,
  description:
    "Resolves YES if the SEC publishes a final rule (any effective date) making quarterly reporting optional for public companies before January 1, 2027.",
  platform: "kalshi",
  category: "regulatory_actions",
  probability: 0.26,
  volume: 4289,
  expiry_date: "2027-01-01",
  url: "https://kalshi.com/markets/kxsecquarterly/will-the-sec-eliminate-the-quarterly-reporting-requirement/kxsecquarterly-26mar?op_market_ticker=KXSECQUARTERLY-26MAR-27APR01",
  relevance_score: 0.92,
  tags: [],
  event_title: "SEC makes quarterly reporting optional",
  rationale:
    "If the SEC makes quarterly reporting optional, public companies disclose far less frequently — widening the information gap that Anon's near-real-time retail intelligence is built to fill, a direct demand catalyst for its investor subscriptions.",
  is_major: true,
  sort_order: 0,
  allocation_pct: 32, // featured — highest modeled value so it ranks first in the ledger
  position: "Buy YES",
  days_left: null,
  resolution: "Jan 1, 2027",
  liquidity: "moderate",
  contract_type: "conditional",
  radar_label: "SEC disclosure reform",
  loss_steps: [],
  sources: [
    {
      title: "Kalshi — Will the SEC eliminate the quarterly reporting requirement?",
      url: "https://kalshi.com/markets/kxsecquarterly/will-the-sec-eliminate-the-quarterly-reporting-requirement/kxsecquarterly-26mar?op_market_ticker=KXSECQUARTERLY-26MAR-27APR01",
    },
  ],
};

export const killingtonEntry: RawEntry = {
  company: base.company,
  dashboard: base.dashboard,
  events: [SEC_QUARTERLY_EVENT, ...base.events],
  contracts: [SEC_QUARTERLY_CONTRACT, ...base.contracts],
  // bespoke value-chain for a public-data intelligence business (like Linea's project map)
  chainLabel: "EXPOSURE MAP · ACROSS THE BUSINESS",
  chainSpan: "data sourcing through capital",
  valueChain: [
    { stage: "Data sourcing", eventKeys: ["evt-0", "evt-8", "evt-5", "evt-7", "evt-12"] },
    { stage: "Data rights", eventKeys: ["evt-16", "evt-1", "evt-10", "evt-2", "evt-6", "evt-13", "evt-11", "evt-17", "evt-18", "evt-21"] },
    { stage: "Client base", eventKeys: ["evt-20", "evt-9", "evt-4", "evt-3", "evt-14", "evt-15"] },
    { stage: "Market & capital", eventKeys: ["evt-sec-quarterly", "evt-19", "evt-23", "evt-22"] },
  ],
  // illustrative modeled-exposure total — kept in low millions, sized so every facet reads as a clean $M
  programOverride: 16,
  // concise display names — replace the verbose pipeline titles (case dockets, statute sections)
  nameByEvent: {
    "evt-0": "Reddit v. SerpApi scraping suit",
    "evt-1": "California Delete Act deadline",
    "evt-2": "California AI decision rules",
    "evt-3": "SEC adviser data-breach rules",
    "evt-4": "SEC alt-data exam priorities",
    "evt-5": "Appeals court scraping ruling",
    "evt-6": "Browser opt-out signal rule",
    "evt-7": "Meta v. Bright Data ruling",
    "evt-8": "Amazon blocks scraping bots",
    "evt-9": "SEC alt-data vendor scrutiny",
    "evt-10": "California data-broker deletion",
    "evt-11": "Federal data-broker bill",
    "evt-12": "DOJ bulk-data transfer ban",
    "evt-13": "FTC data-broker enforcement",
    "evt-14": "SEC breach-notice deadline",
    "evt-15": "SEC enforcement pullback",
    "evt-16": "California data-broker fines",
    "evt-17": "Federal broker registration",
    "evt-18": "Senate consumer-privacy bill",
    "evt-19": "Funds build alt-data in-house",
    "evt-20": "Alt-data as insider information",
    "evt-21": "Online Privacy Act",
    "evt-22": "Trump AI deregulation order",
    "evt-23": "Fintech funding crunch",
  },
  // finer risk facets (smaller subheadings) — drive the risk chips + the exposure-mix donut
  facetByEvent: {
    "evt-sec-quarterly": "Market structure",
    "evt-22": "Market structure",
    "evt-19": "Capital & demand",
    "evt-23": "Capital & demand",
    "evt-4": "SEC oversight",
    "evt-9": "SEC oversight",
    "evt-15": "SEC oversight",
    "evt-20": "SEC oversight",
    "evt-3": "SEC oversight",
    "evt-14": "SEC oversight",
    "evt-1": "Data privacy",
    "evt-2": "Data privacy",
    "evt-6": "Data privacy",
    "evt-10": "Data privacy",
    "evt-16": "Data privacy",
    "evt-11": "Data-broker law",
    "evt-13": "Data-broker law",
    "evt-17": "Data-broker law",
    "evt-18": "Data-broker law",
    "evt-21": "Data-broker law",
    "evt-0": "Web-data access",
    "evt-5": "Web-data access",
    "evt-7": "Web-data access",
    "evt-8": "Web-data access",
    "evt-12": "Web-data access",
  },
  // Linea-style profile (avoids the seed-stage revenue band clashing with the illustrative total)
  profileOverride: [
    { k: "Headquarters", v: "San Francisco, CA" },
    { k: "Founded", v: "2021" },
    { k: "Stage", v: "Seed-funded" },
    { k: "Serves", v: "Hedge funds · institutional investors" },
    { k: "Lead exposure", v: "Regulatory" },
    { k: "Priced risks", v: "25 · 60 markets" },
  ],
};
