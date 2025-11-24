import React, { useState, useEffect } from 'react';
import { X, LogOut, TrendingUp, Bell, Activity, Calendar, Award, Zap, MailWarning } from 'lucide-react';
import { User, DailyProgress } from '../types';
import { GlassCard } from './GlassCard';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSignOut: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onSignOut }) => {
    const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);
    const [activeTab, setActiveTab] = useState<'stats' | 'settings'>('stats');
    const [emailSent, setEmailSent] = useState(false);

    // Initialize notifications from localStorage (default to true)
    const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
        return localStorage.getItem('ml-academy-notifications') !== 'false';
    });

    const toggleNotifications = () => {
        const newValue = !notificationsEnabled;
        setNotificationsEnabled(newValue);
        localStorage.setItem('ml-academy-notifications', String(newValue));
    };

    const sendTestEmail = () => {
        console.log(`[Email Service] Sending TEST email to ${user.email}...`);
        console.log(`[Email Service] Subject: Sinov Xabarnomasi`);
        console.log(`[Email Service] Body: Bu ML Academy tizimidan sinov xabari.`);
        setEmailSent(true);
        // Auto hide after 5 seconds
        setTimeout(() => setEmailSent(false), 5000);
    };

    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem('ml-academy-daily-progress');
            let progress: DailyProgress[] = [];
            if (saved) {
                try {
                    progress = JSON.parse(saved);
                    setDailyProgress(progress);
                } catch (e) {
                    setDailyProgress([]);
                }
            } else {
                setDailyProgress([]);
            }

            // Check for missed lessons if notifications are enabled
            // We check if "Yesterday" exists in the progress log.
            // Note: Using the initial state value of notificationsEnabled is safe here 
            // because the modal re-mounts on open.
            if (localStorage.getItem('ml-academy-notifications') !== 'false') {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                
                // Check if there is any entry for yesterday with count > 0
                const hasActivityYesterday = progress.some(p => p.date === yesterdayStr && p.count > 0);

                if (!hasActivityYesterday) {
                    // SIMULATION: Send Email
                    console.log(`[Email Service] Sending missed lesson reminder to ${user.email}...`);
                    console.log(`[Email Service] Subject: Darsni qoldirmang!`);
                    console.log(`[Email Service] Body: Hurmatli ${user.name}, kecha dars qilmadingiz. Bugun davom ettiramizmi?`);
                    
                    setEmailSent(true);
                }
            }
        } else {
            // Reset state when closed
            setEmailSent(false);
        }
    }, [isOpen, user.email, user.name]);

    if (!isOpen) return null;

    // Generate last 7 days data
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = dailyProgress.find(p => p.date === dateStr);
            days.push({
                day: d.toLocaleDateString('uz-UZ', { weekday: 'short' }), // Uzbek locale for day names
                date: dateStr,
                count: found ? found.count : 0,
                minutes: found ? (found.minutesWatched || 0) : 0
            });
        }
        return days;
    };

    const chartData = getLast7Days();
    const totalLessonsWeek = chartData.reduce((acc, cur) => acc + cur.count, 0);
    const totalMinutesWeek = chartData.reduce((acc, cur) => acc + cur.minutes, 0);
    const totalHoursWeek = (totalMinutesWeek / 60).toFixed(1);

    // Dynamic max for chart scaling (min 60 minutes for visual balance)
    const maxDailyMinutes = Math.max(...chartData.map(d => d.minutes), 60); 
    
    // Helper to format duration text
    const formatDuration = (minutes: number) => {
        if (minutes < 1) return "0 min";
        const h = Math.floor(minutes / 60);
        const m = Math.round(minutes % 60);
        if (h > 0) return `${h} soat ${m} min`;
        return `${m} min`;
    };

    // Motivation Logic
    let motivationMessage = "O'rganishni boshlang!";
    let motivationColor = "text-textMuted";
    
    if (totalLessonsWeek > 10) {
        motivationMessage = "Siz olovsiz! 🔥 Ajoyib natija!";
        motivationColor = "text-orange-500";
    } else if (totalLessonsWeek > 5) {
        motivationMessage = "Yaxshi ketayapsiz! Davom eting 🚀";
        motivationColor = "text-success";
    } else if (totalLessonsWeek > 0) {
        motivationMessage = "Yomon emas, lekin ko'proq harakat qiling 💪";
        motivationColor = "text-blue-500";
    } else {
        motivationMessage = "Bugun birinchi qadamni tashlang! 🌱";
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200 p-0">
                {/* Header */}
                <div className="p-6 border-b border-glassBorder flex items-start justify-between bg-primary/5">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                             <img 
                                src={user.avatar} 
                                alt={user.name} 
                                className="w-20 h-20 rounded-2xl border-4 border-white/20 shadow-xl object-cover"
                            />
                            <div className="absolute -bottom-2 -right-2 bg-success text-white text-xs font-bold px-2 py-1 rounded-full border border-white">
                                PRO
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-textMain">{user.name}</h2>
                            <p className="text-textMuted">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`text-sm font-bold ${motivationColor} flex items-center gap-1`}>
                                   {totalLessonsWeek > 5 ? <Zap size={14} className="fill-current" /> : <Activity size={14} />}
                                   {motivationMessage}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-textMuted">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-glassBorder">
                    <button 
                        onClick={() => setActiveTab('stats')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === 'stats' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-textMuted hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                        Statistika
                    </button>
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === 'settings' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-textMuted hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                        Sozlamalar
                    </button>
                </div>

                {/* Simulation Alert */}
                {emailSent && (
                    <div className="mx-6 mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-300">
                            <MailWarning size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm">Xabarnoma Yuborildi!</h4>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                {user.email} manziliga xabar muvaffaqiyatli yuborildi.
                            </p>
                        </div>
                        <button onClick={() => setEmailSent(false)} className="ml-auto text-blue-500 hover:text-blue-700 p-1">
                            <X size={16} />
                        </button>
                    </div>
                )}

                <div className="p-6">
                    {activeTab === 'stats' ? (
                        <div className="space-y-8">
                            {/* Weekly Activity Chart */}
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-textMain flex items-center gap-2">
                                        <TrendingUp size={20} className="text-accent" />
                                        Haftalik Vaqt
                                    </h3>
                                    <span className="text-sm text-textMuted">Jami: <strong className="text-textMain">{totalHoursWeek} soat</strong></span>
                                </div>
                                
                                <div className="h-48 flex items-end justify-between gap-3 px-2">
                                    {chartData.map((item, index) => {
                                        const heightPercent = (item.minutes / maxDailyMinutes) * 100; 
                                        // Calculate display height: if 0, show tiny line (4px), else percentage (min 5%)
                                        const displayHeight = item.minutes === 0 ? '4px' : `${Math.max(heightPercent, 5)}%`;
                                        
                                        const isToday = index === 6;
                                        
                                        return (
                                            <div key={item.date} className="flex flex-col items-center gap-2 flex-1 group h-full justify-end">
                                                <div className="relative w-full flex items-end justify-center h-full">
                                                    <div 
                                                        className={`w-full max-w-[30px] sm:max-w-[40px] rounded-t-lg transition-all duration-500 relative ${
                                                            isToday 
                                                                ? 'bg-accent shadow-[0_0_15px_rgba(250,204,21,0.5)]' 
                                                                : (item.minutes > 0 ? 'bg-primary/80 group-hover:bg-primary' : 'bg-gray-200 dark:bg-white/10')
                                                        }`}
                                                        style={{ height: displayHeight }}
                                                    >
                                                        {/* Tooltip */}
                                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 whitespace-nowrap pointer-events-none z-10 shadow-xl flex flex-col items-center">
                                                            <span>{formatDuration(item.minutes)}</span>
                                                            <span className="text-[9px] font-normal opacity-70">{item.count} ta dars</span>
                                                            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-bold uppercase ${isToday ? 'text-accent' : 'text-textMuted'}`}>
                                                    {item.day}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Badges / Achievements */}
                            <div>
                                <h3 className="text-lg font-bold text-textMain flex items-center gap-2 mb-4">
                                    <Award size={20} className="text-purple-500" />
                                    Yutuqlar
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-glass border border-glassBorder flex items-center gap-3 transition-transform hover:scale-[1.02]">
                                        <div className="w-12 h-12 rounded-2xl bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center text-yellow-600 border border-yellow-200 dark:border-yellow-700">
                                            <Zap size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-textMain">Tezkor Start</p>
                                            <p className="text-xs text-textMuted">Ilk darsni muvaffaqiyatli tugatdingiz</p>
                                        </div>
                                    </div>
                                    <div className={`p-4 rounded-xl border flex items-center gap-3 transition-transform hover:scale-[1.02] ${totalLessonsWeek >= 5 ? 'bg-glass border-glassBorder' : 'bg-gray-50 dark:bg-white/5 border-dashed border-gray-300 dark:border-gray-700 opacity-70'}`}>
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${totalLessonsWeek >= 5 ? 'bg-green-100 dark:bg-green-900/50 text-green-600 border-green-200 dark:border-green-700' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 border-transparent'}`}>
                                            <TrendingUp size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-textMain">Barqarorlik</p>
                                            <p className="text-xs text-textMuted">Haftasiga 5 ta dars</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-5 rounded-xl bg-glass border border-glassBorder hover:border-primary/30 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                                            <Bell size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-textMain text-lg">Eslatmalar</h4>
                                            <p className="text-sm text-textMuted">Dars qoldirilganda emailga xabar olish.</p>
                                        </div>
                                    </div>
                                    <div 
                                        className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 ${notificationsEnabled ? 'bg-success' : 'bg-gray-300 dark:bg-gray-600'}`}
                                        onClick={toggleNotifications}
                                    >
                                        <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-textMuted leading-relaxed">
                                    <p>Agar bir kun dars qilmasangiz, tizim avtomatik ravishda sizga eslatma xatini yuboradi.</p>
                                </div>
                                
                                {notificationsEnabled && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-xs text-success font-bold bg-success/10 py-2 px-3 rounded-lg inline-block">
                                            <span className="flex items-center gap-1">
                                                <Zap size={12} className="fill-current" />
                                                Faol: {user.email}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={sendTestEmail}
                                            className="px-3 py-1.5 text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors border border-primary/20"
                                        >
                                            Sinov Xati Yuborish
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-glassBorder bg-gray-50 dark:bg-white/5 flex justify-between items-center">
                    <div className="text-xs text-textMuted font-mono bg-black/5 dark:bg-white/10 px-2 py-1 rounded">
                        ID: {user.id}
                    </div>
                    <button 
                        onClick={onSignOut}
                        className="px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-sm hover:shadow-red-500/30"
                    >
                        <LogOut size={18} />
                        Chiqish
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};