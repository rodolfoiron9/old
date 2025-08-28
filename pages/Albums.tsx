
import React from 'react';
import { Track } from '../types';
import Title3D from '../components/Title3D.tsx';

interface AlbumsProps {
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
}

const Albums: React.FC<AlbumsProps> = ({ tracks, onPlayTrack }) => {
  // Assuming all tracks are from the same album for the main title
  const albumTitle = "Old Habit";

  return (
    <div className="pt-24 pb-12 animate-fade-in">
        <div className="max-w-6xl mx-auto px-4">
            <Title3D className="text-5xl tracking-tight mb-4">{albumTitle}</Title3D>
            <p className="text-slate-400 text-lg text-center mb-12">Click a track to experience it in the 3D visualizer.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {tracks.map(track => (
                    <div 
                        key={track.id} 
                        className="group aspect-square relative overflow-hidden rounded-lg border border-slate-800 shadow-lg shadow-black/30 cursor-pointer"
                        onClick={() => onPlayTrack(track)}
                        aria-label={`Play ${track.title}`}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => { if (e.key === 'Enter') onPlayTrack(track) }}
                    >
                        <img 
                            src={track.cover} 
                            alt={track.title} 
                            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300"></div>
                        
                        <div className="absolute bottom-0 left-0 p-5 w-full">
                            <h4 className="text-2xl font-bold text-white transition-transform duration-300 translate-y-2 group-hover:translate-y-0">{track.title}</h4>
                            <p className="text-slate-300 text-sm mt-1 truncate opacity-0 transition-opacity duration-300 group-hover:opacity-100">{track.description}</p>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
                             <div className="w-20 h-20 bg-brand-purple/70 backdrop-blur-sm text-white rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 ease-out">
                                <svg className="w-10 h-10 ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default Albums;
