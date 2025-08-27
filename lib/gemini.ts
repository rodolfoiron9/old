
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Preset, GeneratedImage } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const presetSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "A unique identifier, e.g., 'p9'" },
    name: { type: Type.STRING, description: "The name of the preset, e.g., 'Liquid Chrome'" },
    cubeMaterial: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, description: "Material type, e.g., 'metallic', 'glass', 'standard'" },
        color: { type: Type.STRING, description: "Hex color code, e.g., '#c0c0c0'" },
        roughness: { type: Type.NUMBER, description: "Value from 0.0 to 1.0" },
        metalness: { type: Type.NUMBER, description: "Value from 0.0 to 1.0" },
        opacity: { type: Type.NUMBER, description: "Value from 0.0 to 1.0" },
      },
    },
    environment: {
        type: Type.OBJECT,
        properties: {
            bgColor: { type: Type.STRING, description: "Background hex color, e.g., '#101010'" },
            fogColor: { type: Type.STRING, description: "Fog hex color, e.g., '#0a0a0a'" },
            particleColor: { type: Type.STRING, description: "Particle hex color, e.g., '#ffffff'" },
        },
    },
    bassReaction: {
        type: Type.OBJECT,
        properties: {
            scale: { type: Type.NUMBER, description: "Bass scale multiplier, e.g., 0.18" },
            rotation: { type: Type.NUMBER, description: "Bass rotation multiplier, e.g., 0.01" },
            glitch: { type: Type.NUMBER, description: "Bass glitch effect strength (0-1), e.g., 0" },
        },
    },
     lyricsStyle: {
        type: Type.OBJECT,
        properties: {
            font: { type: Type.STRING, description: "Font path, e.g., '/fonts/ShareTechMono-Regular.woff'" },
            color: { type: Type.STRING, description: "Lyrics hex color, e.g., '#000000'" },
            glowColor: { type: Type.STRING, description: "Lyrics glow hex color, e.g., '#ffffff'" },
        },
    },
  },
};


export const generatePreset = async (prompt: string): Promise<Preset> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a 3D visualizer preset based on this theme: "${prompt}". Respond ONLY with the JSON object.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: presetSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating preset:", error);
        throw new Error("Failed to generate preset from AI.");
    }
};

export const remixPreset = async (currentPreset: Preset, trackDescription: string): Promise<Preset> => {
    try {
        const prompt = `You are an AI visual designer. Here is an existing 3D preset configuration: ${JSON.stringify(currentPreset)}. The music it's for is described as: "${trackDescription}". Create a new preset that is a creative "remix" of the current one, inspired by the music description. Change colors, materials, or environmental properties to create a fresh but related vibe. Respond ONLY with the JSON object.`
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: presetSchema,
            },
        });

        const jsonText = response.text.trim();
        const newPreset = JSON.parse(jsonText);
        newPreset.id = `remix-${Date.now()}`; // Ensure unique ID
        return newPreset;
    } catch (error) {
        console.error("Error remixing preset:", error);
        throw new Error("Failed to remix preset from AI.");
    }
};


export const generateImage = async (prompt: string): Promise<GeneratedImage> => {
    let response;
    try {
        response = await ai.models.generateImages({
            // FIX: Updated model from deprecated 'imagen-3.0-generate-002' to 'imagen-4.0-generate-001' as per guidelines.
            model: 'imagen-4.0-generate-001',
            prompt: `cinematic, abstract, cyberpunk art representing: "${prompt}"`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '1:1',
            },
        });
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image from AI.");
    }

    const image = response.generatedImages?.[0]?.image;

    // The SDK types imageBytes and mimeType as optional, so we must check for them.
    if (image?.imageBytes && image.mimeType) {
        return {
            imageBytes: image.imageBytes,
            mimeType: image.mimeType,
        };
    }
    
    // If we reach here, either no image was returned or it was malformed.
    throw new Error("AI did not return a valid image.");
};

export const generateText = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating text:", error);
        throw new Error("Failed to generate text from AI.");
    }
}

export const getFirebaseAgentResponse = async (prompt: string, history: { role: string, parts: { text: string }[] }[]): Promise<string> => {
    const systemInstruction = `You are an expert Firebase and Google Cloud developer. Your task is to provide code, configuration, and step-by-step instructions to implement backend features for a web application. The user is building a platform for a music artist. Be concise, accurate, and provide production-ready solutions. Use Firebase v9+ (modular) syntax for web (JavaScript/TypeScript). When providing code, wrap it in appropriate markdown code blocks.`;

    const chat: Chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: { systemInstruction },
        history: history
    });

    try {
        const result = await chat.sendMessage({ message: prompt });
        return result.text.trim();
    } catch (error) {
        console.error("Error with Firebase Agent:", error);
        throw new Error("The AI agent failed to respond.");
    }
};