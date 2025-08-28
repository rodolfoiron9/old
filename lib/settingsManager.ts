
import { db } from "./firebase";
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { ProjectState, BlogPost, Preset, Track, FaceContent } from "../types";
import { TRACKS as defaultTracks, PRESETS as defaultPresets } from '../constants';

const defaultBlogPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: 'The Making of "Old Habit"',
    date: 'July 26, 2024',
    content: 'A deep dive into the creative process behind the album. From late-night studio sessions to the final master, Rudybtz shares the stories behind the sound.',
  },
  {
    id: 'post-2',
    title: 'Influences & Inspirations',
    date: 'July 18, 2024',
    content: 'Explore the sonic landscape that shaped "Old Habit". Rudybtz breaks down the key artists and tracks that inspired his latest work.',
  },
];

export const defaultProjectState: ProjectState = {
    tracks: defaultTracks,
    presets: defaultPresets,
    blogPosts: defaultBlogPosts,
};

const settingsDocRef = doc(db, "project", "settings");
const blogCollectionRef = collection(db, "blogPosts");

// Helper to create a clean, serializable copy of a FaceContent object.
const createSerializableFace = (face: FaceContent): FaceContent => {
    const cleanFace: Partial<FaceContent> = { type: face.type };
    if (face.text !== undefined) cleanFace.text = face.text;
    if (face.fields !== undefined) cleanFace.fields = [...face.fields];
    if (face.elements !== undefined) cleanFace.elements = [...face.elements];
    if (face.buttons !== undefined) cleanFace.buttons = [...face.buttons];
    return cleanFace as FaceContent;
};


// Creates a deep, clean copy of the state to ensure it's serializable
// before sending it to Firestore. This prevents "converting circular structure"
// errors by explicitly copying only the properties defined in the types,
// ignoring any complex objects that might have been attached to the live state.
const createSerializableState = (state: ProjectState): { tracks: Track[], presets: Preset[] } => {
    return {
        tracks: state.tracks.map(track => ({
            id: track.id,
            title: track.title,
            artist: track.artist,
            description: track.description,
            audioSrc: track.audioSrc,
            cover: track.cover,
            lyrics: track.lyrics.map(lyric => ({ time: lyric.time, word: lyric.word }))
        })),
        presets: state.presets.map(p => ({
            id: p.id,
            name: p.name,
            cubeMaterial: {
                type: p.cubeMaterial.type,
                color: p.cubeMaterial.color,
                roughness: p.cubeMaterial.roughness,
                metalness: p.cubeMaterial.metalness,
                opacity: p.cubeMaterial.opacity,
            },
            wireframe: {
                enabled: p.wireframe.enabled,
                color: p.wireframe.color,
                thickness: p.wireframe.thickness,
            },
            edges: {
                glow: p.edges.glow,
                cornerRadius: p.edges.cornerRadius,
            },
            faces: {
                front: createSerializableFace(p.faces.front),
                back: createSerializableFace(p.faces.back),
                left: createSerializableFace(p.faces.left),
                right: createSerializableFace(p.faces.right),
                top: createSerializableFace(p.faces.top),
                bottom: createSerializableFace(p.faces.bottom),
            },
            effects: {
                bassFracture: p.effects.bassFracture,
                chorusBloom: p.effects.chorusBloom,
            },
            environment: {
                bgColor: p.environment.bgColor,
                fogColor: p.environment.fogColor,
                particleColor: p.environment.particleColor,
            },
            bassReaction: {
                scale: p.bassReaction.scale,
                rotation: p.bassReaction.rotation,
                glitch: p.bassReaction.glitch,
            },
            lyricsStyle: {
                font: p.lyricsStyle.font,
                color: p.lyricsStyle.color,
                glowColor: p.lyricsStyle.glowColor,
            }
        }))
    };
};


export const saveProjectStateToFirestore = async (state: ProjectState): Promise<void> => {
    try {
        // We only want to save tracks and presets to the main settings document.
        // Blog posts are handled separately in their own collection.
        const settingsToSave = createSerializableState(state);
        
        await setDoc(settingsDocRef, settingsToSave);

        console.log("Project state (tracks, presets) saved to Firestore successfully.");
    } catch (error) {
        console.error("Error saving project state to Firestore:", error);
        throw new Error("Could not save project settings to the cloud.");
    }
};

export const loadProjectStateFromFirestore = async (): Promise<ProjectState> => {
    try {
        const settingsSnap = await getDoc(settingsDocRef);
        const blogSnap = await getDocs(blogCollectionRef);
        
        let loadedState: ProjectState = { ...defaultProjectState };

        if (settingsSnap.exists()) {
            const data = settingsSnap.data();
            loadedState.tracks = data.tracks || defaultTracks;
            loadedState.presets = data.presets || defaultPresets;
        } else {
             await setDoc(settingsDocRef, { tracks: defaultTracks, presets: defaultPresets });
        }

        if (!blogSnap.empty) {
            loadedState.blogPosts = blogSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
        } else {
            // If no blog posts, initialize them
            const batch = writeBatch(db);
            defaultBlogPosts.forEach(post => {
                const postDocRef = doc(db, "blogPosts", post.id);
                batch.set(postDocRef, { title: post.title, date: post.date, content: post.content });
            });
            await batch.commit();
        }

        console.log("Project state loaded from Firestore.");
        return loadedState;

    } catch (error) {
        console.error("Error loading project state from Firestore:", error);
        return defaultProjectState;
    }
};
