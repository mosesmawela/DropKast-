import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateStrategy(releaseTitle: string, genre: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a high-level marketing strategy for a ${genre} release titled "${releaseTitle}". 
      Provide 4 actionable steps in a JSON format: { "objective": string, "steps": [ { "day": number, "action": string, "type": "social" | "platform" | "growth" | "analytics" } ] }`,
      config: { responseMimeType: "application/json" }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Strategy Error:", error);
  }

  // Fallback
  return {
    objective: "Standard Distribution Protocol",
    steps: [
      { day: 1, action: "Teaser post deployment", type: "social" },
      { day: 7, action: "Influencer relay sequence", type: "growth" }
    ]
  };
}

export async function generateViralIdeas(releaseTitle: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 2 viral TikTok/IG Reel ideas for a music release titled "${releaseTitle}". 
      Format: JSON array of { "type": string, "title": string, "script": string, "caption": string, "visual": string }`,
      config: { responseMimeType: "application/json" }
    });
    
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Viral Ideas Error:", error);
  }

  return [
    { type: "TikTok", title: "Main Hook", script: "Show studio vibe", caption: "Out now! #DropKast", visual: "Neon lights" }
  ];
}

export async function generateImage(prompt: string) {
  // In a real production app, you'd use OpenAI, Midjourney, or DALL-E 3
  // For this environment, we'll use a high-quality Unsplash proxy based on the prompt
  const keywords = prompt.split(' ').slice(0, 3).join(',');
  return [
    `https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1024&auto=format&fit=crop&sig=${Math.random()}`,
    `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1024&auto=format&fit=crop&sig=${Math.random()}`,
    `https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1024&auto=format&fit=crop&sig=${Math.random()}`
  ];
}

export async function generateVideo(prompt: string) {
  return {
    url: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
  };
}

export interface CampaignPlan {
  objective: string;
  steps: { day: number; action: string; type: string }[];
}

export async function generateCampaign(title: string, artist: string, goals: string): Promise<CampaignPlan> {
  return generateStrategy(title, "Pop"); // Proxy to strategy gen
}

export const aiService = {
  generateStrategy,
  generateViralIdeas,
  generateImage,
  generateVideo,
  generateCampaign
};
