// services/geminiService.ts

export async function generateWhisperContent(input: string, mode: string, includeVerse: boolean) {
  // This tells the app: "Go talk to the Vercel Vault at /api/generate"
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'draft', input, mode, includeVerse })
  });
  const data = await response.json();
  return data.success ? data.content : null;
}

export async function generateWhisperAudio(message: string, mode: string) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'finalize', message, mode })
  });
  const data = await response.json();
  return data.success ? data.audioBase64 : null;
}

export const generateWhisperImage = async (p: string) => "https://images.unsplash.com/photo-1506126613408-eca07ce68773";