export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { question, answer } = request.body;
  const apiKey = process.env.GEMINI_API_KEY;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const systemPrompt = `You are an interview coach. 
  Analyze the candidate's answer to the interview question.
  Be conversational, encouraging, but critical.
  
  Return a JSON object:
  {
    "score": number (1-10),
    "feedback": "2-3 sentences on what they did well and what was missing.",
    "betterAnswer": "A concise example of a stronger response."
  }
  `;

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

    const data = await geminiResponse.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text.replace(/```json/g, '').replace(/```/g, '').trim();
    return response.status(200).json(JSON.parse(text));
  } catch (error) {
    return response.status(500).json({ error: 'Failed to analyze answer' });
  }
}
