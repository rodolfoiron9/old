import React, { useRef, useState, useEffect, Suspense, useMemo, useCallback } from 'react';
// FIX: Removed `extend` and added type imports for manual JSX namespace augmentation.
import { Canvas, useFrame } from '@react-three/fiber';
// FIX: Use namespace import for robust type augmentation.
import * as ReactThreeFiber from '@react-three/fiber';
import { Text, Stars, OrbitControls, useTexture, Html, Plane, RoundedBox, Line } from '@react-three/drei';
import { EffectComposer, Glitch, Bloom } from '@react-three/postprocessing';
// FIX: Replace `* as THREE` with named imports from `three` to resolve type errors.
import { Vector2, Group, EdgesGeometry, BoxGeometry, Vector3 } from 'three';
import { PRESETS, TRACKS, MagicWandIcon } from '../constants';
import { Preset, Track, Lyric, GeneratedImage, FaceContent } from '../types';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import { generateImage } from '../lib/gemini';

// FIX: Manually augment JSX namespace to include react-three-fiber components.
// This is a workaround for a potential tsconfig issue that prevents automatic type recognition.
declare global {
  namespace JSX {
    // FIX: Use explicit namespace to ensure types are resolved for JSX intrinsics.
    // FIX: Corrected the type from `IntrinsicElements` to `ThreeElements` to match the export from @react-three/fiber.
    interface IntrinsicElements extends ReactThreeFiber.ThreeElements {}
  }
}

const imageCache = new Map<string, string>();

type DynamicFaceContent = {
    key: string;
    type: 'text' | 'image' | 'loading';
    content: string;
};

const FaceImage: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
    const texture = useTexture(imageUrl);
    return (
        <Plane args={[0.9, 0.9]}>
            <meshStandardMaterial map={texture} toneMapped={false} />
        </Plane>
    );
};

const FaceContentComponent: React.FC<{ face: FaceContent, track: Track, preset: Preset, dynamicContent?: DynamicFaceContent }> = ({ face, track, preset, dynamicContent }) => {
    const { lyricsStyle } = preset;
    const fontSize = 0.12;

    switch (face.type) {
        case 'lyrics':
             if (!dynamicContent) return null;
             return (
                 <>
                    {dynamicContent.type === 'text' && (
                         <Text fontSize={0.15} color={lyricsStyle.color} anchorX="center" anchorY="middle" font={lyricsStyle.font}>
                             {dynamicContent.content}
                             <meshBasicMaterial color={lyricsStyle.glowColor} toneMapped={false} />
                         </Text>
                     )}
                     {dynamicContent.type === 'image' && (
                        <Suspense fallback={null}><FaceImage imageUrl={dynamicContent.content} /></Suspense>
                     )}
                     {dynamicContent.type === 'loading' && (
                         <Html center><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div></Html>
                     )}
                 </>
             )
        case 'albumArt':
            return <Suspense fallback={null}><FaceImage imageUrl={track.cover} /></Suspense>;
        case 'staticText':
            return <Text fontSize={fontSize} color={lyricsStyle.color} anchorX="center" anchorY="middle" font={lyricsStyle.font}>{face.text || ''}</Text>;
        case 'metadata':
             const text = (face.fields || [])
                .map(field => field === 'album' ? 'Old Habit' : track[field as keyof Track])
                .join('\n');
            return <Text fontSize={fontSize} color={lyricsStyle.color} anchorX="center" anchorY="middle" font={lyricsStyle.font}>{text}</Text>;
        default:
            return null;
    }
};


interface CubeProps {
  bassLevel: number;
  preset: Preset;
  track: Track;
  faceContents: DynamicFaceContent[];
}

