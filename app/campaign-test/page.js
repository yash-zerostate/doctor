// Campaign Simulator — a simple test harness for Preta UTM / Referrer targeting.
//
// Each button is a REAL link to the target demo carrying a utm_source param.
// Clicking it (instead of typing the URL) reproduces a real campaign click:
//   • the UTM param travels in the URL  → tests UTM targeting
//   • the browser sends this page's domain as the Referer → tests Referrer targeting
//     (add THIS deployed site's domain to the element's Referrer rule to test that).
//
// Change TARGET_BASE if the element lives on a different demo site.

const TARGET_BASE = "https://saas-nextjs-flax.vercel.app";

const SCENARIOS = [
  {
    label: "Simulate LinkedIn Ad",
    source: "linkedin",
    desc: "Arrives with utm_source=linkedin",
    color: "#0a66c2",
  },
  {
    label: "Simulate Google Ad",
    source: "google",
    desc: "Arrives with utm_source=google",
    color: "#ea4335",
  },
  {
    label: "Simulate Email Campaign",
    source: "email",
    desc: "Arrives with utm_source=email",
    color: "#6d28d9",
  },
  {
    label: "Direct visit (no campaign)",
    source: null,
    desc: "No utm_source — element should stay hidden",
    color: "#475569",
  },
];

export const metadata = {
  title: "Campaign Simulator — Preta Targeting Test",
};

export default function CampaignTestPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#0b1220",
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          background: "#111a2b",
          border: "1px solid #1f2b45",
          borderRadius: "20px",
          padding: "32px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ marginBottom: "8px", color: "#3ffb00", fontSize: "13px", fontWeight: 600 }}>
          PRETA · TARGETING TEST
        </div>
        <h1 style={{ margin: "0 0 8px", color: "#f1f5f9", fontSize: "24px", fontWeight: 700 }}>
          Campaign Simulator
        </h1>
        <p style={{ margin: "0 0 24px", color: "#94a3b8", fontSize: "14px", lineHeight: 1.6 }}>
          Click a button to arrive at the demo site as if you came from that
          campaign. The UTM travels in the link, and clicking (not typing) sends
          this page as the referrer.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {SCENARIOS.map((s) => {
            const href = s.source
              ? `${TARGET_BASE}/?utm_source=${encodeURIComponent(s.source)}`
              : `${TARGET_BASE}/`;
            return (
              <a
                key={s.label}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "16px 18px",
                  borderRadius: "14px",
                  background: "#0b1220",
                  border: "1px solid #1f2b45",
                  textDecoration: "none",
                }}
              >
                <span>
                  <span
                    style={{
                      display: "block",
                      color: "#f1f5f9",
                      fontSize: "15px",
                      fontWeight: 600,
                    }}
                  >
                    {s.label}
                  </span>
                  <span style={{ display: "block", color: "#94a3b8", fontSize: "12px", marginTop: "2px" }}>
                    {s.desc}
                  </span>
                </span>
                <span
                  style={{
                    flexShrink: 0,
                    width: "10px",
                    height: "10px",
                    borderRadius: "999px",
                    background: s.color,
                  }}
                />
              </a>
            );
          })}
        </div>

        <p style={{ margin: "24px 0 0", color: "#64748b", fontSize: "12px", lineHeight: 1.6 }}>
          Target: <span style={{ color: "#94a3b8" }}>{TARGET_BASE}</span>
          <br />
          To test <b style={{ color: "#94a3b8" }}>Referrer</b>, add this deployed
          site&rsquo;s domain to the element&rsquo;s Referrer rule, then click a button.
        </p>
      </div>
    </main>
  );
}
