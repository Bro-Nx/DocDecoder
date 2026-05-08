import { useState, useRef } from "react";
import Head from "next/head";

const T = {
  bg:"#F7F4EE", paper:"#FDFBF7", ink:"#1A1814",
  dim:"#8A8070", border:"#E2DDD4", gold:"#B8860B", goldLt:"#F0CC7A",
  red:"#C0392B", redBg:"#FDE8E5", amber:"#D97706", ambBg:"#FEF3C7",
  green:"#15803D", grnBg:"#F0FDF4", blue:"#0EA5E9",
};

export default function DocDecoder() {
  const [stage, setStage] = useState("home");
  const [docText, setDocText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const pdfRef = useRef();
  const fileRef = useRef();

  const PRODUCTS = [
    {
      id:"health", icon:"🏥", name:"Health DocDecoder", color:"#0EA5E9", tagline:"Medical bills, EOBs & denial letters",
      documentType:"UnitedHealth Group EOB - Denied Claim",
      summary:"This EOB denies a $2,472 CT scan. You have 30 days for peer-to-peer review.",
      overallRisk:"AMBER",
      clauses:[{title:"Denial Reason",plain:"Insurance says the CT scan wasn't necessary.",risk:"AMBER"}],
      actions:[{priority:"URGENT",action:"Call your doctor's office and request peer-to-peer review",reason:"Fastest path to reversal"}],
      questions:[{question:"Ask them: What clinical information did you submit with the original authorization request?"}]
    },
    {
      id:"policy", icon:"📋", name:"Policy DocDecoder", color:"#8B5CF6", tagline:"Insurance policies, riders & exclusions",
      documentType:"Homeowners Insurance Policy (HO-3)",
      summary:"Your policy covers wind and fire but EXCLUDES all flood damage.",
      overallRisk:"AMBER",
      clauses:[{title:"Flood Exclusion",plain:"Your homeowners policy will not pay for flood damage.",risk:"RED"}],
      actions:[{priority:"URGENT",action:"Check your property's flood zone at FEMA's Flood Map",reason:"If in flood zone, flood insurance may be required"}],
      questions:[{question:"Ask them: What is my property's specific flood zone designation?"}]
    },
    {
      id:"legal", icon:"⚖️", name:"Legal DocDecoder", color:"#B8860B", tagline:"Agreements, job offers & legal paperwork",
      documentType:"Employment Offer Letter",
      summary:"Offer contains IP assignment, 18-month non-compete, non-solicitation, and mandatory arbitration.",
      overallRisk:"AMBER",
      clauses:[{title:"Non-Compete",plain:"After you leave, you cannot work for direct competitors for 18 months.",risk:"AMBER"}],
      actions:[{priority:"URGENT",action:"Before signing, ask if they will modify the non-compete clause",reason:"These clauses are often negotiable"}],
      questions:[{question:"Ask them: Would you be willing to reduce the non-compete period to 6-12 months?"}]
    },
    {
      id:"aid", icon:"🎓", name:"Financial Aid DocDecoder", color:"#10B981", tagline:"FAFSA awards, student loan notes & IBR",
      documentType:"University Financial Aid Award Letter",
      summary:"Total aid: $23,100/year. Remaining cost: $16,900/year. Parent PLUS loan at 9.08% interest.",
      overallRisk:"AMBER",
      clauses:[{title:"PLUS Loan Terms",plain:"Your parents would borrow at 9.08% interest (higher than typical).",risk:"AMBER"}],
      actions:[{priority:"URGENT",action:"Calculate total debt at graduation including capitalized interest on all loans",reason:"PLUS loans significantly increase total borrowing cost"}],
      questions:[{question:"Ask them: What GPA and credit-hour requirements must be maintained for scholarship renewal?"}]
    },
  ];

  const handleAnalyze = async (text) => {
    if (!text.trim() || text.trim().length < 50) {
      setError("Document must be at least 50 characters");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: text }),
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
    const file = e.target.files?.[0];
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
    if (!pdfRef.current) return;
    window.print();
  };

  return (
    <>
      <Head>
        <title>DocDecoder™ — Understand any document before it costs you money</title>
        <meta name="description" content="Plain English document analysis. Clause-by-clause risk scores. Expert questions." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@300;400;500&family=Lato:wght@300;400;700;900&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Georgia',serif" }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          button { fontFamily: 'Lato', sans-serif; border: 1px solid ${T.border}; background: ${T.paper}; cursor: pointer; transition: all 0.2s; }
          button:hover { background: ${T.gold}33; }
          input, textarea { fontFamily: 'Georgia', serif; border: 1px solid ${T.border}; padding: 12px; color: ${T.ink}; }
          input::placeholder, textarea::placeholder { color: ${T.dim}; }
          .card { padding: 20px; background: ${T.paper}; border: 2px solid ${T.border}; cursor: pointer; transition: all 0.3s; }
          .card:hover { border-color: ${T.gold}; background: ${T.goldLt}22; }
          @media print { body { background: white; } .no-print { display: none; } }
        `}</style>

        {stage === "home" && (
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 10 }}>DocDecoder™</h1>
              <p style={{ fontSize: 18, color: T.blue, marginBottom: 20, fontStyle: "italic" }}>
                "DocDecoder: Understand any document before it costs you money. 💰"
              </p>
              <p style={{ fontSize: 14, color: T.dim, maxWidth: 600, margin: "0 auto" }}>
                Plain English. Clause-by-clause risk scores. And 8–10 expert questions built on expert negotiation and sales frameworks.
              </p>
            </div>

            <div style={{ marginBottom: 40 }}>
              <h3 style={{ textAlign: "center", marginBottom: 20, fontSize: 18 }}>Or try a sample:</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
                {PRODUCTS.map(p => (
                  <div key={p.id} className="card" style={{ borderColor: p.color }} onClick={() => {
                    setResult(p);
                    setStage("result");
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>{p.icon}</div>
                    <h3 style={{ color: p.color, marginBottom: 8, fontSize: 16 }}>{p.name}</h3>
                    <p style={{ fontSize: 12, color: T.dim, marginBottom: 15 }}>{p.tagline}</p>
                    <button style={{ width: "100%", padding: 8, fontSize: 12, background: p.color, color: "#fff", border: "none" }}>
                      View Sample
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: T.goldLt, padding: 30, borderRadius: 8 }}>
              <h2 style={{ marginBottom: 20, fontSize: 24 }}>Analyze Your Document</h2>
              
              <textarea
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                placeholder="Paste your document here (50+ characters)..."
                style={{ width: "100%", height: 200, marginBottom: 15, fontSize: 14 }}
              />
              
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => handleAnalyze(docText)} disabled={loading} style={{ flex: 1, padding: 15, fontSize: 16, fontWeight: 700, background: T.gold, color: "#fff", cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? "Analyzing..." : "ANALYZE DOCUMENT →"}
                </button>
                <button onClick={() => fileRef.current?.click()} style={{ padding: 15, fontSize: 16 }}>
                  📎 Upload File
                </button>
                <input ref={fileRef} type="file" hidden onChange={handleFileUpload} />
              </div>
              
              {error && <div style={{ color: T.red, padding: 15, marginTop: 15, background: T.redBg, borderRadius: 4 }}>{error}</div>}
            </div>
          </div>
        )}

        {stage === "result" && result && (
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
            <div ref={pdfRef} style={{ background: T.paper, padding: 40, marginBottom: 40, borderRadius: 8 }}>
              <div style={{ textAlign: "center", marginBottom: 30, paddingBottom: 20, borderBottom: `2px solid ${T.gold}` }}>
                <h1 style={{ fontSize: 32, color: T.gold }}>DocDecoder™</h1>
                <p style={{ fontSize: 12, color: T.dim }}>Document Analysis Report</p>
              </div>

              <h2 style={{ fontSize: 24, marginBottom: 20 }}>{result.documentType}</h2>
              <p style={{ fontSize: 14, color: T.dim, marginBottom: 20 }}>{result.summary}</p>

              {result.clauses && (
                <div style={{ marginBottom: 30 }}>
                  <h3 style={{ fontSize: 18, marginBottom: 15 }}>Key Clauses</h3>
                  {result.clauses.map((c, i) => (
                    <div key={i} style={{ padding: 15, marginBottom: 10, background: T.bg, border: `1px solid ${T.border}` }}>
                      <strong>{c.title}</strong> <span style={{ fontSize: 11, float: "right", padding: "4px 8px", background: c.risk === "RED" ? T.redBg : T.ambBg, color: c.risk === "RED" ? T.red : T.amber }}>{c.risk}</span>
                      <p style={{ fontSize: 13, color: T.dim, marginTop: 8 }}>{c.plain}</p>
                    </div>
                  ))}
                </div>
              )}

              {result.actions && (
                <div style={{ marginBottom: 30 }}>
                  <h3 style={{ fontSize: 18, marginBottom: 15 }}>Recommended Actions</h3>
                  {result.actions.map((a, i) => (
                    <div key={i} style={{ padding: 15, marginBottom: 10, background: a.priority === "URGENT" ? T.redBg : T.ambBg }}>
                      <strong>[{a.priority}] {a.action}</strong>
                      <p style={{ fontSize: 12, color: T.dim, marginTop: 5 }}>{a.reason}</p>
                    </div>
                  ))}
                </div>
              )}

              {result.questions && (
                <div style={{ marginBottom: 30 }}>
                  <h3 style={{ fontSize: 18, marginBottom: 15 }}>Questions to Ask</h3>
                  {result.questions.map((q, i) => (
                    <div key={i} style={{ padding: 12, marginBottom: 10, background: T.bg, borderLeft: `4px solid ${T.gold}` }}>
                      <p style={{ fontSize: 13 }}>{i + 1}. {q.question}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 30 }}>
              <button onClick={downloadPDF} style={{ flex: 1, padding: 15, fontSize: 16, fontWeight: 700, background: T.gold, color: "#fff" }}>
                📥 Download PDF
              </button>
            </div>

            <button className="no-print" onClick={() => { setStage("home"); setDocText(""); setResult(null); }} style={{ width: "100%", padding: 15, fontSize: 16 }}>
              ← Analyze Another Document
            </button>
          </div>
        )}

        <footer style={{ marginTop: 80, padding: "40px 20px", background: "#1A1814", color: "#999", textAlign: "center", fontSize: 12 }}>
          DOCDECODER™ · UNDERSTAND ANY DOCUMENT BEFORE IT COSTS YOU MONEY · NOT LEGAL ADVICE
        </footer>
      </div>
    </>
  );
}
