import React, { useRef, useState, useEffect, Suspense, useMemo, useCallback } from 'react';
// FIX: Removed `extend` and added type imports for manual JSX namespace augmentation.
import { Canvas, useFrame } from '@react-three/fiber';
// FIX: Replaced direct prop type imports with ThreeElements to align with modern @react-three/fiber, resolving missing type exports.
import type { ThreeElements } from '@react-three/fiber';
import { Text, Stars, MeshTransmissionMaterial, OrbitControls, useTexture, Html, Plane } from '@react-three/drei';
import { EffectComposer, Glitch } from '@react-three/postprocessing';
import * as THREE from 'three';
import { PRESETS, TRACKS, MagicWandIcon } from '../constants';
import { Preset, Track, Lyric, GeneratedImage } from '../types';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import { generateImage } from '../lib/gemini';

// FIX: Manually augment JSX namespace to include react-three-fiber components.
// This is a workaround for a potential tsconfig issue that prevents automatic type recognition.
// FIX: Updated prop types to use ThreeElements for compatibility with modern @react-three/fiber.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: ThreeElements['group'];
      mesh: ThreeElements['mesh'];
      boxGeometry: ThreeElements['boxGeometry'];
      meshStandardMaterial: ThreeElements['meshStandardMaterial'];
      meshBasicMaterial: ThreeElements['meshBasicMaterial'];
      color: ThreeElements['color'];
      fog: ThreeElements['fog'];
      ambientLight: ThreeElements['ambientLight'];
      pointLight: ThreeElements['pointLight'];
    }
  }
}

const imageCache = new Map<string, string>();

type FaceContent = {
    key: string;
    type: 'text' | 'image' | 'loading';
    content: string;
};

const FaceImage: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
    const texture = useTexture(imageUrl);
    return (
        <Plane args={[1, 1]}>
            <meshStandardMaterial map={texture} toneMapped={false} />
        </Plane>
    );
};

interface CubeProps {
  bassLevel: number;
  preset: Preset;
  faceContents: FaceContent[];
}

