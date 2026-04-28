import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import UnicornBackground from '../animations/UnicornBackground';
import LiquidBackground from './LiquidBackground';
import GrowMySongModal from './AIActionButton';
import AIAssistant from '../AIAssistant';
import { useTutorial } from '../../context/TutorialContext';
import { GrowSongProvider } from '../../context/GrowSongContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { maybeAutoStart } = useTutorial();

  // Close sidebar drawer on navigation (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Auto-start tutorial on first dashboard load (after layout mounts so
  // the data-tour targets are present in the DOM).
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      maybeAutoStart();
    }
  }, [location.pathname, maybeAutoStart]);

  return (
    <GrowSongProvider>
      <div className="flex h-screen bg-[var(--bg-main)] overflow-hidden relative transition-colors duration-1000">
        <UnicornBackground />
        <LiquidBackground />

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <button
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          />
        )}

        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 md:p-6 lg:p-8 relative">
            <Outlet />
          </main>
        </div>

        <GrowMySongModal />
        <AIAssistant />
      </div>
    </GrowSongProvider>
  );
}
