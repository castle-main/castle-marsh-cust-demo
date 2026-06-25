// Regenerate src/data/snapshot.json from the castle-onboarding-testing Supabase pipeline.
//
// Requires @supabase/supabase-js and service-role credentials. Either:
//   - set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the env, or
//   - leave ONBOARDING_ENV pointing at the onboarding-testing repo's .env.local (default below).
//
// Run:  node scripts/snapshot.mjs
//
// It selects the curated companies — those whose dashboards have normalized
// prediction-market contracts (dashboard_contracts) — dedupes to the richest dashboard per
// company, and writes the company profile + risk events + linked markets + sources to disk.

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "src", "data", "snapshot.json");
const ONBOARDING_ENV =
  process.env.ONBOARDING_ENV ||
  "/Users/arjunpandey/castle/castle-onboarding-testing/.env.local";

function cred(key) {
  if (process.env[key]) return process.env[key];
  try {
    const env = fs.readFileSync(ONBOARDING_ENV, "utf8");
    const m = env.match(new RegExp("^" + key + "=(.*)$", "m"));
    return m ? m[1].trim().replace(/^["']|["']$/g, "") : null;
  } catch {
    return null;
  }
}

const url = cred("NEXT_PUBLIC_SUPABASE_URL");
const key = cred("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !key) {
  console.error("Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY, or ONBOARDING_ENV.");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

// curated set = dashboards that have normalized contracts; keep richest per company
const { data: ctRows } = await sb.from("dashboard_contracts").select("dashboard_id");
const ctByDash = {};
for (const c of ctRows || []) ctByDash[c.dashboard_id] = (ctByDash[c.dashboard_id] || 0) + 1;
const normDashIds = [...new Set((ctRows || []).map((c) => c.dashboard_id))];

const { data: nd } = await sb
  .from("generated_dashboards")
  .select(
    "id, company_id, brief_headline, brief_summary, brief_points, dominant_risk_label, dominant_risk_bucket, risk_concerns, data_updated_at, created_at"
  )
  .in("id", normDashIds);

const byCompany = {};
for (const d of nd) {
  const cur = byCompany[d.company_id];
  if (!cur || ctByDash[d.id] > ctByDash[cur.id]) byCompany[d.company_id] = d;
}
const dashes = Object.values(byCompany);

const { data: comps } = await sb.from("companies").select("*").in("id", dashes.map((d) => d.company_id));
const cm = Object.fromEntries(comps.map((c) => [c.id, c]));

const out = [];
for (const d of dashes) {
  const company = cm[d.company_id];
  const { data: events } = await sb.from("dashboard_events").select("*").eq("dashboard_id", d.id).order("sort_order");
  const { data: contracts } = await sb.from("dashboard_contracts").select("*").eq("dashboard_id", d.id).order("sort_order");
  const evIds = events.map((e) => e.id);
  const ctIds = contracts.map((c) => c.id);

  const { data: evSrc } = await sb.from("event_sources").select("*").in("event_id", evIds.length ? evIds : ["x"]);
  const evSrcBy = {};
  for (const s of evSrc || []) (evSrcBy[s.event_id] = evSrcBy[s.event_id] || []).push({ title: s.title, url: s.url });

  let loss = [];
  for (let i = 0; i < ctIds.length; i += 150) {
    const { data } = await sb.from("contract_loss_steps").select("*").in("contract_id", ctIds.slice(i, i + 150));
    loss = loss.concat(data || []);
  }
  const lossBy = {};
  for (const s of loss) (lossBy[s.contract_id] = lossBy[s.contract_id] || []).push({ n: s.step_number, text: s.text });
  for (const k in lossBy) lossBy[k].sort((a, b) => a.n - b.n);

  let cSrc = [];
  for (let i = 0; i < ctIds.length; i += 150) {
    const { data } = await sb.from("contract_sources").select("contract_id,title,url").in("contract_id", ctIds.slice(i, i + 150));
    cSrc = cSrc.concat(data || []);
  }
  const cSrcBy = {};
  for (const s of cSrc) {
    const a = (cSrcBy[s.contract_id] = cSrcBy[s.contract_id] || []);
    if (a.length < 4) a.push({ title: s.title, url: s.url });
  }

  out.push({
    company: {
      id: company.id, name: company.name, website: company.website, industry: company.industry,
      description: company.description, revenue_range: company.revenue_range, employee_count: company.employee_count,
      regions: company.regions, supplier_countries: company.supplier_countries, supplier_types: company.supplier_types,
      customer_type: company.customer_type, customer_countries: company.customer_countries, customer_segments: company.customer_segments,
      risk_factors: company.risk_factors, regulatory_agencies: company.regulatory_agencies,
      congressional_committees: company.congressional_committees, political_exposure_notes: company.political_exposure_notes,
      raw_research: (company.raw_research || "").slice(0, 2000), citations: (company.citations || []).slice(0, 10),
    },
    dashboard: {
      id: d.id, brief_headline: d.brief_headline, brief_summary: d.brief_summary, brief_points: d.brief_points,
      dominant_risk_label: d.dominant_risk_label, dominant_risk_bucket: d.dominant_risk_bucket,
      risk_concerns: d.risk_concerns, data_updated_at: d.data_updated_at, created_at: d.created_at,
    },
    events: events.map((e) => ({
      id: e.id, event_key: e.event_key, title: e.title, description: e.description, category: e.category,
      severity: e.severity, timeframe: e.timeframe, sort_order: e.sort_order, sources: evSrcBy[e.id] || [],
    })),
    contracts: contracts.map((c) => ({
      id: c.id, contract_key: c.contract_key, event_key: c.event_key, event_id: c.event_id, title: c.title,
      short_title: c.short_title, display_title: c.display_title, description: c.description, platform: c.platform,
      category: c.category, probability: c.probability, volume: c.volume, expiry_date: c.expiry_date, url: c.url,
      relevance_score: c.relevance_score, tags: c.tags, event_title: c.event_title, rationale: c.rationale,
      is_major: c.is_major, sort_order: c.sort_order, allocation_pct: c.allocation_pct, position: c.position,
      days_left: c.days_left, resolution: c.resolution, liquidity: c.liquidity, contract_type: c.contract_type,
      radar_label: c.radar_label, loss_steps: lossBy[c.id] || [], sources: cSrcBy[c.id] || [],
    })),
  });
  console.log(`  ✓ ${company.name}: ${events.length} events, ${contracts.length} markets`);
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(`\nWrote ${out.length} companies → ${OUT} (${(fs.statSync(OUT).size / 1024 / 1024).toFixed(2)} MB)`);
