import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[200] flex items-center gap-3 px-6 py-4 bg-black text-white rounded-2xl shadow-2xl border border-white/10 min-w-[300px]"
    >
      {type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
      {type === "error" && <AlertCircle className="w-5 h-5 text-rose-500" />}
      <p className="text-sm font-medium flex-grow">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
        <X className="w-4 h-4 text-white/40" />
      </button>
    </motion.div>
  );
};
