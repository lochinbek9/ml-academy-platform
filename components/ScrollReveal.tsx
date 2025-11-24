import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
    children: React.ReactNode;
    direction?: 'up' | 'left' | 'right';
    delay?: number; // in seconds
    className?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({ 
    children, 
    direction = 'up', 
    delay = 0,
    className = "" 
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // Run once
                }
            },
            {
                threshold: 0.1, // Trigger when 10% visible
                rootMargin: '0px 0px -50px 0px' 
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    // Transform styles based on direction
    const getTransformStyle = () => {
        if (isVisible) return 'translate(0, 0)';
        
        switch (direction) {
            case 'up': return 'translateY(50px)';
            case 'left': return 'translateX(-50px)';
            case 'right': return 'translateX(50px)';
            default: return 'translateY(50px)';
        }
    };

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: getTransformStyle(),
                transition: `opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)`,
                transitionDelay: `${delay}s`
            }}
        >
            {children}
        </div>
    );
};