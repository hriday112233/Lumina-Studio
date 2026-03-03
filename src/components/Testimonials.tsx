import React from "react";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sarah Jenkins",
    role: "Content Creator",
    text: "Lumina Studio has completely changed how I share my travel photos. The 3D effect is mind-blowing!",
    avatar: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    name: "Michael Chen",
    role: "Digital Marketer",
    text: "The auto-SEO feature saves me hours of work. I just generate the video and copy the tags. Brilliant.",
    avatar: "https://i.pravatar.cc/150?u=michael"
  },
  {
    name: "Elena Rodriguez",
    role: "Photographer",
    text: "As a professional, I was skeptical of AI, but the facial realism here is actually impressive.",
    avatar: "https://i.pravatar.cc/150?u=elena"
  }
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-white border-t border-black/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="flex flex-col gap-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                ))}
              </div>
              <p className="text-lg font-medium leading-relaxed italic">"{t.text}"</p>
              <div className="flex items-center gap-4 mt-auto">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full grayscale" referrerPolicy="no-referrer" />
                <div>
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-black/40 font-medium uppercase tracking-wider">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
