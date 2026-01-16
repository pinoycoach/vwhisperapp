// api/generate.ts
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { prompt, mode, includeScripture } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 1. THE PERSONA ENGINE
    let instructions = "You are a comforting presence. ";
    if (mode === 'spirit') instructions += "Speak as a timeless voice of ancient wisdom. Use biblical archetypes of peace.";
    if (mode === 'lover') instructions += "Speak as an intimate, caring partner in a quiet room. You cherish the listener.";
    if (mode === 'mentor') instructions += "Speak as a Stoic guide. Provide strength and clarity.";

    const aiPrompt = `${instructions} User needs: "${prompt}". ${includeScripture ? 'Include a relevant Bible verse.' : ''} 
    Return ONLY JSON: { "message": "2 sentences", "quote": "1 short quote", "resonance": 98, "alchemy": 95, "harmony": 97 }`;

    const result = await model.generateContent(aiPrompt);
    const cleanJson = JSON.parse(result.response.text().replace(/```json|```/g, ''));

    // 2. SAVE TO SUPABASE
    const { data } = await supabase.from('gifts').insert([{
      message: cleanJson.message,
      quote: cleanJson.quote,
      mode: mode,
      is_paid: false
    }]).select().single();

    // 3. SUCCESS
    return res.status(200).json({ success: true, content: cleanJson, whisperId: data.id });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}