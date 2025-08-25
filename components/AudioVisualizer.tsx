import React, { useRef, useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { Text, Stars, MeshTransmissionMaterial, Effects } from '@react-three/drei';
import * as THREE from 'three';
import { PRESETS, TRACKS } from '../constants';
import { Preset, Track, Lyric } from '../types';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';

// Manually extend R3F's catalog to fix JSX type errors.
extend({
  Group: THREE.Group,
  Mesh: THREE.Mesh,
  BoxGeometry: THREE.BoxGeometry,
  MeshStandardMaterial: THREE.MeshStandardMaterial,
  MeshBasicMaterial: THREE.MeshBasicMaterial,
  Color: THREE.Color,
  Fog: THREE.Fog,
  AmbientLight: THREE.AmbientLight,
  PointLight: THREE.PointLight,
});


// Helper component for the reactive cube
interface CubeProps {
  bassLevel: number;
  preset: Preset;
  currentWords: { word: string; face: number }[];
}

const Cube: React.FC<CubeProps> = ({ bassLevel, preset, currentWords }) => {
  const meshRef = useRef<THREE.Group>(null!);
  const { bassReaction, cubeMaterial, lyricsStyle } = preset;

  useFrame((state, delta) => {
    if (meshRef.current) {
      const scale = 1 + bassLevel * bassReaction.scale;
      meshRef.current.scale.set(scale, scale, scale);
      meshRef.current.rotation.y += delta * 0.1 + bassLevel * bassReaction.rotation;
      meshRef.current.rotation.x += delta * 0.05;
    }
  });

  const material = useMemo(() => {
    switch (cubeMaterial.type) {
      case 'glass':
        return <MeshTransmissionMaterial
          background={new THREE.Color(preset.environment.bgColor)}
          color={cubeMaterial.color}
          roughness={cubeMaterial.roughness}
          metalness={cubeMaterial.metalness}
          transmission={1}
          thickness={0.2}
          ior={1.5}
          chromaticAberration={0.1}
        />
      default:
        return <meshStandardMaterial
          color={cubeMaterial.color}
          roughness={cubeMaterial.roughness}
          metalness={cubeMaterial.metalness}
          opacity={cubeMaterial.opacity}
          transparent={cubeMaterial.opacity < 1}
        />
    }
  }, [preset, cubeMaterial]);

  const facePositions: {position: [number, number, number], rotation: [number, number, number]}[] = [
    { position: [0, 0, 0.51], rotation: [0, 0, 0] },
    { position: [0.51, 0, 0], rotation: [0, Math.PI / 2, 0] },
    { position: [0, 0, -0.51], rotation: [0, Math.PI, 0] },
    { position: [-0.51, 0, 0], rotation: [0, -Math.PI / 2, 0] },
    { position: [0, 0.51, 0], rotation: [-Math.PI / 2, 0, 0] },
    { position: [0, -0.51, 0], rotation: [Math.PI / 2, 0, 0] },
  ];

  return (
    <group ref={meshRef}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        {material}
      </mesh>
      {facePositions.map((pos, i) => (
         <Text
            key={i}
            position={pos.position as [number, number, number]}
            rotation={pos.rotation as [number, number, number]}
            fontSize={0.15}
            color={lyricsStyle.color}
            anchorX="center"
            anchorY="middle"
            font={lyricsStyle.font}
            material-toneMapped={false}
         >
           {currentWords.find(w => w.face === i)?.word || ''}
           <meshBasicMaterial color={lyricsStyle.glowColor} toneMapped={false} />
         </Text>
      ))}
    </group>
  );
};


// Main Visualizer Scene
interface SceneProps {
  track: Track;
  preset: Preset;
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
}

const Scene: React.FC<SceneProps> = ({ track, preset, audioRef, isPlaying }) => {
  const { getBassLevel } = useAudioAnalyzer();
  const [bassLevel, setBassLevel] = useState(0);
  const [currentWords, setCurrentWords] = useState<{ word: string; face: number }[]>([]);

  useFrame(() => {
    if (isPlaying) {
      setBassLevel(getBassLevel());

      if(audioRef.current){
        const currentTime = audioRef.current.currentTime;
        
        let activeLyricIndex = -1;
        for (let i = track.lyrics.length - 1; i >= 0; i--) {
            if (track.lyrics[i].time <= currentTime) {
                activeLyricIndex = i;
                break;
            }
        }
        
        if(activeLyricIndex > -1){
            const newWords = [];
            for (let i = 0; i < 6; i++) {
                const lyricIndex = activeLyricIndex - i;
                if(lyricIndex >= 0) {
                    newWords.push({word: track.lyrics[lyricIndex].word, face: (activeLyricIndex - i) % 6});
                }
            }
            setCurrentWords(newWords);
        }
      }
    } else {
        setBassLevel(level => Math.max(0, level - 0.01));
    }
  });

  return (
    <>
      <color attach="background" args={[preset.environment.bgColor]} />
      <fog attach="fog" args={[preset.environment.fogColor, 1, 15]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color={preset.cubeMaterial.color} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Suspense fallback={null}>
        <Cube bassLevel={bassLevel} preset={preset} currentWords={currentWords} />
      </Suspense>
      
      {preset.bassReaction.glitch > 0 && bassLevel > 0.5 && (
         <Effects>
            {/* This is a placeholder for a more advanced glitch effect */}
         </Effects>
      )}
    </>
  );
};


// Controls and Main Component
interface AudioVisualizerProps {
  track: Track | null;
  preset: Preset;
  onPresetChange: (preset: Preset) => void;
  onClose: () => void;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ track, preset, onPresetChange, onClose }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { setupAudioContext } = useAudioAnalyzer();

  useEffect(() => {
    // When track changes, the src is updated declaratively on the audio element.
    // This effect just needs to reset player state.
    setIsPlaying(false);
    setIsInitialized(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [track]);

  const handlePlayPause = () => {
    if (!track || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Initialize audio context only after playback has successfully started.
            if (!isInitialized) {
              setupAudioContext(audioRef.current);
              setIsInitialized(true);
            }
            setIsPlaying(true);
          })
          .catch(e => {
            console.error("Playback failed:", e);
            setIsPlaying(false);
          });
      }
    }
  };
  
  const handleEnded = () => {
    setIsPlaying(false);
  }

  if (!track) return null;

  return (
    <div className="fixed inset-0 z-50 bg-brand-bg">
      <div className="absolute inset-0">
        <Canvas>
          <Scene track={track} preset={preset} audioRef={audioRef} isPlaying={isPlaying} />
        </Canvas>
      </div>
      <div className="absolute top-0 left-0 p-4 md:p-6 space-x-2 z-10 flex items-center">
        <button onClick={onClose} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-md text-sm font-semibold transition-colors">
          &larr; Back
        </button>
        <div className="hidden md:block text-sm">
          <span className="font-bold">{track.title}</span> by {track.artist}
        </div>
      </div>
      <div className="absolute top-0 right-0 p-4 md:p-6 z-10">
         <select
            value={preset.id}
            onChange={(e) => onPresetChange(PRESETS.find(p => p.id === e.target.value)!)}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-md px-3 py-1.5 text-sm font-semibold transition-colors appearance-none"
          >
            {PRESETS.map(p => <option key={p.id} value={p.id} className="bg-brand-bg">{p.name}</option>)}
          </select>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex justify-center z-10">
        <button onClick={handlePlayPause} className="w-16 h-16 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white drop-shadow-glow-purple transition-all">
          {isPlaying ? (
             <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
          )}
        </button>
      </div>
      <audio ref={audioRef} src={track.audioSrc} onEnded={handleEnded} crossOrigin="anonymous" />
    </div>
  );
};
