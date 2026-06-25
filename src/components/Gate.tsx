"use client";

import { useState, useEffect } from "react";

const KEY = "castle_unlocked";
const PASSWORD = "excalibur";

export default function Gate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setUnlocked(sessionStorage.getItem(KEY) === "1");
    setReady(true);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim().toLowerCase() === PASSWORD) {
      sessionStorage.setItem(KEY, "1");
      setUnlocked(true);
    } else {
      setError(true);
    }
  }

  // splash (identical on server + first client render → no hydration mismatch)
  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bone)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/castle-mark.svg" width={30} height={37} style={{ opacity: 0.35, color: "#16201A" }} alt="" />
      </div>
    );
  }

  if (unlocked) return <>{children}</>;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bone)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/castle-mark.svg" width={30} height={37} style={{ display: "block", flex: "none", color: "#16201A" }} alt="Castle" />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, letterSpacing: "-0.01em", color: "#14201A" }}>Castle Internal</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", color: "var(--faint)", marginTop: 4 }}>
              CUSTOMER RESEARCH
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid var(--hair)", padding: "28px 28px 30px" }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, letterSpacing: "-0.01em", color: "var(--ink-head)" }}>Sign in</div>
          <p style={{ fontSize: 13.5, color: "var(--text-2)", margin: "8px 0 22px", lineHeight: 1.5 }}>
            Internal access only. Enter the team password to continue.
          </p>
          <form onSubmit={submit}>
            <div
              className="search-box"
              style={{ display: "flex", alignItems: "center", border: `1px solid ${error ? "var(--danger)" : "#DEDED6"}`, background: "#fff", padding: "12px 14px" }}
            >
              <input
                type="password"
                autoFocus
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(false); }}
                placeholder="Password"
                style={{ border: "none", background: "transparent", outline: "none", fontFamily: "var(--font-body)", fontSize: 14, width: "100%", color: "var(--ink)" }}
              />
            </div>
            {error && (
              <div style={{ fontSize: 12.5, color: "var(--danger)", marginTop: 9 }}>Incorrect password.</div>
            )}
            <button
              type="submit"
              className="cta"
              style={{
                marginTop: 18,
                width: "100%",
                background: "var(--forest)",
                color: "#fff",
                border: "none",
                padding: "12px 16px",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Enter
            </button>
          </form>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", color: "var(--faint-2)", marginTop: 18, textAlign: "center" }}>
          CASTLE TECHNOLOGIES · ORIGINATION
        </div>
      </div>
    </div>
  );
}
