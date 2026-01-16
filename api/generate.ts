// api/generate.ts
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export default async function handler(req, res) {
  // Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { action, input, mode, includeVerse, message } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    if (action === 'draft') {
      const prompt = `Return ONLY JSON: { "message": "2 sentences", "quote": "1 quote", "imagePrompt": "desc", "score": { "resonance": 95, "alchemy": 92, "harmony": 98, "overall": 95 } } for input: ${input}`;
      const result = await model.generateContent(prompt);
      const cleanJson = JSON.parse(result.response.text().replace(/```json|```/g, ''));

      // Save to Supabase
      const { data } = await supabase.from('gifts').insert([{ message: cleanJson.message, is_paid: false }]).select().single();
      return res.status(200).json({ success: true, content: cleanJson, giftId: data.id });
    }

    if (action === 'finalize') {
      // Logic for voice generation goes here
      return res.status(200).json({ success: true, audioBase64: "..." });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}