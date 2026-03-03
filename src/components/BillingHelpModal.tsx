import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Info, ShieldCheck, Zap, Image as ImageIcon, BrainCircuit, MessageSquare } from "lucide-react";

interface BillingHelpModalProps {
  onClose: () => void;
}

export const BillingHelpModal: React.FC<BillingHelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden p-8"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Billing & Plan Help</h3>
            <p className="text-xs text-black/40 font-bold uppercase tracking-widest">Current Plan Limitations</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/5 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold">100% Real Face Guarantee</p>
              <p className="text-xs text-black/60 mt-1">With our attached photo result technology, we ensure the same 100% real face consistency across all video frames.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-black/5 space-y-2">
              <div className="flex items-center gap-2 text-black/40">
                <Zap className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Model</span>
              </div>
              <p className="text-sm font-bold">Core Model</p>
              <p className="text-[10px] text-black/40 leading-tight">Optimized for speed and cinematic quality.</p>
            </div>

            <div className="p-4 rounded-2xl border border-black/5 space-y-2">
              <div className="flex items-center gap-2 text-black/40">
                <MessageSquare className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Usage</span>
              </div>
              <p className="text-sm font-bold">Limited Messages</p>
              <p className="text-[10px] text-black/40 leading-tight">Capped uploads and message history per day.</p>
            </div>

            <div className="p-4 rounded-2xl border border-black/5 space-y-2">
              <div className="flex items-center gap-2 text-black/40">
                <ImageIcon className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Creation</span>
              </div>
              <p className="text-sm font-bold">Limited Images</p>
              <p className="text-[10px] text-black/40 leading-tight">Restricted image generation per session.</p>
            </div>

            <div className="p-4 rounded-2xl border border-black/5 space-y-2">
              <div className="flex items-center gap-2 text-black/40">
                <BrainCircuit className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Memory</span>
              </div>
              <p className="text-sm font-bold">Limited Memory</p>
              <p className="text-[10px] text-black/40 leading-tight">Short-term project state retention.</p>
            </div>

            <div className="p-4 rounded-2xl border border-black/5 space-y-2 col-span-2">
              <div className="flex items-center gap-2 text-black/40">
                <ImageIcon className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Bonus</span>
              </div>
              <p className="text-sm font-bold">5 Desirable Screenshots</p>
              <p className="text-[10px] text-black/40 leading-tight">Extract 5 beautiful, eye-catching screenshots from every video clip automatically or manually.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-black/5">
          <p className="text-xs text-black/40 text-center">
            Need more? Upgrade to <span className="text-black font-bold">Pro Studio</span> for unlimited access and priority rendering.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
