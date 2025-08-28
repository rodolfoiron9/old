import React, { useState, Suspense, useMemo } from 'react';
import { Preset, FaceContentType, FaceContent } from '../../types';
import { Canvas } from '@react-three/fiber';
// FIX: Use namespace import for robust type augmentation.
import * as ReactThreeFiber from '@react-three/fiber';
import { OrbitControls, Stars, Text, RoundedBox, Line } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
// FIX: Replace `* as THREE` with named imports from `three` to resolve type errors.
import { EdgesGeometry, BoxGeometry, Vector3 } from 'three';
import { createSerializablePreset } from '../../lib/gemini';


// FIX: Manually augment JSX namespace to include react-three-fiber components.
// This is a workaround for a potential tsconfig issue that prevents automatic type recognition.
declare global {
    namespace JSX {
        // FIX: Use explicit namespace to ensure types are resolved for JSX intrinsics.
        // FIX: Corrected the type from `IntrinsicElements` to `ThreeElements` to match the export from @react-three/fiber.
        interface IntrinsicElements extends ReactThreeFiber.ThreeElements {}
    }
}

interface CubeSettingsTabProps {
    presets: Preset[];
    setPresets: React.Dispatch<React.SetStateAction<Preset[]>>;
}

const LivePreview: React.FC<{ preset: Preset }> = ({ preset }) => {
    const { cubeMaterial, environment, edges, wireframe, effects } = preset;
    
    const facePositions: {position: [number, number, number], rotation: [number, number, number]}[] = [
        { position: [0, 0, 0.51], rotation: [0, 0, 0] },
        { position: [0.51, 0, 0], rotation: [0, Math.PI / 2, 0] },
    ];
    
    const wireframePoints = useMemo(() => {
        // FIX: Changed THREE.EdgesGeometry and THREE.BoxGeometry to named imports.
        const geometry = new EdgesGeometry(new BoxGeometry(1.01, 1.01, 1.01));
        const points = [];
        const position = geometry.attributes.position.array;
        for (let i = 0; i < position.length; i += 3) {
            // FIX: Changed THREE.Vector3 to Vector3.
            points.push(new Vector3(position[i], position[i+1], position[i+2]));
        }
        return points;
    }, []);

    return (
        <Canvas camera={{ position: [1.5, 1.5, 1.5], fov: 50 }}>
            <color attach="background" args={[environment.bgColor]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={1.5} color={cubeMaterial.color} />
            <Stars radius={50} depth={20} count={2000} factor={4} saturation={0} fade speed={1} />
            
            <group>
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
                        points={wireframePoints}
                        color={wireframe.color}
                        lineWidth={wireframe.thickness}
                    />
                )}
                {/* Preview Text on Front Face */}
                 <group position={facePositions[0].position} rotation={facePositions[0].rotation}>
                    <Text fontSize={0.15} color={preset.lyricsStyle.color} anchorX="center" anchorY="middle">Lyrics</Text>
                 </group>
                 {/* Preview Text on Right Face */}
                 <group position={facePositions[1].position} rotation={facePositions[1].rotation}>
                    <Text fontSize={0.12} color={preset.lyricsStyle.color} anchorX="center" anchorY="middle">Artist</Text>
                 </group>
            </group>

            <OrbitControls enableZoom={false} enablePan={false} autoRotate />
            <EffectComposer>
                <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={effects.chorusBloom} />
            </EffectComposer>
        </Canvas>
    )
}

const CollapsibleSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left">
                <h3 className="text-lg font-bold title-3d-light">{title}</h3>
            </button>
            {isOpen && <div className="mt-4">{children}</div>}
        </div>
    )
};

