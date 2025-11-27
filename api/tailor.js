export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  const { resume, jobDesc } = request.body;
  const apiKey = process.env.GEMINI_API_KEY;
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
    ROLE: You are a master executive resume writer. Rewrite the provided resume to target the job description.
    
    STRICT FORMATTING RULES (Based on Keshav-Resume.pdf):
    1. **NO SUMMARY**: Do not include a professional summary or objective.
    2. **HEADER**: Name on top. Second line: Email | Phone | LinkedIn.
    3. **ORDER**: Education, Experience, Projects, Skills.
    4. **STYLE**: Clean, dense bullet points. High burstiness (varied sentence length).
    5. **CONTENT**: Tailor experiences to match the Job Description keywords while remaining factual.

    CRITICAL OUTPUT RULE: Return ONLY a valid JSON object.
    
    JSON STRUCTURE:
    {
      "atsScore": number (0-100),
      "contact": { "name": "String", "details": "Email | Phone | LinkedIn" },
      "education": [ 
        { "line": "Degree | School | Location | GPA | Date", "details": "String (optional)" } 
      ],
      "experience": [ 
        { "header": "Role | Company | Location | Date", "bullets": ["String", "String"] } 
      ],
      "projects": [
        { "header": "Title | Institution/Context | Location | Date", "bullets": ["String", "String"] }
      ],
      "skills": [
        { "category": "String", "items": "String" }
      ],
      "resumeTalkingPoints": [
        { "role": "Role Name", "script": "Conversational explanation" }
      ]
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
