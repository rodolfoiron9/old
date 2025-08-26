
import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Track, Preset, ProjectState } from './types';
import { SpotifyIcon, AppleMusicIcon, YoutubeIcon, InstagramIcon, TiktokIcon } from './constants';
import { AudioVisualizer } from './components/AudioVisualizer';
import ParticleBackground from './components/ParticleBackground';
import Header from './components/Header';
import Bio from './pages/Bio';
import Blog from './pages/Blog';
import Albums from './pages/Albums';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Title3D from './components/Title3D';
import { Portal } from './components/PortalTransition';
import Login from './components/Login';
import { remixPreset } from './lib/gemini';
import { loadProjectStateFromFirestore, defaultProjectState } from './lib/settingsManager';


type Page = 'home' | 'bio' | 'blog' | 'albums' | 'contact' | 'admin';
type AppState = 'viewing' | 'portal' | 'visualizer';

interface HeroProps {
  onPlayRandom: () => void;
}

const Hero: React.FC<HeroProps> = ({ onPlayRandom }) => {
    const title = "Old Habit";
    return (
        <div className="h-screen flex flex-col items-center justify-center text-center p-4 relative pt-16">
            <div className="absolute inset-0 bg-grid opacity-10"></div>
            <div 
                className="absolute top-1/2 left-1/2 w-96 h-96 bg-brand-purple rounded-full mix-blend-screen filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2 animate-pulse"
            ></div>
            <Title3D as="h1" className="text-5xl md:text-8xl tracking-tighter uppercase">
                 {title.split('').map((char, index) => (
                    <span key={index} className="inline-block animate-explode-in" style={{ animationDelay: `${0.2 + index * 0.05}s`}}>
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                 ))}
            </Title3D>
            <h2 className="text-xl md:text-3xl font-light text-slate-300 mt-4 animate-fade-in title-3d-light" style={{ animationDelay: '0.8s' }}>
              The new Drum & Bass album by <span className="font-bold text-white">Rudybtz</span>
            </h2>
            <div className="mt-8 animate-fade-in" style={{ animationDelay: '1s' }}>
               <button onClick={onPlayRandom} className="px-8 py-3 bg-brand-purple/80 text-white font-bold rounded-full hover:bg-brand-purple transition-all transform hover:scale-105 drop-shadow-glow-purple">
                Listen Now
               </button>
            </div>
        </div>
    );
};

const About: React.FC = () => (
    <div id="about" className="py-20 px-4 max-w-4xl mx-auto text-center">
        <Title3D as="h3" className="text-3xl tracking-tight mb-4" variant="light">A Raw, High-Velocity Fusion</Title3D>
        <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
        “Old Habit” is a raw, high-velocity fusion of DnB energy and real-life storytelling. Rudybtz takes the listener through his journey of growth and release — breaking free from cycles and dropping nothing but fire.
        </p>
        <blockquote className="border-l-4 border-brand-red p-4 bg-white/5 rounded-r-lg max-w-xl mx-auto">
            <p className="text-xl italic">“This album is everything I had to leave behind… and everything I’m becoming.”</p>
            <cite className="block text-right mt-2 not-italic text-slate-400">- Rudybtz</cite>
        </blockquote>
    </div>
);

interface TracklistProps {
  tracks: Track[];
  onPlayTrack: (track: Track) => void;
}

const Tracklist: React.FC<TracklistProps> = ({ tracks, onPlayTrack }) => (
    <div id="listen" className="py-20 px-4 max-w-5xl mx-auto">
        <Title3D as="h3" className="text-4xl tracking-tight mb-12" variant="light">Track Previews</Title3D>
        <div className="space-y-4">
            {tracks.map(track => (
                <div key={track.id} className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-800 hover:bg-slate-800/50 transition-colors group">
                    <img src={track.cover} alt={track.title} className="w-20 h-20 rounded-md object-cover" />
                    <div className="flex-grow">
                        <h4 className="text-xl font-bold text-white title-3d-light">{track.title}</h4>
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

const Socials: React.FC = () => {
    const socialLinks = [
        { Icon: SpotifyIcon, href: "#" },
        { Icon: AppleMusicIcon, href: "#" },
        { Icon: YoutubeIcon, href: "#" },
        { Icon: InstagramIcon, href: "#" },
        { Icon: TiktokIcon, href: "#" },
    ];
    return (
        <div id="contact" className="py-20 px-4 text-center">
            <Title3D as="h3" className="text-3xl tracking-tight mb-6" variant="light">Follow Rudybtz</Title3D>
            <div className="flex justify-center gap-6">
                {socialLinks.map(({ Icon, href }, index) => (
                    <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white hover:drop-shadow-glow-blue transition-all link-3d-hover">
                        <Icon className="w-8 h-8" />
                    </a>
                ))}
            </div>
        </div>
    );
};

interface FooterProps {
    onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => (
    <footer className="py-8 px-4 text-center text-slate-500 border-t border-slate-800">
        <nav className="flex justify-center gap-6 md:gap-8 mb-6">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('bio'); }} className="text-slate-400 hover:text-white transition-colors link-3d-hover">Bio</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('blog'); }} className="text-slate-400 hover:text-white transition-colors link-3d-hover">Blog</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('albums'); }} className="text-slate-400 hover:text-white transition-colors link-3d-hover">Albums</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }} className="text-slate-400 hover:text-white transition-colors link-3d-hover">Contact</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('admin'); }} className="text-slate-400 hover:text-white transition-colors link-3d-hover">Admin</a>
        </nav>
        <p>&copy; {new Date().getFullYear()} Rudybtz. All rights reserved.</p>
        <p className="text-sm mt-2">Booking & Press: contact@rudybtz.com</p>
    </footer>
);

