import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Music, Shield, Award } from 'lucide-react';

const footerColumns = [
  {
    title: 'Services',
    links: [
      { label: 'How It Works', path: '/how-it-works' },
      { label: 'Digital Distribution', path: '/releases/new' },
      { label: 'Marketing Methodology', path: '/campaigns' },
      { label: 'Rights Management & Publishing', path: '/publishing' },
      { label: 'Business Intelligence', path: '/analytics' },
    ],
  },
  {
    title: 'About Us',
    links: [
      { label: 'Blog', path: '#' },
      { label: 'Press Releases', path: '#' },
      { label: 'Distribution Partners', path: '#' },
      { label: 'Playlist Covers', path: '#' },
      { label: 'Latest Releases', path: '/releases' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms & Conditions', path: '/terms' },
      { label: 'Privacy Policy', path: '/privacy' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'FAQ', path: '#' },
      { label: 'Support Hub', path: '#' },
    ],
  },
];

export default function PlatformFooter() {
  return (
    <footer className="bg-[#1A1C23] text-white py-12 px-8 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-2 space-y-6">
            <Link to="/dashboard" className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-primary" />
                <span className="text-lg font-black tracking-tight text-white leading-none font-mono italic uppercase">
                  DROPKAST
                </span>
              </div>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] italic">
                MUSIC IS POWER — AMPLIFIER IT
              </span>
            </Link>
            <p className="text-xs text-white/30 leading-relaxed max-w-xs">
              Enterprise music distribution platform powering independent artists and labels worldwide.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="beam w-10 h-10 border border-white/10 flex items-center justify-center transition-all text-white/40">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="beam w-10 h-10 border border-white/10 flex items-center justify-center transition-all text-white/40">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="beam w-10 h-10 border border-white/10 flex items-center justify-center transition-all text-white/40">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {footerColumns.map((col) => (
            <div key={col.title} className="space-y-4">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-xs text-white/40 transition-colors font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Compliance Badges */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 px-4 py-2 border border-white/10 bg-white/5">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest italic font-mono">
                YouTube Certification Token
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border border-white/10 bg-white/5">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest italic font-mono">
                Apple Music Preferred Plus Distributor 2026
              </span>
            </div>
          </div>
          <p className="text-[9px] text-white/20 font-mono italic">
            &copy; {new Date().getFullYear()} DropKast. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
