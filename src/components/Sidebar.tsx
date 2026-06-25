"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ICON = {
  company: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
      <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
      <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
      <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
    </svg>
  ),
  trades: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="18" x2="3" y2="10"></line>
      <line x1="9" y1="18" x2="9" y2="4"></line>
      <line x1="15" y1="18" x2="15" y2="13"></line>
      <line x1="21" y1="18" x2="21" y2="7"></line>
    </svg>
  ),
};

export default function Sidebar() {
  const pathname = usePathname();
  const onTrades = pathname.startsWith("/trades");
  const onCompany = !onTrades;

  function signOut() {
    sessionStorage.removeItem("castle_unlocked");
    window.location.href = "/";
  }

  const item = (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "9px 12px",
    fontFamily: "var(--font-body)",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
    color: active ? "#fff" : "var(--text-2)",
    background: active ? "var(--ink)" : "transparent",
  });

  return (
    <aside
      style={{
        width: 232,
        flex: "none",
        background: "#FFFFFF",
        borderRight: "1px solid var(--hair)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "20px 20px 18px", borderBottom: "1px solid var(--hair-2)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/castle-mark.svg" width={22} height={27} style={{ display: "block", flex: "none", color: "#171717" }} alt="Castle" />
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, letterSpacing: "-0.02em", color: "var(--ink)" }}>Castle Internal</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.16em", color: "var(--faint)", marginTop: 3 }}>
            ORIGINATION
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 12px" }}>
        <Link href="/" className="nav-item" style={item(onCompany)}>
          {ICON.company}
          <span>Company</span>
        </Link>
        <div style={{ height: 4 }} />
        <Link href="/trades" className="nav-item" style={item(onTrades)}>
          {ICON.trades}
          <span>Trades</span>
        </Link>
      </nav>

      <div style={{ padding: 12, borderTop: "1px solid var(--hair-2)" }}>
        <div className="account-pill" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 11px", border: "1px solid var(--hair)", background: "var(--fill-soft)" }}>
          <div
            style={{
              width: 28,
              height: 28,
              flex: "none",
              borderRadius: "var(--radius-pill)",
              background: "var(--fill)",
              color: "var(--ink)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              fontWeight: 600,
            }}
          >
            AP
          </div>
          <div style={{ lineHeight: 1.2, minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Arjun Pandey</div>
            <div style={{ fontSize: 10.5, color: "var(--muted)" }}>Castle · Origination</div>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="back-link"
          style={{ width: "100%", marginTop: 8, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 12, color: "var(--muted)", textAlign: "left", padding: "2px 12px" }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
