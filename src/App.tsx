import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider } from './context/AuthContext';
import { ReleaseProvider } from './context/ReleaseContext';
import { NotificationProvider } from './context/NotificationContext';
import { CampaignProvider } from './context/CampaignContext';
import { ThemeProvider } from './context/ThemeContext';
import { AIProvider } from './context/AIContext';
import { TutorialProvider } from './context/TutorialContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { useTheme } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Tutorial from './components/Tutorial';
import ModuleGuard from './components/ModuleGuard';
import CommandCenterHotkey from './components/CommandCenterHotkey';

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
// Legacy gen pages (UGCStudio, PromoPacks, ContentLab, ANR) are gone.
// All gen tools live in /studios now — these routes redirect.
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
const Roster = lazy(() => import('./pages/Roster'));
const SmartLink = lazy(() => import('./pages/SmartLink'));
const SmartLinks = lazy(() => import('./pages/SmartLinks'));
const Advances = lazy(() => import('./pages/Advances'));
const Drafts = lazy(() => import('./pages/Drafts'));
const Studios = lazy(() => import('./pages/Studios'));
const Studio = lazy(() => import('./pages/Studio'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Subscription = lazy(() => import('./pages/Subscription'));
const CommandCenter = lazy(() => import('./pages/CommandCenter'));
const Trending = lazy(() => import('./pages/Trending'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const MusicCharts = lazy(() => import('./pages/MusicCharts'));
const AudienceInsights = lazy(() => import('./pages/AudienceInsights'));

import WelcomeScreen from './components/layout/WelcomeScreen';
import PortalPage from './pages/PortalPage';

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
            <SubscriptionProvider>
            <WorkspaceProvider>
            <ReleaseProvider>
              <CampaignProvider>
                <BrowserRouter>
                  <Tutorial />
                  <CommandCenterHotkey />
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
              {/* Public-facing smart-link landing page. No auth — fans land here. */}
              <Route path="/link/:slug" element={<SmartLink />} />
              {/* Public pricing page — drives conversion from Landing CTA. */}
              <Route path="/pricing" element={<Pricing />} />
              {/* Hidden Command Center — page handles its own admin gate. */}
              <Route path="/command" element={<CommandCenter />} />
              {/* Admin portal — routes to Command Center */}
              <Route path="/admin" element={<CommandCenter />} />

              {/* Branded artist portals — /@slug sets role + redirects to dashboard */}
              <Route path="/@:slug" element={<PortalPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/campaigns" element={<ModuleGuard moduleId="campaigns"><Campaigns /></ModuleGuard>} />
                  <Route path="/campaigns/:id" element={<ModuleGuard moduleId="campaigns"><CampaignDetails /></ModuleGuard>} />
                  <Route path="/campaigns/new" element={<ModuleGuard moduleId="campaigns"><NewCampaign /></ModuleGuard>} />
                  <Route path="/influencers" element={<ModuleGuard moduleId="influencers"><Influencers /></ModuleGuard>} />
                  <Route path="/djs" element={<ModuleGuard moduleId="dj-packs"><DJs /></ModuleGuard>} />
                  <Route path="/reactions" element={<ModuleGuard moduleId="reactions"><Reactions /></ModuleGuard>} />
                  <Route path="/social" element={<ModuleGuard moduleId="social-ads"><SocialAds /></ModuleGuard>} />
                  <Route path="/splits" element={<ModuleGuard moduleId="splits"><Splits /></ModuleGuard>} />
                  {/* Legacy gen routes — redirect to consolidated /studios */}
                  <Route path="/anr"          element={<Navigate to="/studio/anr" replace />} />
                  <Route path="/promo"        element={<Navigate to="/studio/press" replace />} />
                  <Route path="/ugc"          element={<Navigate to="/studio/ugc" replace />} />
                  <Route path="/content-lab"  element={<Navigate to="/studios" replace />} />
                  <Route path="/pre-release" element={<ModuleGuard moduleId="pre-release"><PreReleaseList /></ModuleGuard>} />
                  <Route path="/pre-release/new" element={<ModuleGuard moduleId="pre-release"><PreReleaseCreate /></ModuleGuard>} />
                  <Route path="/pre-release/:id" element={<ModuleGuard moduleId="pre-release"><PreReleaseDetails /></ModuleGuard>} />
                  <Route path="/platforms" element={<ModuleGuard moduleId="platforms"><Platforms /></ModuleGuard>} />
                  <Route path="/compliance" element={<ModuleGuard moduleId="compliance"><Compliance /></ModuleGuard>} />
                  
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
                  
                  <Route path="/analytics" element={<ModuleGuard moduleId="analytics"><Analytics /></ModuleGuard>} />
                  <Route path="/analytics/:id" element={<ModuleGuard moduleId="analytics"><ReleaseAnalytics /></ModuleGuard>} />
                  <Route path="/earnings" element={<ModuleGuard moduleId="earnings"><Earnings /></ModuleGuard>} />
                  <Route path="/assets" element={<ModuleGuard moduleId="assets"><Assets /></ModuleGuard>} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/ai-providers" element={<ModuleGuard moduleId="ai-providers"><AIProviders /></ModuleGuard>} />
                  <Route path="/academy" element={<ModuleGuard moduleId="academy"><Academy /></ModuleGuard>} />
                  <Route path="/messages" element={<ModuleGuard moduleId="messages"><Messages /></ModuleGuard>} />
                  <Route path="/roster" element={<Roster />} />
                  <Route path="/links" element={<ModuleGuard moduleId="smart-links"><SmartLinks /></ModuleGuard>} />
                  <Route path="/advances" element={<ModuleGuard moduleId="advances"><Advances /></ModuleGuard>} />
                  <Route path="/drafts" element={<Drafts />} />
                  <Route path="/studios" element={<ModuleGuard moduleId="studios"><Studios /></ModuleGuard>} />
                  <Route path="/studio/:id" element={<ModuleGuard moduleId="studios"><Studio /></ModuleGuard>} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/trending" element={<Trending />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/analytics/charts" element={<ModuleGuard moduleId="analytics"><MusicCharts /></ModuleGuard>} />
                  <Route path="/analytics/audience" element={<ModuleGuard moduleId="analytics"><AudienceInsights /></ModuleGuard>} />
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
            </WorkspaceProvider>
            </SubscriptionProvider>
      </NotificationProvider>
     </AIProvider>
    </AuthProvider>
    </TutorialProvider>
   </ThemeProvider>
  );
}
