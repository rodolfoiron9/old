import React, { useState } from 'react';
import { generatePreset, generateImage, generateText } from '../../lib/gemini';
import { GeneratedImage, Preset, FileItem } from '../../types';

interface AiAssistantTabProps {
    onAddFile: (file: FileItem) => void;
}

const AiAssistantTab: React.FC<AiAssistantTabProps> = ({ onAddFile }) => {
    const [prompt, setPrompt] = useState('');
    const [generatedContent, setGeneratedContent] = useState<string | GeneratedImage | null>(null);
    const [contentType, setContentType] = useState<'preset' | 'image' | 'text' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generationType, setGenerationType] = useState('');

    const handleGenerate = async (type: 'preset' | 'image' | 'background' | 'transition') => {
        if (!prompt) return;
        setIsLoading(true);
        setError('');
        setGeneratedContent(null);
        setGenerationType(type);
        
        try {
            if (type === 'preset') {
                setContentType('preset');
                const preset: Preset = await generatePreset(prompt);
                setGeneratedContent(JSON.stringify(preset, null, 2));
            } else if (type === 'image') {
                setContentType('image');
                const image: GeneratedImage = await generateImage(prompt);
                setGeneratedContent(image);
            } else if (type === 'background') {
                 setContentType('text');
                 const text = await generateText(`Generate a creative concept for a dynamic 3D visualizer background based on the theme: "${prompt}". Describe the visuals, colors, and motion.`);
                 setGeneratedContent(text);
            } else if (type === 'transition') {
                setContentType('text');
                const text = await generateText(`Generate a creative concept for a 3D "portal" transition effect based on the theme: "${prompt}". Describe the visual journey.`);
                setGeneratedContent(text);
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddContentToLibrary = () => {
        if (!generatedContent || !contentType) return;
        let file: FileItem | null = null;
        if (contentType === 'preset' && typeof generatedContent === 'string') {
            const presetData = JSON.parse(generatedContent);
            file = { name: `${presetData.name.replace(/\s+/g, '-')}.json`, folder: 'Presets', content: generatedContent };
        } else if (contentType === 'image' && typeof generatedContent === 'object') {
            file = { name: `${prompt.substring(0, 20).replace(/\s+/g, '-')}-${Date.now()}.png`, folder: 'Images', content: (generatedContent as GeneratedImage).imageBytes };
        }
        if (file) {
            onAddFile(file);
            setGeneratedContent(null);
            setContentType(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="ai-prompt" className="block text-sm font-medium text-slate-300 mb-2">Your Creative Prompt</label>
                <textarea 
                    id="ai-prompt"
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A liquid chrome cube in a purple nebula"
                    className="block w-full bg-slate-900/50 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-purple focus:border-brand-purple"
                />
            </div>
            <div className="flex flex-wrap gap-4">
                <button onClick={() => handleGenerate('preset')} disabled={isLoading} className="px-4 py-2 bg-brand-purple/80 text-white font-bold rounded-md hover:bg-brand-purple disabled:bg-slate-600">Generate 3D Preset</button>
                <button onClick={() => handleGenerate('image')} disabled={isLoading} className="px-4 py-2 bg-brand-blue/80 text-white font-bold rounded-md hover:bg-brand-blue disabled:bg-slate-600">Generate Image</button>
                <button onClick={() => handleGenerate('background')} disabled={isLoading} className="px-4 py-2 bg-green-600/80 text-white font-bold rounded-md hover:bg-green-600 disabled:bg-slate-600">Generate Background Idea</button>
                <button onClick={() => handleGenerate('transition')} disabled={isLoading} className="px-4 py-2 bg-orange-500/80 text-white font-bold rounded-md hover:bg-orange-500 disabled:bg-slate-600">Generate Transition Idea</button>
            </div>
            
            {isLoading && <div className="flex items-center gap-2 text-slate-400"><div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>AI is thinking...</div>}
            {error && <p className="text-brand-red p-4 bg-brand-red/10 rounded-md">Error: {error}</p>}

            {generatedContent && (
                <div className="mt-6 p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                    <h3 className="text-lg font-semibold title-3d-light mb-4">Generated Content ({generationType})</h3>
                    {contentType === 'preset' && typeof generatedContent === 'string' && <pre className="p-4 bg-slate-900/80 rounded-md overflow-x-auto text-sm">{generatedContent}</pre>}
                    {contentType === 'image' && typeof generatedContent === 'object' && <img src={`data:${generatedContent.mimeType};base64,${generatedContent.imageBytes}`} alt="Generated by AI" className="rounded-md max-w-sm"/>}
                    {contentType === 'text' && typeof generatedContent === 'string' && <p className="p-4 bg-slate-900/80 rounded-md whitespace-pre-wrap">{generatedContent}</p>}
                    
                    {(contentType === 'preset' || contentType === 'image') && (
                        <button onClick={handleAddContentToLibrary} className="mt-4 px-4 py-2 bg-green-600/80 text-white font-bold rounded-md hover:bg-green-600">Add to Library</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default AiAssistantTab;
