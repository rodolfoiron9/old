import React, { useState, Suspense } from 'react';
import { Preset } from '../../types';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';

interface CubeSettingsTabProps {
    presets: Preset[];
    setPresets: React.Dispatch<React.SetStateAction<Preset[]>>;
}

const LivePreview: React.FC<{ preset: Preset }> = ({ preset }) => {
    const { cubeMaterial, environment } = preset;
    return (
        <Canvas camera={{ position: [1.5, 1.5, 1.5], fov: 50 }}>
            <color attach="background" args={[environment.bgColor]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={1.5} color={cubeMaterial.color} />
            <Stars radius={50} depth={20} count={2000} factor={4} saturation={0} fade speed={1} />
            <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial
                    color={cubeMaterial.color}
                    roughness={cubeMaterial.roughness}
                    metalness={cubeMaterial.metalness}
                    opacity={cubeMaterial.opacity}
                    transparent={cubeMaterial.type === 'glass'}
                />
            </mesh>
            <OrbitControls enableZoom={false} enablePan={false} autoRotate />
        </Canvas>
    )
}

const CubeSettingsTab: React.FC<CubeSettingsTabProps> = ({ presets, setPresets }) => {
    const [selectedPresetId, setSelectedPresetId] = useState(presets[0].id);
    
    const selectedPreset = presets.find(p => p.id === selectedPresetId)!;
    
    const handlePresetChange = (field: keyof Preset, value: any) => {
        const updatedPreset = { ...selectedPreset, [field]: value };
        setPresets(presets.map(p => p.id === selectedPresetId ? updatedPreset : p));
    };

    const handleNestedChange = (category: keyof Preset, field: string, value: any) => {
        const updatedCategory = { ...(selectedPreset[category] as object), [field]: value };
        handlePresetChange(category, updatedCategory);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-300">Select Preset</label>
                    <select value={selectedPresetId} onChange={e => setSelectedPresetId(e.target.value)} className="mt-1 block w-full bg-slate-900/50 border border-slate-700 rounded-md py-2 px-3 text-white">
                        {presets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                    <h3 className="text-lg font-bold title-3d-light mb-4">Cube Material</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label>Color</label><input type="color" value={selectedPreset.cubeMaterial.color} onChange={e => handleNestedChange('cubeMaterial', 'color', e.target.value)} className="w-full mt-1" /></div>
                        <div><label>Type</label><select value={selectedPreset.cubeMaterial.type} onChange={e => handleNestedChange('cubeMaterial', 'type', e.target.value)} className="w-full mt-1 bg-slate-800 rounded p-1"><option>standard</option><option>glass</option><option>metallic</option></select></div>
                        <div><label>Roughness</label><input type="range" min="0" max="1" step="0.01" value={selectedPreset.cubeMaterial.roughness} onChange={e => handleNestedChange('cubeMaterial', 'roughness', parseFloat(e.target.value))} className="w-full mt-1" /></div>
                        <div><label>Metalness</label><input type="range" min="0" max="1" step="0.01" value={selectedPreset.cubeMaterial.metalness} onChange={e => handleNestedChange('cubeMaterial', 'metalness', parseFloat(e.target.value))} className="w-full mt-1" /></div>
                        <div><label>Opacity</label><input type="range" min="0" max="1" step="0.01" value={selectedPreset.cubeMaterial.opacity} onChange={e => handleNestedChange('cubeMaterial', 'opacity', parseFloat(e.target.value))} className="w-full mt-1" /></div>
                    </div>
                </div>
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                    <h3 className="text-lg font-bold title-3d-light mb-4">Effects (Bass Reaction)</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div><label>Scale</label><input type="number" step="0.01" value={selectedPreset.bassReaction.scale} onChange={e => handleNestedChange('bassReaction', 'scale', parseFloat(e.target.value))} className="w-full mt-1 bg-slate-800 rounded p-1" /></div>
                        <div><label>Rotation</label><input type="number" step="0.01" value={selectedPreset.bassReaction.rotation} onChange={e => handleNestedChange('bassReaction', 'rotation', parseFloat(e.target.value))} className="w-full mt-1 bg-slate-800 rounded p-1" /></div>
                        <div><label>Glitch</label><input type="range" min="0" max="1" step="0.01" value={selectedPreset.bassReaction.glitch} onChange={e => handleNestedChange('bassReaction', 'glitch', parseFloat(e.target.value))} className="w-full mt-1" /></div>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-1">
                 <div className="aspect-square bg-slate-900/50 rounded-lg border border-slate-800 overflow-hidden">
                    <Suspense fallback={<div className="flex items-center justify-center h-full">Loading Preview...</div>}>
                        <LivePreview preset={selectedPreset} />
                    </Suspense>
                 </div>
            </div>
        </div>
    );
};

export default CubeSettingsTab;
