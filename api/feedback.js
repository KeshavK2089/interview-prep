export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { question, answer } = request.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // FIXED: Reverted to 'gemini-pro'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  const masterPrompt = `
    You are an interview coach. Analyze the candidate's answer.
    
    CRITICAL OUTPUT RULE: Return ONLY a valid JSON object. No markdown.
    
    JSON STRUCTURE:
    {
      "score": number (1-10),
      "feedback": "string",
      "betterAnswer": "string"
    }

    QUESTION: "${question}"
    CANDIDATE ANSWER: "${answer}"
  `;

  try {
    const geminiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: masterPrompt }] }]
      })
    });

    if (!geminiResponse.ok) throw new Error('Gemini API Error');

    const data = await geminiResponse.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    // Manual Cleaner
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    
    return response.status(200).json(JSON.parse(text));
  } catch (error) {
    return response.status(500).json({ error: 'Failed to analyze answer' });
  }
}
