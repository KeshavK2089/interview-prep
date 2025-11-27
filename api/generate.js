export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  const { resume, jobDesc } = request.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return response.status(500).json({ error: 'Server Config Error: Missing API Key' });

  // Using standard stable model to avoid 403/404 errors
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const count = 6; 

  const masterPrompt = `
    ROLE: You are an elite executive career coach.
    TASK: Analyze the Resume and Job Description.
    INSTRUCTION: Generate exactly ${count} diverse questions.
    CRITICAL OUTPUT RULE: Return ONLY a valid JSON object. No markdown.
    
    JSON STRUCTURE:
    {
      "compatibilityScore": number (0-100),
      "dimensions": [
        { "label": "Technical", "score": number },
        { "label": "Experience", "score": number },
        { "label": "Leadership", "score": number },
        { "label": "Communication", "score": number },
        { "label": "Culture Fit", "score": number }
      ],
      "companyIntel": {
        "name": "String",
        "missionKeywords": ["String"],
        "keyChallenges": ["String"],
        "hiringManagerPainPoints": ["String"],
        "talkingPoints": ["String"]
      },
      "elevatorPitch": { "hook": "String", "body": "String", "close": "String" },
      "skillAnalysis": [ { "skill": "String", "status": "match" | "partial" | "missing" } ],
      "questions": [
         { "id": number, "category": "String", "difficulty": "String", "question": "String", "intent": "String", "starGuide": { "situation": "String", "action": "String", "result": "String" } }
      ]
    }

    RESUME: ${resume}
    JOB DESCRIPTION: ${jobDesc}
  `;

  try {
    const geminiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: masterPrompt }] }] })
    });

    const data = await geminiResponse.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    text = text.replace(/```json/g, '').replace(/```/g, '');
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1) text = text.substring(first, last + 1);

    return response.status(200).json(JSON.parse(text));
  } catch (error) {
    return response.status(500).json({ error: 'Failed to generate plan' });
  }
}
