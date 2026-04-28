import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Campaign {
  id: string;
  title: string;
  status: 'ACTIVE' | 'SCHEDULED' | 'COMPLETED';
  progress: number;
  goal: string;
  budget: string;
  spent: string;
  channels: string[];
  startDate: string;
  metrics: {
    engagement: string;
    reach: string;
  };
}

interface CampaignContextType {
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, 'id'>) => Promise<void>;
  updateCampaign: (id: string, data: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  isLoading: boolean;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

const SEED_CAMPAIGNS: Campaign[] = [];

export const CampaignProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('dropkast_campaign_data');
    if (stored) {
      setCampaigns(JSON.parse(stored));
    } else {
      setCampaigns([]);
    }
    setIsLoading(false);
  }, []);

  const save = (data: Campaign[]) => {
    localStorage.setItem('dropkast_campaign_data', JSON.stringify(data));
  };

  const addCampaign = async (data: Omit<Campaign, 'id'>) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newCampaign: Campaign = {
      ...data,
      id: `C-${Math.floor(Math.random() * 900) + 100}`
    };

    const updated = [newCampaign, ...campaigns];
    setCampaigns(updated);
    save(updated);
    setIsLoading(false);
  };

  const updateCampaign = (id: string, data: Partial<Campaign>) => {
    const updated = campaigns.map(c => c.id === id ? { ...c, ...data } : c);
    setCampaigns(updated);
    save(updated);
  };

  const deleteCampaign = (id: string) => {
    const updated = campaigns.filter(c => c.id !== id);
    setCampaigns(updated);
    save(updated);
  };

  return (
    <CampaignContext.Provider value={{ campaigns, addCampaign, updateCampaign, deleteCampaign, isLoading }}>
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaigns must be used within a CampaignProvider');
  }
  return context;
};
