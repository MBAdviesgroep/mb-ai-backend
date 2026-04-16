import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
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

Haal de belangrijkste gegevens eruit en geef ALLEEN JSON terug.

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
      model: "gpt-5.4-mini",
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
