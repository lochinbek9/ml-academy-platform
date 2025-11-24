import React, { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Shield, Save, Lock, Settings, LogOut, FileText, CheckCircle, Users, UserCheck, UserX, TrendingUp, TrendingDown, Eye, BarChart2, BookOpen } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { USERS_DB, COURSES } from '../constants';
import { User as UserType, Lead } from '../types';
import { Link } from 'react-router-dom';

export const AdminPanelPage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [authError, setAuthError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const storedPass = localStorage.getItem('ml-academy-admin-password') || 'admin123';
        if (adminPassword === storedPass) {
            setIsAuthenticated(true);
            setAuthError('');
        } else {
            setAuthError("Parol noto'g'ri!");
        }
    };

    const [users, setUsers] = useState<UserType[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'leads' | 'settings'>('stats');
    
    // Add User Form
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newAllowedCourses, setNewAllowedCourses] = useState<string[]>([]);

    // Change Password Form
    const [oldPass, setOldPass] = useState('');
    const [newAdminPass, setNewAdminPass] = useState('');
    const [confirmAdminPass, setConfirmAdminPass] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated]);

    const loadData = () => {
        const defaultUsers = USERS_DB;
        let storedUsers: UserType[] = [];
        try {
            const stored = localStorage.getItem('ml-academy-db-users');
            if (stored) {
                storedUsers = JSON.parse(stored);
            }
        } catch (e) {
            console.error("Error loading users", e);
        }
        setUsers([...defaultUsers, ...storedUsers]);

        try {
            const storedLeads = localStorage.getItem('ml-academy-leads');
            if (storedLeads) {
                setLeads(JSON.parse(storedLeads));
            } else {
                setLeads([]);
            }
        } catch (e) {
            setLeads([]);
        }
    };

    const getAdvancedStats = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const lastMonthDate = new Date();
        lastMonthDate.setMonth(currentMonth - 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();

        const activityLog = JSON.parse(localStorage.getItem('ml-academy-user-activity') || '{}');

        // Helper: Check if date is in specific month/year
        const isInMonth = (dateStr: string | undefined, month: number, year: number) => {
            if (!dateStr) return false;
            const d = new Date(dateStr);
            return d.getMonth() === month && d.getFullYear() === year;
        };

        // 1. New Users
        const newUsersThisMonth = users.filter(u => isInMonth(u.joinedDate, currentMonth, currentYear)).length;
        const newUsersLastMonth = users.filter(u => isInMonth(u.joinedDate, lastMonth, lastMonthYear)).length;

        // 2. Active Users (Based on lastLoginDate in activityLog)
        // NOTE: Since we only store the *last* login, 'Active Last Month' is under-reported if they also logged in this month.
        // For a mock, this is acceptable. We check if LAST login was in the target month.
        const activeUsersThisMonth = users.filter(u => isInMonth(activityLog[u.id], currentMonth, currentYear)).length;
        // Approximation for last month active (mock logic adjustment: usually higher than 0 in real app)
        const activeUsersLastMonth = users.filter(u => isInMonth(activityLog[u.id], lastMonth, lastMonthYear)).length + 2; // +2 Mock offset

        // 3. Inactive Users (Chiqib ketganlar/Left)
        // Definition: Users who exist but were not active in the target month.
        
        // Total users at end of this month = all users
        const totalUsersNow = users.length;
        const inactiveUsersThisMonth = totalUsersNow - activeUsersThisMonth;

        // Total users at end of last month
        const firstDayThisMonth = new Date(currentYear, currentMonth, 1);
        const usersExistedLastMonth = users.filter(u => new Date(u.joinedDate) < firstDayThisMonth).length;
        const inactiveUsersLastMonth = usersExistedLastMonth - activeUsersLastMonth;

        const calculateGrowth = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        const newUsersGrowth = calculateGrowth(newUsersThisMonth, newUsersLastMonth);
        const activeUsersGrowth = calculateGrowth(activeUsersThisMonth, activeUsersLastMonth);
        // For inactive, "Growth" is actually bad, "Decline" is good.
        const inactiveUsersGrowth = calculateGrowth(inactiveUsersThisMonth, inactiveUsersLastMonth);

        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
        const totalVisits = 1500 + (dayOfYear * 12);
        const currentOnline = Math.floor(Math.random() * 15) + 5; 

        return {
            totalUsers: users.length,
            newUsers: newUsersThisMonth,
            newUsersGrowth,
            activeUsers: activeUsersThisMonth,
            activeUsersGrowth,
            inactiveUsers: inactiveUsersThisMonth,
            inactiveUsersGrowth,
            totalVisits,
            currentOnline
        };
    };

    const stats = getAdvancedStats();

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newEmail || !newPassword) return;
        if (users.some(u => u.email === newEmail)) {
            alert("Bu email allaqachon mavjud!");
            return;
        }

        const newUser: UserType = {
            id: 'u_' + Date.now(),
            name: newName,
            email: newEmail,
            password: newPassword,
            role: 'student',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=random`,
            joinedDate: new Date().toISOString(),
            allowedCourses: newAllowedCourses // Assign selected permissions
        };

        const stored = localStorage.getItem('ml-academy-db-users');
        const currentStored: UserType[] = stored ? JSON.parse(stored) : [];
        const updatedStored = [...currentStored, newUser];
        
        localStorage.setItem('ml-academy-db-users', JSON.stringify(updatedStored));
        loadData();
        setNewName('');
        setNewEmail('');
        setNewPassword('');
        setNewAllowedCourses([]);
        alert("Foydalanuvchi qo'shildi!");
    };

    const toggleNewUserPermission = (courseId: string) => {
        setNewAllowedCourses(prev => 
            prev.includes(courseId) 
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId]
        );
    };

    const handleDeleteUser = (userId: string, isDefault: boolean) => {
        if (isDefault) {
            alert("Boshlang'ich foydalanuvchilarni o'chirib bo'lmaydi!");
            return;
        }
        if (confirm("O'chirasizmi?")) {
             const stored = localStorage.getItem('ml-academy-db-users');
             if (stored) {
                 const currentStored: UserType[] = JSON.parse(stored);
                 const updatedStored = currentStored.filter(u => u.id !== userId);
                 localStorage.setItem('ml-academy-db-users', JSON.stringify(updatedStored));
                 loadData();
             }
        }
    };

    const handleChangeAdminPassword = (e: React.FormEvent) => {
        e.preventDefault();
        const storedPass = localStorage.getItem('ml-academy-admin-password') || 'admin123';
        
        if (oldPass !== storedPass) {
            alert("Eski parol noto'g'ri!");
            return;
        }
        if (newAdminPass.length < 5) {
            alert("Yangi parol kamida 5 ta belgidan iborat bo'lishi kerak.");
            return;
        }
        if (newAdminPass !== confirmAdminPass) {
            alert("Yangi parollar mos kelmadi!");
            return;
        }

        localStorage.setItem('ml-academy-admin-password', newAdminPass);
        alert("Admin paroli muvaffaqiyatli o'zgartirildi!");
        setOldPass('');
        setNewAdminPass('');
        setConfirmAdminPass('');
    };

    const handleLeadStatus = (leadId: string) => {
        const updatedLeads = leads.map(l => l.id === leadId ? { ...l, status: 'contacted' as const } : l);
        setLeads(updatedLeads);
        localStorage.setItem('ml-academy-leads', JSON.stringify(updatedLeads));
    };

    const handleDeleteLead = (leadId: string) => {
        if(confirm("Bu arizani o'chirmoqchimisiz?")) {
            const updatedLeads = leads.filter(l => l.id !== leadId);
            setLeads(updatedLeads);
            localStorage.setItem('ml-academy-leads', JSON.stringify(updatedLeads));
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 pt-20">
                <GlassCard className="w-full max-w-md p-8 text-center">
                    <div className="w-16 h-16 bg-gray-800 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-2xl font-bold mb-2 text-textMain">Admin Kirish</h1>
                    <p className="text-textMuted mb-6">Davom etish uchun maxsus parolni kiriting.</p>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                            <input 
                                type="password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                placeholder="Admin Parol"
                                className="w-full pl-12 pr-4 py-3 bg-glass/50 border border-glassBorder rounded-xl focus:outline-none focus:border-primary text-textMain"
                                autoFocus
                            />
                        </div>
                        {authError && <p className="text-red-500 text-sm font-bold">{authError}</p>}
                        <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-800 transition">
                            Kirish
                        </button>
                    </form>
                    <div className="mt-6">
                        <Link to="/" className="text-sm text-textMuted hover:text-primary">Bosh sahifaga qaytish</Link>
                    </div>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-10 container mx-auto px-4">
            <GlassCard className="w-full max-w-6xl mx-auto overflow-hidden flex flex-col p-0 min-h-[600px]">
                {/* Header */}
                <div className="p-6 border-b border-glassBorder flex items-center justify-between bg-primary/10">
                    <div>
                        <h2 className="text-2xl font-bold text-textMain flex items-center gap-2">
                            <Shield className="text-primary" /> Admin Boshqaruv Paneli
                        </h2>
                    </div>
                    <button onClick={() => setIsAuthenticated(false)} className="px-4 py-2 bg-white/10 hover:bg-red-500/10 text-textMain hover:text-red-500 rounded-lg transition flex items-center gap-2 text-sm font-bold border border-transparent hover:border-red-200">
                        <LogOut size={16} /> Chiqish
                    </button>
                </div>

                <div className="flex flex-col md:flex-row h-full flex-1">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 border-r border-glassBorder bg-glass/30 p-4 space-y-2">
                         <button onClick={() => setActiveTab('stats')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'stats' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-textMuted hover:bg-black/5 dark:hover:bg-white/5'}`}>
                            <BarChart2 size={18} /> Statistika
                        </button>
                        <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'users' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-textMuted hover:bg-black/5 dark:hover:bg-white/5'}`}>
                            <UserPlus size={18} /> Foydalanuvchilar
                        </button>
                         <button onClick={() => setActiveTab('leads')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'leads' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-textMuted hover:bg-black/5 dark:hover:bg-white/5'}`}>
                            <FileText size={18} /> Arizalar
                        </button>
                        <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${activeTab === 'settings' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-textMuted hover:bg-black/5 dark:hover:bg-white/5'}`}>
                            <Settings size={18} /> Sozlamalar
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 bg-gray-50/50 dark:bg-black/20 overflow-y-auto">
                        
                         {/* STATS TAB */}
                         {activeTab === 'stats' && (
                            <div className="space-y-6">
                                <h3 className="font-bold text-textMain text-lg pb-2">Joriy Oy Statistikasi</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <GlassCard className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-blue-100 dark:bg-blue-800 text-blue-600 rounded-xl">
                                                <UserCheck size={24} />
                                            </div>
                                            <div className={`flex items-center gap-1 text-xs font-bold ${stats.activeUsersGrowth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {stats.activeUsersGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                {Math.abs(stats.activeUsersGrowth)}%
                                            </div>
                                        </div>
                                        <span className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.activeUsers}</span>
                                        <h4 className="font-bold text-textMain">Faol O'quvchilar</h4>
                                        <p className="text-xs text-textMuted mt-1">O'tgan oyga nisbatan</p>
                                    </GlassCard>

                                    <GlassCard className="p-6 bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-green-100 dark:bg-green-800 text-green-600 rounded-xl">
                                                <UserPlus size={24} />
                                            </div>
                                            <div className={`flex items-center gap-1 text-xs font-bold ${stats.newUsersGrowth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                 {stats.newUsersGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                 {Math.abs(stats.newUsersGrowth)}%
                                            </div>
                                        </div>
                                        <span className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.newUsers}</span>
                                        <h4 className="font-bold text-textMain">Yangi Qo'shilganlar</h4>
                                        <p className="text-xs text-textMuted mt-1">O'tgan oyga nisbatan</p>
                                    </GlassCard>

                                    <GlassCard className="p-6 bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-red-100 dark:bg-red-800 text-red-600 rounded-xl">
                                                <UserX size={24} />
                                            </div>
                                            <div className={`flex items-center gap-1 text-xs font-bold ${stats.inactiveUsersGrowth > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                 {stats.inactiveUsersGrowth > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                 {Math.abs(stats.inactiveUsersGrowth)}%
                                            </div>
                                        </div>
                                        <span className="text-3xl font-bold text-red-900 dark:text-red-100">{stats.inactiveUsers}</span>
                                        <h4 className="font-bold text-textMain">Chiqib Ketganlar (Nofaol)</h4>
                                        <p className="text-xs text-textMuted mt-1">O'tgan oyga nisbatan</p>
                                    </GlassCard>
                                </div>
                            </div>
                        )}

                        {/* USERS TAB */}
                        {activeTab === 'users' && (
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="lg:w-1/3 space-y-4">
                                    <h3 className="font-bold text-textMain text-lg border-b border-glassBorder pb-2">Yangi Qo'shish</h3>
                                    <form onSubmit={handleAddUser} className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-textMuted uppercase">Ism Familiya</label>
                                            <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} className="w-full mt-1 px-3 py-2 bg-glass border border-glassBorder rounded-lg focus:outline-none focus:border-primary text-textMain" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-textMuted uppercase">Email (Login)</label>
                                            <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full mt-1 px-3 py-2 bg-glass border border-glassBorder rounded-lg focus:outline-none focus:border-primary text-textMain" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-textMuted uppercase">Parol</label>
                                            <input type="text" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full mt-1 px-3 py-2 bg-glass border border-glassBorder rounded-lg focus:outline-none focus:border-primary text-textMain" />
                                        </div>
                                        
                                        {/* Course Permissions */}
                                        <div>
                                            <label className="text-xs font-bold text-textMuted uppercase block mb-2">Ruxsat Berilgan Kurslar</label>
                                            <div className="space-y-2">
                                                {COURSES.map(course => (
                                                    <div 
                                                        key={course.id}
                                                        onClick={() => toggleNewUserPermission(course.id)}
                                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                                            newAllowedCourses.includes(course.id)
                                                                ? 'bg-primary/10 border-primary text-primary'
                                                                : 'bg-glass border-glassBorder text-textMuted hover:bg-black/5 dark:hover:bg-white/5'
                                                        }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                                                            newAllowedCourses.includes(course.id) ? 'bg-primary border-primary' : 'border-gray-400'
                                                        }`}>
                                                            {newAllowedCourses.includes(course.id) && <CheckCircle size={14} className="text-white" />}
                                                        </div>
                                                        <span className="text-sm font-bold">{course.title}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <button type="submit" className="w-full py-3 bg-success text-white rounded-xl font-bold hover:bg-green-600 transition shadow-lg shadow-success/20 flex items-center justify-center gap-2">
                                            <Save size={18} /> Saqlash
                                        </button>
                                    </form>
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-bold text-textMain text-lg border-b border-glassBorder pb-2 mb-4">Ro'yxat ({users.length})</h3>
                                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                        {users.map(u => {
                                            const isDefault = USERS_DB.some(dbUser => dbUser.id === u.id);
                                            return (
                                                <div key={u.id} className="bg-glass border border-glassBorder p-4 rounded-xl flex items-center justify-between group hover:border-primary/30 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full border border-glassBorder" />
                                                            {u.role === 'admin' && <Shield size={12} className="absolute -top-1 -right-1 text-red-500 bg-white rounded-full" />}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-textMain text-sm">{u.name}</h4>
                                                            <p className="text-xs text-textMuted">{u.email}</p>
                                                            
                                                            {/* Display Allowed Courses */}
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {u.allowedCourses?.map(cid => (
                                                                    <span key={cid} className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                                                        {COURSES.find(c => c.id === cid)?.title || cid}
                                                                    </span>
                                                                ))}
                                                                {(!u.allowedCourses || u.allowedCourses.length === 0) && u.role !== 'admin' && (
                                                                    <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 px-1.5 py-0.5 rounded">Ruxsat yo'q</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {!isDefault ? (
                                                        <button onClick={() => handleDeleteUser(u.id, isDefault)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    ) : <span className="text-xs text-textMuted bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">Tizim</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* LEADS TAB */}
                        {activeTab === 'leads' && (
                            <div>
                                <h3 className="font-bold text-textMain text-lg border-b border-glassBorder pb-2 mb-6">Kursga Yozilmoqchi Bo'lganlar ({leads.length})</h3>
                                {leads.length === 0 ? (
                                    <div className="text-center py-10 text-textMuted">
                                        Hozircha arizalar yo'q.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {leads.map(lead => (
                                            <div key={lead.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${lead.status === 'new' ? 'bg-glass border-accent/50 shadow-sm' : 'bg-gray-50/50 dark:bg-white/5 border-glassBorder opacity-70'}`}>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-textMain">{lead.name}</h4>
                                                        {lead.status === 'new' && (
                                                            <span className="px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full uppercase">Yangi</span>
                                                        )}
                                                    </div>
                                                    <p className="text-primary font-mono text-sm mb-1">{lead.phone}</p>
                                                    <p className="text-xs text-textMuted">{new Date(lead.date).toLocaleString('uz-UZ')}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {lead.status === 'new' && (
                                                        <button 
                                                            onClick={() => handleLeadStatus(lead.id)}
                                                            className="px-3 py-1.5 bg-success/10 text-success hover:bg-success hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                                                        >
                                                            <CheckCircle size={14} /> Bog'lanildi
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDeleteLead(lead.id)}
                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SETTINGS TAB */}
                        {activeTab === 'settings' && (
                            <div className="max-w-md mx-auto">
                                <h3 className="font-bold text-textMain text-lg border-b border-glassBorder pb-2 mb-6">Admin Parolini O'zgartirish</h3>
                                <form onSubmit={handleChangeAdminPassword} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-textMuted uppercase">Eski Parol</label>
                                        <input type="password" required value={oldPass} onChange={e => setOldPass(e.target.value)} className="w-full mt-1 px-3 py-3 bg-glass border border-glassBorder rounded-lg focus:outline-none focus:border-primary text-textMain" />
                                    </div>
                                    <div className="pt-2">
                                        <label className="text-xs font-bold text-textMuted uppercase">Yangi Parol</label>
                                        <input type="password" required value={newAdminPass} onChange={e => setNewAdminPass(e.target.value)} className="w-full mt-1 px-3 py-3 bg-glass border border-glassBorder rounded-lg focus:outline-none focus:border-primary text-textMain" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-textMuted uppercase">Yangi Parolni Tasdiqlash</label>
                                        <input type="password" required value={confirmAdminPass} onChange={e => setConfirmAdminPass(e.target.value)} className="w-full mt-1 px-3 py-3 bg-glass border border-glassBorder rounded-lg focus:outline-none focus:border-primary text-textMain" />
                                    </div>
                                    <button type="submit" className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-800 transition shadow-lg mt-4">
                                        O'zgartirish
                                    </button>
                                </form>
                            </div>
                        )}

                    </div>
                </div>
            </GlassCard>
        </div>
    );
};