import React, { useState } from 'react';
import { SpotifyIcon, AppleMusicIcon, YoutubeIcon, InstagramIcon, TiktokIcon } from '../constants';
import Title3D from '../components/Title3D.tsx';

const Socials = () => {
    const socialLinks = [
        { Icon: SpotifyIcon, href: "#" },
        { Icon: AppleMusicIcon, href: "#" },
        { Icon: YoutubeIcon, href: "#" },
        { Icon: InstagramIcon, href: "#" },
        { Icon: TiktokIcon, href: "#" },
    ];
    return (
        <div className="py-10 text-center">
            <h3 className="text-2xl font-bold tracking-tight mb-6">Connect on Social</h3>
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

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // In a real app, you'd send this to a server.
    // For now, we'll just show a success message.
    setSubmitted(true);
  };

  return (
    <div className="pt-24 pb-12 animate-fade-in">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <Title3D className="text-5xl tracking-tight mb-4">Get In Touch</Title3D>
        <p className="text-slate-400 text-lg mb-12">For booking, press, or other inquiries, use the form below.</p>
        
        {submitted ? (
          <div className="p-8 bg-slate-900/50 rounded-lg border border-brand-purple">
            <h2 className="text-2xl font-bold text-white">Thank You!</h2>
            <p className="text-slate-300 mt-2">Your message has been sent. We'll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300">Name</label>
              <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full bg-slate-900/50 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-purple focus:border-brand-purple" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email</label>
              <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full bg-slate-900/50 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-purple focus:border-brand-purple" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-300">Message</label>
              <textarea name="message" id="message" rows={4} required value={formData.message} onChange={handleChange} className="mt-1 block w-full bg-slate-900/50 border border-slate-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-purple focus:border-brand-purple"></textarea>
            </div>
            <div className="text-center">
              <button type="submit" className="px-8 py-3 bg-brand-purple/80 text-white font-bold rounded-full hover:bg-brand-purple transition-all transform hover:scale-105 drop-shadow-glow-purple">
                Send Message
              </button>
            </div>
          </form>
        )}
        
        <Socials />
      </div>
    </div>
  );
};

export default Contact;