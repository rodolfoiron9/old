
import React, { useState } from 'react';
import { ProjectState } from '../../types';
import { saveProjectStateToFirestore, loadProjectStateFromFirestore, defaultProjectState } from '../../lib/settingsManager';

interface ProjectSettingsTabProps {
    projectState: ProjectState;
    setProjectState: (state: ProjectState) => void;
}

const ProjectSettingsTab: React.FC<ProjectSettingsTabProps> = ({ projectState, setProjectState }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSave = async () => {
        setIsLoading(true);
        setMessage('');
        try {
            await saveProjectStateToFirestore(projectState);
            setMessage('Settings saved successfully to the cloud!');
        } catch (error: any) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoad = async () => {
        setIsLoading(true);
        setMessage('');
        try {
            const state = await loadProjectStateFromFirestore();
            setProjectState(state);
            setMessage('Settings loaded successfully from the cloud!');
        } catch (error: any) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        if(window.confirm("Are you sure you want to reset all settings to their default state? This will overwrite your current edits.")) {
            setProjectState(defaultProjectState);
            setMessage('Project has been reset to default settings. Click "Save to Firebase" to persist this change.');
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-slate-900/50 rounded-lg border border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-6 title-3d-light">Cloud Sync</h2>
            <p className="text-slate-400 mb-6">
                Save your project's entire state (presets, blog posts, etc.) to the Firebase cloud, or load the latest version.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={handleSave} disabled={isLoading} className="flex-1 px-4 py-3 bg-brand-blue/80 text-white font-bold rounded-md hover:bg-brand-blue disabled:opacity-50">
                    {isLoading ? 'Saving...' : 'Save to Firebase'}
                </button>
                <button onClick={handleLoad} disabled={isLoading} className="flex-1 px-4 py-3 bg-green-600/80 text-white font-bold rounded-md hover:bg-green-600 disabled:opacity-50">
                    {isLoading ? 'Loading...' : 'Load from Firebase'}
                </button>
                 <button onClick={handleReset} disabled={isLoading} className="flex-1 px-4 py-3 bg-brand-red/80 text-white font-bold rounded-md hover:bg-brand-red disabled:opacity-50">
                    Reset to Default
                </button>
            </div>
            {message && <p className="mt-4 text-center text-sm">{message}</p>}
        </div>
    );
};

export default ProjectSettingsTab;
