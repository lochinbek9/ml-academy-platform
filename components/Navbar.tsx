import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Code, LogIn, Sun, Moon } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { ProfileModal } from './ProfileModal';
import { User } from '../types';

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate();
    const isDashboard = location.pathname === '/dashboard';

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        
        // Check LocalStorage or System Preference
        const savedTheme = localStorage.getItem('ml-academy-theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }

        // Check User Session
        const checkUser = () => {
            const savedUser = localStorage.getItem('ml-academy-user');
            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch(e) {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };
        
        checkUser();
        window.addEventListener('storage', checkUser); // Listen for storage changes

        // Custom event for immediate update after login
        const handleLoginEvent = () => checkUser();
        window.addEventListener('login-success', handleLoginEvent);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('storage', checkUser);
            window.removeEventListener('login-success', handleLoginEvent);
        };
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('ml-academy-theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('ml-academy-theme', 'dark');
            setIsDark(true);
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('ml-academy-user');
        setUser(null);
        setIsProfileOpen(false);
        navigate('/');
    };

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${isScrolled ? 'py-2' : 'py-5'}`}>
                <div className="container mx-auto px-6">
                    <GlassCard className={`flex items-center justify-between px-6 py-3 rounded-full transition-all duration-500 ease-in-out ${
                        isScrolled 
                        ? 'bg-glass/95 shadow-lg backdrop-blur-xl border-glassBorder' 
                        : 'bg-glass/30 shadow-none backdrop-blur-sm border-transparent'
                    }`}>
                        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
                            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
                                <Code size={20} />
                            </div>
                            <span>ML Academy</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-textMuted">
                            {!isDashboard && (
                                <>
                                    <Link to="/" className="hover:text-primary transition">Bosh sahifa</Link>
                                    <a href="#about" className="hover:text-primary transition">Men haqimda</a>
                                    <a href="#portfolio" className="hover:text-primary transition">Portfolio</a>
                                    <a href="#contact" className="hover:text-primary transition">Bog'lanish</a>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Theme Toggle */}
                            <button 
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-textMuted hover:text-primary hover:bg-glassBorder transition-colors"
                                title={isDark ? "Yorug' rejimga o'tish" : "Tungi rejimga o'tish"}
                            >
                                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            {user ? (
                                <div 
                                    className="flex items-center gap-3 cursor-pointer group"
                                    onClick={() => setIsProfileOpen(true)}
                                >
                                    <span className="text-sm text-textMain hidden sm:block group-hover:text-primary transition font-medium">{user.name.split(' ')[0]}</span>
                                    <div className="relative">
                                        <img src={user.avatar} alt="User" className="w-9 h-9 rounded-full border-2 border-white dark:border-gray-700 shadow-sm group-hover:scale-105 transition-transform" />
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success border-2 border-white dark:border-gray-800 rounded-full"></div>
                                    </div>
                                </div>
                            ) : (
                                <Link to="/login">
                                    <button className="px-5 py-2 bg-accent hover:bg-yellow-400 text-accent-foreground border border-transparent rounded-full text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-accent/20">
                                        <LogIn size={16} />
                                        Kirish
                                    </button>
                                </Link>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </nav>

            {/* Profile Modal */}
            {user && (
                <ProfileModal 
                    isOpen={isProfileOpen} 
                    onClose={() => setIsProfileOpen(false)} 
                    user={user}
                    onSignOut={handleSignOut}
                />
            )}
        </>
    );
};