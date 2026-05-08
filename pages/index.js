import { useState, useRef } from "react";
import Head from "next/head";

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
        "What IP specifically belongs to the company vs. what I create independently?",
        "Who decides disputes about IP ownership?",
        "Is there a geographic limitation to the non-compete?",
        "What's the penalty if I violate the non-compete agreement?"
      ]
    },
    {
      id: "aid",
      icon: "🎓",
      name: "Financial Aid DocDecoder",
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
        <title>DocDecoder - Artistic Document Analysis</title>
        <meta name="description" content="Creative document analysis with soul." />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz@9..144&family=Inter:wght@300;400;600;700&family=Caveat:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #faf8f3 0%, #f4ede3 100%)", fontFamily: "Inter, sans-serif", color: "#2c2416" }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: linear-gradient(135deg, #faf8f3 0%, #f4ede3 100%); }
          button { font-family: 'Inter', sans-serif; border: 2px solid #2c2416; background: #fff8f0; color: #2c2416; cursor: pointer; padding: 10px 20px; transition: all 0.3s; border-radius: 8px; font-weight: 600; }
          button:hover { background: #2c2416; color: #faf8f3; transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.1); }
          input, textarea { font-family: 'Inter', sans-serif; border: 2px solid #d4ccc0; padding: 12px; background: #fff8f0; color: #2c2416; border-radius: 8px; }
          input::placeholder, textarea::placeholder { color: #9b8b7e; }
          .card { padding: 24px; background: #fff8f0; border: 3px solid #e8dfd2; cursor: pointer; transition: all 0.3s; border-radius: 12px; }
          .card:hover { border-color: #d4a574; box-shadow: 0 12px 24px rgba(0,0,0,0.08); transform: translateY(-4px); }
          @media print { .no-print { display: none; } }
        `}</style>

        {stage === "home" && (
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 30px" }}>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <h1 style={{ fontSize: 56, fontFamily: "Fraunces, serif", fontWeight: 700, marginBottom: 16, color: "#2c2416", letterSpacing: "-1px" }}>
                DocDecoder
              </h1>
              <p style={{ fontSize: 18, fontFamily: "Caveat, cursive", color: "#d4a574", marginBottom: 20, fontWeight: 700 }}>
                Understand any document before it costs you money
              </p>
              <p style={{ fontSize: 14, color: "#6b5d50", maxWidth: 700, margin: "0 auto", lineHeight: 1.8 }}>
                Plain English. Clause-by-clause risk scores. And 8–10 expert questions built on negotiation frameworks. Creative analysis with real insight.
              </p>
            </div>

            <div style={{ marginBottom: 60 }}>
              <h3 style={{ textAlign: "center", marginBottom: 30, fontSize: 20, fontFamily: "Fraunces, serif", color: "#2c2416" }}>
                Try a sample
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
                {PRODUCTS.map(p => (
                  <div
                    key={p.id}
                    className="card"
                    onClick={() => {
                      setResult(p);
                      setStage("result");
                    }}
                  >
                    <div style={{ fontSize: 40, marginBottom: 12 }}>{p.icon}</div>
                    <h3 style={{ color: "#2c2416", marginBottom: 8, fontSize: 16, fontFamily: "Fraunces, serif", fontWeight: 600 }}>
                      {p.name}
                    </h3>
                    <p style={{ fontSize: 13, color: "#6b5d50", marginBottom: 16, lineHeight: 1.6 }}>
                      {p.tagline}
                    </p>
                    <button style={{ width: "100%", fontSize: 12 }}>
                      → View Sample
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff8f0", padding: 40, border: "3px solid #e8dfd2", borderRadius: 12 }}>
              <h2 style={{ marginBottom: 16, fontSize: 24, fontFamily: "Fraunces, serif", color: "#2c2416" }}>
                Analyze Your Document
              </h2>
              <p style={{ fontSize: 13, color: "#6b5d50", marginBottom: 20 }}>
                Paste or upload any document to get instant, insightful analysis.
              </p>
              
              <textarea
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                placeholder="Paste your document here (50+ characters)..."
                style={{ width: "100%", height: 220, marginBottom: 20, fontSize: 14 }}
              />
              
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => handleAnalyze(docText)}
                  disabled={loading}
                  style={{ flex: 1, padding: 14, fontSize: 14, fontWeight: 700 }}
                >
                  {loading ? "✨ Analyzing..." : "→ Analyze Document"}
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{ padding: 14, fontSize: 14 }}
                >
                  📎 Upload
                </button>
                <input ref={fileRef} type="file" hidden onChange={handleFileUpload} />
              </div>
              
              {error && (
                <div style={{ color: "#c94a38", padding: 14, marginTop: 16, background: "#fce8e4", border: "2px solid #c94a38", borderRadius: 8 }}>
                  ⚠️ {error}
                </div>
              )}
            </div>
          </div>
        )}

        {stage === "result" && result && (
          <div style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 30px" }}>
            <div ref={pdfRef} style={{ background: "#fff8f0", padding: 50, border: "3px solid #e8dfd2", borderRadius: 12, marginBottom: 40 }}>
              <div style={{ textAlign: "center", marginBottom: 40, paddingBottom: 30, borderBottom: "2px solid #e8ddf2" }}>
                <h1 style={{ fontSize: 44, fontFamily: "Fraunces, serif", fontWeight: 700, color: "#2c2416", marginBottom: 8 }}>
                  DocDecoder Report
                </h1>
                <p style={{ fontSize: 13, color: "#6b5d50" }}>Creative analysis. Real insight.</p>
              </div>

              <h2 style={{ fontSize: 22, fontFamily: "Fraunces, serif", color: "#2c2416", marginBottom: 12 }}>
                {result.documentType}
              </h2>
              <p style={{ fontSize: 14, color: "#6b5d50", lineHeight: 1.8, marginBottom: 20 }}>
                {result.summary}
              </p>

              {result.clauses && (
                <div style={{ marginBottom: 35 }}>
                  <h3 style={{ fontSize: 16, fontFamily: "Fraunces, serif", color: "#2c2416", marginBottom: 16 }}>
                    Key Clauses
                  </h3>
                  {result.clauses.map((c, i) => (
                    <div key={i} style={{ padding: 16, marginBottom: 12, background: "#faf8f3", border: "2px solid #e8dfd2", borderRadius: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <strong style={{ fontSize: 13, color: "#2c2416" }}>{c.title}</strong>
                        <span style={{ fontSize: 11, color: c.risk === "RED" ? "#c94a38" : c.risk === "AMBER" ? "#d4a574" : "#5a7d4d", fontWeight: 700 }}>
                          {c.risk}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: "#6b5d50" }}>{c.plain}</p>
                    </div>
                  ))}
                </div>
              )}

              {result.actions && (
                <div style={{ marginBottom: 35 }}>
                  <h3 style={{ fontSize: 16, fontFamily: "Fraunces, serif", color: "#2c2416", marginBottom: 16 }}>
                    Recommended Actions
                  </h3>
                  {result.actions.map((a, i) => (
                    <div key={i} style={{ padding: 16, marginBottom: 12, background: a.priority === "URGENT" ? "#fce8e4" : "#fff3e4", border: `2px solid ${a.priority === "URGENT" ? "#c94a38" : "#d4a574"}`, borderRadius: 8 }}>
                      <strong style={{ fontSize: 13, color: "#2c2416" }}>
                        [{a.priority}] {a.action}
                      </strong>
                      <p style={{ fontSize: 12, color: "#6b5d50", marginTop: 6 }}>
                        {a.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {result.questions && (
                <div style={{ marginBottom: 30 }}>
                  <h3 style={{ fontSize: 16, fontFamily: "Fraunces, serif", color: "#2c2416", marginBottom: 16 }}>
                    Expert Questions
                  </h3>
                  {result.questions.map((q, i) => (
                    <div key={i} style={{ padding: 14, marginBottom: 10, background: "#faf8f3", borderLeft: "4px solid #d4a574", borderRadius: 4 }}>
                      <p style={{ fontSize: 12, color: "#2c2416", lineHeight: 1.6 }}>
                        <strong>Q{i + 1}.</strong> {q}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ paddingTop: 20, borderTop: "2px solid #e8dfd2", fontSize: 11, color: "#9b8b7e", lineHeight: 1.6 }}>
                <p>
                  This report explains your document in plain English. Not legal advice. For important decisions, consult a qualified attorney.
                </p>
              </div>
            </div>

            <div className="no-print" style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <button onClick={downloadPDF} style={{ flex: 1, padding: 16, fontSize: 14, fontWeight: 700 }}>
                → Download PDF
              </button>
            </div>

            <button
              className="no-print"
              onClick={() => {
                setStage("home");
                setDocText("");
                setResult(null);
              }}
              style={{ width: "100%", padding: 14, fontSize: 14 }}
            >
              ← Analyze Another Document
            </button>
          </div>
        )}

        <footer style={{ marginTop: 80, padding: "40px 30px", textAlign: "center", fontSize: 12, color: "#9b8b7e", borderTop: "2px solid #e8dfd2" }}>
          <p style={{ fontFamily: "Caveat, cursive", fontSize: 16, color: "#d4a574", marginBottom: 8 }}>
            DocDecoder
          </p>
          Creative analysis. Real insight. Not legal advice.
        </footer>
      </div>
    </>
  );
}
