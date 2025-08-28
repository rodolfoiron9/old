
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Preset, GeneratedImage, FaceContent } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const faceContentSchema = {
    type: Type.OBJECT,
    properties: {
        type: {
            type: Type.STRING,
            enum: ['lyrics', 'albumArt', 'social', 'metadata', 'aiVisual', 'controls', 'staticText', 'none'],
            description: "The type of content to display on this face."
        }
        // NOTE: Optional fields like 'text', 'fields' are omitted for generation simplicity.
        // The AI should focus on picking the 'type', and the app will handle the rest.
    }
};

const presetSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "A unique identifier, e.g., 'remix-123'" },
    name: { type: Type.STRING, description: "A creative name for the preset, e.g., 'Liquid Chrome'" },
    cubeMaterial: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: ['glass', 'metallic', 'hologram', 'rock', 'standard'] },
        color: { type: Type.STRING, description: "Hex color code, e.g., '#c0c0c0'" },
        roughness: { type: Type.NUMBER, description: "Value from 0.0 to 1.0" },
        metalness: { type: Type.NUMBER, description: "Value from 0.0 to 1.0" },
        opacity: { type: Type.NUMBER, description: "Value from 0.0 to 1.0" },
      },
    },
    wireframe: {
        type: Type.OBJECT,
        properties: {
            enabled: { type: Type.BOOLEAN },
            color: { type: Type.STRING, description: "Hex color for the wireframe" },
            thickness: { type: Type.NUMBER, description: "Thickness of the wireframe lines" }
        }
    },
    edges: {
        type: Type.OBJECT,
        properties: {
            glow: { type: Type.NUMBER, description: "Edge glow intensity from 0.0 to 1.0" },
            cornerRadius: { type: Type.NUMBER, description: "Radius of the cube's corners" }
        }
    },
    faces: {
        type: Type.OBJECT,
        properties: {
            front: faceContentSchema,
            back: faceContentSchema,
            left: faceContentSchema,
            right: faceContentSchema,
            top: faceContentSchema,
            bottom: faceContentSchema,
        }
    },
    effects: {
        type: Type.OBJECT,
        properties: {
            bassFracture: { type: Type.NUMBER, description: "Bass fracture effect intensity from 0.0 to 1.0" },
            chorusBloom: { type: Type.NUMBER, description: "Chorus bloom effect intensity from 0.0 to 2.0" }
        }
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
            contents: `Generate a 3D visualizer preset based on this theme: "${prompt}". Respond ONLY with the JSON object that conforms to the schema.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: presetSchema,
            },
        });

        const text = response.text;
        if (typeof text !== 'string' || !text.trim()) {
            console.error("AI returned an empty or invalid response:", response);
            throw new Error("AI returned an empty or invalid response.");
        }
        const jsonText = text.trim();

        try {
            return JSON.parse(jsonText);
        } catch (error) {
            console.error("Failed to parse JSON from AI:", jsonText);
            throw new Error(`AI did not return valid JSON. Response text: "${jsonText}"`);
        }
    } catch (error) {
        console.error("Error generating preset:", error);
        throw new Error("Failed to generate preset from AI.");
    }
};

/**
 * Creates a clean, serializable copy of a FaceContent object.
 * This function is critical for preventing serialization errors. It meticulously
 * reconstructs the FaceContent object, ensuring only defined, primitive-like
 * values are included. This process effectively strips away any complex state
 * management artifacts or non-serializable properties that might have been
 * attached to the live state object by React or other libraries.
 */
const createSerializableFace = (face: FaceContent): FaceContent => {
    // Start with the 'type' property, which is always required.
    const cleanFace: FaceContent = { type: face.type };

    // Conditionally copy optional properties only if they exist. This prevents
    // 'undefined' values from being included in the final object, keeping it clean.
    // The arrays are shallow-copied using the spread operator, which is safe
    // because they contain only primitive strings.
    if (face.text) cleanFace.text = face.text;
    if (face.fields) cleanFace.fields = [...face.fields];
    if (face.elements) cleanFace.elements = [...face.elements];
    if (face.buttons) cleanFace.buttons = [...face.buttons];

    return cleanFace;
};

/**
 * Creates a "clean" and completely serializable copy of a Preset object.
 *
 * WHY THIS IS IMPORTANT:
 * Live state objects, especially from libraries like React and react-three-fiber,
 * can contain complex internal data, functions, and even circular references.
 * Attempting to serialize these objects directly with `JSON.stringify` or send
 * them to Firestore will result in a "converting circular structure to JSON" error.
 *
 * THE SOLUTION:
 * This function acts as a robust serializer. Instead of cloning the object, it
 * meticulously rebuilds it from the ground up, property by property. It explicitly
 * copies only the primitive values (strings, numbers, booleans) and simple nested
 * objects/arrays that are defined in our application's `Preset` type.
 * This guarantees that the returned object is a pure, safe-to-serialize data
 * structure, completely free of any runtime artifacts.
 *
 * @param {Preset} preset - The potentially "dirty" live state preset object.
 * @returns {Preset} A clean, serializable representation of the preset.
 */
export const createSerializablePreset = (preset: Preset): Preset => {
    // We construct a new object literal, ensuring the structure matches the Preset type.
    // Each property is accessed directly from the source `preset` object and assigned.
    // This deep-copy approach for a known structure is the most reliable way to
    // prevent serialization errors.

    return {
        id: preset.id,
        name: preset.name,

        // --- Nested Objects ---
        // Each nested object is also rebuilt property by property to ensure it's clean.

        cubeMaterial: {
            type: preset.cubeMaterial.type,
            color: preset.cubeMaterial.color,
            roughness: preset.cubeMaterial.roughness,
            metalness: preset.cubeMaterial.metalness,
            opacity: preset.cubeMaterial.opacity,
        },
        wireframe: {
            enabled: preset.wireframe.enabled,
            color: preset.wireframe.color,
            thickness: preset.wireframe.thickness,
        },
        edges: {
            glow: preset.edges.glow,
            cornerRadius: preset.edges.cornerRadius,
        },
        faces: {
            // Use the dedicated helper for each face to handle its specific structure
            front: createSerializableFace(preset.faces.front),
            back: createSerializableFace(preset.faces.back),
            left: createSerializableFace(preset.faces.left),
            right: createSerializableFace(preset.faces.right),
            top: createSerializableFace(preset.faces.top),
            bottom: createSerializableFace(preset.faces.bottom),
        },
        effects: {
            bassFracture: preset.effects.bassFracture,
            chorusBloom: preset.effects.chorusBloom,
        },
        environment: {
            bgColor: preset.environment.bgColor,
            fogColor: preset.environment.fogColor,
            particleColor: preset.environment.particleColor,
        },
        bassReaction: {
            scale: preset.bassReaction.scale,
            rotation: preset.bassReaction.rotation,
            glitch: preset.bassReaction.glitch,
        },
        lyricsStyle: {
            font: preset.lyricsStyle.font,
            color: preset.lyricsStyle.color,
            glowColor: preset.lyricsStyle.glowColor,
        }
    };
};


export const remixPreset = async (currentPreset: Preset, trackDescription: string): Promise<Preset> => {
    try {
        const serializablePreset = createSerializablePreset(currentPreset);
        const prompt = `You are an AI visual designer. Here is an existing 3D preset configuration: ${JSON.stringify(serializablePreset)}. The music it's for is described as: "${trackDescription}". Create a new preset that is a creative "remix" of the current one, inspired by the music description. Change colors, materials, or environmental properties to create a fresh but related vibe. Respond ONLY with the JSON object.`
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: presetSchema,
            },
        });

        const text = response.text;
        if (typeof text !== 'string' || !text.trim()) {
            console.error("AI returned an empty or invalid response for remix:", response);
            throw new Error("AI returned an empty or invalid response for remix.");
        }
        const jsonText = text.trim();

        try {
            const newPreset = JSON.parse(jsonText);
            newPreset.id = `remix-${Date.now()}`; // Ensure unique ID
            return newPreset;
        } catch(error) {
            console.error("Failed to parse JSON from AI remix:", jsonText);
            throw new Error(`AI did not return valid JSON for remix. Response text: "${jsonText}"`);
        }
    } catch (error) {
        console.error("Error remixing preset:", error);
        throw new Error("Failed to remix preset from AI.");
    }
};


export const generateImage = async (prompt: string): Promise<GeneratedImage> => {
    let response;
    try {
        response = await ai.models.generateImages({
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

    if (image?.imageBytes && image.mimeType) {
        return {
            imageBytes: image.imageBytes,
            mimeType: image.mimeType,
        };
    }
    
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
