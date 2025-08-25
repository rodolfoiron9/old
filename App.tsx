import React, { useState } from 'react';
import { Track, Preset } from './types';
import { TRACKS, PRESETS, SpotifyIcon, AppleMusicIcon, YoutubeIcon, InstagramIcon, TiktokIcon } from './constants';
import { AudioVisualizer } from './components/AudioVisualizer';
import ParticleBackground from './components/ParticleBackground';

const Hero = () => (
  <div className="h-screen flex flex-col items-center justify-center text-center p-4 relative -mt-16">
    <div className="absolute inset-0 bg-grid opacity-10"></div>
    <div 
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-brand-purple rounded-full mix-blend-screen filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2 animate-pulse"
    ></div>
    <h1 className="text-5xl md:text-8xl font-bold tracking-tighter uppercase drop-shadow-glow-purple animate-fade-in" style={{ animationDelay: '0.2s' }}>
      Old Habbit Behind
    </h1>
    <h2 className="text-xl md:text-3xl font-light text-slate-300 mt-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
      The new Drum & Bass album by <span className="font-bold text-white">Rudybtz</span>
    </h2>
    <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
       <a href="#listen" className="px-8 py-3 bg-brand-purple/80 text-white font-bold rounded-full hover:bg-brand-purple transition-all transform hover:scale-105 drop-shadow-glow-purple">
        Listen Now
       </a>
    </div>
  </div>
);

const About = () => (
    <div id="about" className="py-20 px-4 max-w-4xl mx-auto text-center">
        <h3 className="text-3xl font-bold tracking-tight mb-4">A Raw, High-Velocity Fusion</h3>
        <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
        “Old Habbit Behind” is a raw, high-velocity fusion of DnB energy and real-life storytelling. Rudybtz takes the listener through his journey of growth and release — breaking free from cycles and dropping nothing but fire.
        </p>
        <blockquote className="border-l-4 border-brand-red p-4 bg-white/5 rounded-r-lg max-w-xl mx-auto">
            <p className="text-xl italic">“This album is everything I had to leave behind… and everything I’m becoming.”</p>
            <cite className="block text-right mt-2 not-italic text-slate-400">- Rudybtz</cite>
        </blockquote>
    </div>
);

interface TracklistProps {
  onPlayTrack: (track: Track) => void;
}

const Tracklist: React.FC<TracklistProps> = ({ onPlayTrack }) => (
    <div id="listen" className="py-20 px-4 max-w-5xl mx-auto">
        <h3 className="text-4xl font-bold tracking-tight text-center mb-12">Track Previews</h3>
        <div className="space-y-4">
            {TRACKS.map(track => (
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
);

const Socials = () => {
    const socialLinks = [
        { Icon: SpotifyIcon, href: "#" },
        { Icon: AppleMusicIcon, href: "#" },
        { Icon: YoutubeIcon, href: "#" },
        { Icon: InstagramIcon, href: "#" },
        { Icon: TiktokIcon, href: "#" },
    ];
    return (
        <div className="py-20 px-4 text-center">
            <h3 className="text-3xl font-bold tracking-tight mb-6">Follow Rudybtz</h3>
            <div className="flex justify-center gap-6">
                {socialLinks.map(({ Icon, href }, index) => (
                    <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white hover:drop-shadow-glow-blue transition-all">
                        <Icon className="w-8 h-8" />
                    </a>
                ))}
            </div>
        </div>
    );
};

const Footer = () => (
    <footer className="py-8 px-4 text-center text-slate-500 border-t border-slate-800">
        <p>&copy; {new Date().getFullYear()} Rudybtz. All rights reserved.</p>
        <p className="text-sm mt-2">Booking & Press: contact@rudybtz.com</p>
    </footer>
);


export default function App() {
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [activePreset, setActivePreset] = useState<Preset>(PRESETS[0]);

  const handlePlayTrack = (track: Track) => {
    setActiveTrack(track);
  };

  const handleCloseVisualizer = () => {
    setActiveTrack(null);
  };

  return (
    <div className="bg-brand-bg text-slate-200 font-sans isolate">
      <ParticleBackground />
      <main className={activeTrack ? 'blur-sm' : ''}>
        <Hero />
        <About />
        <Tracklist onPlayTrack={handlePlayTrack} />
        <Socials />
        <Footer />
      </main>

      {activeTrack && (
         <AudioVisualizer
            track={activeTrack}
            preset={activePreset}
            onPresetChange={setActivePreset}
            onClose={handleCloseVisualizer}
          />
      )}
    </div>
  );
}
