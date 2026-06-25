"use client";

import Link from "next/link";

export default function TopBar() {
  function signOut() {
    sessionStorage.removeItem("castle_unlocked");
    window.location.href = "/";
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "#fff",
        borderBottom: "1px solid var(--hair)",
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: "0 44px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/castle-mark.svg" width={24} height={30} style={{ display: "block", flex: "none", color: "#16201A" }} alt="Castle" />
          <div style={{ display: "flex", alignItems: "baseline", gap: 11, minWidth: 0 }}>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 17, letterSpacing: "-0.01em", color: "#14201A" }}>Castle Internal</span>
            <span style={{ width: 1, height: 14, background: "var(--hair)", alignSelf: "center" }} aria-hidden />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", color: "var(--faint)", whiteSpace: "nowrap" }}>
              CUSTOMER RESEARCH
            </span>
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 16, flex: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                flex: "none",
                background: "#E9F1EB",
                color: "#14512F",
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
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>Arjun Pandey</div>
              <div style={{ fontSize: 10.5, color: "var(--muted)" }}>Castle · Origination</div>
            </div>
          </div>
          <span style={{ width: 1, height: 22, background: "var(--hair)" }} aria-hidden />
          <button
            type="button"
            onClick={signOut}
            className="back-link"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontSize: 12.5,
              color: "var(--text-2)",
              padding: 0,
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
