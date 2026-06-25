import { CompanyVM, CardVM, ExposureVM, DonutSeg, MixRow } from "./types";
import { GREENS } from "./transform";
import { platformLabel } from "./format";

// Linea Energy — the showcase company from the Castle design prototype, ported faithfully.
// (Its pipeline record exists but was never fully generated, so this preserves the designed
// exposures verbatim. Like every company here, the dollar figures are illustrative.)

type RawExp = {
  id: string; name: string; type: string; severity: string; modeled: number; prob: string;
  horizon: string; summary: string; projects: string; window: string; note: string;
  drivers: string[]; markets: [string, string, string][];
};

const RAW: RawExp[] = [
  {
    id: "module", name: "Solar module tariff", type: "Trade policy", severity: "high", modeled: 51,
    prob: "64%", horizon: "Q1 2027",
    summary: "AD/CVD and Section 201 duties on Southeast-Asian cells raise delivered module cost across the solar pipeline.",
    projects: "Black Bear Solar, Cardinal Solar, Verde Storage", window: "Q2 2026 – Q1 2027",
    note: "A tariff escalation lands directly on the equipment budget for modules already contracted but not yet delivered — the single largest line in Linea's exposure book.",
    drivers: ["Commerce AD/CVD review of Vietnam and Thailand cells", "Section 201 safeguard extension decision", "Bifacial module exclusion status"],
    markets: [["Polymarket", "New solar cell tariff announced before Q4 2026", "64%"], ["Kalshi", "Section 201 safeguard extended", "41%"]],
  },
  {
    id: "ercot", name: "ERCOT merchant floor", type: "Power price", severity: "medium", modeled: 41,
    prob: "30%", horizon: "2027–2029",
    summary: "Merchant power revenue on the Sweetwater tail is exposed to ERCOT real-time price collapse in shoulder months.",
    projects: "Sweetwater Wind", window: "2027–2029 tail",
    note: "The merchant tail beyond the PPA term carries unhedged price risk that scales with solar and wind build-out in ERCOT West.",
    drivers: ["ERCOT West congestion", "Solar saturation in the zone", "Gas price floor"],
    markets: [["Kalshi", "ERCOT average price below $25/MWh in 2027", "30%"]],
  },
  {
    id: "miso", name: "MISO queue delay", type: "Schedule", severity: "high", modeled: 39,
    prob: "51%", horizon: "2027",
    summary: "A Cluster VI study slip risks pushing commercial operation past the tax-credit placed-in-service deadline.",
    projects: "Cardinal Solar", window: "Through 2027",
    note: "Interconnection timing is the most volatile driver in the book — implied probability moved nine points in a single session.",
    drivers: ["MISO Cluster VI study schedule", "FERC interconnection reform implementation", "Network upgrade cost allocation"],
    markets: [["Polymarket", "MISO Cluster VI study completes on schedule", "49%"]],
  },
  {
    id: "battcost", name: "Battery cost inflation", type: "Commodity", severity: "medium", modeled: 34,
    prob: "41%", horizon: "Q3 2026",
    summary: "Delivered DC-block pricing above budget would erode the Verde Storage equipment margin before procurement close.",
    projects: "Verde Storage", window: "Q3 2026 close",
    note: "Lithium carbonate softness has eased this near-term, but a China supply shock remains the tail risk Castle is watching.",
    drivers: ["Lithium carbonate spot path", "China cell oversupply", "Domestic cell ramp timing"],
    markets: [["Polymarket", "Lithium carbonate above $14k/t at year-end", "41%"]],
  },
  {
    id: "step48e", name: "48E ITC step-down", type: "Federal policy", severity: "medium", modeled: 27,
    prob: "29%", horizon: "2026–2027",
    summary: "A §48E credit-rate step-down before placed-in-service would compress tax-equity proceeds across the pipeline.",
    projects: "Portfolio", window: "2026–2027",
    note: "Reconciliation markup timing is pulling the step-down debate forward — watched daily.",
    drivers: ["Reconciliation bill markup schedule", "§6418 transferability final rule", "Phase-out trigger year"],
    markets: [["Polymarket", "48E credit rate reduced before 2027", "29%"], ["Kalshi", "Reconciliation energy package passes in 2026", "38%"]],
  },
  {
    id: "domestic", name: "Domestic content adder", type: "Federal policy", severity: "low", modeled: 22,
    prob: "35%", horizon: "2026",
    summary: "Failure to meet the domestic-content bonus threshold cuts the ITC adder on two construction-stage projects.",
    projects: "Sweetwater Wind, Cardinal Solar", window: "2026 construction",
    note: "Treasury guidance on the manufactured-products percentage is the swing factor for whether the 10-point adder lands.",
    drivers: ["Treasury domestic-content safe-harbor update", "Steel/iron sourcing mix", "Manufactured-products cost test"],
    markets: [["Kalshi", "Treasury finalizes domestic-content rule in 2026", "35%"]],
  },
];

const MODELED_TOTAL = 214;
const maxModeled = Math.max(...RAW.map((e) => e.modeled));

