import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 1. Initialize Clients
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { prompt, mode, includeScripture } = req.body;

    // 2. Generate Content
    const systemPrompt = `You are NEXUS-7. Create a Sanctuary Whisper for: ${prompt}. Mode: ${mode}. Scripture: ${includeScripture}. Return ONLY JSON: { "message": "...", "quote": "..." }`;
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    const cleanJson = JSON.parse(responseText.replace(/```json|```/g, '').trim());

    // 3. Save to Supabase
    const { data, error } = await supabase
      .from('whispers')
      .insert([{
        text_content: cleanJson.message,
        mode: mode,
        is_unlocked: false
      }])
      .select().single();

    if (error) throw new Error(`Database Error: ${error.message}`);

    return res.status(200).json({ success: true, content: cleanJson, whisperId: data.id });

  } catch (error) {
    console.error("CRASH_LOG:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}