interface HomePageProps {
    tracks: Track[];
    onPlayRandom: () => void;
    onPlayTrack: (track: Track) => void;
}

const HomePage: React.FC<HomePageProps> = ({ tracks, onPlayRandom, onPlayTrack }) => (
  <>
    <Hero onPlayRandom={onPlayRandom} />
    <About />
    <Tracklist tracks={tracks} onPlayTrack={onPlayTrack} />
    <Socials />
  </>
);

export default function App() {
  const [projectState, setProjectState] = useState<ProjectState>(defaultProjectState);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [activePreset, setActivePreset] = useState<Preset>(defaultProjectState.presets[0]);
  const [appState, setAppState] = useState<AppState>('viewing');
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoading, setIsLoading] = useState(true);
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Load data from Firestore on initial mount
    const loadData = async () => {
      setIsLoading(true);
      const state = await loadProjectStateFromFirestore();
      setProjectState(state);
      setActivePreset(state.presets[0]);
      setIsLoading(false);
    };
    loadData();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  const handleSetProjectState = (newState: ProjectState) => {
      setProjectState(newState);
      // Also update active preset if the list changes
      if (!newState.presets.find(p => p.id === activePreset.id)) {
          setActivePreset(newState.presets[0]);
      }
  }

  const handlePlayTrack = (track: Track) => {
    setActiveTrack(track);
    setAppState('portal');
  };
  
  const handlePlayRandomTrack = () => {
    const tracks = projectState.tracks;
    if(tracks.length === 0) return;
    const randomIndex = Math.floor(Math.random() * tracks.length);
    const randomTrack = tracks[randomIndex];
    handlePlayTrack(randomTrack);
  };

  const handleCloseVisualizer = () => {
    setAppState('viewing');
    setActiveTrack(null);
  };
  
  const handleNextTrack = () => {
    if(!activeTrack) return;
    const tracks = projectState.tracks;
    const currentIndex = tracks.findIndex(t => t.id === activeTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setActiveTrack(tracks[nextIndex]);
  }

  const handlePortalComplete = () => {
    setAppState('visualizer');
  }

  const handleRemixVisuals = async () => {
      if (!activeTrack) return;
      try {
          const newPreset = await remixPreset(activePreset, activeTrack.description);
          setActivePreset(newPreset);
      } catch (error) {
          console.error("Failed to remix visuals:", error);
      }
  };
  
  if (!authChecked || isLoading) {
      return (
          <div className="bg-brand-bg h-screen flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
  }

  const renderPage = () => {
    if (currentPage === 'admin') {
      if (user) {
        return <Admin projectState={projectState} setProjectState={handleSetProjectState} />;
      } else {
        return <Login onLoginSuccess={() => setUser(auth.currentUser)} />;
      }
    }
    
    switch (currentPage) {
      case 'bio':
        return <Bio />;
      case 'blog':
        return <Blog posts={projectState.blogPosts} />;
      case 'albums':
        return <Albums tracks={projectState.tracks} onPlayTrack={handlePlayTrack} />;
      case 'contact':
        return <Contact />;
      case 'home':
      default:
        return <HomePage tracks={projectState.tracks} onPlayRandom={handlePlayRandomTrack} onPlayTrack={handlePlayTrack} />;
    }
  };

  return (
    <div className="bg-brand-bg text-slate-200 font-sans isolate">
      <ParticleBackground />
      <div className={appState !== 'viewing' ? 'blur-sm pointer-events-none' : ''}>
        <Header onNavigate={setCurrentPage} currentPage={currentPage} />
        <main>
          {renderPage()}
        </main>
        <Footer onNavigate={setCurrentPage} />
      </div>

      {appState === 'portal' && <Portal onCompleted={handlePortalComplete} />}

      {appState === 'visualizer' && activeTrack && (
         <AudioVisualizer
            track={activeTrack}
            preset={activePreset}
            onPresetChange={setActivePreset}
            onClose={handleCloseVisualizer}
            onNext={handleNextTrack}
            onRemix={handleRemixVisuals}
          />
      )}
    </div>
  );
}
