export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { question, answer } = request.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // FIXED: Using the universal alias 'gemini-1.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const systemPrompt = `You are an interview coach. Analyze the candidate's answer.
  OUTPUT FORMAT: JSON Object.
  {
    "score": number (1-10),
    "feedback": "string",
    "betterAnswer": "string"
  }`;

  const userPrompt = `QUESTION: "${question}"\nCANDIDATE ANSWER: "${answer}"`;

  try {
    const geminiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!geminiResponse.ok) throw new Error('Gemini API Error');

    const data = await geminiResponse.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return response.status(200).json(JSON.parse(text));
  } catch (error) {
    return response.status(500).json({ error: 'Failed to analyze answer' });
  }
}
