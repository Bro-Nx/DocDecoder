import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Get email & doc from sessionStorage (if available)
    const email = sessionStorage.getItem("docDecoderEmail");
    const doc = sessionStorage.getItem("docDecoderDoc");

    // If we have both, auto-analyze
    if (email && doc) {
      analyzeDocument(doc);
    } else {
      // Otherwise just show success message
      setTimeout(() => {
        router.push("/");
      }, 5000);
    }
  }, []);

  const analyzeDocument = async (text) => {
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: text })
      });

      if (!res.ok) {
        throw new Error("Analysis failed");
      }

      const data = await res.json();
      
      // Store result in sessionStorage
      sessionStorage.setItem("docDecoderResult", JSON.stringify(data));
      
      // Redirect to result page
      router.push("/result");
    } catch (e) {
      console.error("Analysis error:", e);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }
  };

  return (
    <>
      <Head>
        <title>Payment Successful - DocDecoder</title>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz@9..144&family=Inter:wght@300;400;600;700&family=Caveat:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #faf8f3 0%, #f4ede3 100%)", fontFamily: "Inter, sans-serif", color: "#2c2416", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ textAlign: "center", maxWidth: 600 }}>
          <h1 style={{ fontSize: 48, fontFamily: "Fraunces, serif", fontWeight: 700, marginBottom: 16 }}>
            ✅ Payment Successful
          </h1>
          <p style={{ fontSize: 16, color: "#6b5d50", marginBottom: 20, lineHeight: 1.8 }}>
            Thank you! Your document is being analyzed...
          </p>
          <div style={{ fontSize: 40, marginBottom: 20, animation: "spin 2s linear infinite" }}>
            ✨
          </div>
          <p style={{ fontSize: 13, color: "#9b8b7e" }}>
            Redirecting in a moment...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </>
  );
}
