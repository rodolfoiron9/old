import React from 'react';

interface Title3DProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  style?: React.CSSProperties;
  variant?: 'heavy' | 'light';
}

const Title3D: React.FC<Title3DProps> = ({ children, as: Component = 'h1', className = '', style, variant = 'heavy' }) => {
  const baseClasses = 'font-bold text-center text-white';
  const variantClass = variant === 'heavy' ? 'title-3d-heavy' : 'title-3d-light';

  return (
    <Component className={`${baseClasses} ${variantClass} ${className}`} style={style}>
      {children}
    </Component>
  );
};

export default Title3D;
