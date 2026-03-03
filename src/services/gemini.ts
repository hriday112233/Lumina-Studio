import { GoogleGenAI, Modality, VideoGenerationReferenceType } from "@google/genai";

const getApiKey = () => {
  return process.env.API_KEY || process.env.GEMINI_API_KEY || '';
};

const getAI = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key not found. Please select an API key using the key selector.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSEOMetadata = async (photos: string[], style: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Generate SEO metadata (title, description, and 5 hashtags) for a professional video made from these photos. Style: ${style}. Return as JSON.`,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
};

export const startVideoGeneration = async (
  prompt: string, 
  imagesBase64: string[] = [], 
  effect3D: boolean = false, 
  faceEnhancement: boolean = false,
  style: string = "cinematic",
  transition: string = "fade",
  transitionDuration: number = 1.5,
  aspectRatio: string = "16:9",
  resolution: string = "1080p",
  duration: string = "medium",
  cameraMovement: string = "none",
  colorGrading: string = "none",
  userPrompt: string = ""
) => {
  const ai = getAI();
  
  let basePrompt = prompt;

  if (style === "cartoon") {
    basePrompt += ". Convert the scene into a high-quality 3D animation style, like a modern Pixar or Disney movie. Vibrant colors, smooth textures, and expressive characters.";
  } else if (style === "anime") {
    basePrompt += ". Convert the scene into a beautiful high-end 2D anime style, like Studio Ghibli or Makoto Shinkai films. Detailed backgrounds and artistic lighting.";
  } else if (style === "realistic") {
    basePrompt += ". Focus on extreme photorealism. The video must be indistinguishable from real-life 8K footage. Prioritize hyper-realistic human features: sharp eye reflections, visible skin pores, natural subsurface scattering on skin, and realistic hair movement. Every facial detail must be perfectly rendered.";
  } else {
    basePrompt += ". Focus on creating highly photorealistic human faces with natural expressions, skin textures, and high-fidelity facial details. The video should look like real-life footage.";
  }

  if (faceEnhancement && style !== "cartoon" && style !== "anime") {
    basePrompt += " Apply maximum real face enhancement and restoration: ensure perfect skin clarity without looking artificial, sharp eye details, realistic hair textures, and lifelike facial micro-expressions. Repair any facial artifacts and ensure anatomical perfection.";
  }

  // Add transition instructions
  basePrompt += ` Use professional ${transition} transitions between photo clips, with a smooth duration of ${transitionDuration} seconds.`;

  // Add duration instructions
  if (duration === "short") {
    basePrompt += " Create a fast-paced, high-energy short video clip.";
  } else if (duration === "long") {
    basePrompt += " Create an extended, slow-paced cinematic video with lingering shots.";
  }

  // Add camera movement
  if (cameraMovement !== "none") {
    basePrompt += ` Incorporate a professional ${cameraMovement} camera movement throughout the scene.`;
  }

  // Add color grading
  if (colorGrading !== "none") {
    basePrompt += ` Apply a ${colorGrading} color grading style to the entire video for a consistent artistic look.`;
  }

  let enhancedPrompt = effect3D 
    ? `${basePrompt} Apply a realistic 3D parallax depth effect to the photos, making them feel like real live video with subtle camera movement.`
    : basePrompt;

  if (userPrompt && userPrompt.trim() !== "") {
    enhancedPrompt += ` Additional user instructions: ${userPrompt.trim()}`;
  }

  // Determine the correct model and enforce constraints
  // veo-3.1-generate-preview (High Quality) supports multiple images but ONLY 720p and 16:9
  // veo-3.1-fast-generate-preview supports 720p/1080p and 16:9/9:16
  
  let model = 'veo-3.1-fast-generate-preview';
  let finalResolution = resolution;
  let finalAspectRatio = aspectRatio;

  // If we have more than 2 images, we MUST use veo-3.1-generate-preview
  // and we MUST use 720p and 16:9
  if (imagesBase64.length > 2) {
    model = 'veo-3.1-generate-preview';
    finalResolution = '720p';
    finalAspectRatio = '16:9';
  } else if (faceEnhancement) {
    // Face enhancement also benefits from the high quality model
    model = 'veo-3.1-generate-preview';
    finalResolution = '720p';
    finalAspectRatio = '16:9';
  }

  // Ensure aspect ratio is valid for the selected model
  // Veo only supports 16:9 and 9:16. If 1:1 was selected, fallback to 16:9
  if (finalAspectRatio === "1:1") {
    finalAspectRatio = "16:9";
  }

  const config: any = {
    numberOfVideos: 1,
    resolution: finalResolution,
    aspectRatio: finalAspectRatio
  };

  let payload: any = {
    model,
    prompt: enhancedPrompt,
    config
  };

  if (imagesBase64.length > 0) {
    if (imagesBase64.length === 1 || (imagesBase64.length === 2 && model === 'veo-3.1-generate-preview')) {
      const img = imagesBase64[0];
      payload.image = {
        imageBytes: img.includes('base64,') ? img.split('base64,')[1] : img,
        mimeType: img.startsWith('data:') ? img.split(';')[0].split(':')[1] : 'image/png',
      };
    } else if (imagesBase64.length === 2 && model === 'veo-3.1-fast-generate-preview') {
      const img1 = imagesBase64[0];
      const img2 = imagesBase64[1];
      payload.image = {
        imageBytes: img1.includes('base64,') ? img1.split('base64,')[1] : img1,
        mimeType: img1.startsWith('data:') ? img1.split(';')[0].split(':')[1] : 'image/png',
      };
      payload.config.lastFrame = {
        imageBytes: img2.includes('base64,') ? img2.split('base64,')[1] : img2,
        mimeType: img2.startsWith('data:') ? img2.split(';')[0].split(':')[1] : 'image/png',
      };
    } else if (model === 'veo-3.1-generate-preview') {
      // High quality model supports up to 3 reference images
      payload.config.referenceImages = imagesBase64.slice(0, 3).map(img => ({
        image: {
          imageBytes: img.includes('base64,') ? img.split('base64,')[1] : img,
          mimeType: img.startsWith('data:') ? img.split(';')[0].split(':')[1] : 'image/png',
        },
        referenceType: VideoGenerationReferenceType.ASSET
      }));
    }
  }

  let operation = await ai.models.generateVideos(payload);
  return operation;
};

export const pollVideoOperation = async (operation: any) => {
  const ai = getAI();
  let currentOp = operation;
  
  while (!currentOp.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    currentOp = await ai.operations.getVideosOperation({ operation: currentOp });
  }

  if (currentOp.error) {
    throw new Error(currentOp.error.message || `Generation failed: ${JSON.stringify(currentOp.error)}`);
  }

  return currentOp;
};

export const fetchVideoBlob = async (url: string) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-goog-api-key': getApiKey(),
    },
  });
  return await response.blob();
};
