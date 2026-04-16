import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { type, text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const prompt = `
Je bent een document-analyse AI voor vastgoedfinancieringen.

Documenttype: ${type}

Geef ALLEEN geldige JSON terug.
GEEN uitleg, GEEN tekst, alleen JSON.

Gebruik dit formaat:
{
  "naamKlant": "",
  "vermogen": 0,
  "aantalPanden": 0,
  "woonland": "",
  "aankoopprijs": 0,
  "marktwaarde": 0,
  "huur": 0
}

Als iets niet gevonden is, gebruik lege string "" of 0.

Tekst:
${text}
`;

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
    });

    const output = response.output_text;

let parsed;

try {
  parsed = JSON.parse(output);
} catch (e) {
  parsed = { error: "Geen geldige JSON", raw: output };
}

return res.status(200).json(parsed);
  } catch (error) {
    console.error("OpenAI fout:", error);

    return res.status(500).json({
      error: "AI error",
      message: error?.message || "Onbekende fout"
    });
  }
}
