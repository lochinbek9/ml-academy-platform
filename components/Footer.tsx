import React from 'react';
import { Send, Monitor, Code } from 'lucide-react';
import { SOCIAL_LINKS } from '../constants';

export const Footer = () => (
    <footer className="mt-20 bg-primary text-white">
        <div className="container mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-blue-200 text-sm">
                    &copy; 2024 ML Academy Platformasi. Barcha huquqlar himoyalangan.
                </div>
                <div className="flex items-center gap-4">
                    <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-primary transition-all">
                        <Send size={18} />
                    </a>
                    <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-primary transition-all">
                        <Monitor size={18} />
                    </a>
                    <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-primary transition-all">
                        <Code size={18} />
                    </a>
                </div>
            </div>
        </div>
    </footer>
);