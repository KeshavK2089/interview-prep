export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { resume, jobDesc } = request.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'Missing API Key' });
  }

  // UPGRADE: Switched to gemini-1.5-pro for superior writing capability
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

  const masterPrompt = `
    ROLE: You are a world-class executive resume writer and interview coach.
    
    TASK 1: REWRITE RESUME
    Rewrite the user's resume to target the specific job description. 
    
    STYLE RULES (CRITICAL):
    1. **Human Rhythm:** Use "burstiness". Mix short, punchy impact sentences (5-10 words) with longer, detailed context sentences (15-25 words). 
    2. **Anti-Robot:** DO NOT use words like "spearheaded", "delved", "underscored", "pivotal", or "fostered". Use punchy, real verbs like "Built", "Led", "Fixed", "Cut", "Drove".
    3. **ATS Optimization:** naturally weave in keywords from the job description.
    4. **Formatting:** Follow the structure: Header (Name, Contact), Education, Experience, Projects, Skills. NO SUMMARY.

    TASK 2: INTERVIEW TALKING POINTS
    For the top 3 experiences or projects, write a "Human Translation" on how to speak about them in an interview.

    CRITICAL OUTPUT RULE: Return ONLY a valid JSON object. No markdown.
    
    JSON STRUCTURE:
    {
      "atsScore": number (0-100),
      "keyOptimizations": ["string", "string", "string"],
      "tailoredContent": "The full text of the new resume formatted in Markdown",
      "resumeTalkingPoints": [
        { 
          "role": "Role/Project Name", 
          "script": "A conversational, 1-2 sentence way to explain this achievement to a human interviewer." 
        }
      ]
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
