"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CompanyVM, ExposureVM } from "@/lib/types";

const SEV_COLOR: Record<string, string> = {
  critical: "#B4302A",
  high: "#C77A2A",
  medium: "#246075",
  low: "#8A938C",
};
const sevColor = (s: string) => SEV_COLOR[s] || "#8A938C";

/** Make a div-based control keyboard-activatable (Enter / Space). */
function clickKeys(fn: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };
}

export default function CompanyDetail({ co }: { co: CompanyVM }) {
  const [tab, setTab] = useState<"overview" | "exposures">("overview");
  const [selId, setSelId] = useState<string | null>(null);
  const sel = co.exposures.find((e) => e.id === selId) || null;

  const tabBase: React.CSSProperties = {
    padding: "14px 0",
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    fontSize: 15,
    marginBottom: -1,
  };
  const tabStyle = (active: boolean): React.CSSProperties => ({
    ...tabBase,
    fontWeight: active ? 600 : 500,
    color: active ? "var(--ink-head)" : "#7B847C",
    borderBottom: active ? "2px solid #16201A" : "2px solid transparent",
  });

  const select = (id: string) => setSelId(id);

  return (
    <section>
      {/* sticky sub-header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(250,250,249,0.9)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(24,24,24,0.12)",
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 44px" }}>
          <Link
            href="/"
            className="back-link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "16px 0 6px",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--text-2)",
              cursor: "pointer",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Companies
          </Link>
          <div role="tablist" style={{ display: "flex", alignItems: "center", gap: 30 }}>
            <div role="tab" tabIndex={0} aria-selected={tab === "overview"} className="tab" style={tabStyle(tab === "overview")} onClick={() => { setTab("overview"); setSelId(null); }} onKeyDown={clickKeys(() => { setTab("overview"); setSelId(null); })}>
              Overview
            </div>
            <div role="tab" tabIndex={0} aria-selected={tab === "exposures"} className="tab" style={tabStyle(tab === "exposures")} onClick={() => { setTab("exposures"); setSelId(null); }} onKeyDown={clickKeys(() => { setTab("exposures"); setSelId(null); })}>
              Exposures
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "30px 44px 90px" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, minWidth: 0 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 38, fontWeight: 400, letterSpacing: "-0.015em", margin: 0, color: "var(--ink-head)" }}>
                  {co.name}
                </h1>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10.5,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    color: "var(--muted)",
                    background: "var(--fill)",
                    padding: "4px 11px",
                    borderRadius: "var(--radius-pill)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {co.industryCaps}
                </span>
              </div>
              <p style={{ fontSize: 14.5, color: "var(--text-2)", margin: "10px 0 0", maxWidth: 680, lineHeight: 1.5 }}>
                {co.thesis}
              </p>
            </div>
          </div>
          <div style={{ textAlign: "right", flex: "none", paddingTop: 4 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", color: "var(--muted)" }}>
              MODELED EXPOSURE
            </div>
            <div className="tnum" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 30, color: "var(--ink-head)", marginTop: 5, letterSpacing: "-0.01em" }}>
              {co.modeledTotal}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 7, marginTop: 4 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", color: "var(--faint)", border: "1px solid var(--hair)", borderRadius: "var(--radius-pill)", padding: "2px 8px" }}>
                ILLUSTRATIVE
              </span>
              <span className="tnum" style={{ fontSize: 12, color: "var(--muted)" }}>
                {co.risks} risks · {co.contracts} markets
              </span>
            </div>
          </div>
        </div>

        {tab === "overview" ? <Overview co={co} /> : <Exposures co={co} onSelect={select} />}
      </div>

      {sel && <Drawer ex={sel} onClose={() => setSelId(null)} />}
    </section>
  );
}

// ── Overview ──────────────────────────────────────────────────────

function Overview({ co }: { co: CompanyVM }) {
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => {
      const el = bodyRef.current;
      if (el) setOverflows(el.scrollHeight > el.clientHeight + 2);
    };
    measure();
    const fonts = (document as unknown as { fonts?: { ready?: Promise<unknown> } }).fonts;
    if (fonts?.ready) fonts.ready.then(measure);
  }, [co.id]);

  const body = co.aboutP1;

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: 48,
          marginTop: 26,
          borderTop: "1px solid rgba(24,24,24,0.16)",
          paddingTop: 24,
          alignItems: "start",
        }}
      >
        <div>
          <Eyebrow>{co.aboutLabel}</Eyebrow>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, lineHeight: 1.25, letterSpacing: "-0.01em", color: "var(--ink-head)", marginTop: 10 }}>
            {co.aboutHead}
          </div>
          {expanded ? (
            <p style={{ fontSize: 14.5, color: "#3A443D", lineHeight: 1.65, margin: "16px 0 0" }}>{co.aboutP1}</p>
          ) : (
            <div
              ref={bodyRef}
              style={{
                fontSize: 14.5,
                color: "#3A443D",
                lineHeight: 1.65,
                marginTop: 16,
                display: "-webkit-box",
                WebkitLineClamp: 5,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {body}
            </div>
          )}
          {(overflows || expanded) && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              style={{ background: "none", border: "none", padding: 0, marginTop: 12, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--forest)" }}
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
        <div>
          <Eyebrow>PROFILE</Eyebrow>
          <div style={{ marginTop: 8 }}>
            {co.profile.map((f, i) => (
              <div
                key={f.k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 14,
                  padding: "10px 0",
                  fontSize: 13.5,
                  borderBottom: i < co.profile.length - 1 ? "1px solid var(--hair-2)" : "none",
                }}
              >
                <span style={{ color: "var(--muted)" }}>{f.k}</span>
                <span style={{ color: "var(--ink)", fontWeight: 500, textAlign: "right" }}>{f.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: co.keyConcerns.length > 0 ? "1fr 1fr" : "1fr", gap: 48, marginTop: 28, alignItems: "start" }}>
        {/* donut */}
        <div style={{ borderTop: "1px solid rgba(24,24,24,0.16)", padding: "22px 24px" }}>
          <Eyebrow>EXPOSURE MIX</Eyebrow>
          <SectionHead>Modeled risk by category</SectionHead>
          <div style={{ display: "flex", justifyContent: "center", margin: "18px 0" }}>
            <Donut co={co} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {co.mix.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13 }}>
                <span style={{ width: 10, height: 10, background: m.color, flex: "none" }}></span>
                <span style={{ color: "#3A443D" }}>{m.label}</span>
                <span className="tnum" style={{ marginLeft: "auto", color: "var(--muted)" }}>{m.pct}</span>
                <span className="tnum" style={{ width: 56, textAlign: "right", fontWeight: 600, color: "var(--ink)" }}>{m.amt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* what castle is watching (real brief_points; replaces fabricated activity feed) */}
        {co.keyConcerns.length > 0 && (
          <div style={{ borderTop: "1px solid rgba(24,24,24,0.16)", padding: "22px 24px" }}>
            <Eyebrow>WHAT CASTLE IS WATCHING</Eyebrow>
            <SectionHead>Lead concerns this cycle</SectionHead>
            <div style={{ marginTop: 6 }}>
              {co.keyConcerns.map((k, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "11px 0", borderTop: "1px solid var(--hair-2)", fontSize: 13.5, color: "#3A443D", lineHeight: 1.5 }}>
                  <span style={{ color: "var(--forest)", flex: "none", fontWeight: 600 }}>›</span>
                  <span>{k}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Exposures ─────────────────────────────────────────────────────

function Exposures({ co, onSelect }: { co: CompanyVM; onSelect: (id: string) => void }) {
  return (
    <>
      {/* risk map by theme */}
      <div style={{ borderTop: "1px solid rgba(24,24,24,0.16)", padding: "22px 24px", marginTop: 24 }}>
        <Eyebrow>{co.chainLabel}</Eyebrow>
        <SectionHead>Where the risk concentrates</SectionHead>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>
          {co.modeledTotal} modeled · {co.chainSpan}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "stretch", marginTop: 18 }}>
          {co.chain.map((st, i) => (
            <div key={i} style={{ flex: st.flex }}>
              <div style={{ borderTop: "2px solid var(--ink)", paddingTop: 8 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.1em", color: "var(--muted)" }}>{st.stage}</div>
                <div className="tnum" style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--ink-head)", marginTop: 3 }}>{st.total}</div>
              </div>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {st.items.map((it) => (
                  <div key={it.id} role="button" tabIndex={0} className="chain-chip" style={{ background: "var(--fill)", padding: "10px 11px" }} onClick={() => onSelect(it.id)} onKeyDown={clickKeys(() => onSelect(it.id))}>
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: "var(--ink-head)",
                        lineHeight: 1.3,
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {it.name}
                    </div>
                    <div className="tnum" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{it.meta}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ledger */}
      <div style={{ borderTop: "1px solid rgba(24,24,24,0.16)", marginTop: 20, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "18px 24px", borderBottom: "1px solid var(--hair-2)" }}>
          <div style={{ fontSize: 14, color: "var(--text-2)" }}>
            <strong style={{ color: "var(--ink)", fontWeight: 600 }}>{co.exposures.length}</strong> exposures, ranked by modeled value
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--faint)", letterSpacing: "0.04em" }}>
            IMPLIED FROM LIVE PREDICTION MARKETS
          </div>
        </div>
        {co.exposures.map((r, i) => (
          <div key={r.id} role="button" tabIndex={0} aria-label={`${r.name} — ${r.modeled} modeled`} className="ledger-row" style={{ cursor: "pointer" }} onClick={() => onSelect(r.id)} onKeyDown={clickKeys(() => onSelect(r.id))}>
            <div style={{ display: "grid", gridTemplateColumns: "34px 1fr 248px", gap: 20, alignItems: "center", padding: "18px 24px", borderBottom: "1px solid var(--hair-3)" }}>
              <div className="tnum" style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--faint-2)", alignSelf: "flex-start", paddingTop: 2 }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{r.name}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-2)", background: "var(--fill)", padding: "3px 10px", borderRadius: "var(--radius-pill)", whiteSpace: "nowrap" }}>{r.type}</span>
                  <SevChip severity={r.severity} />
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-2)",
                    lineHeight: 1.55,
                    marginTop: 7,
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {r.summary}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 11 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: "var(--faint)" }}>IMPLIED</span>
                    <span className="tnum" style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "#3A443D" }}>{r.prob}</span>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--faint)" }}>{r.linked}</span>
                </div>
              </div>
              <div style={{ alignSelf: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: 7 }}>
                  <span className="tnum" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 24, letterSpacing: "-0.01em", color: "var(--ink-head)" }}>{r.modeled}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: "var(--faint)" }}>MODELED</span>
                </div>
                <div style={{ height: 5, background: "var(--hair)", marginTop: 9 }}>
                  <div style={{ height: "100%", width: r.barPct, background: "var(--teal)" }}></div>
                </div>
                <div style={{ textAlign: "right", fontSize: 11.5, color: "var(--faint-2)", marginTop: 9 }}>
                  {r.horizon ? `Resolves ${r.horizon}` : ""}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11.5, color: "var(--faint)", lineHeight: 1.6, marginTop: 16, maxWidth: 760 }}>
        Implied probabilities are live from the linked Kalshi, Polymarket, and Castle-modeled markets. Modeled
        exposure is illustrative — sized on the company&apos;s revenue band and distributed by Castle&apos;s hedge-allocation model.
      </div>
    </>
  );
}

