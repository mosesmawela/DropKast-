import { Search, LogOut, Terminal, Users, Disc, Radio, Menu, User as UserIcon, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import ThemeToggle from '../ThemeToggle';
import NotificationsDropdown from '../NotificationsDropdown';
import { AnimatePresence, motion } from 'motion/react';

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchItems = [
      { id: '1', name: 'Alex Wave', type: 'influencer', path: '/influencers' },
      { id: '2', name: 'Sasha Sun', type: 'influencer', path: '/influencers' },
      { id: '3', name: 'DJ Matrix', type: 'dj', path: '/djs' },
      { id: '4', name: 'ReactCentral', type: 'reaction', path: '/reactions' },
    ];

    const filtered = searchItems.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));
    setResults(filtered);
  }, [query]);

  return (
    <header className="h-14 sm:h-16 bg-[var(--card-bg)] backdrop-blur-xl border-b border-[var(--border-main)] px-4 sm:px-6 md:px-8 flex items-center justify-between gap-3 z-10 technical-grid">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 -ml-2 text-white/60 hover:text-white transition-colors shrink-0"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0 max-w-xl" ref={searchRef}>
        <div className="relative group flex items-center gap-2 sm:gap-4">
          <Terminal className="w-3 h-3 text-primary animate-pulse hidden sm:block" />
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="SEARCH..."
              className="w-full bg-transparent border-none py-2.5 pl-6 sm:pl-8 pr-2 text-[9px] font-black tracking-widest focus:ring-0 transition-all text-white placeholder:text-white/10 uppercase font-mono"
            />

            {/* Global Search Results */}
            <AnimatePresence>
              {isFocused && query.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-4 bg-black border border-white/10 shadow-2xl backdrop-blur-2xl z-50 overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] italic font-mono">
                      Creative_Relay_Results
                    </span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {results.length > 0 ? (
                      results.map((res) => (
                        <button
                          key={`${res.type}-${res.id}`}
                          onClick={() => {
                            navigate(res.path);
                            setQuery('');
                            setIsFocused(false);
                          }}
                          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-primary/10 transition-all group text-left border-b border-white/5 last:border-0"
                        >
                          {res.type === 'influencer' && <Users className="w-3.5 h-3.5 text-primary" />}
                          {res.type === 'dj' && <Radio className="w-3.5 h-3.5 text-primary" />}
                          {res.type === 'reaction' && <Disc className="w-3.5 h-3.5 text-primary" />}
                          <div>
                            <p className="text-[10px] font-black text-white uppercase italic tracking-tighter">{res.name}</p>
                            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-0.5">
                              {res.type}_NODE
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-6 py-8 text-center bg-white/[0.01]">
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest italic">
                          Zero matches in current sector
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="px-6 py-3 bg-primary/5 text-right">
                    <span className="text-[7px] font-black text-primary uppercase tracking-widest italic">
                      Protocol: DISCOVERY_v2.1
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 md:gap-12 h-full shrink-0">
        <div className="hidden xl:flex items-center gap-8 h-full border-x border-white/5 px-8 opacity-40">
          <div className="flex flex-col gap-1">
            <span className="text-[7px] font-black uppercase text-white tracking-widest leading-none">CORE_S_UPTIME</span>
            <span className="text-[9px] font-black text-primary leading-none">99.98%</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[7px] font-black uppercase text-white tracking-widest leading-none">P_IDENTITY</span>
            <span className="text-[9px] font-black text-primary leading-none uppercase">
              {user?.id?.slice(0, 8) || 'S-ARCHIVE'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5 md:gap-8">
          <Link
            to="/academy"
            data-tour="navbar-academy"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-primary/30 hover:border-primary text-primary text-[10px] font-mono font-black uppercase italic tracking-widest transition-all"
            title="DropKast Academy"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Academy</span>
          </Link>
          <Link
            to="/academy"
            data-tour="navbar-academy-mobile"
            className="sm:hidden p-2 text-primary hover:text-primary/70 transition-colors"
            title="Academy"
          >
            <GraduationCap className="w-4 h-4" />
          </Link>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <NotificationsDropdown />

          <div className="flex items-center gap-3 sm:gap-5 group sm:border-l sm:border-white/5 sm:pl-4 md:pl-6 h-10">
            <Link
              to="/profile"
              data-tour="navbar-profile"
              className="text-right hidden md:block hover:text-primary transition-colors"
              title="View profile"
            >
              <div className="text-[10px] font-black text-white italic leading-none tracking-widest uppercase group-hover:text-primary transition-colors">
                {user?.artistName || 'GENERIC_USER'}
              </div>
              <div className="text-[8px] text-white/20 font-black uppercase tracking-[0.2em] mt-1 italic">
                View Profile
              </div>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/profile"
                className="w-8 h-8 manifest-card corner-marker p-0.5 border-white/20 shrink-0 hover:border-primary transition-colors"
                title="Profile"
              >
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=SoundWave`}
                  alt="Profile"
                  className="w-full h-full object-cover grayscale contrast-125"
                />
              </Link>
              <Link
                to="/profile"
                className="md:hidden p-1.5 border border-white/5 hover:border-primary hover:text-primary text-white/40 transition-all"
                title="Profile"
              >
                <UserIcon className="w-3 h-3" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 border border-white/5 hover:border-primary hover:text-primary text-white/40 transition-all"
                title="Sign out"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
