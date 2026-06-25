// ── text cleaning ──────────────────────────────────────────────

/** Strip markdown bold, inline HTML tags, and [n] citation markers; collapse whitespace. */
export function cleanText(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/<[^>]+>/g, " ") // html tags
    .replace(/\*\*/g, "") // markdown bold
    .replace(/\[\d+\]/g, "") // [1] citation markers
    .replace(/\s+/g, " ")
    .trim();
}

const ABBREV =
  /\b(U\.S|U\.K|U\.N|U\.A\.E|E\.U|e\.g|i\.e|Inc|Corp|Ltd|Co|St|Mt|vs|No|Sr|Jr|Dr|Mr|Mrs|Ms|Fig|approx|etc|Ph\.D|S\.A|N\.A|L\.P|d\.b\.a)\./gi;
const DOT = String.fromCharCode(1); // sentinel for a protected '.'

/** Split prose into sentences without breaking on common abbreviations (U.S., Inc., etc.). */
export function splitSentences(s: string): string[] {
  const protectedStr = cleanText(s).replace(ABBREV, (m) => m.replace(/\./g, DOT));
  return protectedStr
    .split(/(?<=[.!?])\s+(?=[A-Z(])/)
    .map((x) => x.split(DOT).join(".").trim())
    .filter(Boolean);
}

/** Truncate at a word boundary, appending an ellipsis. */
export function capWords(s: string, n: number): string {
  const c = cleanText(s);
  if (c.length <= n) return c;
  const cut = c.slice(0, n);
  const sp = cut.lastIndexOf(" ");
  return (sp > n * 0.6 ? cut.slice(0, sp) : cut).trimEnd() + "…";
}

/** First sentence (word-capped at maxLen); used for blurbs and short driver phrases. */
export function firstSentence(s: string, maxLen = 130): string {
  const first = splitSentences(s)[0] || cleanText(s);
  return capWords(first.replace(/[.;]$/, ""), maxLen);
}

const TRAILING_STOPWORD =
  /[\s,;:—–-]+(the|a|an|of|in|on|for|to|and|or|under|with|by|as|at|from|that|which|its|their)$/i;

/** Truncate prose at a clause boundary (comma / em-dash) so it never ends mid-phrase. */
export function capClause(s: string, n: number): string {
  const c = cleanText(s);
  if (c.length <= n) return c;
  let cut = c.slice(0, n);
  const clause = Math.max(cut.lastIndexOf(", "), cut.lastIndexOf("; "), cut.lastIndexOf(" — "), cut.lastIndexOf(" – "));
  if (clause > n * 0.5) cut = cut.slice(0, clause);
  else {
    const sp = cut.lastIndexOf(" ");
    if (sp > n * 0.6) cut = cut.slice(0, sp);
  }
  cut = cut.replace(/[\s,;:—–-]+$/, "");
  while (TRAILING_STOPWORD.test(cut)) cut = cut.replace(TRAILING_STOPWORD, "");
  return cut.replace(/[\s,;:—–-]+$/, "") + "…";
}

/** Remove internal pipeline identifiers (evt-3, poly-12, synthetic-x, library-7…) from prose. */
export function scrubIds(s: string): string {
  return cleanText(s)
    .replace(/\b(?:evt|poly|kalshi|synthetic|library|grp)-[A-Za-z0-9-]+/gi, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s+([,.;])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** True when a rationale is internal hedge-book bookkeeping rather than partner-facing analysis. */
export function isBookkeeping(s: string | null | undefined): boolean {
  return /duplicate|overlaps with|consolidated|double-count|zero marginal|no incremental|superseded by|already (allocated|captured|covered|priced)|same economic exposure|higher-volume|no additional budget/i.test(
    s || ""
  );
}

const COUNTRY_CODES: Record<string, string> = {
  us: "United States", usa: "United States", ca: "Canada", mx: "Mexico", br: "Brazil",
  cn: "China", jp: "Japan", in: "India", kr: "South Korea", tw: "Taiwan", th: "Thailand",
  vn: "Vietnam", my: "Malaysia", sg: "Singapore", id: "Indonesia", ph: "Philippines",
  uk: "United Kingdom", gb: "United Kingdom", de: "Germany", fr: "France", it: "Italy",
  es: "Spain", nl: "Netherlands", be: "Belgium", ch: "Switzerland", se: "Sweden",
  no: "Norway", pl: "Poland", ie: "Ireland", au: "Australia", nz: "New Zealand",
  ae: "United Arab Emirates", sa: "Saudi Arabia", qa: "Qatar", il: "Israel", tr: "Turkey",
  za: "South Africa", ng: "Nigeria", eg: "Egypt", ar: "Argentina", cl: "Chile",
  co: "Colombia", pe: "Peru", ru: "Russia", ua: "Ukraine", gh: "Ghana",
};
/** Expand a 2–3 letter country code to its full name; pass through full names unchanged. */
export function expandCountry(x: string): string {
  const t = (x || "").trim();
  if (/^[A-Za-z]{2,3}$/.test(t)) return COUNTRY_CODES[t.toLowerCase()] || t.toUpperCase();
  return t;
}

// ── labels ─────────────────────────────────────────────────────

const REGION_NAMES: Record<string, string> = {
  na: "North America",
  sa: "South America",
  eu: "Europe",
  ap: "Asia-Pacific",
  apac: "Asia-Pacific",
  me: "Middle East",
  mena: "Middle East & N. Africa",
  af: "Africa",
  oc: "Oceania",
  global: "Global",
};
export function regionName(code: string): string {
  return REGION_NAMES[code?.toLowerCase()] || (code ? code.toUpperCase() : "");
}

const CATEGORY_LABELS: Record<string, string> = {
  trade_policy: "Trade policy",
  federal_legislation: "Legislation",
  regulatory_actions: "Regulatory",
  regulatory: "Regulatory",
  macro_policy: "Macro",
  macro: "Macro",
  monetary_policy: "Monetary",
  elections: "Elections",
  geopolitical: "Geopolitical",
  immigration: "Immigration",
  litigation: "Litigation",
  commodity: "Commodity",
  climate: "Climate",
  tax: "Tax policy",
};
export function categoryLabel(cat: string): string {
  if (!cat) return "Policy";
  return (
    CATEGORY_LABELS[cat.toLowerCase()] ||
    cat
      .split(/[_\s]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

export function platformLabel(p: string): string {
  const k = (p || "").toLowerCase();
  if (k === "kalshi") return "KALSHI";
  if (k === "polymarket") return "POLYMARKET";
  if (k === "synthetic") return "CASTLE MODEL";
  return (p || "").toUpperCase();
}

// ── numbers ────────────────────────────────────────────────────

/** Format a value expressed in $millions, e.g. 214 -> "$214M", 1240 -> "$1.2B". */
export function money(millions: number): string {
  const v = Math.max(0, millions);
  if (v >= 1000) {
    const b = v / 1000;
    return "$" + (b >= 10 ? Math.round(b) : b.toFixed(1)) + "B";
  }
  if (v >= 10) return "$" + Math.round(v) + "M";
  if (v >= 1) return "$" + v.toFixed(1).replace(/\.0$/, "") + "M";
  return "$" + (v * 1000).toFixed(0) + "K";
}

export function pct(prob: number | null | undefined): string {
  if (prob == null) return "—";
  return Math.min(100, Math.max(0, Math.round(prob * 100))) + "%"; // clamp stray source values to 0–100%
}

// ── identity / monogram ────────────────────────────────────────

export function monoInitials(name: string): string {
  const w = (name || "").replace(/[^A-Za-z ]/g, "").trim().split(/\s+/);
  return (w.length > 1 ? w[0][0] + w[1][0] : (name || "??").slice(0, 2)).toUpperCase();
}

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function domainOf(website: string): string {
  return (website || "")
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

export function slugify(name: string): string {
  return (name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Format an ISO timestamp as M/D/YYYY. */
export function shortDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}
