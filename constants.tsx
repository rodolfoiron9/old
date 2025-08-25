
import React from 'react';
import { Track, Preset } from './types';

// Mock lyrics for "Cycle Cut"
const cycleCutLyrics = [
  { time: 2, word: "Stuck" }, { time: 2.5, word: "in" }, { time: 2.8, word: "the" }, { time: 3.2, word: "loop" },
  { time: 4, word: "again" }, { time: 4.8, word: "Same" }, { time: 5.2, word: "old" }, { time: 5.5, word: "story" },
  { time: 6.5, word: "no" }, { time: 6.8, word: "new" }, { time: 7.2, word: "friend" }, { time: 8, word: "Breaking" },
  { time: 8.5, word: "free" }, { time: 9, word: "from" }, { time: 9.4, word: "this" }, { time: 9.8, word: "chain" },
  { time: 10.8, word: "Glitch" }, { time: 11.2, word: "in" }, { time: 11.5, word: "the" }, { time: 11.9, word: "system" },
  { time: 12.7, word: "Shedding" }, { time: 13.2, word: "the" }, { time: 13.5, word: "pain" }, { time: 14.5, word: "Cut" },
  { time: 15, word: "the" }, { time: 15.3, word: "cycle" }, { time: 16, word: "now" }, { time: 16.8, word: "Bass" },
  { time: 17.2, word: "drops" }, { time: 17.6, word: "loud" }, { time: 18.2, word: "Echoes" }, { time: 18.7, word: "fade" },
  { time: 19.5, word: "New" }, { time: 19.8, word: "path" }, { time: 20.2, word: "is" }, { time: 20.6, word: "made" },
];

export const TRACKS: Track[] = [
  {
    id: 1,
    title: "Cycle Cut",
    artist: "Rudybtz",
    description: "A dark, glitch-heavy anthem about breaking toxic patterns.",
    audioSrc: "https://cdn.pixabay.com/download/audio/2022/01/21/audio_3166539b06.mp3",
    cover: "https://picsum.photos/seed/cyclecut/800/800",
    lyrics: cycleCutLyrics,
  },
  {
    id: 2,
    title: "Mirror Break",
    artist: "Rudybtz",
    description: "Confronting the self with hard-hitting breaks and raw honesty.",
    audioSrc: "https://cdn.pixabay.com/download/audio/2023/04/17/audio_80s-retro-pop-epic-trailer-147005.mp3",
    cover: "https://picsum.photos/seed/mirrorbreak/800/800",
    lyrics: cycleCutLyrics.map(l => ({...l, word: l.word.split('').reverse().join('')})), // Placeholder reversed lyrics
  },
  {
    id: 3,
    title: "Gone With the Drop",
    artist: "Rudybtz",
    description: "The powerful closer about letting go and moving forward.",
    audioSrc: "https://cdn.pixabay.com/download/audio/2022/09/20/audio_c36905a89d.mp3",
    cover: "https://picsum.photos/seed/gonewithdrop/800/800",
    lyrics: cycleCutLyrics.slice().reverse(), // Placeholder reversed order lyrics
  },
];

export const PRESETS: Preset[] = [
  {
    id: 'p1',
    name: "Quantum Mirage",
    cubeMaterial: { type: 'glass', color: '#9f7aea', roughness: 0.1, metalness: 0, opacity: 0.3 },
    environment: { bgColor: '#000010', fogColor: '#0a0a0a', particleColor: '#9f7aea' },
    bassReaction: { scale: 0.15, rotation: 0.05, glitch: 0.5 },
    lyricsStyle: { font: '/fonts/Inter-Bold.woff', color: '#ffffff', glowColor: '#9f7aea' },
  },
  {
    id: 'p2',
    name: "Echo Core",
    cubeMaterial: { type: 'metallic', color: '#f56565', roughness: 0.3, metalness: 0.8, opacity: 1.0 },
    environment: { bgColor: '#100000', fogColor: '#0a0a0a', particleColor: '#f56565' },
    bassReaction: { scale: 0.2, rotation: 0.1, glitch: 0 },
    lyricsStyle: { font: '/fonts/ShareTechMono-Regular.woff', color: '#f7fafc', glowColor: '#f56565' },
  },
  {
    id: 'p3',
    name: "Bass Forge",
    cubeMaterial: { type: 'rock', color: '#4299e1', roughness: 0.8, metalness: 0.1, opacity: 1.0 },
    environment: { bgColor: '#000515', fogColor: '#0a0a0a', particleColor: '#4299e1' },
    bassReaction: { scale: 0.25, rotation: 0, glitch: 0.2 },
    lyricsStyle: { font: '/fonts/Orbitron-Bold.woff', color: '#e2e8f0', glowColor: '#4299e1' },
  },
];

export const SpotifyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"></path><path d="M7.5 12.5c2.485 0 4.5-2.015 4.5-4.5S9.985 3.5 7.5 3.5s-4.5 2.015-4.5 4.5c0 .332.055.65.147.95"></path><path d="M16.5 16.5c-2.485 0-4.5-2.015-4.5-4.5s2.015-4.5 4.5-4.5 4.5 2.015 4.5 4.5c0 .332-.055.65-.147.95"></path><path d="M12 20.5c-2.485 0-4.5-2.015-4.5-4.5s2.015-4.5 4.5-4.5 4.5 2.015 4.5 4.5c0 .332-.055.65-.147.95"></path></svg>
);
export const AppleMusicIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><path d="M12 12c-1.12 0-2.03-.9-2.03-2.03S10.88 7.94 12 7.94s2.03.9 2.03 2.03c0 .5-.19.98-.53 1.34"></path><path d="M14.83 12.23A4.5 4.5 0 0112 16.5a4.5 4.5 0 01-2.83-4.27"></path><path d="M12 12a2.25 2.25 0 00-2.25 2.25V18a2.25 2.25 0 004.5 0v-3.75A2.25 2.25 0 0012 12z"></path></svg>
);
export const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21.58 7.19c-.23-.86-.9-1.52-1.76-1.75C18.25 5 12 5 12 5s-6.25 0-7.82.44c-.86.23-1.52.9-1.76 1.75C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.9 1.52 1.76 1.75C5.75 19 12 19 12 19s6.25 0 7.82-.44c.86-.23 1.52-.9 1.76-1.75C22 15.25 22 12 22 12s0-3.25-.42-4.81z"></path><polygon points="10 15 15 12 10 9"></polygon></svg>
);
export const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
export const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16.5 5.5c-3.3 0-6 2.7-6 6v8.5a2.5 2.5 0 1 0 5 0V11a3.5 3.5 0 1 1 7 0v1.5a2.5 2.5 0 1 0 5 0V9c0-4.42-3.58-8-8-8z"></path></svg>
);
