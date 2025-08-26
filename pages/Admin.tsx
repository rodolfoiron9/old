
import React, { useState } from 'react';
import Title3D from '../components/Title3D';
import { FileItem, ProjectState, BlogPost, Preset, Track } from '../types';

// Import tab components from the new admin sub-directory
import StatisticsTab from './admin/StatisticsTab';
import UploadManagerTab from './admin/UploadManagerTab';
import AiAssistantTab from './admin/AiAssistantTab';
import BlogPostTab from './admin/BlogPostTab';
import CubeSettingsTab from './admin/CubeSettingsTab';
import LyricsSettingsTab from './admin/LyricsSettingsTab';
import ProjectSettingsTab from './admin/ProjectSettingsTab';
import FirebaseAgentTab from './admin/FirebaseAgentTab';

interface AdminProps {
    projectState: ProjectState;
    setProjectState: (state: ProjectState) => void;
}

const Admin: React.FC<AdminProps> = ({ projectState, setProjectState }) => {
  const [activeTab, setActiveTab] = useState('Statistics');
  
  // State management for mock upload manager
  const [files, setFiles] = useState<FileItem[]>([
      {name: 'cycle-cut.wav', folder: 'Music'},
      {name: 'mirror-break_master.mp3', folder: 'Music'},
      {name: 'album-art-v1.png', folder: 'Images'},
      {name: 'quantum-mirage.json', folder: 'Presets'},
  ]);

  const tabs = ['Statistics', 'Blog Posts', 'Cube Settings', 'Lyrics Editor', 'Upload Manager', 'AI Assistant', 'Firebase AI Agent', 'Project Settings'];

  const addFile = (file: FileItem) => {
      setFiles(prevFiles => [...prevFiles, file]);
  };

  const handleBlogPostsChange = (newPostsAction: React.SetStateAction<BlogPost[]>) => {
      const newPosts = typeof newPostsAction === 'function' ? newPostsAction(projectState.blogPosts) : newPostsAction;
      setProjectState({ ...projectState, blogPosts: newPosts });
  };

  const handlePresetsChange = (newPresetsAction: React.SetStateAction<Preset[]>) => {
      const newPresets = typeof newPresetsAction === 'function' ? newPresetsAction(projectState.presets) : newPresetsAction;
      setProjectState({ ...projectState, presets: newPresets });
  };

  const handleTracksChange = (newTracksAction: React.SetStateAction<Track[]>) => {
      const newTracks = typeof newTracksAction === 'function' ? newTracksAction(projectState.tracks) : newTracksAction;
      setProjectState({ ...projectState, tracks: newTracks });
  };


  const renderActiveTab = () => {
    switch (activeTab) {
        case 'Statistics':
            return <StatisticsTab />;
        case 'Blog Posts':
            return <BlogPostTab posts={projectState.blogPosts} setPosts={handleBlogPostsChange} />;
        case 'Cube Settings':
            return <CubeSettingsTab presets={projectState.presets} setPresets={handlePresetsChange} />;
        case 'Lyrics Editor':
            return <LyricsSettingsTab tracks={projectState.tracks} setTracks={handleTracksChange} />;
        case 'Upload Manager':
            return <UploadManagerTab files={files} />;
        case 'AI Assistant':
            return <AiAssistantTab onAddFile={addFile} />;
        case 'Firebase AI Agent':
            return <FirebaseAgentTab />;
        case 'Project Settings':
            return <ProjectSettingsTab projectState={projectState} setProjectState={setProjectState} />;
        default:
            return <StatisticsTab />;
    }
  }

  return (
    <div className="pt-24 pb-12 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4">
        <Title3D className="text-5xl tracking-tight mb-4">Admin Dashboard</Title3D>
        <div className="mb-8 border-b border-slate-800">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
                {tabs.map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                            activeTab === tab 
                            ? 'border-brand-purple text-brand-purple'
                            : 'border-transparent text-slate-400 hover:text-white hover:border-slate-500'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
        </div>
        
        <div className="min-h-[500px]">
            {renderActiveTab()}
        </div>

      </div>
    </div>
  );
};

export default Admin;