const Cube: React.FC<CubeProps> = ({ bassLevel, preset, track, faceContents }) => {
  // FIX: Changed THREE.Group to Group.
  const groupRef = useRef<Group>(null!);
  const wireframeRef = useRef<any>(null!);
  const { bassReaction, cubeMaterial, edges, wireframe } = preset;
  
  const wireframePoints = useMemo(() => {
    // FIX: Changed THREE.EdgesGeometry and THREE.BoxGeometry to named imports.
    const geometry = new EdgesGeometry(new BoxGeometry(1.001, 1.001, 1.001));
    const points = [];
    const position = geometry.attributes.position.array;
    for (let i = 0; i < position.length; i += 3) {
        // FIX: Changed THREE.Vector3 to Vector3.
        points.push(new Vector3(position[i], position[i+1], position[i+2]));
    }
    return points;
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      const scale = 1 + bassLevel * bassReaction.scale;
      groupRef.current.scale.set(scale, scale, scale);
    }
    if (wireframeRef.current && wireframe.enabled) {
        (wireframeRef.current.material as any).linewidth = wireframe.thickness + bassLevel * wireframe.thickness * 2;
        (wireframeRef.current.material as any).needsUpdate = true;
    }
  });
  
  const facePositions: {position: [number, number, number], rotation: [number, number, number]}[] = [
    { position: [0, 0, 0.51], rotation: [0, 0, 0] }, // front
    { position: [0, 0, -0.51], rotation: [0, Math.PI, 0] }, // back
    { position: [-0.51, 0, 0], rotation: [0, -Math.PI / 2, 0] }, // left
    { position: [0.51, 0, 0], rotation: [0, Math.PI / 2, 0] }, // right
    { position: [0, 0.51, 0], rotation: [-Math.PI / 2, 0, 0] }, // top
    { position: [0, -0.51, 0], rotation: [Math.PI / 2, 0, 0] }, // bottom
  ];
  
  const faceKeys = ['front', 'back', 'left', 'right', 'top', 'bottom'] as const;

  return (
    <group ref={groupRef}>
      <RoundedBox args={[1, 1, 1]} radius={edges.cornerRadius} smoothness={4}>
        <meshStandardMaterial
            color={cubeMaterial.color}
            roughness={cubeMaterial.roughness}
            metalness={cubeMaterial.metalness}
            opacity={cubeMaterial.opacity}
            transparent={cubeMaterial.type === 'glass' || cubeMaterial.opacity < 1}
        />
      </RoundedBox>

      {wireframe.enabled && (
        <Line
            ref={wireframeRef}
            points={wireframePoints}
            color={wireframe.color}
            lineWidth={wireframe.thickness}
        />
      )}
      
      {facePositions.map((pos, i) => {
        const faceName = faceKeys[i];
        const faceConfig = preset.faces[faceName];
        if (faceConfig.type === 'none') return null;
        
        const dynamicContent = faceConfig.type === 'lyrics' ? faceContents[i] : undefined;

        return (
             <group key={faceName} position={pos.position as [number, number, number]} rotation={pos.rotation as [number, number, number]}>
                 <FaceContentComponent face={faceConfig} track={track} preset={preset} dynamicContent={dynamicContent} />
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
  const [faceContents, setFaceContents] = useState<DynamicFaceContent[]>([]);

  useEffect(() => {
    // Reset faces when track changes
    setFaceContents([]);
  }, [track]);

  useFrame(() => {
    if (isPlaying) {
      const currentBass = getBassLevel();
      setBassLevel(currentBass);

      if(audioRef.current){
        const currentTime = audioRef.current.currentTime;
        let activeLyricIndex = track.lyrics.findIndex((lyric, i) => {
            const nextLyric = track.lyrics[i + 1];
            return currentTime >= lyric.time && (!nextLyric || currentTime < nextLyric.time);
        });
        
        if(activeLyricIndex > -1){
            const faceIndex = activeLyricIndex % 6; // Cycle through faces
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
    // FIX: Changed THREE.Vector2 to Vector2.
    return new Vector2(strength, strength);
  }, [bassLevel, preset.bassReaction.glitch]);
  
  const fractureStrength = useMemo(() => {
    const strength = Math.max(0, (bassLevel - 0.8) * 5 * preset.effects.bassFracture);
    // FIX: Changed THREE.Vector2 to Vector2.
    return new Vector2(strength, strength);
  }, [bassLevel, preset.effects.bassFracture]);

  return (
    <>
      <color attach="background" args={[preset.environment.bgColor]} />
      <fog attach="fog" args={[preset.environment.fogColor, 1, 15]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color={preset.cubeMaterial.color} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Suspense fallback={null}>
        <Cube bassLevel={bassLevel} preset={preset} track={track} faceContents={faceContents} />
      </Suspense>

      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate={true}
        autoRotateSpeed={0.5 + bassLevel * preset.bassReaction.rotation * 10}
      />
      
      <EffectComposer>
        {preset.bassReaction.glitch > 0 && bassLevel > 0.6 && (
            <Glitch
              // FIX: Changed THREE.Vector2 to Vector2.
              delay={new Vector2(0.5, 1.5)}
              // FIX: Changed THREE.Vector2 to Vector2.
              duration={new Vector2(0.1, 0.2)}
              strength={glitchStrength}
              ratio={0.85}
            />
        )}
        {preset.effects.bassFracture > 0 && bassLevel > 0.8 && (
             <Glitch
              // FIX: Changed THREE.Vector2 to Vector2.
              delay={new Vector2(0.1, 0.5)}
              // FIX: Changed THREE.Vector2 to Vector2.
              duration={new Vector2(0.1, 0.15)}
              strength={fractureStrength}
              ratio={0.5}
            />
        )}
         {preset.effects.chorusBloom > 0 && (
            <Bloom 
                luminanceThreshold={0.2} 
                luminanceSmoothing={0.9} 
                height={300} 
                intensity={bassLevel * preset.effects.chorusBloom} 
            />
         )}
      </EffectComposer>
    </>
  );
};


interface AudioVisualizerProps {
  track: Track | null;
  preset: Preset;
  onPresetChange: (preset: Preset) => void;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRemix: () => void;
}

const SlidersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="4" y1="21" x2="4" y2="14"></line>
        <line x1="4" y1="10" x2="4" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12" y2="3"></line>
        <line x1="20" y1="21" x2="20" y2="16"></line>
        <line x1="20" y1="12" x2="20" y2="3"></line>
        <line x1="1" y1="14" x2="7" y2="14"></line>
        <line x1="9" y1="8" x2="15" y2="8"></line>
        <line x1="17" y1="16" x2="23" y2="16"></line>
    </svg>
);

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ track, preset, onPresetChange, onClose, onNext, onPrev, onRemix }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRemixing, setIsRemixing] = useState(false);
  const { setupAudioContext } = useAudioAnalyzer();
  const [volume, setVolume] = useState(1);
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    let isMounted = true;

    const playTrack = async () => {
      audio.src = track.audioSrc;
      audio.currentTime = 0;
      
      try {
        await audio.play();
        if (isMounted) {
          if (!isInitialized) {
            setupAudioContext(audio);
            setIsInitialized(true);
          }
          setIsPlaying(true);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Autoplay failed:", error);
          setIsPlaying(false);
        }
      }
    };

    audio.pause();
    setIsPlaying(false);
    playTrack();

    return () => {
      isMounted = false;
      if (audio) {
        audio.pause();
        audio.src = ''; // Prevents memory leaks
      }
    };
  }, [track, setupAudioContext, isInitialized]);
  
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
        }).catch(e => {
            console.error("Playback failed:", e);
            setIsPlaying(false);
        });
      }
    }
  }, [track, isPlaying, isInitialized, setupAudioContext]);

   useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrev();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePlayPause, onNext, onPrev]);
  
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
        <div className="text-sm text-right max-w-xs bg-black/20 p-3 rounded-lg backdrop-blur-sm">
            <p className="font-bold truncate text-white">{track.title} by {track.artist}</p>
            <p className="text-slate-400 italic mt-1 text-xs whitespace-normal">{track.description}</p>
        </div>
      </div>
      
      {showEffectsPanel && (
        <div className="absolute bottom-[72px] left-4 md:left-6 p-4 bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-700 w-64 z-20 animate-fade-in">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-white">Visual Effects</h3>
                <button onClick={() => setShowEffectsPanel(false)} className="text-2xl leading-none text-white/50 hover:text-white">&times;</button>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="flex items-center justify-between text-sm"><span>Bloom</span><span className="text-slate-400">{preset.effects.chorusBloom.toFixed(2)}</span></label>
                    <input type="range" min="0" max="2" step="0.05" value={preset.effects.chorusBloom} onChange={(e) => onPresetChange({...preset, effects: { ...preset.effects, chorusBloom: parseFloat(e.target.value) }})} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer mt-1" />
                </div>
                <div>
                    <label className="flex items-center justify-between text-sm"><span>Bass Glitch</span><span className="text-slate-400">{preset.bassReaction.glitch.toFixed(2)}</span></label>
                    <input type="range" min="0" max="1" step="0.05" value={preset.bassReaction.glitch} onChange={(e) => onPresetChange({...preset, bassReaction: { ...preset.bassReaction, glitch: parseFloat(e.target.value) }})} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer mt-1" />
                </div>
                <div>
                    <label className="flex items-center justify-between text-sm"><span>Bass Fracture</span><span className="text-slate-400">{preset.effects.bassFracture.toFixed(2)}</span></label>
                    <input type="range" min="0" max="1" step="0.05" value={preset.effects.bassFracture} onChange={(e) => onPresetChange({...preset, effects: { ...preset.effects, bassFracture: parseFloat(e.target.value) }})} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer mt-1" />
                </div>
            </div>
        </div>
      )}

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
         <button onClick={() => setShowEffectsPanel(!showEffectsPanel)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-md text-sm font-semibold transition-colors flex items-center gap-2">
            <SlidersIcon className="w-4 h-4" />
            Effects
        </button>
        <button onClick={onPrev} className="px-4 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-md text-sm font-semibold transition-colors">
            &larr; Prev
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

      <div className="absolute bottom-0 right-0 p-4 md:p-6 flex items-center space-x-3 z-10">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white/70">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
        </svg>
        <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
            aria-label="Volume control"
        />
      </div>

      <audio ref={audioRef} onEnded={handleEnded} crossOrigin="anonymous" />
    </div>
  );
};