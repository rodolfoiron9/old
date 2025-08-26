
import { doc, getDoc, setDoc, collection, getDocs, query, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { ProjectState, BlogPost } from "../types";
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

export const saveProjectStateToFirestore = async (state: ProjectState): Promise<void> => {
    try {
        const batch = writeBatch(db);

        // Save tracks and presets to the main settings document
        const mainSettings = { tracks: state.tracks, presets: state.presets };
        batch.set(settingsDocRef, mainSettings);
        
        console.log("Project state (tracks, presets) saved to Firestore successfully.");
    } catch (error) {
        console.error("Error saving project state to Firestore:", error);
        throw new Error("Could not save project settings to the cloud.");
    }
};

export const loadProjectStateFromFirestore = async (): Promise<ProjectState> => {
    try {
        const settingsSnap = await getDoc(settingsDocRef);
        const blogQuery = query(blogCollectionRef);
        const blogSnap = await getDocs(blogQuery);
        
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
                const docRef = doc(db, "blogPosts", post.id);
                batch.set(docRef, { title: post.title, date: post.date, content: post.content });
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
