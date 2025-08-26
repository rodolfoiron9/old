
export interface Lyric {
  time: number;
  word: string;
}

export interface Track {
  id: number;
  title: string;
  artist: string;
  description: string;
  audioSrc: string;
  cover: string;
  lyrics: Lyric[];
}

export interface CubeMaterial {
  type: 'glass' | 'metallic' | 'hologram' | 'rock' | 'standard';
  color: string;
  roughness: number;
  metalness: number;
  opacity: number;
}

export interface Environment {
  bgColor: string;
  fogColor: string;
  particleColor: string;
}

export interface BassReaction {
  scale: number;
  rotation: number;
  glitch: number;
}

export interface LyricsStyle {
  font: string;
  color: string;
  glowColor: string;
}

export interface Preset {
  id: string;
  name:string;
  cubeMaterial: CubeMaterial;
  environment: Environment;
  bassReaction: BassReaction;
  lyricsStyle: LyricsStyle;
}

export interface GeneratedImage {
    imageBytes: string;
    mimeType: string;
}

export interface FileItem {
  name: string;
  folder: 'Music' | 'Images' | '3D Files' | 'Presets';
  content?: string; // For presets JSON or image base64
}

export interface BlogPost {
    id: string; // Use string for Firestore IDs
    title: string;
    date: string;
    content: string;
}

export interface ProjectState {
    tracks: Track[];
    presets: Preset[];
    blogPosts: BlogPost[];
}
