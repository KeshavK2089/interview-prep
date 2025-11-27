export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  const { question, answer } = request.body;
  const apiKey = process.env.GEMINI_API_KEY;
  
  // FORCED: Using Gemini 2.5 Flash Preview
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const prompt = `
    Interview Coach. Analyze answer.
    OUTPUT: JSON { "score": number (1-10), "feedback": "string", "betterAnswer": "string" }
    Q: "${question}"
    A: "${answer}"
  `;

  try {
    const geminiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await geminiResponse.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1) text = text.substring(first, last + 1);
    
    return response.status(200).json(JSON.parse(text));
  } catch (error) {
    return response.status(500).json({ error: 'Failed to analyze' });
  }
}
