import React, { useState } from 'react';
import { Track, Lyric } from '../../types';

interface LyricsSettingsTabProps {
    tracks: Track[];
    setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
}

const LyricsSettingsTab: React.FC<LyricsSettingsTabProps> = ({ tracks, setTracks }) => {
    const [selectedTrackId, setSelectedTrackId] = useState<number>(tracks[0].id);
    
    const selectedTrack = tracks.find(t => t.id === selectedTrackId)!;

    const handleLyricChange = (index: number, field: keyof Lyric, value: string | number) => {
        const newLyrics = [...selectedTrack.lyrics];
        newLyrics[index] = { ...newLyrics[index], [field]: value };
        
        const newTrack = { ...selectedTrack, lyrics: newLyrics };
        setTracks(tracks.map(t => t.id === selectedTrackId ? newTrack : t));
    };

    const addLyric = () => {
        const lastTime = selectedTrack.lyrics[selectedTrack.lyrics.length - 1]?.time || 0;
        const newLyrics = [...selectedTrack.lyrics, { time: lastTime + 1, word: "new" }];
        const newTrack = { ...selectedTrack, lyrics: newLyrics };
        setTracks(tracks.map(t => t.id === selectedTrackId ? newTrack : t));
    };
    
    const removeLyric = (index: number) => {
        const newLyrics = selectedTrack.lyrics.filter((_, i) => i !== index);
        const newTrack = { ...selectedTrack, lyrics: newLyrics };
        setTracks(tracks.map(t => t.id === selectedTrackId ? newTrack : t));
    }

    return (
        <div>
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300">Select Track</label>
                <select value={selectedTrackId} onChange={e => setSelectedTrackId(Number(e.target.value))} className="mt-1 block w-full md:w-1/3 bg-slate-900/50 border border-slate-700 rounded-md py-2 px-3 text-white">
                    {tracks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {selectedTrack.lyrics.map((lyric, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-slate-900/50 rounded-md">
                        <input 
                            type="number"
                            value={lyric.time}
                            onChange={e => handleLyricChange(index, 'time', Number(e.target.value))}
                            className="w-20 bg-slate-800 rounded p-1 text-center"
                            step="0.1"
                        />
                        <input 
                            type="text"
                            value={lyric.word}
                            onChange={e => handleLyricChange(index, 'word', e.target.value)}
                            className="flex-grow bg-slate-800 rounded p-1"
                        />
                        <button onClick={() => removeLyric(index)} className="px-2 py-1 text-sm bg-brand-red/80 rounded hover:bg-brand-red">&times;</button>
                    </div>
                ))}
            </div>
            <button onClick={addLyric} className="mt-4 px-4 py-2 bg-brand-purple/80 text-white font-bold rounded-md hover:bg-brand-purple">Add Lyric</button>
        </div>
    );
};

export default LyricsSettingsTab;
