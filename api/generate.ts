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
    // 2. Check if Vercel can see your keys
    const config = {
      hasGoogleKey: !!process.env.GOOGLE_API_KEY,
      hasSupaUrl: !!process.env.SUPABASE_URL,
      hasSupaKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    };

    // 3. Initialize the AI with the correct library name
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 4. A simple test to see if the AI responds
    const result = await model.generateContent("Say the word 'Online'");
    const responseText = result.response.text();

    // 5. Return a success message we can see in the browser
    return res.status(200).json({
      success: true,
      status: "The Engine is Running",
      keysDetected: config,
      aiResponse: responseText
    });

  } catch (error: any) {
    // If it crashes, send the reason to the browser instead of a generic 500
    return res.status(200).json({
      success: false,
      error: "CRASH_REPORT",
      message: error.message
    });
  }
}