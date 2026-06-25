import {
  RawEntry,
  RawEvent,
  RawContract,
  RawCompany,
  CardVM,
  CompanyVM,
  ExposureVM,
  MixRow,
  DonutSeg,
  ChainStage,
  FootprintRow,
  ProfileRow,
  MarketLink,
  RawSource,
} from "./types";
import {
  cleanText,
  firstSentence,
  splitSentences,
  capWords,
  capClause,
  scrubIds,
  isBookkeeping,
  expandCountry,
  categoryLabel,
  platformLabel,
  regionName,
  money,
  pct,
  monoInitials,
  hashStr,
  domainOf,
  slugify,
  shortDate,
} from "./format";

export const GREENS = ["#143D28", "#1C5E3C", "#2E8056", "#4FA177", "#86C2A1", "#BBDDC9"];

// accent monogram palette (from the Castle handoff spec)
const MONO_PALETTE = [
  { bg: "#EDF1ED", fg: "#395938" }, // forest
  { bg: "#ECF0F7", fg: "#3A5C9A" }, // blue
  { bg: "#E6EEF1", fg: "#246075" }, // teal
  { bg: "#E3EDEC", fg: "#00544F" }, // deep teal
  { bg: "#E2EAE8", fg: "#002E2C" }, // midnight
];

const SEVERITY_RANK: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

// illustrative hedge-program size by revenue band: [base, jitterRange] in $M
const BANDS: Record<string, [number, number]> = {
  "Over $1B": [220, 140],
  "$500M - $1B": [90, 70],
  "$100M - $500M": [50, 45],
  "$50M - $100M": [30, 25],
  "$10M - $50M": [18, 18],
  "$5M - $10M": [8, 10],
  "$1M - $5M": [5, 7],
  "Under $1M": [3, 4],
};

function programSize(revenueRange: string | null, name: string): number {
  const [base, range] = BANDS[revenueRange || ""] || [60, 40];
  return base + (hashStr(name) % (range + 1));
}

function mono(slug: string) {
  return MONO_PALETTE[hashStr(slug) % MONO_PALETTE.length];
}

// ── exposures ────────────────────────────────────────────────────

function primaryOf(linked: RawContract[]): RawContract {
  return [...linked].sort((a, b) => {
    if (a.is_major !== b.is_major) return a.is_major ? -1 : 1;
    return (b.relevance_score || 0) - (a.relevance_score || 0);
  })[0];
}

function sortLinked(linked: RawContract[]): RawContract[] {
  return [...linked].sort((a, b) => {
    if (a.is_major !== b.is_major) return a.is_major ? -1 : 1;
    return (b.relevance_score || 0) - (a.relevance_score || 0);
  });
}

function marketsOf(linked: RawContract[]): MarketLink[] {
  const seen = new Set<string>();
  const out: MarketLink[] = [];
  for (const c of sortLinked(linked)) {
    const title = capClause(c.display_title || c.short_title || c.title, 104);
    const key = title.toLowerCase().slice(0, 60);
    if (!title || seen.has(key)) continue;
    seen.add(key);
    out.push({
      plat: platformLabel(c.platform),
      title,
      price: pct(c.probability),
      // real markets link to the market; Castle-modeled (synthetic) markets link to their primary source
      url: c.url || c.sources?.[0]?.url || "",
      position: c.position || "",
      liquidity: c.liquidity || "",
    });
    if (out.length >= 10) break;
  }
  return out;
}

function driversOf(linked: RawContract[], fallback: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  let noteUsed = false; // the first rationale is shown as the exposure note — don't repeat it as a driver
  for (const c of sortLinked(linked)) {
    if (!c.rationale || isBookkeeping(c.rationale)) continue; // skip internal hedge-book notes
    if (!noteUsed) { noteUsed = true; continue; } // this one is the note; drivers are the rest
    const phrase = scrubIds(firstSentence(c.rationale, 240)); // full sentence, not a mid-clause cutoff
    const key = phrase.toLowerCase().slice(0, 40);
    if (phrase.length > 8 && !seen.has(key)) {
      seen.add(key);
      out.push(phrase);
    }
    if (out.length >= 4) break;
  }
  if (out.length === 0 && fallback) out.push(scrubIds(firstSentence(fallback, 200)));
  return out;
}

