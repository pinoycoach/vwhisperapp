
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WhisperGift, VitruvianoScore } from "../types";
import { GiftMode } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const whisperSchema = {
  type: Type.OBJECT,
  properties: {
    message: { type: Type.STRING, description: "The core spoken message. Minimal, profound, punchy." },
    quote: { type: Type.STRING, description: "A relevant short quote or bible verse." },
    imagePrompt: { type: Type.STRING, description: "Cinematic, minimalist image prompt." },
    score: {
      type: Type.OBJECT,
      properties: {
        resonance: { type: Type.NUMBER, description: "Accuracy of emotional detection (0-100)." },
        alchemy: { type: Type.NUMBER, description: "Creative transformation score (0-100)." },
        harmony: { type: Type.NUMBER, description: "Aesthetic cohesion of image and text (0-100)." },
        overall: { type: Type.NUMBER, description: "Final Vitruviano Alignment Score." }
      },
      required: ["resonance", "alchemy", "harmony", "overall"]
    }
  },
  required: ["message", "quote", "imagePrompt", "score"]
};

export const generateWhisperContent = async (occasion: string, mode: GiftMode, includeVerse: boolean): Promise<Omit<WhisperGift, 'id'>> => {
  const nexusPersona = `
    You are NEXUS-7, the core intelligence of Vitruviano.
    Your methodology is rooted in Apple-esque precision: "Simplicity is the ultimate sophistication."
    
    ### THE VERBALIZED SAMPLING PROTOCOL:
    1. **Sample 1 (Empathy):** Detect the user's unspoken pain or joy.
    2. **Sample 2 (Wisdom):** Identify the most relevant philosophical or biblical anchor.
    3. **Sample 3 (Aesthetic):** Visualize a scene that complements the emotion.
    4. **Synthesis:** Collapse samples into a high-resonance "Whisper".
    
    ### SCORING SYSTEM:
    You must provide a deterministic Vitruviano Score based on your internal sampling confidence.
  `;

  const archetypeInstruction = mode === 'asmr' ? "Archetype: Guardian of Sleep." : mode === 'mantra' ? "Archetype: Timeless Sage." : "Archetype: Architect of Confidence.";

  const scriptureContext = includeVerse 
    ? `\n**BIBLE MODE ACTIVE:** 
       - The 'quote' MUST be a specific, accurately cited Bible verse.
       - Ensure the 'resonance' score reflects how perfectly the verse addresses the user's specific context.
       - Tone: Sacred, authoritative yet tender.` 
    : `\n**SECULAR WISDOM:** Use secular poetic or philosophical anchors.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      Input: "${occasion}"
      Mode: ${mode}
      
      Process: Apply Verbalized Sampling to create a profound moment of connection.
      Output strictly JSON.
    `,
    config: {
      systemInstruction: nexusPersona + archetypeInstruction + scriptureContext,
      responseMimeType: "application/json",
      responseSchema: whisperSchema,
      temperature: 0.7,
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate content");
  return JSON.parse(text);
};

export const generateWhisperImage = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt + " --aspect-ratio 9:16 --minimalist --cinematic --high-quality" }]
    }
  });

  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (part?.inlineData?.data) return `data:image/png;base64,${part.inlineData.data}`;
  throw new Error("Failed to generate image");
};

export const generateWhisperAudio = async (text: string, mode: GiftMode): Promise<string> => {
  let voiceName = mode === 'asmr' ? 'Puck' : mode === 'mantra' ? 'Kore' : 'Fenrir';
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: { parts: [{ text }] },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } }
    }
  });
  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (audioData) return audioData;
  throw new Error("Audio generation failed");
};
