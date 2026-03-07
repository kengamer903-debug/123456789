import { GoogleGenAI, Modality } from "@google/genai";
import { SCENES } from './data.ts';
import fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateAll() {
  const preloaded: Record<number, string> = {};
  
  for (const scene of SCENES) {
    console.log(`Generating audio for scene ${scene.id}...`);
    const text = scene.th.script.join(" ");
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        preloaded[scene.id] = `data:audio/wav;base64,${base64Audio}`;
        console.log(`Scene ${scene.id} generated successfully.`);
      } else {
        console.log(`Scene ${scene.id} failed to generate audio.`);
      }
    } catch (e) {
      console.error(`Error generating scene ${scene.id}:`, e);
    }
  }
  
  fs.writeFileSync('generated_audio.json', JSON.stringify(preloaded, null, 2));
  console.log("Done!");
}

generateAll();