/** Partner-facing note: the best non-bookkeeping rationale, else the event description. */
function noteOf(linked: RawContract[], eventDesc: string): string {
  for (const c of sortLinked(linked)) {
    if (c.rationale && !isBookkeeping(c.rationale)) return scrubIds(c.rationale);
  }
  return cleanText(eventDesc);
}

// lowercase a label for mid-sentence use, but preserve acronyms (FCC, ESG, AD/CVD…)
function lowerPhrase(s: string): string {
  return s
    .split(" ")
    .map((w) => (w.length <= 4 && w === w.toUpperCase() ? w : w.toLowerCase()))
    .join(" ");
}

function whereItHitsOf(linked: RawContract[], industry: string, category: string): string {
  const ind = industry || "the business";
  const labels = linked.map((c) => (c.radar_label || "").trim()).filter(Boolean);
  const focus = labels[0] || categoryLabel(category);
  return `${ind} operations exposed to ${lowerPhrase(focus)}`;
}

function sourcesOf(event: RawEvent, primary: RawContract): RawSource[] {
  const merged = [...(event.sources || []), ...(primary.sources || [])];
  const seen = new Set<string>();
  const out: RawSource[] = [];
  for (const s of merged) {
    const key = (s.url || s.title || "").toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= 5) break;
  }
  return out;
}

function buildExposures(
  events: RawEvent[],
  contracts: RawContract[],
  programTotal: number,
  industry: string,
  facetByEvent?: Record<string, string>,
  nameByEvent?: Record<string, string>
): ExposureVM[] {
  const byEvent: Record<string, RawContract[]> = {};
  for (const c of contracts) {
    const k = c.event_key || "";
    if (!k) continue;
    (byEvent[k] = byEvent[k] || []).push(c);
  }

  const priced = events.filter((e) => (byEvent[e.event_key] || []).length > 0);

  // allocation share -> illustrative dollars. Prefer real hedge-allocation %; fall back to
  // market relevance when a risk has no allocation data, else an equal floor. The same weight
  // feeds BOTH the per-exposure numerator and the denominator, so the parts always sum to
  // programTotal exactly (otherwise the mix/donut would overshoot 100%).
  const weightOf = (e: RawEvent) => {
    const linked = byEvent[e.event_key] || [];
    const alloc = linked.reduce((s, c) => s + (c.allocation_pct || 0), 0);
    if (alloc > 0) return alloc;
    const rel = linked.reduce((s, c) => s + (c.relevance_score || 0), 0);
    return rel > 0 ? rel * 10 : 1;
  };
  const totalAlloc = priced.reduce((s, e) => s + weightOf(e), 0) || 1;

  const built = priced.map((e) => {
    const linked = byEvent[e.event_key];
    const modeledRaw = (programTotal * weightOf(e)) / totalAlloc;
    const primary = primaryOf(linked);
    const note = noteOf(linked, e.description);
    const nkey = note.toLowerCase().slice(0, 40);
    return {
      id: e.event_key,
      name: nameByEvent?.[e.event_key] || cleanText(e.title),
      type: facetByEvent?.[e.event_key] || categoryLabel(e.category),
      severity: (e.severity || "medium").toLowerCase(),
      modeledRaw,
      modeled: money(modeledRaw),
      prob: pct(primary.probability),
      barPct: "0%", // filled below
      horizon: primary.resolution || capClause(cleanText(e.timeframe).replace(/\s*\(.*$/, ""), 40),
      linked: `${linked.length} market${linked.length === 1 ? "" : "s"}`,
      summary: cleanText(e.description),
      whereItHits: whereItHitsOf(linked, industry, e.category),
      window: cleanText(e.timeframe),
      note,
      drivers: driversOf(linked, e.description).filter((d) => d.toLowerCase().slice(0, 40) !== nkey),
      markets: marketsOf(linked),
      sources: sourcesOf(e, primary),
    } as ExposureVM;
  });

  // ranked strictly by modeled value (label says so); severity & name break exact ties
  built.sort((a, b) => {
    if (b.modeledRaw !== a.modeledRaw) return b.modeledRaw - a.modeledRaw;
    const sd = (SEVERITY_RANK[b.severity] || 0) - (SEVERITY_RANK[a.severity] || 0);
    if (sd !== 0) return sd;
    return a.name.localeCompare(b.name);
  });

  const max = Math.max(...built.map((e) => e.modeledRaw), 1);
  for (const e of built) e.barPct = `${Math.max(6, Math.round((e.modeledRaw / max) * 100))}%`;

  return built;
}

// ── mix + donut ──────────────────────────────────────────────────

/** Largest-remainder (Hamilton) rounding so the displayed percentages sum to exactly 100. */
function hamiltonPct(values: number[]): number[] {
  const total = values.reduce((s, v) => s + v, 0) || 1;
  const raw = values.map((v) => (v / total) * 100);
  const floors = raw.map(Math.floor);
  let remainder = 100 - floors.reduce((s, v) => s + v, 0);
  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < order.length && remainder > 0; k++, remainder--) floors[order[k].i]++;
  return floors;
}