// ── Drawer ────────────────────────────────────────────────────────

function Drawer({ ex, onClose }: { ex: ExposureVM; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <>
      <div className="anim-fade" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(22,32,26,0.28)", zIndex: 40 }}></div>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Exposure detail: ${ex.name}`}
        className="anim-panel"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: 600,
          maxWidth: "92vw",
          background: "#fff",
          borderLeft: "1px solid #E4E4DD",
          boxShadow: "-12px 0 36px rgba(20,30,20,0.10)",
          zIndex: 41,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--hair-2)" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.16em", color: "var(--faint)" }}>EXPOSURE DETAIL</div>
          <div role="button" tabIndex={0} aria-label="Close" className="drawer-close" onClick={onClose} onKeyDown={clickKeys(onClose)} style={{ cursor: "pointer", color: "var(--muted)", display: "flex" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 500, color: "var(--text-2)", background: "var(--fill)", padding: "5px 12px", borderRadius: "var(--radius-pill)" }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: sevColor(ex.severity) }}></span>
            {ex.severity.charAt(0).toUpperCase() + ex.severity.slice(1)} severity · open exposure
          </span>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 25, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.18, margin: "14px 0 0", color: "var(--ink-head)" }}>
            {ex.name}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--hair)", border: "1px solid var(--hair)", borderRadius: "var(--radius-card)", overflow: "hidden", marginTop: 20 }}>
            <Stat label="MODELED" value={ex.modeled} />
            <Stat label="IMPLIED PROB." value={ex.prob} />
            <Stat label="TYPE" value={ex.type} small />
            <Stat label="HORIZON" value={ex.horizon || "—"} small />
          </div>

          <Block label="EXPOSURE FOCUS">
            <div style={{ fontSize: 14, color: "#3A443D", marginTop: 7, lineHeight: 1.5 }}>{ex.whereItHits}</div>
          </Block>

          {ex.note && (
            <div style={{ marginTop: 18, padding: "15px 16px", background: "var(--fill-soft)", border: "1px solid var(--hair)", borderRadius: "var(--radius-sm)", fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.55 }}>
              {ex.note}
            </div>
          )}

          {ex.drivers.length > 0 && (
            <>
              <Label style={{ margin: "24px 0 10px" }}>KEY DRIVERS</Label>
              {ex.drivers.map((d, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", fontSize: 13.5, color: "#3A443D", lineHeight: 1.45 }}>
                  <span style={{ color: "var(--forest)", flex: "none" }}>›</span>
                  {d}
                </div>
              ))}
            </>
          )}

          {ex.window && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginTop: 18, padding: "12px 16px", background: "var(--fill)", border: "1px solid var(--hair)", borderRadius: "var(--radius-sm)" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.12em", color: "var(--text-2)" }}>EXPOSURE WINDOW</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-head)", textAlign: "right" }}>{ex.window}</span>
            </div>
          )}

          <Label style={{ margin: "26px 0 12px" }}>LINKED PREDICTION MARKETS</Label>
          {ex.markets.map((m, i) => {
            const Wrap: any = m.url ? "a" : "div";
            return (
              <Wrap
                key={i}
                {...(m.url ? { href: m.url, target: "_blank", rel: "noreferrer" } : {})}
                className="market-link"
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderTop: "1px solid var(--hair-2)", cursor: m.url ? "pointer" : "default" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.12em", color: "#B3BAB1" }}>{m.plat}</span>
                    {m.position && (
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.04em", color: "var(--text-2)" }}>· {m.position}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                    <span style={{ fontSize: 13.5, color: "var(--ink)", lineHeight: 1.35 }}>{m.title}</span>
                    {m.url && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B3BAB1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}>
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                    )}
                  </div>
                </div>
                <div className="tnum" style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 600, color: "var(--forest)", flex: "none" }}>{m.price}</div>
              </Wrap>
            );
          })}

          {ex.sources.length > 0 && (
            <>
              <Label style={{ margin: "26px 0 10px" }}>SOURCES</Label>
              {ex.sources.map((s, i) => {
                const Wrap: any = s.url ? "a" : "div";
                return (
                  <Wrap
                    key={i}
                    {...(s.url ? { href: s.url, target: "_blank", rel: "noreferrer" } : {})}
                    className="source-link"
                    style={{ display: "block", fontSize: 12.5, color: "var(--muted)", padding: "6px 0", lineHeight: 1.4, cursor: s.url ? "pointer" : "default" }}
                  >
                    {s.title}
                  </Wrap>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── small shared bits ─────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.14em", color: "var(--muted)" }}>
      {children}
    </div>
  );
}
function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "var(--font-serif)", fontSize: 23, letterSpacing: "-0.01em", margin: "6px 0 0", color: "var(--ink-head)" }}>
      {children}
    </div>
  );
}
function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.14em", color: "var(--muted)", ...style }}>
      {children}
    </div>
  );
}
function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div style={{ background: "#fff", padding: "14px 16px" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", color: "var(--faint)" }}>{label}</div>
      {small ? (
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", marginTop: 7 }}>{value}</div>
      ) : (
        <div className="tnum" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 21, color: "var(--ink-head)", marginTop: 5 }}>{value}</div>
      )}
    </div>
  );
}
function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 18 }}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
function SevChip({ severity }: { severity: string }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: "0.08em",
        color: sevColor(severity),
        border: `1px solid ${sevColor(severity)}33`,
        background: `${sevColor(severity)}0F`,
        padding: "2px 7px",
        whiteSpace: "nowrap",
        textTransform: "uppercase",
      }}
    >
      {severity}
    </span>
  );
}

// ── donut ─────────────────────────────────────────────────────────

function Donut({ co }: { co: CompanyVM }) {
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" className="tnum">
      <g transform="rotate(-90 90 90)" fill="none" strokeWidth="22">
        {co.donut.map((d, i) => (
          <circle key={i} cx="90" cy="90" r="70" stroke={d.color} strokeDasharray={d.dash} strokeDashoffset={d.offset}></circle>
        ))}
      </g>
      <text x="90" y="86" textAnchor="middle" fontFamily="var(--font-body)" fontWeight="600" fontSize="24" letterSpacing="-0.02em" fill="#16201A">
        {co.modeledTotal}
      </text>
      <text x="90" y="104" textAnchor="middle" fontFamily="var(--font-body)" fontSize="11" fill="#8A938C">
        Modeled risk
      </text>
    </svg>
  );
}
