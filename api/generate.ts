import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: any, res: any) {
  // 1. Setup Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { input, message, mode, includeVerse } = req.body;

    // 2. Initialize Clients
    const supabase = createClient(
      process.env.SUPABASE_URL || '', 
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
    
    // --- THE FIX: USING GEMINI 3 FLASH PREVIEW ---
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // --- LOGIC: DRAFT ---
    if (input) {
      const systemPrompt = `You are NEXUS-7. Create a Sanctuary Whisper for: ${input}. Mode: ${mode}. Scripture: ${includeVerse}. Return ONLY JSON: { "message": "...", "quote": "...", "score": { "resonance": 95, "alchemy": 92, "harmony": 98, "overall": 95 } }`;
      
      const result = await model.generateContent(systemPrompt);
      const responseText = result.response.text();
      const cleanJson = JSON.parse(responseText.replace(/```json|```/g, '').trim());

      const { data, error } = await supabase
        .from('gifts')
        .insert([{
          message: cleanJson.message,
          quote: cleanJson.quote,
          is_paid: false
        }])
        .select().single();

      if (error) throw new Error(error.message);

      return res.status(200).json({ success: true, content: cleanJson, giftId: data.id });
    }

    // --- LOGIC: FINALIZE ---
    if (message) {
      return res.status(200).json({ success: true, audioBase64: "UklGRigAAAFXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=" });
    }

    return res.status(400).json({ success: false, error: "Invalid request parameters" });

  } catch (error: any) {
    console.error("Vault Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}