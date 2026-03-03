import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Play, Sparkles } from "lucide-react";

interface HeroProps {
  onStart?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 text-black/60 text-[10px] font-bold uppercase tracking-widest mb-12">
            <Sparkles className="w-3 h-3 text-amber-500" />
            The Future of Cinematic Storytelling
          </div>
          
          <h1 className="text-8xl md:text-9xl lg:text-[10rem] font-serif font-bold italic leading-[0.82] tracking-tighter mb-12 text-balance">
            Photos <br />
            <span className="text-black/10">into</span> <br />
            Cinema.
          </h1>
          
          <p className="text-xl text-black/40 max-w-md mb-12 leading-relaxed font-medium">
            Transform your static moments into high-end cinematic stories with our advanced AI video engine.
          </p>
          
          <div className="flex flex-wrap gap-6">
            <button 
              onClick={onStart}
              className="px-10 py-5 bg-black text-white rounded-full font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-2xl active:scale-95"
            >
              Start Creating
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-10 py-5 border border-black/10 rounded-full font-bold flex items-center gap-3 hover:bg-black/5 transition-all active:scale-95">
              <Play className="w-4 h-4" />
              Watch Demo
            </button>
          </div>

          <div className="mt-24 pt-12 border-t border-black/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/20 mb-8">Trusted by industry leaders</p>
            <div className="flex flex-wrap gap-12 opacity-30 grayscale">
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" className="h-5" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="h-5" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" className="h-5" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg" alt="Slack" className="h-5" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
          className="relative aspect-[4/5] rounded-[40px] overflow-hidden premium-shadow group"
        >
          <img 
            src="https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=2000" 
            alt="Cinematic Video Preview"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute bottom-12 left-12 right-12 p-8 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[32px] shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xl">
                  <Play className="w-5 h-5 text-black fill-black ml-1" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">Summer in Amalfi</div>
                  <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Cinematic • 1080p • 60fps</div>
                </div>
              </div>
              <div className="text-white/80 font-mono text-sm tracking-widest">00:15</div>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[50vw] h-screen bg-black/[0.02] -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-amber-500/[0.03] rounded-full blur-[120px] -z-10" />
    </section>
  );
};
