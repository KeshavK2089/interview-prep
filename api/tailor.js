export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { resume, jobDesc } = request.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'Missing API Key' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const masterPrompt = `
    ROLE: You are a master executive resume writer. 
    TASK: Rewrite the provided resume to target the job description.
    
    CRITICAL OUTPUT RULE: Return ONLY a valid JSON object. No markdown.
    
    JSON STRUCTURE:
    {
      "atsScore": number (0-100),
      "keyOptimizations": ["string"],
      "tailoredContent": "The full markdown text of the new resume"
    }

    ORIGINAL RESUME: ${resume}
    TARGET JOB DESCRIPTION: ${jobDesc}
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
      throw new Error(`Gemini Tailor Error: ${geminiResponse.statusText}`);
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
    console.error("Tailor API Failed:", error);
    return response.status(500).json({ error: 'Failed to tailor resume' });
  }
}
