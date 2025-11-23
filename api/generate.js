// This runs on the server. Your API Key is safe here.
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Extract the new numQuestions parameter
  const { resume, jobDesc, numQuestions } = request.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  // 2. Inject the number of questions into the instructions
  const count = numQuestions || 7; 

  const systemPrompt = `You are an elite executive career coach. 
  TASK: Analyze the Resume and Job Description.
  OUTPUT FORMAT: Return a SINGLE, VALID JSON object. No markdown.
  
  INSTRUCTION: Generate exactly ${count} diverse questions.

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
      "talkingPoints": ["String"]
    },
    "skillAnalysis": [
      { "skill": "String", "status": "match" | "partial" | "missing" }
    ],
    "strategicAdvice": "String",
    "questions": [
       { "id": number, "category": "String", "difficulty": "String", "question": "String", "intent": "String", "starGuide": { "situation": "String", "action": "String", "result": "String" } }
    ]
  }
  
  VALIDATION: If input is nonsense, return { "error": "Invalid input." }`;

  const userPrompt = `RESUME:\n${resume}\n\nJOB DESCRIPTION:\n${jobDesc}`;

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
    let textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (textResponse) {
      textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '');
      const firstOpen = textResponse.indexOf('{');
      const lastClose = textResponse.lastIndexOf('}');
      if (firstOpen !== -1 && lastClose !== -1) {
        textResponse = textResponse.substring(firstOpen, lastClose + 1);
      }
    }

    return response.status(200).json(JSON.parse(textResponse));
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Failed to generate prep plan' });
  }
}
