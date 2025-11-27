export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { resume, jobDesc } = request.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'Missing API Key' });
  }

  // STABLE MODEL URL
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=${apiKey}`;

  const systemPrompt = `You are a master executive resume writer. Rewrite the provided resume to target the job description.
  OUTPUT FORMAT: Return a SINGLE, VALID JSON object. No markdown.
  
  JSON STRUCTURE:
  {
    "atsScore": number (0-100),
    "keyOptimizations": ["string"],
    "tailoredContent": "The full markdown text of the new resume"
  }`;

  const userPrompt = `ORIGINAL RESUME:\n${resume}\n\nTARGET JOB DESCRIPTION:\n${jobDesc}`;

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

    if (!geminiResponse.ok) {
      throw new Error(`Gemini Tailor Error: ${geminiResponse.statusText}`);
    }
    
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
    console.error("Tailor API Failed:", error);
    return response.status(500).json({ error: 'Failed to tailor resume' });
  }
}
