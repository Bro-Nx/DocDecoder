import { useState, useRef } from "react";
import Head from "next/head";

const T = {
  bg: "#0a0e27", paper: "#0f1433", ink: "#00ff41",
  dim: "#00cc33", border: "#00ff41", gold: "#00ff41",
  red: "#ff0055", redBg: "#ff005522", amber: "#ffaa00", ambBg: "#ffaa0022",
  green: "#00ff41", grnBg: "#00ff4122", blue: "#00ccff",
};

export default function DocDecoder() {
  const [stage, setStage] = useState("home");
  const [docText, setDocText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const pdfRef = useRef(null);
  const fileRef = useRef(null);

  const PRODUCTS = [
    {
      id: "health",
      icon: "🏥",
      name: "Health DocDecoder",
      color: "#00ff41",
      tagline: "Medical bills, EOBs & denial letters",
      documentType: "UnitedHealth Group EOB - Denied Claim",
      summary: "This EOB denies a $2,472 CT scan. You have 30 days for peer-to-peer review.",
      overallRisk: "AMBER",
      clauses: [{ title: "Denial Reason", plain: "Insurance says the CT scan wasn't necessary.", risk: "AMBER" }],
      actions: [{ priority: "URGENT", action: "Call your doctor's office and request peer-to-peer review", reason: "Fastest path to reversal" }],
      questions: [
        "What was the specific medical policy cited in the denial?",
        "Has this procedure been approved for other patients with similar diagnoses?",
        "What clinical evidence would support overturning this denial?",
        "Who can provide the peer-to-peer review?",
        "What's the timeline for the peer-to-peer review process?",
        "If denied again, what's the formal appeal process?",
        "Are there alternative diagnostic methods covered by this plan?",
        "Will they reconsider with additional clinical notes from my doctor?",
        "Is there a cost difference if I proceed without insurance coverage?",
        "What percentage of similar appeals are overturned?"
      ]
    },
    {
      id: "policy",
      icon: "📋",
      name: "Policy DocDecoder",
      color: "#00ff41",
      tagline: "Insurance policies, riders & exclusions",
      documentType: "Homeowners Insurance Policy (HO-3)",
      summary: "Your policy covers wind and fire but EXCLUDES all flood damage.",
      overallRisk: "AMBER",
      clauses: [{ title: "Flood Exclusion", plain: "Your homeowners policy will not pay for flood damage.", risk: "RED" }],
      actions: [{ priority: "URGENT", action: "Check your property's flood zone at FEMA's Flood Map", reason: "If in flood zone, flood insurance may be required" }],
      questions: [
        "What is my property's official FEMA flood zone designation?",
        "How often does this area experience flooding?",
        "What's the average flood damage claim in my zip code?",
        "Is flood insurance mandatory for my mortgage?",
        "How much would a separate flood policy cost annually?",
        "Does the policy cover sewer backup or water damage from storms?",
        "What's covered under the water damage exclusion?",
        "Are there any discounts for flood mitigation improvements?",
        "How long does it take for a flood policy to become effective?",
        "What's the deductible on a separate flood policy?"
      ]
    },
    {
      id: "legal",
      icon: "⚖️",
      name: "Legal DocDecoder",
      color: "#00ff41",
      tagline: "Agreements, job offers & legal paperwork",
      documentType: "Employment Offer Letter",
      summary: "Offer contains IP assignment, 18-month non-compete, non-solicitation, and mandatory arbitration.",
      overallRisk: "AMBER",
      clauses: [{ title: "Non-Compete", plain: "After you leave, you cannot work for direct competitors for 18 months.", risk: "AMBER" }],
      actions: [{ priority: "URGENT", action: "Before signing, ask if they will modify the non-compete clause", reason: "These clauses are often negotiable" }],
      questions: [
        "Would you be willing to reduce the non-compete period to 6-12 months?",
        "How is 'competitor' defined in this clause?",
        "Does the non-compete apply if I'm terminated without cause?",
        "What happens to my equity if I leave before the 1-year cliff?",
        "Is the non-solicitation clause limited to direct reports or all employees?",
        "Can I work for non-competing divisions of competitor companies?",
        "Can I work for non-competing divisions of competitor companies?",
        "Who decides disputes about IP ownership?",
        "Is there a geographic limitation to the non-compete?",
        "What's the penalty if I violate the non-compete agreement?"
      ]
    },
    {
      id: "aid",
      icon: "🎓",
      name: "Financial Aid DocDecoder",
      color: "#00ff41",
      tagline: "FAFSA awards, student loan notes & IBR",
      documentType: "University Financial Aid Award Letter",
      summary: "Total aid: $23,100/year. Remaining cost: $16,900/year. Parent PLUS loan at 9.08% interest.",
      overallRisk: "AMBER",
      clauses: [{ title: "PLUS Loan Terms", plain: "Your parents would borrow at 9.08% interest (higher than typical).", risk: "AMBER" }],
      actions: [{ priority: "URGENT", action: "Calculate total debt at graduation including capitalized interest on all loans", reason: "PLUS loans significantly increase total borrowing cost" }],
      questions: [
        "What GPA and credit-hour requirements must be maintained for scholarship renewal?",
        "Are there income thresholds for Public Service Loan Forgiveness on these loans?",
        "What happens if I change majors or graduate early?",
        "Can I defer the Parent PLUS loan while in school?",
        "What's the total cost of education with interest over 10 years?",
        "Are there employer matching programs that could offset these costs?",
        "Can I refinance the Parent PLUS loan after graduation?",
        "What's the default rate on Parent PLUS loans from this institution?",
        "Are there alternative loan options with lower interest rates?",
        "What's the plan if I can't find a job in my field after graduation?"
      ]
    }
  ];

  const handleAnalyze = async (text) => {
    if (!text || text.trim().length < 50) {
      setError("Document must be at least 50 characters");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: text })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Analysis failed");
      }

      const data = await res.json();
      setResult(data);
      setStage("result");
    } catch (e) {
      setError(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === "string") {
          setDocText(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadPDF = () => {
    if (pdfRef.current) {
      window.print();
    }
  };

  return (
    <>
      <Head>
        <title>DocDecoder - Enterprise Document Analysis</title>
        <meta name="description" content="Plain English document analysis with expert questions." />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&family=Roboto:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "IBM Plex Mono, monospace", color: T.ink }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'IBM Plex Mono', monospace; }
          button { font-family: 'IBM Plek Mono', monospace; border: 2px solid ${T.ink}; background: transparent; color: ${T.ink}; cursor: pointer; padding: 8px 16px; transition: all 0.2s; }
          button:hover { background: ${T.ink}22; }
          input, textarea { font-family: 'IBM Plex Mono', monospace; border: 2px solid ${T.ink}; padding: 12px; background: ${T.paper}; color: ${T.ink}; }
          @media print { .no-print { display: none; } }
        `}</style>

        {stage === "home" && (
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 20px" }}>
            <div style={{ borderBottom: "2px solid " + T.ink, paddingBottom: 20, marginBottom: 40 }}>
              <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 10 }}>DocDecoder</h1>
              <p style={{ fontSize: 14, color: T.dim, maxWidth: 800, lineHeight: 1.6 }}>
                Plain English. Clause-by-clause risk scores. And 8–10 expert questions built on negotiation frameworks.
              </p>
            </div>

            <div style={{ marginBottom: 40 }}>
              <h3 style={{ marginBottom: 20, fontSize: 16, color: T.blue }}>SAMPLE REPORTS</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 15 }}>
                {PRODUCTS.map(p => (
                  <div
                    key={p.id}
                    style={{
                      padding: 20,
                      background: T.paper,
                      border: "2px solid " + T.ink,
                      cursor: "pointer",
                      transition: "all 0.3s"
                    }}
                    onClick={() => {
                      setResult(p);
                      setStage("result");
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 10 }}>{p.icon}</div>
                    <h3 style={{ color: T.ink, marginBottom: 4, fontSize: 14 }}>{p.name}</h3>
                    <p style={{ fontSize: 12, color: T.dim, marginBottom: 12 }}>{p.tagline}</p>
                    <button style={{ width: "100%", fontSize: 11 }}>VIEW SAMPLE</button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: T.paper, padding: 30, border: "2px solid " + T.ink }}>
              <h2 style={{ marginBottom: 20, fontSize: 16, color: T.blue }}>ANALYZE DOCUMENT</h2>
              <textarea
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                placeholder="Paste document here (50+ characters)..."
                style={{ width: "100%", height: 200, marginBottom: 15 }}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => handleAnalyze(docText)}
                  disabled={loading}
                  style={{ flex: 1, padding: 12, fontSize: 12, fontWeight: 700 }}
                >
                  {loading ? "ANALYZING..." : "ANALYZE DOCUMENT"}
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{ padding: 12, fontSize: 12 }}
                >
                  UPLOAD FILE
                </button>
                <input ref={fileRef} type="file" hidden onChange={handleFileUpload} />
              </div>
              {error && (
                <div style={{ color: T.red, padding: 12, marginTop: 15, background: T.redBg, border: "1px solid " + T.red }}>
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {stage === "result" && result && (
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 20px" }}>
            <div ref={pdfRef} style={{ background: T.paper, padding: 40, marginBottom: 40, border: "2px solid " + T.ink }}>
              <h1 style={{ fontSize: 32, color: T.ink, marginBottom: 20 }}>DocDecoder Report</h1>
              <h2 style={{ fontSize: 18, marginBottom: 10 }}>{result.documentType}</h2>
              <p style={{ fontSize: 13, color: T.dim, lineHeight: 1.6, marginBottom: 15 }}>{result.summary}</p>

              {result.clauses && (
                <div style={{ marginBottom: 30 }}>
                  <h3 style={{ fontSize: 14, marginBottom: 15, color: T.blue }}>KEY CLAUSES</h3>
                  {result.clauses.map((c, i) => (
                    <div key={i} style={{ padding: 15, marginBottom: 10, background: T.bg, border: "1px solid " + T.ink }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <strong style={{ fontSize: 12 }}>{c.title}</strong>
                        <span style={{ fontSize: 10, color: c.risk === "RED" ? T.red : T.amber }}>[{c.risk}]</span>
                      </div>
                      <p style={{ fontSize: 12, color: T.dim }}>{c.plain}</p>
                    </div>
                  ))}
                </div>
              )}

              {result.actions && (
                <div style={{ marginBottom: 30 }}>
                  <h3 style={{ fontSize: 14, marginBottom: 15, color: T.blue }}>ACTIONS</h3>
                  {result.actions.map((a, i) => (
                    <div key={i} style={{ padding: 12, marginBottom: 10, background: a.priority === "URGENT" ? T.redBg : T.ambBg }}>
                      <strong style={{ fontSize: 11 }}>[{a.priority}] {a.action}</strong>
                      <p style={{ fontSize: 11, color: T.dim, marginTop: 4 }}>{a.reason}</p>
                    </div>
                  ))}
                </div>
              )}

              {result.questions && (
                <div style={{ marginBottom: 30 }}>
                  <h3 style={{ fontSize: 14, marginBottom: 15, color: T.blue }}>EXPERT QUESTIONS</h3>
                  {result.questions.map((q, i) => (
                    <div key={i} style={{ padding: 12, marginBottom: 8, background: T.bg, borderLeft: "3px solid " + T.ink }}>
                      <p style={{ fontSize: 11, color: T.ink }}>Q{i + 1}. {q}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 30 }}>
              <button onClick={downloadPDF} style={{ flex: 1, padding: 12, fontSize: 12, fontWeight: 700 }}>
                DOWNLOAD PDF
              </button>
            </div>

            <button
              className="no-print"
              onClick={() => {
                setStage("home");
                setDocText("");
                setResult(null);
              }}
              style={{ width: "100%", padding: 12, fontSize: 12 }}
            >
              ANALYZE ANOTHER DOCUMENT
            </button>
          </div>
        )}

        <footer style={{ marginTop: 80, padding: "20px", borderTop: "2px solid " + T.ink, textAlign: "center", fontSize: 10, color: T.dim }}>
          DOCDECODER - ENTERPRISE DOCUMENT ANALYSIS
        </footer>
      </div>
    </>
  );
}
