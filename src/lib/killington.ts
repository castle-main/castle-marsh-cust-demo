import { RawEntry } from "./types";
import killingtonData from "@/data/killington.json";

// Real Killington Technologies dashboard, pulled from dashboard.castle.tech
// (generated_dashboards 910c2811-6022-4bd6-ab10-d20cc64d8672) — 24 risks / 59 markets.
const base = killingtonData as unknown as RawEntry;

// Added risk: SEC making quarterly reporting optional. Linked to the live Kalshi market
// KXSECQUARTERLY-26MAR-27APR01 (last price 26% as of 6/24/2026). For an investor-facing
// alt-data vendor this is a demand catalyst — less official disclosure widens the gap Killington fills.
const SEC_QUARTERLY_EVENT = {
  id: "evt-sec-quarterly",
  event_key: "evt-sec-quarterly",
  title: "SEC makes quarterly reporting optional",
  description:
    "An SEC final rule making quarterly (10-Q) reporting optional would sharply cut how often public companies disclose financials — reshaping the information landscape Killington's investor-facing retail intelligence operates in.",
  category: "regulatory_actions",
  severity: "high",
  timeframe: "Through Q1 2027",
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
    "Will the SEC announce a final rule making quarterly reporting optional for public companies before Apr 1, 2027?",
  short_title: "SEC Makes Quarterly Reporting Optional",
  display_title: null,
  description:
    "Resolves YES if the SEC publishes a final rule (any effective date) making quarterly reporting optional for public companies before April 1, 2027.",
  platform: "kalshi",
  category: "regulatory_actions",
  probability: 0.26,
  volume: 4289,
  expiry_date: "2027-04-01",
  url: "https://kalshi.com/markets/kxsecquarterly/will-the-sec-eliminate-the-quarterly-reporting-requirement/kxsecquarterly-26mar?op_market_ticker=KXSECQUARTERLY-26MAR-27APR01",
  relevance_score: 0.92,
  tags: [],
  event_title: "SEC makes quarterly reporting optional",
  rationale:
    "If the SEC makes quarterly reporting optional, public companies disclose far less frequently — widening the information gap that Killington's near-real-time retail intelligence is built to fill, a direct demand catalyst for its investor subscriptions.",
  is_major: true,
  sort_order: 0,
  allocation_pct: 32, // featured — highest modeled value so it ranks first in the ledger
  position: "Buy YES",
  days_left: null,
  resolution: "Apr 1, 2027",
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
    "evt-0": "Reddit v. SerpApi — web-scraping ruling",
    "evt-1": "CPPA DELETE Act compliance deadline",
    "evt-2": "CCPA automated-decision (ADMT) rules",
    "evt-3": "SEC Regulation S-P amendments",
    "evt-4": "SEC 2026 alt-data & MNPI exam priorities",
    "evt-5": "DMCA §1201 Second Circuit appeal",
    "evt-6": "CPPA opt-out signal (OOPS) rule",
    "evt-7": "Meta v. Bright Data scraping precedent",
    "evt-8": "Amazon robots.txt bot-blocking",
    "evt-9": "SEC alt-data vendor due-diligence exams",
    "evt-10": "California SB 362 Delete Act (DROP)",
    "evt-11": "SECURE Data Act hearing (H.R. 8413)",
    "evt-12": "DOJ Data Security Program enforcement",
    "evt-13": "FTC PADFAA data-broker enforcement",
    "evt-14": "SEC Regulation S-P compliance deadline",
    "evt-15": "SEC enforcement-division restructuring",
    "evt-16": "CPPA data-broker enforcement strike force",
    "evt-17": "SECURE Data Act broker registration",
    "evt-18": "Consumer Data Privacy Act (S.4211)",
    "evt-19": "Hedge-fund in-house AI disintermediation",
    "evt-20": "SEC §204A alt-data MNPI liability",
    "evt-21": "Online Privacy Act (H.R. 8014)",
    "evt-22": "Trump AI deregulation executive order",
    "evt-23": "Fintech seed-funding concentration",
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
