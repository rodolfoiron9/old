import React from 'react';

const Logo: React.FC = () => {
    const logoStyle: React.CSSProperties = {
        fontFamily: "'Orbitron', sans-serif", // A futuristic font
        fontSize: '1.5rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        color: '#f0f0f0',
        textShadow: `
            0 0 5px rgba(159, 122, 234, 0.5),
            0 0 10px rgba(159, 122, 234, 0.4),
            0 0 20px rgba(159, 122, 234, 0.3),
            1px 1px 0px #000,
            2px 2px 0px #111
        `,
        WebkitTextStroke: '0.5px rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease',
    };

    return (
        <div style={logoStyle} className="hover:scale-105 transform">
            RudyBtz
        </div>
    );
};

export default Logo;
