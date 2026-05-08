export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { document } = req.body;

  if (!document) {
    return res.status(400).json({ error: "No document provided" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: `You are DocDecoder™. Analyze documents and return ONLY valid JSON (no markdown, no code blocks). Format: {"documentType":"string","summary":"string","overallRisk":"RED|AMBER|GREEN","clauses":[{"title":"string","plain":"string","risk":"RED|AMBER|GREEN"}],"actions":[{"priority":"URGENT|IMPORTANT|OPTIONAL","action":"string","reason":"string"}],"questions":[{"question":"Ask them: ..."}]}`,
        messages: [{ role: "user", content: `Analyze this document:\n\n${document}` }],
      }),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error("Claude API error:", response.status, responseText);
      return res.status(response.status).json({ error: `Claude API error: ${response.status}` });
    }

    const data = JSON.parse(responseText);
    let analysisText = data.content?.[0]?.text || "";
    
    // Remove markdown code blocks if present
    analysisText = analysisText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    analysisText = analysisText.replace(/^```\n?/, "").replace(/\n?```$/, "");
    
    // Parse JSON
    const analysis = JSON.parse(analysisText);

    return res.status(200).json(analysis);
  } catch (err) {
    console.error("Analysis error:", err.message);
    return res.status(500).json({ error: `Analysis error: ${err.message}` });
  }
}
