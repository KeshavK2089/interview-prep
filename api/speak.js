export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = request.body;
  const apiKey = process.env.GEMINI_API_KEY;
  
  // We use the specific TTS model
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

  try {
    const geminiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Kore" // Options: Kore, Fenrir, Puck, Aoede
              }
            }
          }
        }
      })
    });

    if (!geminiResponse.ok) throw new Error('Gemini TTS Failed');

    const data = await geminiResponse.json();
    const audioBase64 = data.candidates[0].content.parts[0].inlineData.data;

    // Convert Raw PCM to WAV (Browsers can't play raw PCM easily)
    // This helper adds a WAV header to the audio data
    const wavBuffer = pcmToWav(Buffer.from(audioBase64, 'base64'));

    // Send back audio file
    response.setHeader('Content-Type', 'audio/wav');
    return response.send(wavBuffer);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'TTS failed' });
  }
}

// --- Helper: Convert Raw PCM to WAV ---
function pcmToWav(pcmData, sampleRate = 24000) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmData.length;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  pcmData.copy(buffer, 44);

  return buffer;
}
