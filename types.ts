
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

export interface WireframeStyle {
    enabled: boolean;
    color: string;
    thickness: number;
}

export interface EdgeStyle {
    glow: number; // 0 to 1
    cornerRadius: number; // 0 to 0.5
}

export type FaceContentType = 'lyrics' | 'albumArt' | 'social' | 'metadata' | 'aiVisual' | 'controls' | 'staticText' | 'none';

export interface FaceContent {
    type: FaceContentType;
    // Optional params based on type
    text?: string; // for staticText
    fields?: ('artist' | 'album' | 'title')[]; // for metadata
    elements?: ('like' | 'share' | 'comment')[]; // for social
    buttons?: ('next' | 'prev' | 'play')[]; // for controls
}

export interface Faces {
    front: FaceContent;
    back: FaceContent;
    left: FaceContent;
    right: FaceContent;
    top: FaceContent;
    bottom: FaceContent;
}

export interface Effects {
    bassFracture: number; // 0 to 1
    chorusBloom: number; // 0 to 2
    // Future effects can be added here
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
  wireframe: WireframeStyle;
  edges: EdgeStyle;
  faces: Faces;
  effects: Effects;
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
