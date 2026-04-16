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

Haal de belangrijkste gegevens eruit en geef ALLEEN geldige JSON terug.

Voorbeeld:
{
  "rechtsvorm": "BV",
  "marktwaarde": 450000,
  "risico": "laag"
}

Tekst:
${text}
`;

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
    });

    const output = response.output_text;

    return res.status(200).json({
      result: output,
    });
  } catch (error) {
    console.error("OpenAI fout:", error);

    return res.status(500).json({
      error: "AI error",
      message: error?.message || "Onbekende fout"
    });
  }
}
