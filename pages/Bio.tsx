import React from 'react';
import Title3D from '../components/Title3D.tsx';

const Bio: React.FC = () => {
  return (
    <div className="pt-24 pb-12 animate-fade-in">
      <div className="max-w-5xl mx-auto px-4">
        <Title3D className="text-5xl tracking-tight mb-12">The Architect of Sound</Title3D>
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-start">
          <div className="md:col-span-1">
            <img 
              src="https://picsum.photos/seed/rudybtz/800/1200" 
              alt="Rudybtz"
              className="rounded-lg object-cover w-full h-full shadow-lg shadow-brand-purple/20"
            />
          </div>
          <div className="md:col-span-2 space-y-6 text-slate-300 text-lg leading-relaxed">
            <p>
              Rudybtz is not just a producer; he is an architect of sound, meticulously crafting sonic landscapes that blur the line between raw energy and intricate emotion. Emerging from the depths of the underground electronic scene, his signature style is a high-velocity collision of relentless breakbeats, guttural basslines, and hauntingly melodic undertones.
            </p>
            <h2 className="text-3xl font-bold text-white pt-4 border-t border-slate-800">Forged in the Underground</h2>
            <p>
              His journey began not in a polished studio, but in the sweaty, bass-filled confines of warehouse raves and clandestine parties. It was there, amidst the pulse of the collective, that Rudybtz honed his craft, learning to speak the language of the dance floor. This raw, visceral education is etched into every track he produces, creating music that is felt as much as it is heard.
            </p>
            <h2 className="text-3xl font-bold text-white pt-4 border-t border-slate-800">The 'Old Habit' Philosophy</h2>
            <p>
              The debut album, "Old Habit," is the culmination of this journey. It's a sonic diary—a testament to the process of shedding old skins and breaking destructive cycles. Each track serves as a chapter, exploring themes of introspection, confrontation, and ultimate catharsis. For Rudybtz, "Old Habit" is more than an album; it’s a statement of intent, a declaration of evolution, and an invitation for listeners to embark on their own journey of release.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bio;