export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { resume, jobDesc, numQuestions } = request.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'Server Config Error: GEMINI_API_KEY is missing.' });
  }

  // Using gemini-1.5-flash as it is the most stable current model.
  // If this 404s, your key might lack access, but it's the standard for new keys.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const count = numQuestions || 7; 

  const masterPrompt = `
    You are an elite executive career coach. Analyze the Resume and Job Description.
    
    INSTRUCTION: Generate exactly ${count} diverse questions.
    
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
      })
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API Error: ${geminiResponse.status} ${geminiResponse.statusText}`);
    }
    
    const data = await geminiResponse.json();

    // Check if the AI refused to answer (Safety Filters)
    if (!data.candidates || data.candidates.length === 0) {
        throw new Error("AI returned no content. It might have been flagged by safety filters.");
    }

    let textResponse = data.candidates[0].content?.parts?.[0]?.text || "{}";
    
    // --- ADVANCED CLEANER ---
    // 1. Remove markdown fences
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '');
    
    // 2. Surgical Extraction: Find the VERY FIRST '{' and the VERY LAST '}'
    const firstBrace = textResponse.indexOf('{');
    const lastBrace = textResponse.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
        textResponse = textResponse.substring(firstBrace, lastBrace + 1);
    } else {
        throw new Error("AI response did not contain valid JSON structure");
    }
    // --- END CLEANER ---

    // Parse
    const parsedData = JSON.parse(textResponse);
    return response.status(200).json(parsedData);

  } catch (error) {
    console.error("Generate API Failed:", error);
    // Send the ACTUAL error message to the frontend for easier debugging
    return response.status(500).json({ error: error.message || 'Server Error' });
  }
}
