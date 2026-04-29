import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider } from './context/AuthContext';
import { ReleaseProvider } from './context/ReleaseContext';
import { NotificationProvider } from './context/NotificationContext';
import { CampaignProvider } from './context/CampaignContext';
import { ThemeProvider } from './context/ThemeContext';
import { AIProvider } from './context/AIContext';
import { TutorialProvider } from './context/TutorialContext';
import { useTheme } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Tutorial from './components/Tutorial';

// Lazy load pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Releases = lazy(() => import('./pages/Releases'));
const NewRelease = lazy(() => import('./pages/NewRelease'));
const Analytics = lazy(() => import('./pages/Analytics'));
const ReleaseAnalytics = lazy(() => import('./pages/ReleaseAnalytics'));
const Earnings = lazy(() => import('./pages/Earnings'));
const Settings = lazy(() => import('./pages/Settings'));
const Assets = lazy(() => import('./pages/Assets'));
const Platforms = lazy(() => import('./pages/Platforms'));
const Compliance = lazy(() => import('./pages/Compliance'));
const History = lazy(() => import('./pages/History'));
const Processing = lazy(() => import('./pages/Processing'));
const ReleaseStatus = lazy(() => import('./pages/ReleaseStatus'));

// Core Pages
const Campaigns = lazy(() => import('./pages/Campaigns'));
const CampaignDetails = lazy(() => import('./pages/CampaignDetails'));
const NewCampaign = lazy(() => import('./pages/NewCampaign'));
const Influencers = lazy(() => import('./pages/Influencers'));
const DJs = lazy(() => import('./pages/DJs'));
const Reactions = lazy(() => import('./pages/Reactions'));
const SocialAds = lazy(() => import('./pages/SocialAds'));
const Splits = lazy(() => import('./pages/Splits'));
const ANR = lazy(() => import('./pages/ANR'));
const ContentLab = lazy(() => import('./pages/ContentLab'));
const PromoPacks = lazy(() => import('./pages/PromoPacks'));
const UGCStudio = lazy(() => import('./pages/UGCStudio'));
const PreReleaseList = lazy(() => import('./pages/PreReleaseList'));
const PreReleaseCreate = lazy(() => import('./pages/PreReleaseCreate'));
const PreReleaseDetails = lazy(() => import('./pages/PreReleaseDetails'));

// Influencer Portal
const InfluencerCampaigns = lazy(() => import('./pages/creator/influencer/Campaigns'));
const InfluencerEarnings = lazy(() => import('./pages/creator/influencer/Earnings'));
const InfluencerSocials = lazy(() => import('./pages/creator/influencer/Socials'));

// DJ Portal
const DJPacks = lazy(() => import('./pages/creator/dj/Packs'));
const DJFeedback = lazy(() => import('./pages/creator/dj/Feedback'));

const Layout = lazy(() => import('./components/layout/Layout'));
const Profile = lazy(() => import('./pages/Profile'));
const AIProviders = lazy(() => import('./pages/AIProviders'));
const Academy = lazy(() => import('./pages/Academy'));
const Messages = lazy(() => import('./pages/Messages'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));

import WelcomeScreen from './components/layout/WelcomeScreen';

export default function App() {
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('dropkast_welcome_seen');
  });

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    localStorage.setItem('dropkast_welcome_seen', 'true');
  };

  return (
    <ThemeProvider>
      <TutorialProvider>
      <AuthProvider>
        <AIProvider>
          <NotificationProvider>
            <ReleaseProvider>
              <CampaignProvider>
                <BrowserRouter>
                  <Tutorial />
                  <AnimatePresence mode="wait">
                    {showWelcome ? (
                      <WelcomeScreen key="welcome" onComplete={handleWelcomeComplete} />
                    ) : (
                      <motion.div
                        key="main"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="h-full w-full"
                      >
                        <Suspense fallback={
                          <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white gap-8 font-sans">
              <div className="flex flex-col items-center gap-4">
                <div className="text-[10px] font-black text-primary italic tracking-[0.5em] uppercase">Loading DropKast</div>
                <div className="w-64 h-[2px] bg-white/5 relative overflow-hidden">
                  <motion.div 
                    initial={{ left: '-100%' }}
                    animate={{ left: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute top-0 bottom-0 w-1/2 bg-primary shadow-[0_0_15px_rgba(255,77,0,0.5)]"
                  />
                </div>
              </div>
              <div className="barcode-sim opacity-20" />
            </div>
          }>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/campaigns" element={<Campaigns />} />
                  <Route path="/campaigns/:id" element={<CampaignDetails />} />
                  <Route path="/campaigns/new" element={<NewCampaign />} />
                  <Route path="/influencers" element={<Influencers />} />
                  <Route path="/djs" element={<DJs />} />
                  <Route path="/reactions" element={<Reactions />} />
                  <Route path="/social" element={<SocialAds />} />
                  <Route path="/splits" element={<Splits />} />
                  <Route path="/anr" element={<ANR />} />
                  <Route path="/content-lab" element={<ContentLab />} />
                  <Route path="/promo" element={<PromoPacks />} />
                  <Route path="/ugc" element={<UGCStudio />} />
                  <Route path="/pre-release" element={<PreReleaseList />} />
                  <Route path="/pre-release/new" element={<PreReleaseCreate />} />
                  <Route path="/pre-release/:id" element={<PreReleaseDetails />} />
                  <Route path="/platforms" element={<Platforms />} />
                  <Route path="/compliance" element={<Compliance />} />
                  
                  {/* Influencer Portal Routes */}
                  <Route path="/influencer/missions" element={<InfluencerCampaigns />} />
                  <Route path="/influencer/earnings" element={<InfluencerEarnings />} />
                  <Route path="/influencer/socials" element={<InfluencerSocials />} />

                  {/* DJ Portal Routes */}
                  <Route path="/dj/packs" element={<DJPacks />} />
                  <Route path="/dj/feedback" element={<DJFeedback />} />
                  
                  <Route path="/releases" element={<Releases />} />
                  <Route path="/releases/new" element={<NewRelease />} />
                  <Route path="/releases/history" element={<History />} />
                  <Route path="/releases/:id/processing" element={<Processing />} />
                  <Route path="/releases/:id/status" element={<ReleaseStatus />} />
                  
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/analytics/:id" element={<ReleaseAnalytics />} />
                  <Route path="/earnings" element={<Earnings />} />
                  <Route path="/assets" element={<Assets />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/ai-providers" element={<AIProviders />} />
                  <Route path="/academy" element={<Academy />} />
                  <Route path="/messages" element={<Messages />} />
                </Route>
              </Route>

              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
         </motion.div>
        )}
       </AnimatePresence>
      </BrowserRouter>
          </CampaignProvider>
        </ReleaseProvider>
      </NotificationProvider>
     </AIProvider>
    </AuthProvider>
    </TutorialProvider>
   </ThemeProvider>
  );
}
