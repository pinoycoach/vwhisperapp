import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: any, res: any) {
  // 1. Set Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle pre-flight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { prompt, mode, includeScripture } = req.body;

    // 2. Initialize Supabase
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Initialize Google AI (Gemini 2.0 Flash)
    const apiKey = process.env.GOOGLE_API_KEY || '';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 4. The Persona Logic
    const systemPrompt = `
      You are NEXUS-7, an emotional intelligence engine. 
      Task: Create a Sanctuary Whisper for: ${prompt}. 
      Mode: ${mode}. 
      Include Scripture: ${includeScripture}. 
      Return ONLY a clean JSON object:
      {
        "message": "2 sentences of profound comfort",
        "quote": "a short anchor quote or Bible verse"
      }
    `;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    
    // Clean and parse the AI response
    const cleanJson = JSON.parse(responseText.replace(/```json|```/g, '').trim());

    // 5. Save to Supabase
    const { data, error } = await supabase
      .from('whispers')
      .insert([{
        text_content: cleanJson.message,
        mode: mode,
        is_unlocked: false
      }])
      .select().single();

    if (error) throw new Error(`Database Error: ${error.message}`);

    // 6. Return Success
    return res.status(200).json({ 
      success: true, 
      content: cleanJson, 
      whisperId: data.id 
    });

  } catch (error: any) {
    console.error("Vault Error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "An internal error occurred" 
    });
  }
}