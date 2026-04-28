import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import UnicornBackground from '../animations/UnicornBackground';
import LiquidBackground from './LiquidBackground';
import GrowMySongButton from './AIActionButton';
import AIAssistant from '../AIAssistant';

export default function Layout() {
  return (
    <div className="flex h-screen bg-[var(--bg-main)] overflow-hidden relative transition-colors duration-1000">
      <UnicornBackground />
      <LiquidBackground />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto custom-scrollbar p-10 relative">
          <Outlet />
        </main>
      </div>
      <GrowMySongButton />
      <AIAssistant />
    </div>
  );
}
