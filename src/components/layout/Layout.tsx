import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import UnicornBackground from '../animations/UnicornBackground';
import LiquidBackground from './LiquidBackground';
import GrowMySongButton from './AIActionButton';
import AIAssistant from '../AIAssistant';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar drawer on navigation (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
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
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-10 relative">
          <Outlet />
        </main>
      </div>

      <GrowMySongButton />
      <AIAssistant />
    </div>
  );
}
