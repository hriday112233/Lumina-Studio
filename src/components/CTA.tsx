import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

export const CTA: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <section className="py-24 bg-black text-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/60 text-[10px] font-bold uppercase tracking-widest mb-8">
          <Sparkles className="w-3 h-3" />
          Ready to transform your photos?
        </div>
        <h2 className="text-5xl md:text-7xl font-sans font-bold tracking-tighter mb-8 max-w-3xl mx-auto leading-[0.9]">
          START CREATING <br />
          <span className="text-white/20">CINEMATIC</span> STORIES.
        </h2>
        <p className="text-xl text-white/40 max-w-md mx-auto mb-12 leading-relaxed">
          Join thousands of creators and turn your memories into professional videos in seconds.
        </p>
        <button 
          onClick={onStart}
          className="px-10 py-5 bg-white text-black rounded-full font-bold flex items-center gap-2 mx-auto hover:scale-105 transition-transform"
        >
          Get Started for Free
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Decorative background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] -z-0" />
    </section>
  );
};
