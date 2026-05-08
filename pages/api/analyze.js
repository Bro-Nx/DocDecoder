export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { document } = req.body;

  if (!document) {
    return res.status(400).json({ error: "No document provided" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3000,
        system: `You are DocDecoder™. Analyze documents in plain English. Return ONLY valid JSON with: documentType, summary (2-3 sentences), overallRisk (RED/AMBER/GREEN), clauses (array of {title, plain, risk}), actions (array of {priority, action, reason}), questions (array of {question starting with "Ask them:"}).`,
        messages: [{ role: "user", content: `Analyze: ${document}` }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.content?.[0]?.text || "";
    const analysis = JSON.parse(analysisText);

    return res.status(200).json(analysis);
  } catch (err) {
    console.error("Analysis error:", err);
    return res.status(500).json({ error: err.message });
  }
}