const Cube: React.FC<CubeProps> = ({ bassLevel, preset, faceContents }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const { bassReaction, cubeMaterial, lyricsStyle } = preset;

  useFrame(() => {
    if (groupRef.current) {
      const scale = 1 + bassLevel * bassReaction.scale;
      groupRef.current.scale.set(scale, scale, scale);
    }
  });
  
  const material = useMemo(() => {
    // This material is for the main cube body, faces will be rendered separately
    return <meshStandardMaterial
        color={cubeMaterial.color}
        roughness={cubeMaterial.roughness}
        metalness={cubeMaterial.metalness}
        opacity={cubeMaterial.opacity * 0.5} // Make body slightly more transparent
        transparent={true}
    />
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
    <group ref={groupRef}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        {material}
      </mesh>
      {facePositions.map((pos, i) => {
        const faceContent = faceContents[i];
        if (!faceContent) return null;
        return (
             <group key={`${faceContent.key}-${i}`} position={pos.position as [number, number, number]} rotation={pos.rotation as [number, number, number]}>
                 {faceContent.type === 'text' && (
                     <Text fontSize={0.15} color={lyricsStyle.color} anchorX="center" anchorY="middle" font={lyricsStyle.font}>
                         {faceContent.content}
                         <meshBasicMaterial color={lyricsStyle.glowColor} toneMapped={false} />
                     </Text>
                 )}
                 {faceContent.type === 'image' && (
                    <Suspense fallback={null}>
                        <FaceImage imageUrl={faceContent.content} />
                    </Suspense>
                 )}
                 {faceContent.type === 'loading' && (
                     <Html center>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                     </Html>
                 )}
             </group>
        )
      })}
    </group>
  );
};

interface SceneProps {
  track: Track;
  preset: Preset;
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
}

const Scene: React.FC<SceneProps> = ({ track, preset, audioRef, isPlaying }) => {
  const { getBassLevel } = useAudioAnalyzer();
  const [bassLevel, setBassLevel] = useState(0);
  const [faceContents, setFaceContents] = useState<FaceContent[]>([]);

  useEffect(() => {
    // Reset faces when track changes
    setFaceContents([]);
  }, [track]);

  useFrame(() => {
    if (isPlaying) {
      setBassLevel(getBassLevel());

      if(audioRef.current){
        const currentTime = audioRef.current.currentTime;
        let activeLyricIndex = track.lyrics.findIndex((lyric, i) => {
            const nextLyric = track.lyrics[i + 1];
            return currentTime >= lyric.time && (!nextLyric || currentTime < nextLyric.time);
        });
        
        if(activeLyricIndex > -1){
            const faceIndex = activeLyricIndex % 6;
            const currentLyric = track.lyrics[activeLyricIndex];
            const existingFace = faceContents[faceIndex];

            if(!existingFace || existingFace.key !== currentLyric.word){
                 const newFaceContents = [...faceContents];
                 newFaceContents[faceIndex] = { key: currentLyric.word, type: 'loading', content: currentLyric.word };
                 setFaceContents(newFaceContents);
                 
                 (async () => {
                     let imageUrl = imageCache.get(currentLyric.word);
                     if(!imageUrl){
                         try {
                            const image: GeneratedImage = await generateImage(currentLyric.word);
                            imageUrl = `data:${image.mimeType};base64,${image.imageBytes}`;
                            imageCache.set(currentLyric.word, imageUrl);
                         } catch(e) { console.error("Image generation failed:", e); return; }
                     }

                     setFaceContents(prev => {
                         const updated = [...prev];
                         if (updated[faceIndex] && updated[faceIndex].key === currentLyric.word) {
                            updated[faceIndex] = { key: currentLyric.word, type: 'image', content: imageUrl! };
                         }
                         return updated;
                     });
                 })();
            }
        }
      }
    } else {
        setBassLevel(level => Math.max(0, level - 0.01));
    }
  });

  const glitchStrength = useMemo(() => {
    const strength = Math.max(0, (bassLevel - 0.6) * 2 * preset.bassReaction.glitch);
    return new THREE.Vector2(strength, strength);
  }, [bassLevel, preset.bassReaction.glitch]);

  return (
    <>
      <color attach="background" args={[preset.environment.bgColor]} />
      <fog attach="fog" args={[preset.environment.fogColor, 1, 15]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color={preset.cubeMaterial.color} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Suspense fallback={null}>
        <Cube bassLevel={bassLevel} preset={preset} faceContents={faceContents} />
      </Suspense>

      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate={true}
        autoRotateSpeed={0.5 + bassLevel * preset.bassReaction.rotation * 10}
      />
      
      {preset.bassReaction.glitch > 0 && bassLevel > 0.6 && (
         <EffectComposer>
            <Glitch
              delay={new THREE.Vector2(0.5, 1.5)}
              duration={new THREE.Vector2(0.1, 0.2)}
              strength={glitchStrength}
              ratio={0.85}
            />
         </EffectComposer>
      )}
    </>
  );
};


interface AudioVisualizerProps {
  track: Track | null;
  preset: Preset;
  onPresetChange: (preset: Preset) => void;
  onClose: () => void;
  onNext: () => void;
  onRemix: () => void;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ track, preset, onPresetChange, onClose, onNext, onRemix }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRemixing, setIsRemixing] = useState(false);
  const { setupAudioContext } = useAudioAnalyzer();

  const handlePlayPause = useCallback(() => {
    if (!track || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          if (!isInitialized) {
            setupAudioContext(audioRef.current!);
            setIsInitialized(true);
          }
          setIsPlaying(true);
        }).catch(e => console.error("Playback failed:", e));
      }
    }
  }, [track, isPlaying, isInitialized, setupAudioContext]);

  useEffect(() => {
    setIsPlaying(false);
    setIsInitialized(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      const timer = setTimeout(handlePlayPause, 100); // Autoplay with small delay
      return () => clearTimeout(timer);
    }
  }, [track, handlePlayPause]);
  
  const handleEnded = () => {
    setIsPlaying(false);
    onNext(); // Go to next track when one finishes
  }
  
  const handleRemix = async () => {
    setIsRemixing(true);
    await onRemix();
    setIsRemixing(false);
  };


  if (!track) return null;

  return (
    <div className="fixed inset-0 z-50 bg-brand-bg animate-fade-in">
      <div className="absolute inset-0">
        <Canvas>
          <Scene track={track} preset={preset} audioRef={audioRef} isPlaying={isPlaying} />
        </Canvas>
      </div>
      <div className="absolute top-0 left-0 p-4 md:p-6 z-10">
        <button onClick={onClose} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-md text-sm font-semibold transition-colors">
          &larr; Back
        </button>
      </div>
      <div className="absolute top-0 right-0 p-4 md:p-6 z-10">
         <div className="hidden md:block text-sm text-right">
          <span className="font-bold">{track.title}</span><br/> by {track.artist}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 p-4 md:p-6 flex items-center space-x-2 z-10">
         <select
            value={preset.id.startsWith('remix-') ? preset.name : preset.id}
            onChange={(e) => onPresetChange(PRESETS.find(p => p.id === e.target.value)!)}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-md px-3 py-1.5 text-sm font-semibold transition-colors appearance-none"
          >
            {PRESETS.map(p => <option key={p.id} value={p.id} className="bg-brand-bg">{p.name}</option>)}
             {preset.id.startsWith('remix-') && <option value={preset.name} className="bg-brand-bg text-brand-purple">{preset.name} (AI)</option>}
          </select>
        <button onClick={handleRemix} disabled={isRemixing} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-md text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50">
            {isRemixing ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <MagicWandIcon className="w-4 h-4"/>}
            Remix
        </button>
        <button onClick={onNext} className="px-4 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-md text-sm font-semibold transition-colors">
            Next &rarr;
        </button>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 p-4 md:p-6 flex justify-center z-10">
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