const exposures: ExposureVM[] = RAW.map((e) => ({
  id: e.id,
  name: e.name,
  type: e.type,
  severity: e.severity,
  modeled: `$${e.modeled}M`,
  modeledRaw: e.modeled,
  prob: e.prob,
  barPct: `${Math.max(6, Math.round((e.modeled / maxModeled) * 100))}%`,
  horizon: e.horizon,
  linked: `${e.markets.length} market${e.markets.length === 1 ? "" : "s"}`,
  summary: e.summary,
  whereItHits: e.projects,
  window: e.window,
  note: e.note,
  drivers: e.drivers,
  markets: e.markets.map(([plat, title, price]) => ({
    plat: platformLabel(plat),
    title,
    price,
    url: "",
    position: "",
    liquidity: "",
  })),
  sources: [],
}));

const MIX: [string, number, string][] = [
  ["Trade policy", 24, "$51M"],
  ["Power price", 22, "$47M"],
  ["Federal policy", 20, "$43M"],
  ["Schedule", 18, "$39M"],
  ["Commodity", 16, "$34M"],
];

const mix: MixRow[] = MIX.map(([label, pctN, amt], i) => ({
  label,
  pct: `${pctN}%`,
  amt,
  color: GREENS[i % GREENS.length],
}));

const C = 2 * Math.PI * 70;
let off = 0;
const donut: DonutSeg[] = MIX.map(([, pctN], i) => {
  const len = (pctN / 100) * C;
  const seg = { color: GREENS[i % GREENS.length], dash: `${len.toFixed(1)} ${(C - len).toFixed(1)}`, offset: -off };
  off += len;
  return seg;
});

const expById = Object.fromEntries(exposures.map((e) => [e.id, e]));
const chainItem = (id: string) => {
  const e = expById[id];
  return { id, name: e.name, meta: `${e.modeled} · ${e.prob} implied` };
};

export const lineaView: CompanyVM = {
  id: "linea-energy",
  name: "Linea Energy",
  industryCaps: "ENERGY & UTILITIES",
  domain: "lineaenergy.com",
  mono: "LE",
  monoBg: "#EDF1ED",
  monoFg: "#395938",
  thesis: "Interconnection queue timing and tax-credit step-down risk sit across Linea's 2.4 GW development pipeline.",
  modeledTotal: `$${MODELED_TOTAL}M`,
  risks: exposures.length,
  contracts: exposures.reduce((s, e) => s + e.markets.length, 0),
  aboutLabel: "ABOUT LINEA ENERGY",
  aboutHead: "Utility-scale solar, wind, and storage — developed, financed, and operated.",
  aboutP1:
    "Linea originates, builds, owns, and operates grid-scale renewables — carrying each project from greenfield siting through interconnection, permitting, and financing, then selling power under long-term offtake. Revenue comes from 15–20 year PPAs and merchant tails, with IRA investment tax credits (§48E) monetized via transfer (§6418).",
  profile: [
    { k: "Headquarters", v: "Durham, NC" },
    { k: "Founded", v: "2018" },
    { k: "Structure", v: "Independent power producer" },
    { k: "Stage", v: "Growth-stage" },
    { k: "Pipeline", v: "2.4 GW" },
    { k: "Lead exposure", v: "Trade policy" },
  ],
  footprintLabel: "PROJECT MAP · 4 ACTIVE",
  footprintHead: "Geographic exposure",
  footprint: [
    { name: "Sweetwater Wind", meta: "340 MW · Construction", region: "Nolan Co., TX", dot: "#16573A" },
    { name: "Black Bear Solar", meta: "220 MWac · Pre-construction", region: "Halifax Co., NC", dot: "#2E8056" },
    { name: "Verde Storage", meta: "200 MW / 800 MWh · Late development", region: "Kern Co., CA", dot: "#4FA177" },
    { name: "Cardinal Solar", meta: "180 MWac · Development", region: "Pike Co., IN", dot: "#86C2A1" },
  ],
  donut,
  mix,
  chainLabel: "EXPOSURE MAP · BY VALUE CHAIN",
  chainSpan: "procurement through revenue",
  chain: [
    { stage: "SUPPLY CHAIN", total: "$85M", flex: 1.6, items: [chainItem("module"), chainItem("battcost")] },
    { stage: "CONSTRUCTION", total: "$22M", flex: 1.6, items: [chainItem("domestic")] },
    { stage: "INTERCONNECT", total: "$39M", flex: 1.6, items: [chainItem("miso")] },
    { stage: "OFFTAKE & TAX", total: "$68M", flex: 1.7, items: [chainItem("ercot"), chainItem("step48e")] },
  ],
  exposures,
  keyConcerns: [
    "MISO Cluster VI queue timing is the most volatile driver in the book — implied probability swung nine points in a single session.",
    "Section 201 / AD-CVD solar-module duties remain the single largest exposure line at $51M modeled.",
    "A §48E credit-rate step-down is being pulled forward by reconciliation markup timing — watched daily.",
  ],
};

export const lineaCard: CardVM = {
  id: "linea-energy",
  name: "Linea Energy",
  industryCaps: "ENERGY & UTILITIES",
  domain: "lineaenergy.com",
  blurb: "Renewable energy infrastructure developer building utility-scale solar, wind, and storage across the US.",
  thesis: lineaView.thesis,
  risks: lineaView.risks,
  contracts: lineaView.contracts,
  updated: "5/22/2026",
  dominant: "Trade policy",
  mono: "LE",
  monoBg: "#EDF1ED",
  monoFg: "#395938",
  watch: lineaView.exposures.slice(0, 3).map((e) => ({ label: e.name, tag: e.type })),
};
