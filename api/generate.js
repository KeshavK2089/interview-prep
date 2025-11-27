export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { resume, jobDesc, numQuestions } = request.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'Server Config Error: GEMINI_API_KEY is missing.' });
  }

  // FIXED: Reverted to 'gemini-pro' (1.0) which is globally available and resolves 404s
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
  const count = numQuestions || 7; 

  // Merged System Prompt (Gemini 1.0 doesn't support separate system instructions well)
  const masterPrompt = `
    You are an elite executive career coach. Analyze the Resume and Job Description.
    
    INSTRUCTION: Generate exactly ${count} diverse questions.
    
    CRITICAL OUTPUT RULE: 
    Return ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json. 
    Do not include any conversational text. Start with { and end with }.

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
      "roleVibe": {
        "scope": number, "social": number, "structure": number, "techNature": number
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
      "strategicAdvice": "String",
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
        // Note: No generationConfig for JSON mode here, we parse manually below
      })
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API Error: ${geminiResponse.statusText}`);
    }
    
    const data = await geminiResponse.json();
    let textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    // --- MANUAL CLEANER (Fixes 1.0 formatting issues) ---
    // 1. Remove markdown
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '');
    // 2. Extract JSON using Regex (Finds the first { and last })
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      textResponse = jsonMatch[0];
    }
    // --- END CLEANER ---

    return response.status(200).json(JSON.parse(textResponse));
  } catch (error) {
    console.error("Generate API Failed:", error);
    return response.status(500).json({ error: 'Failed to generate plan. Please try again.' });
  }
}
