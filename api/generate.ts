import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  // Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { action, input, mode, includeVerse } = req.body;
    const apiKey = process.env.GOOGLE_API_KEY;

    // 1. Initialize Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL || '', 
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // --- ACTION: DRAFT ---
    if (action === 'draft') {
      const systemPrompt = `You are NEXUS-7. Create a Sanctuary Whisper for: ${input}. Mode: ${mode}. Scripture: ${includeVerse}. Return ONLY JSON: { "message": "...", "quote": "...", "score": { "resonance": 95, "alchemy": 92, "harmony": 98, "overall": 95 } }`;
      
      // 2. DIRECT HTTP CALL (No Library = No Errors)
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }]
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google API Error: ${errorText}`);
      }

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      const cleanJson = JSON.parse(text.replace(/```json|```/g, '').trim());

      // 3. Save to Supabase
      const { data: giftData, error } = await supabase
        .from('gifts')
        .insert([{
          message: cleanJson.message,
          quote: cleanJson.quote,
          is_paid: false
        }])
        .select().single();

      if (error) throw new Error(`Supabase Error: ${error.message}`);

      return res.status(200).json({ success: true, content: cleanJson, giftId: giftData.id });
    }

    // --- ACTION: FINALIZE ---
    if (action === 'finalize') {
      return res.status(200).json({ success: true, audioBase64: "UklGRigAAAFXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=" });
    }

  } catch (error: any) {
    console.error("Vault Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}