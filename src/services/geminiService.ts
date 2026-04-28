import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const models = {
  flash: "gemini-3-flash-preview",
  pro: "gemini-3.1-pro-preview",
};

export interface AICampaign {
  title: string;
  plan: string;
  tasks: {
    day: number;
    title: string;
    description: string;
    content?: string;
  }[];
}

export interface AIInsights {
  recommendation: string;
  analysis: string;
  priority: 'low' | 'medium' | 'high';
}

export const generateMarketingCampaign = async (songDetails: string): Promise<AICampaign> => {
  const response = await ai.models.generateContent({
    model: models.flash,
    contents: `Generate a full 14-day marketing rollout plan for the following song/artist: ${songDetails}. 
    Include Instagram captions, TikTok hooks, and email newsletter ideas. 
    Format as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          plan: { type: Type.STRING },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                content: { type: Type.STRING },
              },
              required: ["day", "title", "description"],
            },
          },
        },
        required: ["title", "plan", "tasks"],
      },
    },
  });

  return JSON.parse(response.text);
};

export const getAIInsights = async (analyticsData: string): Promise<AIInsights> => {
  const response = await ai.models.generateContent({
    model: models.flash,
    contents: `Analyze this music analytics data and provide high-level strategic insights. 
    Tell me why streams might be dropping or which song to promote.
    Data: ${analyticsData}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendation: { type: Type.STRING },
          analysis: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["low", "medium", "high"] },
        },
        required: ["recommendation", "analysis", "priority"],
      },
    },
  });

  return JSON.parse(response.text);
};

export const analyzeSongPotential = async (lyricsOrDesc: string) => {
  const response = await ai.models.generateContent({
    model: models.flash,
    contents: `Analyze this song description/lyrics for TikTok potential, genre fit, and energy levels.
    Provide constructive feedback if the hook comes too late.
    Song details: ${lyricsOrDesc}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tiktokPotential: { type: Type.STRING },
          genreTags: { type: Type.ARRAY, items: { type: Type.STRING } },
          feedback: { type: Type.STRING },
          energyScore: { type: Type.NUMBER },
        },
      },
    },
  });

  return JSON.parse(response.text);
};

export const getRevenueStrategy = async (artistProfile: string) => {
  const response = await ai.models.generateContent({
    model: models.flash,
    contents: `Based on this artist profile: ${artistProfile}, suggest sync licensing opportunities, YouTube monetization strategies, and predict expected earnings per platform. 
    Recommend where to push ads for maximum ROI.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          syncOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
          monetizationTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          predictedEarnings: { 
            type: Type.OBJECT,
            properties: {
              spotify: { type: Type.STRING },
              apple: { type: Type.STRING },
              youtube: { type: Type.STRING },
            }
          },
          adStrategy: { type: Type.STRING },
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const generateContentIdeas = async (context: string) => {
  const response = await ai.models.generateContent({
    model: models.flash,
    contents: `Generate cover art concepts, music video themes, and 3 TikTok scripts for: ${context}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          coverArtConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
          musicVideoTheme: { type: Type.STRING },
          tiktokScripts: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                hook: { type: Type.STRING },
                body: { type: Type.STRING },
                cta: { type: Type.STRING }
              }
            } 
          },
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const runBrandAudit = async (bio: string) => {
  const response = await ai.models.generateContent({
    model: models.flash,
    contents: `Perform a brand audit and bio rewrite for: ${bio}. Suggest a visual identity direction.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          audit: { type: Type.STRING },
          newBio: { type: Type.STRING },
          visualDirection: { type: Type.STRING },
        }
      }
    }
  });
  return JSON.parse(response.text);
};
