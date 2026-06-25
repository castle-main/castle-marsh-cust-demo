"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CardVM } from "@/lib/types";

type View = "cards" | "list";

export default function CompanyGrid({ cards }: { cards: CardVM[] }) {
  const [q, setQ] = useState("");
  const [view, setView] = useState<View>("cards");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return cards;
    return cards.filter((c) =>
      `${c.name} ${c.industryCaps} ${c.domain} ${c.dominant} ${c.thesis}`.toLowerCase().includes(ql)
    );
  }, [q, cards]);

  return (
    <section>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "34px 44px 90px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 42, fontWeight: 400, letterSpacing: "-0.015em", margin: 0, color: "var(--ink-head)" }}>
            Companies
          </h1>
          <span className="tnum" style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--faint)", letterSpacing: "0.04em" }}>
            {cards.length}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "stretch", gap: 12, marginTop: 24 }}>
          <div
            className="search-box"
            style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid #DEDED6", background: "#fff", padding: "11px 14px", flex: 1, maxWidth: 560 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A0A89F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search companies, industries, risks…"
              style={{ border: "none", background: "transparent", outline: "none", fontFamily: "var(--font-body)", fontSize: 14, width: "100%", color: "var(--ink)" }}
            />
          </div>

          <div style={{ display: "flex", border: "1px solid #DEDED6", background: "#fff", flex: "none" }}>
            {(["cards", "list"] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                style={{
                  border: "none",
                  background: view === v ? "#16201A" : "transparent",
                  color: view === v ? "#fff" : "var(--text-2)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "0 16px",
                  cursor: "pointer",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {view === "cards" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 26 }}>
            {filtered.map((c) => (
              <CardItem key={c.id} c={c} />
            ))}
          </div>
        ) : (
          <ListView cards={filtered} />
        )}

        {filtered.length === 0 && (
          <div style={{ marginTop: 40, color: "var(--muted)", fontSize: 14 }}>No companies match “{q}”.</div>
        )}
      </div>
    </section>
  );
}

// ── risk-forward card ───────────────────────────────────────────

function CardItem({ c }: { c: CardVM }) {
  return (
    <Link
      href={`/company/${c.id}`}
      className="company-card"
      style={{ padding: "24px 26px 20px", cursor: "pointer", display: "flex", flexDirection: "column", minHeight: 218 }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, minWidth: 0 }}>
          <Mono c={c} size={46} font={15} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 23, fontWeight: 400, letterSpacing: "-0.01em", color: "var(--ink-head)", lineHeight: 1.1 }}>
              {c.name}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.12em", color: "var(--muted)", marginTop: 8 }}>
              {c.industryCaps}
            </div>
          </div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C2C8C0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: 4 }}>
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
        <span style={{ width: 6, height: 6, background: "var(--forest)", flex: "none" }}></span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", color: "var(--faint)" }}>LEAD RISK</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", color: "var(--forest)", textTransform: "uppercase" }}>{c.dominant}</span>
      </div>
      <p
        style={{
          fontSize: 13.5,
          color: "#3A443D",
          lineHeight: 1.5,
          margin: "8px 0 0",
          flex: 1,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {c.thesis}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--hair-2)" }}>
        <Metric value={c.risks} label="risks" />
        <Metric value={c.contracts} label="markets" />
        <div className="tnum" style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--faint-2)" }}>{c.updated}</div>
      </div>
    </Link>
  );
}

// ── compact list / table ────────────────────────────────────────

const COLS = "2.3fr 1.3fr 1.3fr 70px 84px 96px";

function ListView({ cards }: { cards: CardVM[] }) {
  return (
    <div style={{ marginTop: 26, border: "1px solid var(--hair)", borderRadius: "var(--radius-card)", background: "#fff", overflow: "hidden" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: COLS,
          gap: 16,
          padding: "12px 20px",
          borderBottom: "1px solid var(--hair)",
          fontFamily: "var(--font-mono)",
          fontSize: 9.5,
          fontWeight: 600,
          letterSpacing: "0.12em",
          color: "var(--faint)",
        }}
      >
        <div>COMPANY</div>
        <div>INDUSTRY</div>
        <div>LEAD RISK</div>
        <div style={{ textAlign: "right" }}>RISKS</div>
        <div style={{ textAlign: "right" }}>MARKETS</div>
        <div style={{ textAlign: "right" }}>UPDATED</div>
      </div>
      {cards.map((c, i) => (
        <Link
          key={c.id}
          href={`/company/${c.id}`}
          className="ledger-row"
          style={{
            display: "grid",
            gridTemplateColumns: COLS,
            gap: 16,
            alignItems: "center",
            padding: "13px 20px",
            borderBottom: i < cards.length - 1 ? "1px solid var(--hair-3)" : "none",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <Mono c={c} size={28} font={10.5} />
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 16, color: "var(--ink-head)", letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {c.name}
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {title(c.industryCaps)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
            <span style={{ width: 6, height: 6, background: "var(--forest)", flex: "none" }}></span>
            <span style={{ fontSize: 12.5, color: "#3A443D", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.dominant}</span>
          </div>
          <div className="tnum" style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{c.risks}</div>
          <div className="tnum" style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{c.contracts}</div>
          <div className="tnum" style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--faint-2)" }}>{c.updated}</div>
        </Link>
      ))}
    </div>
  );
}

// ── shared bits ─────────────────────────────────────────────────

function Mono({ c, size, font }: { c: CardVM; size: number; font: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        flex: "none",
        background: c.monoBg,
        color: c.monoFg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-mono)",
        fontSize: font,
        fontWeight: 600,
        letterSpacing: "0.02em",
      }}
    >
      {c.mono}
    </div>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
      <span className="tnum" style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{value}</span>
      <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{label}</span>
    </div>
  );
}

function title(caps: string): string {
  return caps
    .toLowerCase()
    .split(" ")
    .map((w) => (w === "&" ? "&" : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}
