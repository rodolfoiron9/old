import React from 'react';
import Logo from './Logo';

type Page = 'home' | 'bio' | 'blog' | 'albums' | 'contact' | 'admin';

interface HeaderProps {
    onNavigate: (page: Page) => void;
    currentPage: Page;
}

const NavLink: React.FC<{ page: Page; currentPage: Page; onNavigate: (page: Page) => void; children: React.ReactNode }> = ({ page, currentPage, onNavigate, children }) => {
    const isActive = currentPage === page;
    return (
        <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onNavigate(page); }}
            className={`relative px-3 py-2 text-sm font-medium transition-colors link-3d-hover ${
                isActive 
                ? 'text-white' 
                : 'text-slate-300 hover:text-white'
            }`}
        >
            {children}
            {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-brand-purple rounded-full drop-shadow-glow-purple"></span>}
        </a>
    );
};


const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-brand-bg/60 backdrop-blur-md border-b border-white/10">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>
                           <Logo />
                        </a>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <NavLink page="home" currentPage={currentPage} onNavigate={onNavigate}>Home</NavLink>
                            <NavLink page="bio" currentPage={currentPage} onNavigate={onNavigate}>Bio</NavLink>
                            <NavLink page="blog" currentPage={currentPage} onNavigate={onNavigate}>Blog</NavLink>
                            <NavLink page="albums" currentPage={currentPage} onNavigate={onNavigate}>Albums</NavLink>
                            <NavLink page="contact" currentPage={currentPage} onNavigate={onNavigate}>Contact</NavLink>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;