function buildMix(exposures: ExposureVM[]): MixRow[] {
  const byType: Record<string, number> = {};
  for (const e of exposures) byType[e.type] = (byType[e.type] || 0) + e.modeledRaw;
  const entries = Object.entries(byType).sort((a, b) => b[1] - a[1]);
  const top = entries.slice(0, 6);
  const rest = entries.slice(6).reduce((s, [, v]) => s + v, 0);
  const labeled: [string, number][] = top.slice();
  if (rest > 0) labeled.push(["Other", rest]);
  const pcts = hamiltonPct(labeled.map(([, v]) => v));
  return labeled.map(([label, v], i) => ({
    label,
    pct: pcts[i] + "%",
    amt: money(v),
    color: GREENS[i % GREENS.length],
  }));
}

function buildDonut(exposures: ExposureVM[], programTotal: number): DonutSeg[] {
  const byType: Record<string, number> = {};
  for (const e of exposures) byType[e.type] = (byType[e.type] || 0) + e.modeledRaw;
  const entries = Object.entries(byType).sort((a, b) => b[1] - a[1]);
  const top = entries.slice(0, 6);
  const rest = entries.slice(6).reduce((s, [, v]) => s + v, 0);
  const vals = top.map(([, v]) => v);
  if (rest > 0) vals.push(rest);

  const C = 2 * Math.PI * 70;
  let off = 0;
  return vals.map((v, i) => {
    const len = (v / programTotal) * C;
    const seg = {
      color: GREENS[i % GREENS.length],
      dash: `${len.toFixed(1)} ${(C - len).toFixed(1)}`,
      offset: -off,
    };
    off += len;
    return seg;
  });
}

// ── value-chain (risk map by theme) ──────────────────────────────

