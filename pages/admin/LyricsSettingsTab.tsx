
import React, { useState, useRef, useEffect } from 'react';
import { Track, Lyric } from '../../types';

interface LyricsSettingsTabProps {
    tracks: Track[];
    setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
}

const LyricsSettingsTab: React.FC<LyricsSettingsTabProps> = ({ tracks, setTracks }) => {
    const [selectedTrackId, setSelectedTrackId] = useState<number>(tracks.length > 0 ? tracks[0].id : -1);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);

    const selectedTrack = tracks.find(t => t.id === selectedTrackId);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
        setIsPlaying(false);
        setCurrentTime(0);
    }, [selectedTrackId]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const timeUpdateHandler = () => setCurrentTime(audio.currentTime);
        const playHandler = () => setIsPlaying(true);
        const pauseHandler = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', timeUpdateHandler);
        audio.addEventListener('play', playHandler);
        audio.addEventListener('pause', pauseHandler);
        audio.addEventListener('ended', pauseHandler);

        return () => {
            audio.removeEventListener('timeupdate', timeUpdateHandler);
            audio.removeEventListener('play', playHandler);
            audio.removeEventListener('pause', pauseHandler);
            audio.removeEventListener('ended', pauseHandler);
        };
    }, [audioRef.current]);

    const handlePlayPause = () => {
        const audio = audioRef.current;
        if (audio) {
            if (isPlaying) audio.pause();
            else audio.play();
        }
    };
    
    if (!selectedTrack) {
        return <p>No tracks available. Please add a track first.</p>;
    }

    const handleLyricChange = (index: number, field: keyof Lyric, value: string | number) => {
        const newLyrics = [...selectedTrack.lyrics];
        newLyrics[index] = { ...newLyrics[index], [field]: value };
        
        const newTrack = { ...selectedTrack, lyrics: newLyrics.sort((a, b) => a.time - b.time) }; // Keep lyrics sorted by time
        setTracks(tracks.map(t => t.id === selectedTrackId ? newTrack : t));
    };

    const addLyric = () => {
        const lastTime = selectedTrack.lyrics[selectedTrack.lyrics.length - 1]?.time || 0;
        const newLyrics = [...selectedTrack.lyrics, { time: parseFloat((lastTime + 1).toFixed(2)), word: "new" }];
        const newTrack = { ...selectedTrack, lyrics: newLyrics };
        setTracks(tracks.map(t => t.id === selectedTrackId ? newTrack : t));
    };
    
    const removeLyric = (index: number) => {
        const newLyrics = selectedTrack.lyrics.filter((_, i) => i !== index);
        const newTrack = { ...selectedTrack, lyrics: newLyrics };
        setTracks(tracks.map(t => t.id === selectedTrackId ? newTrack : t));
    };

    const handleSync = (index: number) => {
        if (audioRef.current) {
            handleLyricChange(index, 'time', parseFloat(audioRef.current.currentTime.toFixed(2)));
        }
    };

    return (
        <div>
            <div className="mb-6">
                <label htmlFor="track-select" className="block text-sm font-medium text-slate-300">Select Track</label>
                <select id="track-select" value={selectedTrackId} onChange={e => setSelectedTrackId(Number(e.target.value))} className="mt-1 block w-full md:w-1/3 bg-slate-900/50 border border-slate-700 rounded-md py-2 px-3 text-white">
                    {tracks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
            </div>

            <div className="p-4 mb-6 bg-slate-900/50 border border-slate-800 rounded-lg sticky top-16 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={handlePlayPause} className="px-4 py-2 w-20 text-center bg-brand-purple/80 text-white font-bold rounded-md hover:bg-brand-purple transition-colors">
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <div className="font-mono text-lg text-white">{currentTime.toFixed(2)}s</div>
                </div>
                <audio ref={audioRef} src={selectedTrack.audioSrc} crossOrigin="anonymous" className="hidden" />
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {selectedTrack.lyrics.map((lyric, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-slate-900/50 rounded-md">
                        <button onClick={() => handleSync(index)} className="px-3 py-1 text-sm bg-brand-blue/80 rounded hover:bg-brand-blue" title="Sync to current audio time">Sync</button>
                        <input 
                            type="number"
                            value={lyric.time}
                            onChange={e => handleLyricChange(index, 'time', Number(e.target.value))}
                            className="w-24 bg-slate-800 rounded p-2 text-center"
                            step="0.01"
                            aria-label="Timestamp"
                        />
                        <input 
                            type="text"
                            value={lyric.word}
                            onChange={e => handleLyricChange(index, 'word', e.target.value)}
                            className="flex-grow bg-slate-800 rounded p-2"
                             aria-label="Lyric word"
                        />
                        <button onClick={() => removeLyric(index)} className="px-3 py-1 text-lg leading-none bg-brand-red/80 rounded hover:bg-brand-red" title="Remove lyric">&times;</button>
                    </div>
                ))}
            </div>
            <button onClick={addLyric} className="mt-4 px-4 py-2 bg-brand-purple/80 text-white font-bold rounded-md hover:bg-brand-purple">Add Lyric</button>
        </div>
    );
};

export default LyricsSettingsTab;
