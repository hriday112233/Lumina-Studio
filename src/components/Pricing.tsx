import React, { useState } from "react";
import { Check, Zap, Sparkles, Crown, HelpCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { BillingHelpModal } from "./BillingHelpModal";

interface PricingProps {
  onSelectPackage: (packageId: string) => void;
  onClose: () => void;
}

const PACKAGES = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    credits: 5,
    icon: Zap,
    features: ["Basic Editing", "Limited Music", "Standard Export", "Watermark Included"],
    recommended: false
  },
  {
    id: "pro",
    name: "Pro Studio",
    price: "$19/mo",
    credits: 50,
    icon: Sparkles,
    features: ["Premium Templates", "Advanced Transitions", "3D Parallax Effects", "Larger Music Catalog", "Higher Resolution", "No Watermark"],
    recommended: true
  },
  {
    id: "elite",
    name: "Elite",
    price: "$49/mo",
    credits: 200,
    icon: Crown,
    features: ["Priority Rendering", "Exclusive Effects Packs", "Commercial License", "24/7 Priority Support", "Custom Branding", "All Pro Features"],
    recommended: false
  }
];

export const Pricing: React.FC<PricingProps> = ({ onSelectPackage, onClose }) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-5xl bg-white rounded-[32px] overflow-hidden shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors"
        >
          <Check className="w-6 h-6 rotate-45" />
        </button>

        <div className="p-12 text-center">
          <h2 className="text-4xl font-sans font-bold tracking-tight mb-4">Choose Your Plan</h2>
          <p className="text-black/60 max-w-md mx-auto">
            Get more credits to create professional videos. Each generation costs 1 credit.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 p-12 pt-0">
          {PACKAGES.map((pkg) => (
            <div 
              key={pkg.id}
              className={cn(
                "relative p-8 rounded-3xl border transition-all flex flex-col",
                pkg.recommended 
                  ? "border-black bg-black text-white shadow-2xl scale-105 z-10" 
                  : "border-black/5 bg-black/[0.02] hover:border-black/10"
              )}
            >
              {pkg.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-black text-[10px] font-bold uppercase tracking-widest rounded-full">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  pkg.recommended ? "bg-white/10" : "bg-black/5"
                )}>
                  <pkg.icon className={cn("w-5 h-5", pkg.recommended ? "text-white" : "text-black")} />
                </div>
                <span className="font-bold text-lg">{pkg.name}</span>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{pkg.price}</span>
                  <span className={cn("text-sm", pkg.recommended ? "text-white/60" : "text-black/40")}>/one-time</span>
                </div>
                <div className={cn("text-sm font-medium mt-2", pkg.recommended ? "text-amber-400" : "text-black/60")}>
                  {pkg.credits} Credits Included
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className={cn("w-4 h-4", pkg.recommended ? "text-amber-400" : "text-black/40")} />
                    <span className={pkg.recommended ? "text-white/80" : "text-black/60"}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => onSelectPackage(pkg.id)}
                className={cn(
                  "w-full py-4 rounded-xl font-bold transition-all",
                  pkg.recommended 
                    ? "bg-white text-black hover:bg-white/90" 
                    : "bg-black text-white hover:bg-black/90"
                )}
              >
                Get {pkg.credits} Credits
              </button>
            </div>
          ))}
        </div>

        <div className="p-8 bg-black/5 text-center flex flex-col items-center gap-4">
          <div className="text-[10px] text-black/40 uppercase tracking-widest font-bold">
            Secure payment powered by Stripe • 100% Satisfaction Guaranteed
          </div>
          <button 
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-2 text-xs font-bold text-black/60 hover:text-black transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            Have an existing plan? See billing help model
          </button>
        </div>

        {isHelpOpen && <BillingHelpModal onClose={() => setIsHelpOpen(false)} />}
      </div>
    </div>
  );
};
