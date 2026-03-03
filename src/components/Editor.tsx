import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { 
  Upload, 
  Image as ImageIcon, 
  Music, 
  Sparkles, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Share2,
  Download,
  Crown,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { Photo, GenerationStyle, VideoProject, TransitionType, AspectRatio, Resolution, VideoDuration } from "@/src/types";

interface EditorProps {
  user: { email: string; credits: number; tier?: string } | null;
  onGenerate: (project: VideoProject) => Promise<void>;
  isGenerating: boolean;
  onViewHistory?: () => void;
}

export const Editor: React.FC<EditorProps> = ({ user, onGenerate, isGenerating, onViewHistory }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [style, setStyle] = useState<GenerationStyle>("cinematic");
  const [transition, setTransition] = useState<TransitionType>("fade");
  const [transitionDuration, setTransitionDuration] = useState<number>(1.5);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [resolution, setResolution] = useState<Resolution>("1080p");
  const [duration, setDuration] = useState<VideoDuration>("medium");
  const [cameraMovement, setCameraMovement] = useState<string>("none");
  const [colorGrading, setColorGrading] = useState<string>("none");
  const [effect3D, setEffect3D] = useState(false);
  const [faceEnhancement, setFaceEnhancement] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const [music, setMusic] = useState<string>("lo-fi-beats");
  const [project, setProject] = useState<VideoProject | null>(null);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const [isPublic, setIsPublic] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [generationTimer, setGenerationTimer] = useState(0);

  const isPro = user?.tier === "pro" || user?.tier === "elite";

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setGenerationTimer(0);
      interval = setInterval(() => {
        setGenerationTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  useEffect(() => {
    if (user?.email) {
      setIsHistoryLoading(true);
      fetch(`/api/projects/${user.email}`)
        .then(res => res.json())
        .then(data => setHistory(data))
        .catch(err => console.error("Failed to fetch history:", err))
        .finally(() => setIsHistoryLoading(false));
    }
  }, [user?.email]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPhotos = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 10,
    multiple: true
  } as any);

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleGenerate = async () => {
    if (!user || photos.length === 0) return;

    const newProject: VideoProject = {
      id: Math.random().toString(36).substring(7),
      photos,
      style,
      transition,
      transitionDuration,
      aspectRatio,
      resolution,
      duration,
      cameraMovement,
      colorGrading,
      effect3D,
      faceEnhancement,
      userPrompt,
      music,
      status: "idle"
    };

    setProject(newProject);
    setScreenshots([]);
    setIsPublic(false);
    await onGenerate(newProject);
  };

  const captureScreenshots = async () => {
    if (!project?.videoUrl) return;
    setIsCapturing(true);
    const video = document.createElement('video');
    video.src = project.videoUrl;
    video.crossOrigin = "anonymous";
    
    await new Promise((resolve) => {
      video.onloadedmetadata = resolve;
    });

    const duration = video.duration;
    const captureTimes = [0.1, 0.3, 0.5, 0.7, 0.9].map(p => p * duration);
    const captured: string[] = [];

    for (const time of captureTimes) {
      video.currentTime = time;
      await new Promise((resolve) => {
        video.onseeked = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        captured.push(canvas.toDataURL('image/jpeg', 0.8));
      }
    }

    setScreenshots(captured);
    setIsCapturing(false);
  };

  const handleTogglePublic = async () => {
    if (!project?.id || !user?.email) return;
    setIsSharing(true);
    try {
      const res = await fetch("/api/projects/toggle-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: user.email, 
          projectId: project.id, 
          isPublic: !isPublic 
        }),
      });
      if (res.ok) {
        setIsPublic(!isPublic);
      }
    } catch (err) {
      console.error("Toggle public failed:", err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleShare = async () => {
    if (!project?.videoUrl) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: project.seoMetadata?.title || "My AI Video",
          text: project.seoMetadata?.description || "Check out this video I created with Lumina Studio!",
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const handleDownload = () => {
    if (!project?.videoUrl) return;
    const a = document.createElement('a');
    a.href = project.videoUrl;
    a.download = `${project.seoMetadata?.title || 'lumina-video'}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!user?.email) return;
    try {
      const res = await fetch("/api/projects/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, projectId }),
      });
      if (res.ok) {
        setHistory(prev => prev.filter(p => p.id !== projectId));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleClearHistory = async () => {
    if (!user?.email) return;
    if (!confirm("Are you sure you want to clear all history?")) return;
    try {
      const res = await fetch("/api/projects/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      if (res.ok) {
        setHistory([]);
      }
    } catch (err) {
      console.error("Clear failed:", err);
    }
  };

  const handleMaxMode = () => {
    if (!isPro) {
      alert("Max Mode requires a Pro or Elite subscription.");
      return;
    }
    setStyle("realistic");
    setTransition("dissolve");
    setTransitionDuration(2.0);
    setAspectRatio("16:9");
    setResolution("720p"); // High quality model requires 720p
    setDuration("long");
    setCameraMovement("zoom-in");
    setColorGrading("vibrant");
    setEffect3D(true);
    if (user?.tier === "elite") {
      setFaceEnhancement(true);
    }
  };

  const handleReset = () => {
    setPhotos([]);
    setStyle("cinematic");
    setTransition("fade");
    setTransitionDuration(1.5);
    setAspectRatio("16:9");
    setResolution("1080p");
    setDuration("medium");
    setCameraMovement("none");
    setColorGrading("none");
    setEffect3D(false);
    setFaceEnhancement(false);
    setUserPrompt("");
    setMusic("lo-fi-beats");
    setProject(null);
    setScreenshots([]);
    setIsPublic(false);
  };

  return (
    <section className="py-24 bg-white" id="editor">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Controls Panel */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-sans font-bold tracking-tight mb-2">Create Your Video</h2>
                <p className="text-black/60 text-sm">Upload up to 10 photos and let AI do the magic.</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleMaxMode}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-indigo-700 transition-colors flex items-center gap-1 shadow-md"
                >
                  <Sparkles className="w-3 h-3" />
                  Max Mode
                </button>
                <button 
                  onClick={handleReset}
                  className="px-3 py-1.5 bg-black/5 text-black/60 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-black/10 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-black/40">1. Upload Photos</label>
              <div 
                {...getRootProps()} 
                className={cn(
                  "border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3",
                  isDragActive ? "border-black bg-black/5" : "border-black/10 hover:border-black/20"
                )}
              >
                <input {...getInputProps()} />
                <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-black/40" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Click or drag photos here</p>
                  <p className="text-xs text-black/40 mt-1">PNG, JPG up to 10MB (Add up to 3 for best results)</p>
                </div>
              </div>

              {/* Photo Grid */}
              <div className="grid grid-cols-5 gap-2">
                {photos.map(photo => (
                  <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button 
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Style Selection */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-black/40">2. Select Style</label>
              <div className="grid grid-cols-2 gap-3">
                {(["cinematic", "realistic", "minimal", "energetic", "3d-parallax", "cartoon", "anime"] as GenerationStyle[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={cn(
                      "px-3 py-4 rounded-xl border text-xs font-semibold capitalize transition-all relative",
                      style === s ? "border-black bg-black text-white shadow-lg" : "border-black/10 hover:border-black/20",
                      (s === "3d-parallax" || s === "anime" || s === "realistic") && !isPro && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={(s === "3d-parallax" || s === "anime" || s === "realistic") && !isPro}
                  >
                    {s.replace("-", " ")}
                    {(s === "3d-parallax" || s === "anime" || s === "realistic") && !isPro && <Crown className="w-3 h-3 absolute top-1 right-1 text-amber-500" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Depth Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-black/40">3. 3D Depth Effect</label>
                {!isPro && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">PRO</span>}
              </div>
              <button
                onClick={() => isPro && setEffect3D(!effect3D)}
                className={cn(
                  "w-full p-4 rounded-xl border flex items-center justify-between transition-all",
                  effect3D ? "border-black bg-black/5" : "border-black/10",
                  !isPro && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className={cn("w-5 h-5", effect3D ? "text-amber-500" : "text-black/20")} />
                  <span className="text-sm font-medium">Real Live Video Effect</span>
                </div>
                <div className={cn(
                  "w-10 h-5 rounded-full transition-colors relative",
                  effect3D ? "bg-black" : "bg-black/10"
                )}>
                  <div className={cn(
                    "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                    effect3D ? "left-6" : "left-1"
                  )} />
                </div>
              </button>
            </div>

            {/* Face Enhancement Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-black/40">4. Realistic Face Repair</label>
                {user?.tier !== "elite" && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">ELITE</span>}
              </div>
              <button
                onClick={() => user?.tier === "elite" && setFaceEnhancement(!faceEnhancement)}
                className={cn(
                  "w-full p-4 rounded-xl border flex items-center justify-between transition-all",
                  faceEnhancement ? "border-black bg-black/5" : "border-black/10",
                  user?.tier !== "elite" && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3">
                  <User className={cn("w-5 h-5", faceEnhancement ? "text-indigo-500" : "text-black/20")} />
                  <span className="text-sm font-medium">Ultra-HD Face Restoration</span>
                </div>
                <div className={cn(
                  "w-10 h-5 rounded-full transition-colors relative",
                  faceEnhancement ? "bg-black" : "bg-black/10"
                )}>
                  <div className={cn(
                    "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                    faceEnhancement ? "left-6" : "left-1"
                  )} />
                </div>
              </button>
            </div>

            {/* Transition Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-black/40">5. Transitions</label>
                {!isPro && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">PRO</span>}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(["fade", "wipe", "zoom", "dissolve", "slide", "blur", "glitch"] as TransitionType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => isPro && setTransition(t)}
                    className={cn(
                      "py-2 rounded-lg border text-[10px] font-bold uppercase tracking-tighter transition-all relative",
                      transition === t ? "border-black bg-black text-white shadow-md" : "border-black/10 hover:border-black/20",
                      (t === "glitch" || t === "blur") && !isPro && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={(t === "glitch" || t === "blur") && !isPro}
                  >
                    {t}
                    {(t === "glitch" || t === "blur") && !isPro && <Crown className="w-2 h-2 absolute top-0.5 right-0.5 text-amber-500" />}
                  </button>
                ))}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-black/40 uppercase">Duration: {transitionDuration}s</label>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="3.0" 
                  step="0.1" 
                  value={transitionDuration}
                  onChange={(e) => setTransitionDuration(parseFloat(e.target.value))}
                  className="w-full accent-black"
                />
              </div>
            </div>

            {/* Video Settings */}
            <div className="space-y-6 pt-6 border-t border-black/5">
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-black/40">6. Video Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["16:9", "9:16"] as AspectRatio[]).map(ar => (
                    <button
                      key={ar}
                      onClick={() => setAspectRatio(ar)}
                      className={cn(
                        "py-2 rounded-lg border text-[10px] font-bold transition-all",
                        aspectRatio === ar ? "border-black bg-black text-white" : "border-black/10 hover:border-black/20",
                        (photos.length > 2 || faceEnhancement) && ar === "9:16" && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={(photos.length > 2 || faceEnhancement) && ar === "9:16"}
                    >
                      {ar}
                    </button>
                  ))}
                </div>
                {(photos.length > 2 || faceEnhancement) && (
                  <p className="text-[9px] text-amber-600 font-bold uppercase">Note: 3+ photos & Face Repair require 16:9 format</p>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {(["720p", "1080p"] as Resolution[]).map(res => (
                    <button
                      key={res}
                      onClick={() => setResolution(res)}
                      className={cn(
                        "py-2 rounded-lg border text-[10px] font-bold transition-all relative",
                        resolution === res ? "border-black bg-black text-white" : "border-black/10 hover:border-black/20",
                        (res === "1080p" && !isPro) || ((photos.length > 2 || faceEnhancement) && res === "1080p") ? "opacity-50 cursor-not-allowed" : ""
                      )}
                      disabled={(res === "1080p" && !isPro) || ((photos.length > 2 || faceEnhancement) && res === "1080p")}
                    >
                      {res}
                      {res === "1080p" && !isPro && <Crown className="w-2 h-2 absolute top-0.5 right-0.5 text-amber-500" />}
                    </button>
                  ))}
                </div>
                {(photos.length > 2 || faceEnhancement) && (
                  <p className="text-[9px] text-amber-600 font-bold uppercase">Note: 3+ photos & Face Repair require 720p resolution</p>
                )}
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-black/40">7. Scene Pace</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["short", "medium", "long"] as VideoDuration[]).map(d => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={cn(
                        "py-2 rounded-lg border text-[10px] font-bold capitalize transition-all",
                        duration === d ? "border-black bg-black text-white" : "border-black/10 hover:border-black/20"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-black/40">8. Camera & Color</label>
                <div className="grid grid-cols-2 gap-3">
                  <select 
                    value={cameraMovement}
                    onChange={(e) => setCameraMovement(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-black/10 text-[10px] font-bold uppercase tracking-widest focus:outline-none"
                  >
                    <option value="none">No Movement</option>
                    <option value="zoom-in">Zoom In</option>
                    <option value="zoom-out">Zoom Out</option>
                    <option value="pan-left">Pan Left</option>
                    <option value="pan-right">Pan Right</option>
                    <option value="tilt-up">Tilt Up</option>
                    <option value="tilt-down">Tilt Down</option>
                  </select>
                  <select 
                    value={colorGrading}
                    onChange={(e) => setColorGrading(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-black/10 text-[10px] font-bold uppercase tracking-widest focus:outline-none"
                  >
                    <option value="none">Natural Color</option>
                    <option value="vintage">Vintage Film</option>
                    <option value="black-white">B&W Classic</option>
                    <option value="vibrant">Vibrant Pop</option>
                    <option value="muted">Muted Tones</option>
                    <option value="warm">Warm Glow</option>
                    <option value="cool">Cool Breeze</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Music Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-black/40" />
                <label className="text-xs font-bold uppercase tracking-widest text-black/40">9. Choose Music</label>
              </div>
              <select 
                value={music}
                onChange={(e) => setMusic(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-black/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5"
              >
                <option value="lo-fi-beats">Lo-fi Beats (Chill)</option>
                <option value="cinematic-orchestra">Cinematic Orchestra (Epic)</option>
                {!isPro && <option disabled>Premium Tracks (Pro Only)</option>}
                {isPro && (
                  <>
                    <option value="upbeat-pop">Upbeat Pop (Energetic)</option>
                    <option value="minimal-ambient">Minimal Ambient (Calm)</option>
                    <option value="epic-trailer">Epic Trailer (Powerful)</option>
                    <option value="hip-hop-groove">Hip Hop Groove (Cool)</option>
                    <option value="synthwave">Synthwave (Retro)</option>
                    <option value="jazz-funk">Jazz Funk (Groovy)</option>
                  </>
                )}
              </select>
            </div>

            {/* Custom Thoughts / Prompt */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-black/40">10. Your Thoughts / Prompt</label>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Add specific instructions, thoughts, or story ideas for the AI..."
                className="w-full px-4 py-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 resize-none h-24"
              />
            </div>

            {/* Generate Button */}
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || photos.length === 0}
              className={cn(
                "w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all",
                isGenerating || photos.length === 0 
                  ? "bg-black/10 text-black/40 cursor-not-allowed" 
                  : "bg-black text-white hover:scale-[1.02] shadow-xl"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Video (1 Credit)
                </>
              )}
            </button>

            {/* History Section */}
            <div className="pt-12 border-t border-black/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-black/40">Recent Creations</h3>
                {history.length > 0 && (
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={onViewHistory}
                      className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors"
                    >
                      View All
                    </button>
                    <button 
                      onClick={handleClearHistory}
                      className="text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
              {isHistoryLoading ? (
                <div className="flex items-center gap-3 text-black/20">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-widest">Loading history...</span>
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-4">
                  {history.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-black/5 transition-colors cursor-pointer group relative">
                      <div 
                        className="flex items-center gap-4 flex-grow min-w-0"
                        onClick={() => {
                          setProject({
                            id: item.id,
                            photos: [], // We don't store photos in DB yet
                            videoUrl: item.video_url,
                            style: item.style,
                            transition: item.transition || 'fade',
                            transitionDuration: item.transition_duration || 1.5,
                            aspectRatio: item.aspect_ratio || '16:9',
                            resolution: item.resolution || '1080p',
                            duration: item.duration || 'medium',
                            cameraMovement: item.camera_movement || 'none',
                            colorGrading: item.color_grading || 'none',
                            effect3D: false,
                            faceEnhancement: item.face_enhancement === 1,
                            status: "completed",
                            seoMetadata: {
                              title: item.title,
                              description: item.description,
                              hashtags: JSON.parse(item.hashtags)
                            }
                          });
                          setScreenshots([]);
                        }}
                      >
                        <div className="w-16 h-10 bg-black rounded-lg overflow-hidden flex-shrink-0">
                          <video src={item.video_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">{item.title}</p>
                          <p className="text-[10px] text-black/40 uppercase font-bold">{new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(item.id);
                        }}
                        className="p-2 text-black/20 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-black/20 font-bold uppercase tracking-widest">No creations yet.</p>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-8">
            <div className="bg-black rounded-3xl aspect-video relative overflow-hidden flex items-center justify-center">
              {isGenerating ? (
                <div className="text-center space-y-6 max-w-md px-12">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-white/10 border-t-white rounded-full animate-spin mx-auto" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white text-xl font-bold">Crafting Your Masterpiece</h3>
                    <div className="flex items-center justify-center gap-2 text-amber-500 font-mono text-lg">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{Math.floor(generationTimer / 60)}:{(generationTimer % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <p className="text-white/40 text-sm leading-relaxed">
                      Our AI is analyzing your photos to create cinematic transitions and perfect timing. This usually takes 30-60 seconds.
                    </p>
                  </div>
                </div>
              ) : project?.videoUrl ? (
                <video 
                  src={project.videoUrl} 
                  controls 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                    <ImageIcon className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-white/40 text-sm">Your video preview will appear here</p>
                </div>
              )}
            </div>

            {/* Post-Generation Details */}
            <AnimatePresence>
              {project?.videoUrl && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 grid md:grid-cols-2 gap-8"
                >
                  {/* SEO Metadata */}
                  <div className="p-6 rounded-2xl border border-black/5 bg-black/[0.02]">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <h4 className="font-bold text-sm uppercase tracking-wider">Auto-Generated SEO</h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-black/40 uppercase">Recommended Title</label>
                        <p className="text-sm font-medium mt-1">{project.seoMetadata?.title || "Untitled Cinematic Masterpiece"}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-black/40 uppercase">Description</label>
                        <p className="text-xs text-black/60 mt-1 leading-relaxed">
                          {project.seoMetadata?.description || "A beautiful collection of moments captured and brought to life with AI."}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.seoMetadata?.hashtags.map(tag => (
                          <span key={tag} className="px-2 py-1 rounded-md bg-black/5 text-[10px] font-bold text-black/60">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      {project.generationTime && (
                        <div className="pt-2 flex items-center gap-2 text-[10px] font-bold text-black/30 uppercase tracking-widest">
                          <Loader2 className="w-3 h-3" />
                          Generated in {project.generationTime}s
                        </div>
                      )}
                    </div>
                  </div>

                    {/* Actions */}
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl border border-black/5 bg-black/[0.01] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                            isPublic ? "bg-emerald-500 text-white" : "bg-black/5 text-black/40"
                          )}>
                            <Share2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest">Showcase</p>
                            <p className="text-[10px] text-black/40">Make this creation public</p>
                          </div>
                        </div>
                        <button
                          onClick={handleTogglePublic}
                          disabled={isSharing}
                          className={cn(
                            "w-10 h-5 rounded-full transition-colors relative",
                            isPublic ? "bg-emerald-500" : "bg-black/10"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                            isPublic ? "left-6" : "left-1"
                          )} />
                        </button>
                      </div>

                      <button 
                        onClick={handleDownload}
                        className="w-full py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black/90"
                      >
                        <Download className="w-5 h-5" />
                        Download 1080p
                      </button>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={handleShare}
                        className="py-3 border border-black/10 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black/5"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                      <button 
                        onClick={() => { setProject(null); setScreenshots([]); }}
                        className="py-3 border border-black/10 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black/5"
                      >
                        <Play className="w-4 h-4" />
                        New Video
                      </button>
                    </div>
                  </div>

                  {/* Screenshots Section */}
                  <div className="md:col-span-2 space-y-6 pt-8 border-t border-black/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-amber-500" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">5 Desirable Screenshots</h4>
                      </div>
                      <button 
                        onClick={captureScreenshots}
                        disabled={isCapturing}
                        className={cn(
                          "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                          isCapturing ? "bg-black/10 text-black/40" : "bg-black text-white hover:scale-105"
                        )}
                      >
                        {isCapturing ? "Capturing..." : screenshots.length > 0 ? "Re-Capture Best Moments" : "Capture 5 Best Moments"}
                      </button>
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                      {screenshots.length > 0 ? (
                        screenshots.map((src, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="aspect-video rounded-xl overflow-hidden border border-black/5 shadow-sm group relative"
                          >
                            <img src={src} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <a 
                              href={src} 
                              download={`screenshot-${i+1}.jpg`}
                              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Download className="w-4 h-4 text-white" />
                            </a>
                          </motion.div>
                        ))
                      ) : (
                        Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="aspect-video rounded-xl border-2 border-dashed border-black/5 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-black/10" />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
