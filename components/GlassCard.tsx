import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", hoverEffect = false }) => {
    return (
        <div className={`
            relative overflow-hidden
            bg-glass backdrop-blur-xl
            border border-glassBorder
            shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-2xl
            text-textMain
            transition-colors duration-300
            ${hoverEffect ? 'transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]' : ''}
            ${className}
        `}>
            {/* Inner shine effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-glassShine to-transparent pointer-events-none" />
            {children}
        </div>
    );
};