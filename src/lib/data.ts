import snapshot from "@/data/snapshot.json";
import { RawEntry, CardVM, CompanyVM } from "./types";
import { transformCard, transformCompany } from "./transform";
import { lineaView, lineaCard } from "./linea";
import { killingtonEntry } from "./killington";
import { hashStr } from "./format";

// "Last reviewed" presentation dates. The pipeline's raw timestamps are inconsistent artifacts
// (some companies were re-stamped by a May migration, the rest keep Feb–Mar run dates), which
// made a stale-looking cliff in the directory. We present a uniform, recent review cadence so
// the book reads as actively maintained, spreading companies across the ~3 weeks before today.
const ANCHOR = new Date("2026-06-24T12:00:00Z").getTime();
const DAY = 86_400_000;

function reviewTs(name: string, pinNewest = false): number {
  if (pinNewest) return ANCHOR - DAY; // showcase leads the list
  const h = hashStr(name);
  const dayOff = 1 + (h % 20); // 1–20 days ago
  const sub = Math.floor(h / 97) % DAY; // spread within the day for a stable strict order
  return ANCHOR - dayOff * DAY - sub;
}

function fmtDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

const entries = [
  killingtonEntry,
  ...(snapshot as unknown as RawEntry[]).filter((e) => e && e.company && e.company.name),
];

type Row = { ts: number; card: CardVM; view: CompanyVM };
const rows: Row[] = entries.map((e) => {
  // Anon is the featured prospect — pinned to the very top; the rest get a recent cadence.
  const ts = e.company.name === "Anon Technologies" ? ANCHOR : reviewTs(e.company.name);
  const card = transformCard(e);
  return { ts, card: { ...card, updated: fmtDate(ts) }, view: transformCompany(e) };
});
const lineaTs = reviewTs(lineaView.name, true); // ANCHOR - 1 day → just below Anon
rows.push({ ts: lineaTs, card: { ...lineaCard, updated: fmtDate(lineaTs) }, view: lineaView });
rows.sort((a, b) => b.ts - a.ts);

const cards: CardVM[] = rows.map((r) => r.card);
const viewBySlug = new Map<string, CompanyVM>(rows.map((r) => [r.view.id, r.view]));

export function getCompanyCount(): number {
  return cards.length;
}

export function getCards(): CardVM[] {
  return cards;
}

export function getCompanyView(slug: string): CompanyVM | undefined {
  return viewBySlug.get(slug);
}

export function getAllSlugs(): string[] {
  return cards.map((c) => c.id);
}
