import React from "react";
import { User, Coins, LogOut, History } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface HeaderProps {
  user: { email: string; credits: number; tier: string } | null;
  onPricingClick: () => void;
  onHistoryClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onPricingClick, onHistoryClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rounded-full" />
          </div>
          <span className="font-sans font-bold text-xl tracking-tight">LUMINA</span>
          {user?.tier && user.tier !== 'free' && (
            <span className="ml-2 px-2 py-0.5 bg-amber-500 text-black text-[10px] font-bold rounded uppercase">
              {user.tier}
            </span>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-black/60 hover:text-black transition-colors">Features</button>
          <button onClick={() => document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-black/60 hover:text-black transition-colors">Showcase</button>
          <button onClick={onPricingClick} className="text-sm font-medium text-black/60 hover:text-black transition-colors cursor-pointer">Pricing</button>
          <button onClick={onHistoryClick} className="text-sm font-medium text-black/60 hover:text-black transition-colors cursor-pointer flex items-center gap-2">
            <History className="w-4 h-4" />
            History
          </button>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={onPricingClick}
                className="flex items-center gap-2 px-3 py-1.5 bg-black/5 rounded-full hover:bg-black/10 transition-colors"
              >
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold">{user.credits} Credits</span>
              </button>
              <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                <User className="w-4 h-4 text-black/60" />
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="p-2 text-black/40 hover:text-black transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-black/90 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
