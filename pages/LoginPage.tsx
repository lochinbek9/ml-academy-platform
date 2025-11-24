import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { User } from '../types';
import { USERS_DB } from '../constants';

export const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate network delay
        setTimeout(() => {
            // 1. Get Users from Constants
            const defaultUsers = USERS_DB;
            
            // 2. Get Users from LocalStorage
            let storedUsers: User[] = [];
            try {
                const stored = localStorage.getItem('ml-academy-db-users');
                if (stored) {
                    storedUsers = JSON.parse(stored);
                }
            } catch(e) {
                console.error("Storage error", e);
            }

            // 3. Combine databases
            const allUsers = [...defaultUsers, ...storedUsers];

            // 4. Check credentials
            const foundUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

            if (foundUser) {
                // Update User Activity Log in LocalStorage for Stats
                const userActivityMap = JSON.parse(localStorage.getItem('ml-academy-user-activity') || '{}');
                userActivityMap[foundUser.id] = new Date().toISOString();
                localStorage.setItem('ml-academy-user-activity', JSON.stringify(userActivityMap));

                // Don't store password in session
                // Fix: Include joinedDate which is required by User type
                const userSession: User = {
                    id: foundUser.id,
                    name: foundUser.name,
                    email: foundUser.email,
                    avatar: foundUser.avatar,
                    role: foundUser.role,
                    joinedDate: foundUser.joinedDate,
                    lastLoginDate: new Date().toISOString(),
                    allowedCourses: foundUser.allowedCourses
                };

                localStorage.setItem('ml-academy-user', JSON.stringify(userSession));
                
                // Dispatch event to update Navbar immediately
                window.dispatchEvent(new Event('login-success'));
                
                navigate('/dashboard');
            } else {
                setError("Email yoki parol noto'g'ri. Iltimos qayta urinib ko'ring.");
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 pt-20">
            <GlassCard className="w-full max-w-md p-8 rounded-3xl border-t-4 border-t-primary">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-primary">Xush Kelibsiz</h1>
                    <p className="text-textMuted">Tizimga kirish uchun admin taqdim etgan ma'lumotlardan foydalaning.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-textMain ml-1">Email</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted">
                                <Mail size={20} />
                            </div>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full pl-12 pr-4 py-3 bg-glass/50 border border-glassBorder rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-textMuted/50 text-textMain"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-textMain ml-1">Parol</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted">
                                <Lock size={20} />
                            </div>
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-4 py-3 bg-glass/50 border border-glassBorder rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-textMuted/50 text-textMain"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-primary hover:bg-blue-800 text-white rounded-xl font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Tizimga Kirish <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-textMuted">
                    <p>Login va parolni olish uchun administratorga murojaat qiling.</p>
                </div>
            </GlassCard>
        </div>
    );
};