
import React from 'react';
import { Track } from '../types';
import Title3D from '../components/Title3D.tsx';

interface AlbumsProps {
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
}

const Albums: React.FC<AlbumsProps> = ({ tracks, onPlayTrack }) => {
  return (
    <div className="pt-24 pb-12 animate-fade-in">
        <div className="max-w-5xl mx-auto px-4">
            <Title3D className="text-5xl tracking-tight mb-4">Old Habit</Title3D>
            <p className="text-slate-400 text-lg text-center mb-12">The debut album. Available on all platforms.</p>
            <div className="space-y-4">
                {tracks.map(track => (
                    <div key={track.id} className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-800 hover:bg-slate-800/50 transition-colors group">
                        <img src={track.cover} alt={track.title} className="w-20 h-20 rounded-md object-cover" />
                        <div className="flex-grow">
                            <h4 className="text-xl font-bold text-white">{track.title}</h4>
                            <p className="text-slate-400">{track.description}</p>
                        </div>
                        <button onClick={() => onPlayTrack(track)} className="w-16 h-16 bg-brand-purple/80 text-white rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform hover:bg-brand-purple">
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default Albums;
