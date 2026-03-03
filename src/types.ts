export type SubscriptionTier = "free" | "pro" | "elite";

export interface User {
  id: string;
  email: string;
  credits: number;
  tier: SubscriptionTier;
}

export interface Photo {
  id: string;
  url: string;
  name: string;
}

export type TransitionType = "fade" | "wipe" | "zoom" | "dissolve" | "slide" | "blur" | "glitch";
export type AspectRatio = "16:9" | "9:16";
export type Resolution = "720p" | "1080p";
export type VideoDuration = "short" | "medium" | "long";

export interface VideoProject {
  id: string;
  photos: Photo[];
  music?: string;
  style: GenerationStyle;
  transition: TransitionType;
  transitionDuration: number;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  duration: VideoDuration;
  cameraMovement?: string;
  colorGrading?: string;
  effect3D: boolean;
  faceEnhancement: boolean;
  userPrompt?: string;
  generationTime?: number;
  status: "idle" | "generating" | "completed" | "failed";
  videoUrl?: string;
  seoMetadata?: {
    title: string;
    description: string;
    hashtags: string[];
  };
}

export type GenerationStyle = "cinematic" | "realistic" | "minimal" | "energetic" | "3d-parallax" | "cartoon" | "anime";
