export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  const { text } = request.body;
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

  try {
    const geminiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } }
        }
      })
    });

    if (!geminiResponse.ok) throw new Error('TTS API Failed');
    const data = await geminiResponse.json();
    const base64Audio = data.candidates[0].content.parts[0].inlineData.data;
    const wavBuffer = Buffer.from(base64Audio, 'base64');
    response.setHeader('Content-Type', 'audio/wav');
    return response.send(wavBuffer);
  } catch (error) {
    return response.status(500).json({ error: 'TTS failed' });
  }
}
