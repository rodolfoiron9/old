import React, { useState } from 'react';
import { FileItem } from '../../types';

interface UploadManagerTabProps {
    files: FileItem[];
}

const UploadManagerTab: React.FC<UploadManagerTabProps> = ({ files }) => {
    const folders: FileItem['folder'][] = ['Music', 'Images', '3D Files', 'Presets'];
    const [currentFolder, setCurrentFolder] = useState<FileItem['folder']>('Music');

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/4">
                <h3 className="text-lg font-semibold mb-4 title-3d-light">Folders</h3>
                <ul className="space-y-2">
                    {folders.map(folder => (
                        <li key={folder}>
                            <button 
                                onClick={() => setCurrentFolder(folder)}
                                className={`w-full text-left px-3 py-2 rounded-md ${currentFolder === folder ? 'bg-brand-purple/20 text-white' : 'hover:bg-white/5'}`}
                            >
                                {folder}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="w-full md:w-3/4 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-semibold title-3d-light">{currentFolder}</h3>
                     <button className="px-3 py-1 bg-brand-purple/80 text-white font-bold rounded-md text-sm hover:bg-brand-purple">Upload File</button>
                 </div>
                 <ul className="space-y-2 max-h-96 overflow-y-auto">
                    {files.filter(f => f.folder === currentFolder).map(file => (
                        <li key={file.name} className="p-2 bg-slate-800/50 rounded-md truncate">{file.name}</li>
                    ))}
                 </ul>
                 {files.filter(f => f.folder === currentFolder).length === 0 && (
                    <p className="text-slate-500 text-center py-8">No files in this folder.</p>
                 )}
            </div>
        </div>
    );
}

export default UploadManagerTab;
