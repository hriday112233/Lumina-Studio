import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Editor } from "./components/Editor";
import { Pricing } from "./components/Pricing";
import { FAQ } from "./components/FAQ";
import { Features } from "./components/Features";
import { Testimonials } from "./components/Testimonials";
import { Showcase } from "./components/Showcase";
import { CTA } from "./components/CTA";
import { Toast, ToastType } from "./components/Toast";
import { ScrollToTop } from "./components/ScrollToTop";
import { Contact } from "./components/Contact";
import { HistoryModal } from "./components/HistoryModal";
import { User, VideoProject } from "./types";
import { generateSEOMetadata, startVideoGeneration, pollVideoOperation, fetchVideoBlob } from "./services/gemini";
import { Loader2, Key } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type });
  };

  const userEmail = "demo@example.com"; // In a real app, this would come from auth

  const fetchHistory = async (email: string) => {
    try {
      const res = await fetch(`/api/projects/${email}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        // Check API Key
        const keySelected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(keySelected);

        // Fetch User
        const res = await fetch(`/api/user/${userEmail}`);
        const data = await res.json();
        setUser(data);
        fetchHistory(data.email);
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleOpenKeySelector = async () => {
    await window.aistudio.openSelectKey();
    setHasApiKey(true);
  };

  const handleGenerate = async (project: VideoProject) => {
    if (!user) return;
    if (!hasApiKey) {
      await handleOpenKeySelector();
    }

    setIsGenerating(true);
    try {
      // 1. Deduct credits
      const deductRes = await fetch("/api/deduct-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, amount: 1 }),
      });

      if (!deductRes.ok) {
        setIsPricingOpen(true);
        throw new Error("Insufficient credits");
      }

      const { remainingCredits } = await deductRes.json();
      setUser({ ...user, credits: remainingCredits });

      // 2. Convert photos to base64 for reference
      const blobToBase64 = async (blobUrl: string): Promise<string> => {
        const response = await fetch(blobUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      };

      // Convert up to 3 photos for reference (Veo limit for referenceImages)
      const base64Photos = await Promise.all(
        project.photos.slice(0, 3).map(p => blobToBase64(p.url))
      );

      // 3. Generate SEO Metadata in parallel
      const seoPromise = generateSEOMetadata(
        project.photos.map(p => p.url),
        project.style
      );

      // 4. Start Video Generation
      const startTime = Date.now();
      const prompt = `A professional ${project.style} video with ${project.music} mood, showcasing these photos with cinematic transitions.`;
      const operation = await startVideoGeneration(
        prompt, 
        base64Photos, 
        project.effect3D, 
        project.faceEnhancement,
        project.style,
        project.transition,
        project.transitionDuration,
        project.aspectRatio,
        project.resolution,
        project.duration,
        project.cameraMovement || "none",
        project.colorGrading || "none",
        project.userPrompt || ""
      );
      
      const completedOp = await pollVideoOperation(operation);
      const endTime = Date.now();
      const generationTime = Math.round((endTime - startTime) / 1000);
      const downloadUrl = completedOp.response?.generatedVideos?.[0]?.video?.uri;

      if (downloadUrl) {
        const videoBlob = await fetchVideoBlob(downloadUrl);
        const videoUrl = URL.createObjectURL(videoBlob);
        const seoMetadata = await seoPromise;

        project.videoUrl = videoUrl;
        project.seoMetadata = seoMetadata;
        project.generationTime = generationTime;
        project.status = "completed";

        // 5. Save to history
        await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, project }),
        });
        
        // Refresh history
        fetchHistory(user.email);

        showToast("Video generated successfully!", "success");
      } else {
        throw new Error("No video URL returned from generation");
      }
    } catch (error: any) {
      console.error("Generation failed:", error);
      project.status = "failed";
      
      const errorMessage = error.message || "";
      if (errorMessage.includes("403") || errorMessage.includes("permission") || errorMessage.includes("not found")) {
        showToast("API Key Permission Error. Please select a paid project key.", "error");
        await handleOpenKeySelector();
      } else {
        showToast(errorMessage || "Failed to generate video", "error");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPackage = async (packageId: string) => {
    try {
      // In a real app, this would be handled by Stripe webhooks
      // For this demo, we'll update the tier directly after "payment"
      const res = await fetch("/api/update-tier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, tier: packageId }),
      });
      
      if (res.ok) {
        setUser(prev => prev ? { ...prev, tier: packageId as any } : null);
        setIsPricingOpen(false);
        showToast(`Upgraded to ${packageId.toUpperCase()} successfully!`, "success");
      }

      // Also trigger Stripe session (optional for demo, but kept for completeness)
      const stripeRes = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, priceId: packageId }),
      });
      const { url } = await stripeRes.json();
      // if (url) window.location.href = url; // Commented out to stay in demo
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-black/5 border-t-black rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold uppercase tracking-widest text-black/20">Initializing Lumina Studio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-black selection:text-white">
      <Header 
        user={user} 
        onPricingClick={() => setIsPricingOpen(true)} 
        onHistoryClick={() => setIsHistoryOpen(true)}
      />
      
      <main>
        <Hero onStart={() => document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth' })} />
        
        <div id="editor" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="mb-16 space-y-4">
            <h2 className="text-5xl font-serif font-bold italic tracking-tight">The Studio</h2>
            <p className="text-black/40 max-w-xl text-lg leading-relaxed">
              Upload your photos and let our AI transform them into professional cinematic stories.
            </p>
          </div>
          <Editor 
            user={user} 
            isGenerating={isGenerating} 
            onGenerate={handleGenerate} 
            onViewHistory={() => setIsHistoryOpen(true)}
          />
        </div>
        
        <Features />
        <Showcase />
        <Testimonials />
        
        <CTA onStart={() => document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth' })} />
        <Contact />
        <FAQ />
      </main>

      {/* API Key Modal if not selected */}
      <AnimatePresence>
        {!hasApiKey && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full glass-card p-12 rounded-[40px] text-center space-y-8 premium-shadow"
            >
              <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mx-auto shadow-2xl rotate-3">
                <Key className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-serif font-bold italic">Unlock Creative Power</h1>
                <p className="text-black/40 text-sm leading-relaxed">
                  To start generating cinematic videos with Gemini Veo, please connect your Google Cloud API key.
                </p>
              </div>
              <button 
                onClick={handleOpenKeySelector}
                className="w-full py-4 bg-black text-white rounded-full font-bold hover:scale-[1.02] transition-all shadow-xl"
              >
                Connect API Key
              </button>
              <p className="text-[10px] text-black/20 font-bold uppercase tracking-widest">
                Secure connection • Direct API access
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isPricingOpen && (
        <Pricing 
          onClose={() => setIsPricingOpen(false)} 
          onSelectPackage={handleSelectPackage} 
        />
      )}

      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>

      <ScrollToTop />

      <AnimatePresence>
        {isHistoryOpen && (
          <HistoryModal 
            history={history}
            onClose={() => setIsHistoryOpen(false)}
            onSelect={(item) => {
              // This logic would ideally be in a shared state or passed to Editor
              // For now, we'll just close the modal. In a real app, we'd load the project.
              setIsHistoryOpen(false);
            }}
            onDelete={async (id) => {
              const res = await fetch("/api/projects/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user?.email, projectId: id }),
              });
              if (res.ok) {
                setHistory(prev => prev.filter(p => p.id !== id));
                showToast("Project deleted", "success");
              }
            }}
          />
        )}
      </AnimatePresence>

      <footer className="py-24 border-t border-black/5 bg-[#f5f5f4]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                  <div className="w-4 h-4 border border-white rounded-full" />
                </div>
                <span className="font-bold text-xl tracking-tight">LUMINA</span>
              </div>
              <p className="text-black/40 text-sm max-w-xs leading-relaxed">
                The world's most advanced AI video studio for creators and professionals.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-black/40">Product</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#" className="hover:text-black transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Showcase</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-black/40">Stay Updated</h4>
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); showToast("Subscribed!", "success"); }}>
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="bg-white border border-black/5 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 flex-grow"
                />
                <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold">Join</button>
              </form>
            </div>
          </div>

          <div className="pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex gap-8 text-sm text-black/40 font-medium">
              <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-black transition-colors">Cookie Policy</a>
            </div>
            <p className="text-xs text-black/20 font-mono">© 2026 LUMINA STUDIO. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
