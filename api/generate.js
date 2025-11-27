export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { resume, jobDesc } = request.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'Server Config Error: GEMINI_API_KEY is missing.' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  // FIXED: Default to 6 questions as requested
  const count = 6; 

  const masterPrompt = `
    ROLE: You are an elite executive career coach.
    TASK: Analyze the Resume and Job Description.
    
    INSTRUCTION: Generate exactly ${count} diverse, high-impact interview questions.
    
    CRITICAL OUTPUT RULE: 
    Return ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json. 
    Start with { and end with }.

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
      "roleAnalysis": {
        "level": "Entry/Mid/Senior/Lead/Executive",
        "coreFocus": "String",
        "techStack": ["String"]
      },
      "companyIntel": {
        "name": "String",
        "missionKeywords": ["String"],
        "keyChallenges": ["String"],
        "hiringManagerPainPoints": ["String"],
        "talkingPoints": ["String"]
      },
      "elevatorPitch": {
        "hook": "String",
        "body": "String",
        "close": "String"
      },
      "skillAnalysis": [
        { "skill": "String", "status": "match" | "partial" | "missing" }
      ],
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
      body: JSON.stringify({
        contents: [{ parts: [{ text: masterPrompt }] }]
      })
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API Error: ${geminiResponse.status} ${geminiResponse.statusText}`);
    }
    
    const data = await geminiResponse.json();
    let textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '');
    const firstBrace = textResponse.indexOf('{');
    const lastBrace = textResponse.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        textResponse = textResponse.substring(firstBrace, lastBrace + 1);
    }

    return response.status(200).json(JSON.parse(textResponse));
  } catch (error) {
    console.error("Generate API Failed:", error);
    return response.status(500).json({ error: error.message });
  }
}
