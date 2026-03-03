import React from "react";
import { Sparkles, Zap, Shield, Globe, Camera, Layers } from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Cinematic Engine",
    description: "Our proprietary AI analyzes your photos to create perfect transitions and timing."
  },
  {
    icon: Layers,
    title: "3D Parallax Depth",
    description: "Turn static images into immersive 3D environments with realistic depth mapping."
  },
  {
    icon: Camera,
    title: "Photorealistic Faces",
    description: "Advanced facial reconstruction ensures every person looks lifelike and expressive."
  },
  {
    icon: Globe,
    title: "Auto-SEO Metadata",
    description: "Instantly generate titles, descriptions, and hashtags optimized for social media."
  },
  {
    icon: Zap,
    title: "Priority Rendering",
    description: "Elite users get access to our fastest GPU clusters for near-instant generation."
  },
  {
    icon: Shield,
    title: "Commercial Rights",
    description: "Full commercial license for all your creations on the Elite plan."
  }
];

export const Features: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-sans font-bold tracking-tight mb-4">Everything you need to create.</h2>
          <p className="text-black/60 max-w-2xl mx-auto">
            Lumina Studio combines state-of-the-art AI with a simple, intuitive interface to help you tell your story.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {FEATURES.map((feature, index) => (
            <div key={index} className="group">
              <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-all duration-300">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
              <p className="text-sm text-black/60 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
