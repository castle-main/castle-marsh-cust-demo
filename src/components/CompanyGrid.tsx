"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { CardVM } from "@/lib/types";

// Lead-risk category → color + tint. Matched by keyword so every bucket
// (regulatory_actions, trade_policy, federal_legislation, supply_chain, …) resolves.
type Cat = { key: string; label: string; color: string; tint: string };
const CATS: Cat[] = [
  { key: "regulat", label: "Regulatory", color: "var(--forest)", tint: "rgba(22, 87, 58, 0.07)" },
  { key: "trade", label: "Trade Policy", color: "var(--teal)", tint: "rgba(36, 96, 117, 0.07)" },
  { key: "legisl", label: "Legislation", color: "var(--caution)", tint: "rgba(199, 122, 42, 0.09)" },
  { key: "supply", label: "Supply Chain", color: "var(--danger)", tint: "rgba(180, 48, 42, 0.07)" },
];
function catOf(dominant: string): Cat {
  const d = (dominant || "").toLowerCase();
  return (
    CATS.find((c) => d.includes(c.key)) || {
      key: "other",
      label: dominant || "Policy",
      color: "var(--muted)",
      tint: "rgba(138, 147, 140, 0.1)",
    }
  );
}

export default function CompanyGrid({ cards }: { cards: CardVM[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return cards;
    return cards.filter((c) =>
      `${c.name} ${c.industryCaps} ${c.domain} ${c.dominant} ${c.thesis}`.toLowerCase().includes(ql)
    );
  }, [q, cards]);

  const present = CATS.filter((cat) => filtered.some((c) => catOf(c.dominant).key === cat.key));

  return (
    <section>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "34px 44px 70px" }}>
        <p className="ri-kicker">Castle Risk Intelligence · Account Directory</p>

        <div className="ri-head">
          <h1 className="ri-title">Companies</h1>
          <div className="ri-search">
            <span className="ri-mag">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.5" y2="16.5" />
              </svg>
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search companies, industries, risks…"
            />
          </div>
        </div>

        <div className="ri-meta">
          <div className="ri-legend">
            {present.map((cat) => (
              <span key={cat.key} className="ri-leg">
                <span className="ri-tick" style={{ background: cat.color }} />
                {cat.label}
              </span>
            ))}
          </div>
          <div className="ri-colhead">
            <span className="ri-c-risk">Risks</span>
            <span className="ri-c-mkt">Markets</span>
            <span className="ri-c-upd">Updated</span>
          </div>
        </div>

        <div className="ri-list">
          {filtered.map((c) => {
            const cat = catOf(c.dominant);
            const rowVars = { "--cat": cat.color, "--cat-tint": cat.tint } as CSSProperties;
            return (
              <Link key={c.id} href={`/company/${c.id}`} className="ri-row" style={rowVars}>
                <div>
                  <div className="ri-eyebrow">
                    <span className="ri-ind">{c.industryCaps}</span>
                  </div>
                  <div className="ri-name">{c.name}</div>
                  <p className="ri-thesis">{c.thesis}</p>
                </div>
                <div className="ri-figs">
                  <span className="ri-fig r">
                    <span className="ri-n lead tnum">{c.risks}</span>
                    <span className="ri-k">Risks</span>
                  </span>
                  <span className="ri-fig m">
                    <span className="ri-n tnum">{c.contracts}</span>
                    <span className="ri-k">Markets</span>
                  </span>
                  <span className="ri-fig u">
                    <span className="ri-d tnum">{c.updated}</span>
                    <span className="ri-k">Updated</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div style={{ marginTop: 40, color: "var(--muted)", fontSize: 14 }}>No companies match “{q}”.</div>
        ) : (
          <div className="ri-foot">
            <span className="ri-foot-l">Sorted by last updated</span>
            <span className="ri-foot-r">Castle Risk Intelligence</span>
          </div>
        )}
      </div>
    </section>
  );
}