function buildChain(exposures: ExposureVM[]): ChainStage[] {
  const byType: Record<string, ExposureVM[]> = {};
  for (const e of exposures) (byType[e.type] = byType[e.type] || []).push(e);
  const cols = Object.entries(byType)
    .map(([type, exps]) => ({
      type,
      total: exps.reduce((s, e) => s + e.modeledRaw, 0),
      exps: exps.sort((a, b) => b.modeledRaw - a.modeledRaw),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const maxTotal = Math.max(...cols.map((c) => c.total), 1);
  return cols.map((c) => ({
    stage: c.type.toUpperCase(),
    total: money(c.total),
    flex: Math.max(1, +(c.total / maxTotal).toFixed(2)) + 0.6,
    items: c.exps.slice(0, 2).map((e) => ({
      id: e.id,
      name: capClause(e.name, 48),
      meta: `${e.modeled} · ${e.prob} implied`,
    })),
  }));
}

/** Build the value-chain map from a hand-authored stage → exposure-id mapping (showcase companies). */
function buildChainFromStages(
  exposures: ExposureVM[],
  stages: { stage: string; eventKeys: string[] }[]
): ChainStage[] {
  const byId = Object.fromEntries(exposures.map((e) => [e.id, e]));
  const cols = stages
    .map((s) => {
      const exps = s.eventKeys
        .map((k) => byId[k])
        .filter(Boolean)
        .sort((a, b) => b.modeledRaw - a.modeledRaw);
      return { stage: s.stage.toUpperCase(), total: exps.reduce((t, e) => t + e.modeledRaw, 0), exps };
    })
    .filter((c) => c.exps.length > 0);
  const maxTotal = Math.max(...cols.map((c) => c.total), 1);
  return cols.map((c) => ({
    stage: c.stage,
    total: money(c.total),
    flex: Math.max(1, +(c.total / maxTotal).toFixed(2)) + 0.6,
    items: c.exps.slice(0, 2).map((e) => ({ id: e.id, name: capClause(e.name, 48), meta: `${e.modeled} · ${e.prob} implied` })),
  }));
}

// ── footprint ────────────────────────────────────────────────────

function trunc(s: string, n: number): string {
  const c = cleanText(s);
  return c.length > n ? c.slice(0, n - 1).trimEnd() + "…" : c;
}

function buildFootprint(c: RawCompany): FootprintRow[] {
  const rows: FootprintRow[] = [];
  if (c.regions?.length) {
    rows.push({
      name: "Operating regions",
      meta: c.regions.map(regionName).filter(Boolean).join(" · "),
      region: `${c.regions.length} region${c.regions.length === 1 ? "" : "s"}`,
      dot: GREENS[1],
    });
  }
  if (c.supplier_countries?.length) {
    rows.push({
      name: "Supply base",
      meta: trunc(c.supplier_countries.slice(0, 4).map(expandCountry).join(" · "), 52),
      region: "Sourcing",
      dot: GREENS[2],
    });
  }
  if (c.customer_countries?.length) {
    rows.push({
      name: "Customer markets",
      meta: trunc(c.customer_countries.slice(0, 4).map(expandCountry).join(" · "), 52),
      region: "Demand",
      dot: GREENS[3],
    });
  }
  const dep = c.supplier_types?.[0] || c.customer_segments?.[0];
  if (dep) {
    rows.push({
      name: "Key dependency",
      meta: trunc(dep, 54),
      region: "Supply",
      dot: GREENS[4],
    });
  }
  return rows.slice(0, 4);
}

// ── profile + about ──────────────────────────────────────────────

function buildProfile(
  c: RawCompany,
  dominant: string,
  risks: number,
  contracts: number
): ProfileRow[] {
  const rows: ProfileRow[] = [];
  const push = (k: string, v: string | null | undefined) => {
    if (v && String(v).trim()) rows.push({ k, v: String(v).trim() });
  };
  push("Industry", c.industry);
  push("Revenue", c.revenue_range);
  push("Employees", c.employee_count);
  push("Customer type", c.customer_type);
  push("Lead exposure", dominant);
  push("Priced risks", `${risks} · ${contracts} markets`);
  return rows.slice(0, 6);
}

/** A descriptor built purely from real company fields, used when the source description is thin. */
function companyDescriptor(c: RawCompany): string {
  const ind = (c.industry || "business").toLowerCase();
  const parts = [`${c.name} is a ${ind} company`];
  if (c.customer_type && c.customer_type !== "Both") parts.push(`serving ${c.customer_type} customers`);
  else if (c.customer_type === "Both") parts.push("serving both B2B and consumer customers");
  if (c.regions?.length) {
    const r = c.regions.map(regionName).filter(Boolean).slice(0, 3).join(", ");
    if (r) parts.push(`across ${r}`);
  }
  return parts.join(" ") + ".";
}

function buildBlurb(c: RawCompany, brief_headline: string | null): string {
  const s = firstSentence(c.description || "", 170);
  if (s.length >= 45) return s;
  const thesis = cleanText(brief_headline);
  if (thesis.length >= 30) return thesis;
  return companyDescriptor(c);
}

// ── top-level ────────────────────────────────────────────────────

export function transformCompany(entry: RawEntry): CompanyVM {
  const { company: c, dashboard: d, events, contracts } = entry;
  const slug = slugify(c.name);
  const m = mono(slug);
  const programTotal = entry.programOverride ?? programSize(c.revenue_range, c.name);

  const exposures = buildExposures(events, contracts, programTotal, c.industry || "", entry.facetByEvent, entry.nameByEvent);
  const risks = exposures.length;
  const linkedContracts = contracts.filter((ct) => ct.event_key).length;

  // canonical category label (matches the chips/legend casing everywhere on the page)
  const dominant = d.dominant_risk_bucket
    ? categoryLabel(d.dominant_risk_bucket)
    : cleanText(d.dominant_risk_label);

  const desc = cleanText(c.description);
  const sentences = splitSentences(desc);
  let aboutHead = sentences[0] || "";
  let aboutP1 = sentences.length > 1 ? sentences.slice(1).join(" ") : "";
  if (aboutHead.length < 45) {
    // thin source description — lead with a real descriptor, keep any prose as body
    aboutHead = companyDescriptor(c);
    aboutP1 = desc.length >= 30 && desc !== aboutHead ? desc : "";
  }
  // Headline is the full first sentence (no ellipsis). Only soft-trim a very long run-on at a
  // clause boundary so it never balloons past ~4 lines — still a complete phrase, never "…".
  if (aboutHead.length > 240) {
    const cut = aboutHead.slice(0, 240);
    const b = Math.max(cut.lastIndexOf(", "), cut.lastIndexOf("; "), cut.lastIndexOf(" — "), cut.lastIndexOf(" – "));
    if (b > 120) aboutHead = aboutHead.slice(0, b);
  }
  const keyConcerns = (d.brief_points || []).map((p) => cleanText(p)).filter(Boolean).slice(0, 3);

  return {
    id: slug,
    name: c.name,
    industryCaps: (c.industry || "").toUpperCase(),
    domain: domainOf(c.website),
    mono: monoInitials(c.name),
    monoBg: m.bg,
    monoFg: m.fg,
    thesis: cleanText(d.brief_headline) || aboutHead,
    modeledTotal: money(programTotal),
    risks,
    contracts: linkedContracts,
    aboutLabel: `ABOUT ${(c.name || "").toUpperCase()}`,
    aboutHead,
    aboutP1,
    profile: entry.profileOverride ?? buildProfile(c, dominant, risks, linkedContracts),
    footprintLabel: "FOOTPRINT · OPERATIONS",
    footprintHead: "Where the business is exposed",
    footprint: buildFootprint(c),
    donut: buildDonut(exposures, programTotal),
    mix: buildMix(exposures),
    chainLabel: entry.chainLabel || "RISK MAP · BY THEME",
    chainSpan: entry.chainSpan || `${dominant || "policy"} lead`,
    chain: entry.valueChain ? buildChainFromStages(exposures, entry.valueChain) : buildChain(exposures),
    exposures,
    keyConcerns,
  };
}

export function transformCard(entry: RawEntry): CardVM {
  const { company: c, dashboard: d, events, contracts } = entry;
  const slug = slugify(c.name);
  const m = mono(slug);
  const programTotal = programSize(c.revenue_range, c.name);
  const exposures = buildExposures(events, contracts, programTotal, c.industry || "", entry.facetByEvent, entry.nameByEvent);
  const linkedContracts = contracts.filter((ct) => ct.event_key).length;
  const blurb = buildBlurb(c, d.brief_headline);

  return {
    id: slug,
    name: c.name,
    industryCaps: (c.industry || "").toUpperCase(),
    domain: domainOf(c.website),
    blurb,
    thesis: cleanText(d.brief_headline) || blurb,
    risks: exposures.length,
    contracts: linkedContracts,
    updated: shortDate(d.data_updated_at || d.created_at),
    dominant: d.dominant_risk_bucket ? categoryLabel(d.dominant_risk_bucket) : cleanText(d.dominant_risk_label),
    mono: monoInitials(c.name),
    monoBg: m.bg,
    monoFg: m.fg,
    watch: exposures.slice(0, 3).map((e) => ({ label: e.name, tag: e.type })),
  };
}

/** sort key: bigger illustrative programs first (marquee names lead), then more risks. */
export function sortRank(entry: RawEntry): number {
  return programSize(entry.company.revenue_range, entry.company.name) * 100 + entry.events.length;
}