const FaceEditor: React.FC<{ faceName: string, content: FaceContent, onChange: (newContent: FaceContent) => void }> = ({ faceName, content, onChange }) => {
    const contentTypes: FaceContentType[] = ['none', 'lyrics', 'albumArt', 'social', 'metadata', 'aiVisual', 'controls', 'staticText'];
    return (
        <div>
            <h4 className="font-semibold capitalize text-slate-300">{faceName} Face</h4>
            <select value={content.type} onChange={e => onChange({ ...content, type: e.target.value as FaceContentType })} className="w-full mt-1 bg-slate-800 rounded p-1">
                {contentTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {content.type === 'staticText' && (
                <input type="text" value={content.text || ''} onChange={e => onChange({ ...content, text: e.target.value })} placeholder="Enter text" className="w-full mt-2 bg-slate-800 rounded p-1" />
            )}
        </div>
    );
};

const CubeSettingsTab: React.FC<CubeSettingsTabProps> = ({ presets, setPresets }) => {
    const [selectedPresetId, setSelectedPresetId] = useState(presets[0].id);
    const [isCopied, setIsCopied] = useState(false);
    
    const selectedPreset = presets.find(p => p.id === selectedPresetId)!;
    
    const handlePresetChange = (field: keyof Preset, value: any) => {
        const updatedPresets = presets.map(p => {
            if (p.id === selectedPresetId) {
                return { ...p, [field]: value };
            }
            return p;
        });
        setPresets(updatedPresets);
    };

    const handleNestedChange = (category: keyof Preset, field: string, value: any) => {
        const updatedCategory = { ...(selectedPreset[category] as object), [field]: value };
        handlePresetChange(category, updatedCategory);
    };

    const handleFaceChange = (faceName: keyof Preset['faces'], newContent: FaceContent) => {
        const updatedFaces = { ...selectedPreset.faces, [faceName]: newContent };
        handlePresetChange('faces', updatedFaces);
    };

    const handleCopyPreset = () => {
        if (!selectedPreset) return;
        
        const serializablePreset = createSerializablePreset(selectedPreset);
        navigator.clipboard.writeText(JSON.stringify(serializablePreset, null, 2));
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-300">Select Preset</label>
                    <div className="flex items-center gap-2 mt-1">
                        <select 
                            value={selectedPresetId} 
                            onChange={e => setSelectedPresetId(e.target.value)} 
                            className="flex-grow bg-slate-900/50 border border-slate-700 rounded-md py-2 px-3 text-white"
                        >
                            {presets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <button 
                            onClick={handleCopyPreset}
                            className="px-3 py-2 bg-slate-700/80 text-white font-semibold rounded-md text-sm hover:bg-slate-600 transition-colors whitespace-nowrap"
                            title="Copy preset JSON to clipboard"
                        >
                            {isCopied ? 'Copied!' : 'Copy JSON'}
                        </button>
                    </div>
                     <p className="text-xs text-slate-500 mt-2 md:hidden">
                        Pro Tip: Paste this in Project Settings to import/share presets.
                    </p>
                </div>

                <CollapsibleSection title="Cube Material">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label>Color</label><input type="color" value={selectedPreset.cubeMaterial.color} onChange={e => handleNestedChange('cubeMaterial', 'color', e.target.value)} className="w-full mt-1" /></div>
                        <div><label>Type</label><select value={selectedPreset.cubeMaterial.type} onChange={e => handleNestedChange('cubeMaterial', 'type', e.target.value)} className="w-full mt-1 bg-slate-800 rounded p-1"><option>standard</option><option>glass</option><option>metallic</option><option>rock</option><option>hologram</option></select></div>
                        <div><label>Roughness</label><input type="range" min="0" max="1" step="0.01" value={selectedPreset.cubeMaterial.roughness} onChange={e => handleNestedChange('cubeMaterial', 'roughness', parseFloat(e.target.value))} className="w-full mt-1" /></div>
                        <div><label>Metalness</label><input type="range" min="0" max="1" step="0.01" value={selectedPreset.cubeMaterial.metalness} onChange={e => handleNestedChange('cubeMaterial', 'metalness', parseFloat(e.target.value))} className="w-full mt-1" /></div>
                        <div><label>Opacity</label><input type="range" min="0" max="1" step="0.01" value={selectedPreset.cubeMaterial.opacity} onChange={e => handleNestedChange('cubeMaterial', 'opacity', parseFloat(e.target.value))} className="w-full mt-1" /></div>
                    </div>
                </CollapsibleSection>

                 <CollapsibleSection title="Wireframe & Edges">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label>Wireframe</label><input type="checkbox" checked={selectedPreset.wireframe.enabled} onChange={e => handleNestedChange('wireframe', 'enabled', e.target.checked)} className="mt-1" /></div>
                        <div><label>Wire Color</label><input type="color" value={selectedPreset.wireframe.color} onChange={e => handleNestedChange('wireframe', 'color', e.target.value)} className="w-full mt-1" /></div>
                        <div><label>Wire Thickness</label><input type="range" min="0.1" max="5" step="0.1" value={selectedPreset.wireframe.thickness} onChange={e => handleNestedChange('wireframe', 'thickness', parseFloat(e.target.value))} className="w-full mt-1" /></div>
                        <div><label>Corner Radius</label><input type="range" min="0" max="0.5" step="0.01" value={selectedPreset.edges.cornerRadius} onChange={e => handleNestedChange('edges', 'cornerRadius', parseFloat(e.target.value))} className="w-full mt-1" /></div>
                        <div><label>Edge Glow</label><input type="range" min="0" max="1" step="0.01" value={selectedPreset.edges.glow} onChange={e => handleNestedChange('edges', 'glow', parseFloat(e.target.value))} className="w-full mt-1" /></div>
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Face Content">
                    <p className="text-xs text-slate-400 mb-4">Front face is reserved for lyrics.</p>
                    <div className="grid grid-cols-2 gap-4">
                        <FaceEditor faceName="Back" content={selectedPreset.faces.back} onChange={c => handleFaceChange('back', c)} />
                        <FaceEditor faceName="Left" content={selectedPreset.faces.left} onChange={c => handleFaceChange('left', c)} />
                        <FaceEditor faceName="Right" content={selectedPreset.faces.right} onChange={c => handleFaceChange('right', c)} />
                        <FaceEditor faceName="Top" content={selectedPreset.faces.top} onChange={c => handleFaceChange('top', c)} />
                        <FaceEditor faceName="Bottom" content={selectedPreset.faces.bottom} onChange={c => handleFaceChange('bottom', c)} />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="Visual Effects">
                     <div className="grid grid-cols-2 gap-4">
                        <div><label>Bass Fracture</label><input type="range" min="0" max="1" step="0.01" value={selectedPreset.effects.bassFracture} onChange={e => handleNestedChange('effects', 'bassFracture', parseFloat(e.target.value))} className="w-full mt-1" /></div>
                        <div><label>Chorus Bloom</label><input type="range" min="0" max="2" step="0.01" value={selectedPreset.effects.chorusBloom} onChange={e => handleNestedChange('effects', 'chorusBloom', parseFloat(e.target.value))} className="w-full mt-1" /></div>
                        <div><label>Bass Glitch</label><input type="range" min="0" max="1" step="0.01" value={selectedPreset.bassReaction.glitch} onChange={e => handleNestedChange('bassReaction', 'glitch', parseFloat(e.target.value))} className="w-full mt-1" /></div>
                    </div>
                </CollapsibleSection>

            </div>
            <div className="lg:col-span-1">
                 <div className="aspect-square bg-slate-900/50 rounded-lg border border-slate-800 overflow-hidden sticky top-20">
                    <Suspense fallback={<div className="flex items-center justify-center h-full">Loading Preview...</div>}>
                        <LivePreview preset={selectedPreset} />
                    </Suspense>
                 </div>
            </div>
        </div>
    );
};

export default CubeSettingsTab;