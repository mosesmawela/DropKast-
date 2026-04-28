import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CampaignPlan, aiService } from '../services/aiService';

interface AIContextType {
  lastPlan: CampaignPlan | null;
  isLoading: boolean;
  error: string | null;
  autoSendDJs: boolean;
  autoGenerateContent: boolean;
  autoOptimizeAds: boolean;
  generateCampaign: (title: string, artist: string, goals: string) => Promise<CampaignPlan | null>;
  clearError: () => void;
  toggleAutoSendDJs: () => void;
  toggleAutoGenerateContent: () => void;
  toggleAutoOptimizeAds: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [lastPlan, setLastPlan] = useState<CampaignPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Automation Toggles
  const [autoSendDJs, setAutoSendDJs] = useState(false);
  const [autoGenerateContent, setAutoGenerateContent] = useState(true);
  const [autoOptimizeAds, setAutoOptimizeAds] = useState(false);

  const toggleAutoSendDJs = () => setAutoSendDJs(prev => !prev);
  const toggleAutoGenerateContent = () => setAutoGenerateContent(prev => !prev);
  const toggleAutoOptimizeAds = () => setAutoOptimizeAds(prev => !prev);

  const generateCampaign = async (title: string, artist: string, goals: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const plan = await aiService.generateCampaign(title, artist, goals);
      setLastPlan(plan);
      return plan;
    } catch (err: any) {
      setError(err.message || "Failed to generate campaign plan");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AIContext.Provider value={{ 
      lastPlan, 
      isLoading, 
      error, 
      autoSendDJs,
      autoGenerateContent,
      autoOptimizeAds,
      generateCampaign, 
      clearError,
      toggleAutoSendDJs,
      toggleAutoGenerateContent,
      toggleAutoOptimizeAds
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}
