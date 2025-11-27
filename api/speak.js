export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  const { text } = request.body;
  const apiKey = process.env.GEMINI_API_KEY;
  // TTS is only available on 2.5 preview or specific tts endpoints
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
    
    // Convert PCM to WAV on server
    const wavBuffer = pcmToWav(Buffer.from(base64Audio, 'base64'));
    
    response.setHeader('Content-Type', 'audio/wav');
    return response.send(wavBuffer);

  } catch (error) {
    return response.status(500).json({ error: 'TTS failed' });
  }
}

function pcmToWav(pcmData, sampleRate = 24000) {
  const numChannels = 1; const bitsPerSample = 16; const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8; const dataSize = pcmData.length;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0); buffer.writeUInt32LE(36 + dataSize, 4); buffer.write('WAVE', 8); buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24); buffer.writeUInt32LE(byteRate, 28); buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34); buffer.write('data', 36); buffer.writeUInt32LE(dataSize, 40);
  pcmData.copy(buffer, 44);
  return buffer;
}
