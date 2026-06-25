"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { CardVM } from "@/lib/types";

// Lead-risk category → color. Matched by keyword so every bucket resolves.
type Cat = { key: string; label: string; color: string };
const CATS: Cat[] = [
  { key: "regulat", label: "Regulatory", color: "var(--forest)" },
  { key: "trade", label: "Trade Policy", color: "var(--teal)" },
  { key: "legisl", label: "Legislation", color: "var(--caution)" },
  { key: "supply", label: "Supply Chain", color: "var(--danger)" },
];
function catOf(dominant: string): Cat {
  const d = (dominant || "").toLowerCase();
  return CATS.find((c) => d.includes(c.key)) || { key: "other", label: dominant || "Policy", color: "var(--muted)" };
}
function titleCase(caps: string): string {
  return caps
    .toLowerCase()
    .split(" ")
    .map((w) => (w === "&" ? "&" : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

export default function CompanyGrid({ cards }: { cards: CardVM[] }) {
  const [q, setQ] = useState("");
  const [selId, setSelId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return cards;
    return cards.filter((c) =>
      `${c.name} ${c.industryCaps} ${c.domain} ${c.dominant} ${c.thesis}`.toLowerCase().includes(ql)
    );
  }, [q, cards]);

  const sel = filtered.find((c) => c.id === selId) || filtered[0] || null;

  return (
    <section style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", padding: "30px 40px 24px" }}>
      {/* masthead */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, paddingBottom: 16, borderBottom: "2px solid var(--ink-head)", flex: "none" }}>
        <div>
          <div className="ri-kicker" style={{ margin: "0 0 8px" }}>Risk coverage · Pre-call briefing</div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 38, fontWeight: 400, letterSpacing: "-0.015em", margin: 0, color: "var(--ink-head)" }}>Companies</h1>
        </div>
        <div className="tnum" style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--faint)", paddingBottom: 6, whiteSpace: "nowrap" }}>
          {filtered.length} of {cards.length} covered · by last updated
        </div>
      </div>

      {/* two-pane */}
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        {/* ── master list ── */}
        <div style={{ width: 432, flex: "none", display: "flex", flexDirection: "column", borderRight: "1px solid var(--hair)", minHeight: 0 }}>
          <div className="rr-search" style={{ position: "relative", padding: "16px 18px 14px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 30, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.5" y2="16.5" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search companies, industries, risks…"
              style={{ width: "100%", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--ink)", background: "var(--surface)", border: "1px solid var(--hair)", borderBottom: "1px solid var(--faint-2)", padding: "9px 12px 9px 30px", outline: "none" }}
            />
          </div>

          <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
            {filtered.map((c) => {
              const cat = catOf(c.dominant);
              const active = sel?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelId(c.id)}
                  className={`rr-row${active ? " on" : ""}`}
                  style={{ "--cat": cat.color, borderLeft: `3px solid ${active ? cat.color : "transparent"}` } as CSSProperties}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: active ? "var(--forest)" : "var(--ink-head)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4, minWidth: 0 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: cat.color, whiteSpace: "nowrap" }}>{cat.label}</span>
                      <span style={{ color: "var(--faint-2)" }}>·</span>
                      <span style={{ fontSize: 11.5, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{titleCase(c.industryCaps)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ padding: "24px 18px", color: "var(--muted)", fontSize: 13 }}>No companies match “{q}”.</div>
            )}
          </div>
        </div>

        {/* ── detail preview ── */}
        <div style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: "32px 8px 40px 44px" }}>
          {sel && <Preview c={sel} />}
        </div>
      </div>
    </section>
  );
}

function Preview({ c }: { c: CardVM }) {
  const cat = catOf(c.dominant);
  return (
    <div style={{ maxWidth: 660 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: cat.color, flex: "none" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.13em", textTransform: "uppercase", color: cat.color }}>{cat.label}</span>
          <span style={{ color: "var(--faint-2)" }}>·</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.13em", textTransform: "uppercase", color: "var(--muted)" }}>{c.industryCaps}</span>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--faint)" }}>Updated {c.updated}</span>
      </div>

      <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: 46, lineHeight: 1.02, letterSpacing: "-0.018em", color: "var(--ink-head)", margin: "16px 0 0" }}>{c.name}</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "var(--hair)", border: "1px solid var(--hair)", marginTop: 26 }}>
        <Stat label="Active risks" value={String(c.risks)} />
        <Stat label="Markets tracked" value={String(c.contracts)} />
        <Stat label="Lead driver" value={cat.label} color={cat.color} />
      </div>

      <Label style={{ margin: "30px 0 10px" }}>Thesis</Label>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: 22, lineHeight: 1.34, letterSpacing: "-0.008em", color: "var(--ink-head)", margin: 0 }}>{c.thesis}</p>

      {c.watch.length > 0 && (
        <>
          <Label style={{ margin: "32px 0 4px" }}>What to watch</Label>
          <div>
            {c.watch.map((w, i) => (
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 16, padding: "14px 0", borderBottom: "1px solid var(--hair-2)" }}>
                <span className="tnum" style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: "var(--faint-2)", flex: "none", width: 18 }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontSize: 14, color: "var(--ink-head)", lineHeight: 1.4, flex: 1, minWidth: 0 }}>{w.label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", flex: "none", whiteSpace: "nowrap" }}>{w.tag}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 28, paddingTop: 22, borderTop: "1px solid var(--hair)" }}>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>
          Tracking {c.contracts} markets across {c.risks} priced risks.
        </span>
        <Link href={`/company/${c.id}`} className="cta" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "var(--forest)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 600, letterSpacing: "0.03em", padding: "11px 18px", whiteSpace: "nowrap" }}>
          Open profile
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: "var(--surface)", padding: "18px 20px" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.13em", textTransform: "uppercase", color: "var(--muted)" }}>{label}</div>
      <div className="tnum" style={{ fontFamily: "var(--font-body)", fontSize: 26, fontWeight: 600, letterSpacing: "-0.01em", color: color || "var(--ink-head)", marginTop: 7 }}>{value}</div>
    </div>
  );
}

function Label({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--faint)", ...style }}>
      {children}
    </div>
  );
}
