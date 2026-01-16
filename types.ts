
export interface VitruvianoScore {
  resonance: number; // 0-100
  alchemy: number;   // 0-100
  harmony: number;   // 0-100
  overall: number;   // Calculated average
}

export interface WhisperGift {
  id: string;
  recipientName?: string;
  occasion: string;
  message: string;
  quote: string;
  imagePrompt: string;
  audioBase64?: string;
  imageUrl?: string;
  score?: VitruvianoScore;
}

export interface GenerationStep {
  label: string;
  status: 'pending' | 'active' | 'complete';
}
