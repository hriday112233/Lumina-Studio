import React from "react";
import { X, Play, Download, Share2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HistoryModalProps {
  history: any[];
  onClose: () => void;
  onSelect: (project: any) => void;
  onDelete: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ history, onClose, onSelect, onDelete }) => {
  const [displayCount, setDisplayCount] = React.useState(6);
  const visibleHistory = history.slice(0, displayCount);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="p-8 border-b border-black/5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-sans font-bold tracking-tight">Your Creations</h2>
            <p className="text-sm text-black/40 font-medium">{history.length} projects found</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8">
          {history.length > 0 ? (
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                {visibleHistory.map((item) => (
                  <div key={item.id} className="group relative bg-[#f5f5f4] rounded-2xl overflow-hidden border border-black/5 hover:border-black/10 transition-all">
                    <div className="aspect-video bg-black relative overflow-hidden">
                      <video src={item.video_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        <button 
                          onClick={() => onSelect(item)}
                          className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          <Play className="w-6 h-6 fill-black" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm truncate">{item.title}</h3>
                        <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                      <button 
                        onClick={() => onDelete(item.id)}
                        className="p-2 text-black/20 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {displayCount < history.length && (
                <div className="flex justify-center">
                  <button 
                    onClick={() => setDisplayCount(prev => prev + 6)}
                    className="px-8 py-3 bg-black text-white rounded-full text-sm font-bold hover:scale-105 transition-transform"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
              <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-6">
                <Play className="w-8 h-8 text-black/20" />
              </div>
              <h3 className="text-lg font-bold mb-2">No projects yet</h3>
              <p className="text-sm text-black/40 max-w-xs">Start creating your first AI video to see it here.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
