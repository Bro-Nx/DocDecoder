import { useEffect, useState, useRef } from "react";
import Head from "next/head";

export default function ResultPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const pdfRef = useRef(null);

  useEffect(() => {
    const resultJson = sessionStorage.getItem("docDecoderResult");
    if (resultJson) {
      setResult(JSON.parse(resultJson));
      setLoading(false);
    }
  }, []);

  const downloadPDF = () => {
    if (pdfRef.current) {
      window.print();
    }
  };

  const goHome = () => {
    sessionStorage.clear();
    window.location.href = "/";
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: 60, fontSize: 18 }}>Loading...</div>;
  }

  if (!result) {
    return <div style={{ textAlign: "center", padding: 60, fontSize: 18 }}>No analysis found</div>;
  }

  return (
    <>
      <Head>
        <title>DocDecoder Report</title>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz@9..144&family=Inter:wght@300;400;600;700&family=Caveat:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #faf8f3 0%, #f4ede3 100%)", fontFamily: "Inter, sans-serif", color: "#2c2416" }}>
        <style>{`
          button { font-family: 'Inter', sans-serif; border: 2px solid #2c2416; background: #fff8f0; color: #2c2416; cursor: pointer; padding: 10px 20px; transition: all 0.3s; border-radius: 8px; font-weight: 600; }
          button:hover { background: #2c2416; color: #faf8f3; transform: translateY(-2px); }
          @media print { .no-print { display: none; } }
        `}</style>

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
                      <span style={{ fontSize: 11, color: c.risk === "RED" ? "#c94a38" : "#d4a574", fontWeight: 700 }}>
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
            onClick={goHome}
            style={{ width: "100%", padding: 14, fontSize: 14 }}
          >
            ← Analyze Another Document
          </button>
        </div>
      </div>
    </>
  );
}
