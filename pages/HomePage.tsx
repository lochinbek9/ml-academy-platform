import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, Code, Monitor, Mail, Send, ChevronRight, Users, Eye, CheckCircle, Brain, Layout } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { ScrollReveal } from '../components/ScrollReveal';
import { EnrollModal } from '../components/EnrollModal';
import { SOCIAL_LINKS, USERS_DB, COURSES } from '../constants';
import { User } from '../types';

export const HomePage = () => {
    const [isEnrollOpen, setIsEnrollOpen] = useState(false);
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeLearners: 0,
        totalVisits: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        // Calculate Public Stats
        // 1. Total Students
        const defaultUsers = USERS_DB;
        const storedUsers: User[] = JSON.parse(localStorage.getItem('ml-academy-db-users') || '[]');
        const allUsers = [...defaultUsers, ...storedUsers];
        
        // 2. Active Learners (Logged in recently)
        const activityLog = JSON.parse(localStorage.getItem('ml-academy-user-activity') || '{}');
        const activeCount = Object.keys(activityLog).length; // Simple count of anyone who ever logged in
        
        // 3. Simulated Total Visits (Based on Date)
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
        const simulatedVisits = 1500 + (dayOfYear * 12);

        setStats({
            totalStudents: allUsers.length + 124, // +124 fake base users for display
            activeLearners: activeCount + 45,      // +45 fake base
            totalVisits: simulatedVisits
        });
    }, []);

    const scrollToCourses = () => {
        const element = document.getElementById('courses');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="pt-32 pb-20">
            {/* Hero Section */}
            <section className="container mx-auto px-6 mb-20">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <ScrollReveal direction="left" className="flex-1 space-y-6">
                        <div className="inline-block px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase">
                            Yangi Avlod Platformasi
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight text-textMain">
                            Kelajak Kasbini <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                                Biz Bilan
                            </span> O'rganing
                        </h1>
                        <p className="text-lg text-textMuted max-w-xl leading-relaxed">
                            Dasturlash va Sun'iy Intellekt bo'yicha professional kurslar. 
                            Nazariya emas, real loyihalar orqali tajriba orttiring.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <button 
                                onClick={() => setIsEnrollOpen(true)}
                                className="px-8 py-4 bg-accent text-accent-foreground rounded-xl font-bold shadow-lg shadow-accent/30 hover:shadow-accent/50 transition-all transform hover:-translate-y-1 flex items-center gap-2"
                            >
                                Kursga Yozilish <ChevronRight size={20} />
                            </button>
                            <button 
                                onClick={scrollToCourses}
                                className="px-8 py-4 bg-glass border border-glassBorder rounded-xl font-bold text-primary hover:bg-glassBorder transition-all"
                            >
                                Kurslarni Ko'rish
                            </button>
                        </div>
                    </ScrollReveal>
                    <ScrollReveal direction="right" className="flex-1 relative" delay={0.2}>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />
                        <GlassCard className="p-2 rounded-3xl rotate-2 hover:rotate-0 transition-transform duration-500 bg-white dark:bg-slate-800">
                            <img src="https://picsum.photos/id/3/800/600" alt="Coding" className="rounded-2xl w-full h-auto shadow-sm" />
                        </GlassCard>
                    </ScrollReveal>
                </div>
            </section>

            {/* Public Stats Bar */}
            <section className="container mx-auto px-6 mb-32 relative z-10">
                <ScrollReveal direction="up" delay={0.4}>
                    <GlassCard className="p-8 rounded-2xl border-primary/10 bg-glass/80 backdrop-blur-md">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-glassBorder">
                            <div className="flex flex-col items-center justify-center p-2">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full mb-3">
                                    <Users size={24} />
                                </div>
                                <h3 className="text-4xl font-bold text-textMain mb-1">{stats.totalStudents}+</h3>
                                <p className="text-textMuted text-sm font-medium uppercase tracking-wider">Ro'yxatdan O'tganlar</p>
                            </div>
                            <div className="flex flex-col items-center justify-center p-2">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full mb-3">
                                    <CheckCircle size={24} />
                                </div>
                                <h3 className="text-4xl font-bold text-textMain mb-1">{stats.activeLearners}+</h3>
                                <p className="text-textMuted text-sm font-medium uppercase tracking-wider">Faol O'quvchilar</p>
                            </div>
                            <div className="flex flex-col items-center justify-center p-2">
                                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full mb-3">
                                    <Eye size={24} />
                                </div>
                                <h3 className="text-4xl font-bold text-textMain mb-1">{stats.totalVisits}</h3>
                                <p className="text-textMuted text-sm font-medium uppercase tracking-wider">Saytga Tashriflar</p>
                            </div>
                        </div>
                    </GlassCard>
                </ScrollReveal>
            </section>

            {/* Courses Section */}
            <section id="courses" className="container mx-auto px-6 mb-32">
                <ScrollReveal direction="up" className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4 text-textMain">Bizning Kurslar</h2>
                    <p className="text-textMuted">O'zingizga mos yo'nalishni tanlang</p>
                </ScrollReveal>

                <div className="grid md:grid-cols-2 gap-8">
                    {COURSES.map((course, index) => (
                        <ScrollReveal key={course.id} direction="up" delay={index * 0.2}>
                            <Link to={`/dashboard/${course.id}`} className="block h-full">
                                <GlassCard className="h-full group hover:border-primary/50 transition-all p-0 overflow-hidden flex flex-col" hoverEffect>
                                    <div className="aspect-video relative overflow-hidden">
                                        <img 
                                            src={course.thumbnail} 
                                            alt={course.title} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                                            <div className="flex items-center gap-2 text-white font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
                                                {course.category === 'ai' ? <Brain size={18} /> : <Layout size={18} />}
                                                {course.category === 'ai' ? "Sun'iy Intellekt" : "Dasturlash"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col">
                                        <h3 className="text-2xl font-bold text-textMain mb-2 group-hover:text-primary transition-colors">
                                            {course.title}
                                        </h3>
                                        <p className="text-textMuted mb-6 flex-1">
                                            {course.description}
                                        </p>
                                        <div className="flex items-center justify-between border-t border-glassBorder pt-4 mt-auto">
                                            <div className="flex items-center gap-2 text-sm text-textMain font-medium">
                                                <PlayCircle size={16} className="text-accent" />
                                                {course.lessons.length} ta dars
                                            </div>
                                            <span className="text-primary font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                Darsni Boshlash <ChevronRight size={16} />
                                            </span>
                                        </div>
                                    </div>
                                </GlassCard>
                            </Link>
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            {/* About / Features */}
            <section id="about" className="container mx-auto px-6 mb-32">
                <ScrollReveal direction="up" className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4 text-textMain">Nega aynan biz?</h2>
                    <p className="text-textMuted">Sifatli ta'lim va zamonaviy yondashuv</p>
                </ScrollReveal>
                <div className="grid md:grid-cols-3 gap-8">
                    <ScrollReveal direction="up" delay={0.1} className="h-full">
                        <GlassCard className="p-8 h-full" hoverEffect>
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-primary mb-6 shadow-sm">
                                <PlayCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-textMain">Amaliy Darslar</h3>
                            <p className="text-textMuted">Nazariya bilan cheklanib qolmay, real loyihalar ustida ishlash orqali o'rganing.</p>
                        </GlassCard>
                    </ScrollReveal>
                    <ScrollReveal direction="up" delay={0.2} className="h-full">
                        <GlassCard className="p-8 h-full" hoverEffect>
                            <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-success mb-6 shadow-sm">
                                <Code size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-textMain">Toza Kod</h3>
                            <p className="text-textMuted">Best practice qoidalari asosida kod yozish va arxitekturani to'g'ri qurish.</p>
                        </GlassCard>
                    </ScrollReveal>
                    <ScrollReveal direction="up" delay={0.3} className="h-full">
                        <GlassCard className="p-8 h-full" hoverEffect>
                            <div className="w-14 h-14 rounded-2xl bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400 mb-6 shadow-sm">
                                <Monitor size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-textMain">Responsive Dizayn</h3>
                            <p className="text-textMuted">Har qanday qurilma uchun moslashuvchan interfeyslar yaratishni o'rganing.</p>
                        </GlassCard>
                    </ScrollReveal>
                </div>
            </section>

            {/* Contact */}
            <section id="contact" className="container mx-auto px-6">
                <ScrollReveal direction="up">
                    <GlassCard className="p-12 rounded-[3rem] border-t-4 border-t-accent">
                        <div className="text-center max-w-2xl mx-auto">
                            <h2 className="text-4xl font-bold mb-6 text-textMain">Birga ishlamoqchimisiz?</h2>
                            <p className="text-textMuted mb-8">
                                Loyiha bo'yicha savollaringiz bo'lsa yoki hamkorlik qilmoqchi bo'lsangiz, bemalol bog'laning.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a href={`mailto:info@example.com`} className="px-8 py-4 bg-glass hover:bg-glassBorder border border-glassBorder rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-primary">
                                    <Mail size={20} /> Email Yozish
                                </a>
                                 <a href={SOCIAL_LINKS.telegram} className="px-8 py-4 bg-primary hover:bg-blue-800 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-primary-foreground shadow-lg shadow-primary/30">
                                    <Send size={20} /> Telegram
                                </a>
                            </div>
                        </div>
                    </GlassCard>
                </ScrollReveal>
            </section>
            
            {/* Enrollment Modal */}
            <EnrollModal isOpen={isEnrollOpen} onClose={() => setIsEnrollOpen(false)} />
        </div>
    );
};