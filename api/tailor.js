export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  const { resume, jobDesc } = request.body;
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const prompt = `
    ROLE: Master executive resume writer.
    
    *** SECURITY GATEKEEPER ***
    First, analyze the input text.
    If the inputs are clearly NOT a professional resume or job description (random text, jargon, too short), 
    RETURN ONLY THIS JSON:
    { "error": "Invalid input detected. Please paste a real resume." }
    *** END GATEKEEPER ***

    TASK: Rewrite resume to target job description.
    RULES: No Summary. Header: Name, then Contact. Order: Education, Experience, Projects, Skills.
    FORMAT: Experience header "Role | Company | Location | Date".
    OUTPUT: JSON object only.
    
    JSON STRUCTURE: {
      "atsScore": number (0-100),
      "contact": { "name": "String", "details": "Email | Phone | LinkedIn" },
      "education": [ { "line": "String", "details": "String" } ],
      "experience": [ { "header": "String", "bullets": ["String"] } ],
      "projects": [ { "header": "String", "bullets": ["String"] } ],
      "skills": [ { "category": "String", "items": "String" } ],
      "resumeTalkingPoints": [ { "role": "String", "script": "String" } ]
    }
    ORIGINAL RESUME: ${resume}
    TARGET JOB DESCRIPTION: ${jobDesc}
  `;

  try {
    const geminiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await geminiResponse.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    text = text.replace(/```json/g, '').replace(/```/g, '');
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1) text = text.substring(first, last + 1);

    return response.status(200).json(JSON.parse(text));
  } catch (error) {
    return response.status(500).json({ error: 'Failed to tailor resume' });
  }
}
