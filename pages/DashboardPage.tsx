import React, { useState, useEffect } from 'react';
import { Play, Send, Cpu, MessageCircle, Copy, Check, RotateCw, CheckCircle, Circle, Lock, Languages, AlertTriangle, ArrowLeft } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { VideoPlayer } from '../components/VideoPlayer';
import { ScrollReveal } from '../components/ScrollReveal';
import { EnrollModal } from '../components/EnrollModal';
import { COURSES, MOCK_COMMENTS, DEMO_LESSON_ID } from '../constants';
import { Lesson, Comment, User, DailyProgress, Course } from '../types';
import { askAIAboutLesson } from '../services/geminiService';
import { useParams, useNavigate, Link } from 'react-router-dom';

export const DashboardPage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();

    const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [accessDenied, setAccessDenied] = useState(false);

    const [inputComment, setInputComment] = useState("");
    const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // Lazy initialize user
    const [user, setUser] = useState<User | null>(() => {
        try {
            const savedUser = localStorage.getItem('ml-academy-user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            return null;
        }
    });

    const [isEnrollOpen, setIsEnrollOpen] = useState(false);
    
    // Progress State
    const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('ml-academy-completed-lessons');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    // AI State
    const [aiQuestion, setAiQuestion] = useState("");
    const [lastAiQuestion, setLastAiQuestion] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [aiLanguage, setAiLanguage] = useState("uz");

    const quickQuestions = [
        "Darsning qisqacha mazmuni",
        "Asosiy terminlar",
        "Koddan namuna"
    ];

    // Initialize Data based on URL Course ID
    useEffect(() => {
        if (!courseId) return;

        // 1. Find Course
        const course = COURSES.find(c => c.id === courseId);
        if (!course) {
            // Course not found
            navigate('/');
            return;
        }

        // 2. Check Permissions
        // Admin always has access
        if (user?.role === 'admin') {
            setCurrentCourse(course);
            if (!currentLesson) setCurrentLesson(course.lessons[0]);
        } else {
            // Check if user's allowedCourses includes this ID
            // OR if user is not logged in (handled by isLessonLocked later for Demo, but need to load course structure)
            const hasAccess = user?.allowedCourses?.includes(courseId);
            
            if (hasAccess || !user) {
                // If user is null, they can see structure but only watch Demo
                // If user is authorized, they see everything
                setCurrentCourse(course);
                if (!currentLesson) setCurrentLesson(course.lessons[0]);
            } else {
                // User is logged in but does not have permission for this specific course
                setAccessDenied(true);
            }
        }

    }, [courseId, user, navigate, currentLesson]);

    // CHECK ACCESS PERMISSIONS FOR VIDEO
    const isLessonLocked = (lesson: Lesson) => {
        // 1. Demo lesson is always open (usually the first lesson or specific ID)
        // Here we assume the first lesson of any course is free/demo
        if (currentCourse && lesson.id === currentCourse.lessons[0].id) return false;
        
        // 2. If user is logged in AND has course permission
        if (user && user.allowedCourses?.includes(currentCourse?.id || '')) return false;

        // 3. Otherwise locked
        return true;
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(inputComment.trim()) {
            const newComment: Comment = {
                id: Date.now().toString(),
                userId: user?.id || "guest",
                userName: user?.name || "Mehmon",
                userAvatar: user?.avatar || "https://picsum.photos/id/64/40/40",
                text: inputComment,
                date: "Hozirgina"
            };
            setComments([newComment, ...comments]);
            setInputComment("");
        }
    };

    const saveDailyProgress = (lessonDuration: string) => {
        const today = new Date().toISOString().split('T')[0];
        const savedProgress = localStorage.getItem('ml-academy-daily-progress');
        let dailyProgress: DailyProgress[] = savedProgress ? JSON.parse(savedProgress) : [];
        
        const [minStr, secStr] = lessonDuration.split(':');
        const minutes = parseInt(minStr || "0") + (parseInt(secStr || "0") / 60);
        
        const todayEntryIndex = dailyProgress.findIndex(p => p.date === today);
        if (todayEntryIndex >= 0) {
            dailyProgress[todayEntryIndex].count += 1;
            dailyProgress[todayEntryIndex].minutesWatched = (dailyProgress[todayEntryIndex].minutesWatched || 0) + minutes;
        } else {
            dailyProgress.push({ date: today, count: 1, minutesWatched: minutes });
        }
        
        if (dailyProgress.length > 30) {
            dailyProgress = dailyProgress.slice(-30);
        }
        
        localStorage.setItem('ml-academy-daily-progress', JSON.stringify(dailyProgress));
    };

    const toggleLessonCompletion = (e: React.MouseEvent, lessonId: string) => {
        e.stopPropagation();
        const isCompleted = completedLessons.includes(lessonId);
        let newCompleted;
        
        if (isCompleted) {
            newCompleted = completedLessons.filter(id => id !== lessonId);
        } else {
            newCompleted = [...completedLessons, lessonId];
            const lesson = currentCourse?.lessons.find(l => l.id === lessonId);
            if (lesson) {
                saveDailyProgress(lesson.duration);
            }
        }
        
        setCompletedLessons(newCompleted);
        localStorage.setItem('ml-academy-completed-lessons', JSON.stringify(newCompleted));
    };

    const handleVideoEnded = () => {
        if (currentLesson && !completedLessons.includes(currentLesson.id)) {
            const newCompleted = [...completedLessons, currentLesson.id];
            setCompletedLessons(newCompleted);
            localStorage.setItem('ml-academy-completed-lessons', JSON.stringify(newCompleted));
            saveDailyProgress(currentLesson.duration);
        }

        const isAutoplay = localStorage.getItem('ml-academy-autoplay') === 'true';
        if (isAutoplay && currentCourse && currentLesson) {
            const currentIndex = currentCourse.lessons.findIndex(l => l.id === currentLesson.id);
            if (currentIndex !== -1 && currentIndex < currentCourse.lessons.length - 1) {
                const nextLesson = currentCourse.lessons[currentIndex + 1];
                if (!isLessonLocked(nextLesson)) {
                    setCurrentLesson(nextLesson);
                }
            }
        }
    };

    const generateAiResponse = async (question: string) => {
        if (!currentLesson) return;
        setIsAiThinking(true);
        setAiResponse("");
        setIsCopied(false);
        
        try {
            const streamResponse = await askAIAboutLesson(question, currentLesson, aiLanguage);
            
            let fullText = "";
            for await (const chunk of streamResponse) {
                const text = chunk.text;
                if (text) {
                    fullText += text;
                    setAiResponse(fullText);
                }
            }
        } catch (error) {
            setAiResponse("Tizimda xatolik yuz berdi. Iltimos keyinroq urinib ko'ring.");
        } finally {
            setIsAiThinking(false);
        }
    };

    const handleAiAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiQuestion.trim()) return;
        setLastAiQuestion(aiQuestion);
        await generateAiResponse(aiQuestion);
    };

    const handleQuickAsk = (question: string) => {
        setAiQuestion(question);
        setLastAiQuestion(question);
        generateAiResponse(question);
    };

    const handleRegenerate = () => {
        if (lastAiQuestion) {
            generateAiResponse(lastAiQuestion);
        }
    };

    const handleCopy = () => {
        if (!aiResponse) return;
        navigator.clipboard.writeText(aiResponse);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (accessDenied) {
        return (
            <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen flex items-center justify-center">
                <GlassCard className="max-w-md w-full text-center p-8 border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Kirish Cheklangan</h2>
                    <p className="text-textMuted mb-6">
                        Siz ushbu kursga kirish huquqiga ega emassiz. Iltimos, administratorga murojaat qiling yoki o'z yo'nalishingizdagi kursni tanlang.
                    </p>
                    <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 transition">
                        <ArrowLeft size={20} /> Kurslarga Qaytish
                    </Link>
                </GlassCard>
            </div>
        );
    }

    if (!currentCourse || !currentLesson) {
        return <div className="min-h-screen pt-32 flex justify-center"><span className="animate-spin text-primary">Loading...</span></div>;
    }

    const progressPercentage = Math.round((completedLessons.filter(id => currentCourse.lessons.some(l => l.id === id)).length / currentCourse.lessons.length) * 100);
    const isLocked = isLessonLocked(currentLesson);

    return (
        <div className="pt-24 pb-10 container mx-auto px-4 h-[calc(100vh-20px)] flex flex-col">
             <div className="mb-4 flex items-center gap-2">
                <Link to="/" className="text-sm font-bold text-textMuted hover:text-primary flex items-center gap-1">
                    <ArrowLeft size={16} /> Barcha Kurslar
                </Link>
                <span className="text-textMuted">/</span>
                <span className="text-sm font-bold text-primary">{currentCourse.title}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-full">
                {/* Left Sidebar - Lesson List */}
                <ScrollReveal direction="right" className={`lg:w-1/4 flex flex-col gap-4 ${isSidebarOpen ? '' : 'hidden lg:flex'}`}>
                     <GlassCard className="p-6 flex-1 overflow-hidden flex flex-col">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold leading-tight mb-2 text-textMain">{currentCourse.title}</h2>
                            <div className="flex items-center justify-between text-xs text-textMuted font-medium uppercase tracking-wider mb-2">
                                <span>{currentCourse.lessons.length} ta dars</span>
                                <span>{progressPercentage}% Tugatildi</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-success transition-all duration-500"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-2">
                            {currentCourse.lessons.map((lesson, index) => {
                                const locked = isLessonLocked(lesson);
                                return (
                                    <div 
                                        key={lesson.id}
                                        onClick={() => setCurrentLesson(lesson)}
                                        className={`p-3 rounded-xl cursor-pointer transition-all border group relative ${
                                            currentLesson.id === lesson.id 
                                            ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20' 
                                            : 'bg-glass border-glassBorder hover:bg-glassBorder'
                                        }`}
                                    >
                                        <div className="flex gap-3 items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                                currentLesson.id === lesson.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300'
                                            }`}>
                                                {locked ? (
                                                    <Lock size={12} />
                                                ) : currentLesson.id === lesson.id ? (
                                                    <Play size={12} className="ml-0.5 fill-current" />
                                                ) : (
                                                    <span className="text-xs font-medium">{index + 1}</span>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-sm font-medium line-clamp-1 transition-colors ${
                                                    currentLesson.id === lesson.id ? 'text-primary-foreground' : (completedLessons.includes(lesson.id) ? 'text-textMuted line-through opacity-70' : 'text-textMain')
                                                }`}>
                                                    {lesson.title}
                                                </h4>
                                                <span className={`text-xs ${currentLesson.id === lesson.id ? 'text-blue-100 opacity-80' : 'text-textMuted'}`}>{lesson.duration}</span>
                                            </div>

                                            {!locked && (
                                                <button
                                                    onClick={(e) => toggleLessonCompletion(e, lesson.id)}
                                                    className={`p-1.5 rounded-full transition-all focus:outline-none ${
                                                        completedLessons.includes(lesson.id) 
                                                        ? (currentLesson.id === lesson.id ? 'text-white' : 'text-success') 
                                                        : (currentLesson.id === lesson.id ? 'text-blue-200 hover:text-white' : 'text-gray-300 dark:text-gray-600 hover:text-primary')
                                                    }`}
                                                >
                                                    {completedLessons.includes(lesson.id) ? (
                                                        <CheckCircle size={20} className="fill-current" />
                                                    ) : (
                                                        <Circle size={20} strokeWidth={1.5} />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                     </GlassCard>
                </ScrollReveal>

                {/* Right Content */}
                <div className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar">
                    <ScrollReveal direction="up" className="w-full">
                        <VideoPlayer 
                            src={currentLesson.videoUrl} 
                            poster={currentLesson.thumbnail} 
                            lessonId={currentLesson.id}
                            onEnded={handleVideoEnded}
                            isLocked={isLocked}
                            onEnrollClick={() => setIsEnrollOpen(true)}
                            userId={user?.id}
                        />
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ScrollReveal direction="up" delay={0.2} className="md:col-span-2 space-y-6">
                             <GlassCard className="p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                                        {currentLesson.title}
                                        {isLocked && <Lock size={20} className="text-textMuted" />}
                                    </h1>
                                    {!isLocked && (
                                        <button 
                                            onClick={(e) => toggleLessonCompletion(e, currentLesson.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                                                completedLessons.includes(currentLesson.id) 
                                                ? 'bg-success text-white border-success shadow-lg shadow-success/20 hover:bg-green-600' 
                                                : 'bg-glass border-glassBorder text-textMuted hover:border-primary hover:text-primary hover:bg-white/50'
                                            }`}
                                        >
                                            {completedLessons.includes(currentLesson.id) ? <CheckCircle size={18} className="fill-current" /> : <Circle size={18} />}
                                            <span className="text-sm font-bold whitespace-nowrap">
                                                {completedLessons.includes(currentLesson.id) ? "Bajarildi" : "Bajarilgan deb belgilash"}
                                            </span>
                                        </button>
                                    )}
                                </div>
                                <p className="text-textMuted leading-relaxed mb-6">{currentLesson.description}</p>
                                
                                <div className="border-t border-glassBorder pt-6">
                                    <h3 className="text-lg font-bold mb-4 text-textMain flex items-center gap-2">
                                        <MessageCircle size={20} className="text-primary" />
                                        Fikr va Mulohazalar
                                    </h3>
                                    
                                    <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-8">
                                        <img src={user?.avatar || "https://picsum.photos/id/64/40/40"} alt="User" className="w-10 h-10 rounded-full border border-glassBorder" />
                                        <div className="flex-1 flex gap-2">
                                            <input 
                                                type="text" 
                                                value={inputComment}
                                                onChange={(e) => setInputComment(e.target.value)}
                                                placeholder={isLocked ? "Dars qulflangan" : "Dars haqida fikringiz..."}
                                                disabled={isLocked}
                                                className="flex-1 bg-glass/50 border border-glassBorder rounded-xl px-4 py-2 text-textMain placeholder:text-textMuted focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                                            />
                                            <button type="submit" disabled={!inputComment.trim() || isLocked} className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </form>

                                    <div className="space-y-6">
                                        {comments.map(comment => (
                                            <div key={comment.id} className="flex gap-4">
                                                <img src={comment.userAvatar} alt={comment.userName} className="w-10 h-10 rounded-full border border-glassBorder" />
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-sm text-textMain">{comment.userName}</span>
                                                        <span className="text-xs text-textMuted">{comment.date}</span>
                                                    </div>
                                                    <p className="text-textMuted text-sm bg-glass/50 p-3 rounded-xl rounded-tl-none border border-glassBorder">
                                                        {comment.text}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             </GlassCard>
                        </ScrollReveal>

                         <ScrollReveal direction="left" delay={0.3} className="space-y-6">
                            <GlassCard className="p-6 border-2 border-primary/20 relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                                <div className="relative">
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                                        <div className="flex items-center gap-2 text-primary font-bold text-lg">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Cpu size={20} />
                                            </div>
                                            AI Yordamchi
                                        </div>
                                        <div className="flex items-center gap-1 bg-glassBorder rounded-lg p-1">
                                            <Languages size={14} className="text-textMuted ml-1" />
                                            <select 
                                                value={aiLanguage}
                                                onChange={(e) => setAiLanguage(e.target.value)}
                                                disabled={isLocked}
                                                className="bg-transparent text-xs font-medium text-textMain focus:outline-none p-1 cursor-pointer"
                                            >
                                                <option value="uz">O'zbek</option>
                                                <option value="en">English</option>
                                                <option value="ru">Русский</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {quickQuestions.map((q, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleQuickAsk(q)}
                                                disabled={isLocked || isAiThinking}
                                                className="text-xs font-medium bg-primary/5 hover:bg-primary/10 text-primary px-3 py-1.5 rounded-lg transition-colors border border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>

                                    <form onSubmit={handleAiAsk} className="space-y-3">
                                        <textarea 
                                            value={aiQuestion}
                                            onChange={(e) => setAiQuestion(e.target.value)}
                                            placeholder={isLocked ? "Bu dars qulflangan." : "Masalan: Hooks qanday ishlaydi?"}
                                            disabled={isLocked}
                                            className="w-full h-24 bg-glass/50 border border-glassBorder rounded-xl p-3 text-sm text-textMain placeholder:text-textMuted resize-none focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={isAiThinking || !aiQuestion.trim() || isLocked}
                                            className="w-full py-2.5 bg-accent text-accent-foreground rounded-xl font-bold text-sm shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                        >
                                            {isAiThinking ? (
                                                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                            ) : (
                                                <>So'rash <Send size={16} /></>
                                            )}
                                        </button>
                                    </form>
                                    
                                    {(aiResponse || isAiThinking) && (
                                        <div className="mt-4 pt-4 border-t border-glassBorder animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-primary uppercase tracking-wide">Javob:</span>
                                                <div className="flex items-center gap-1">
                                                     <button 
                                                        onClick={handleRegenerate}
                                                        disabled={isAiThinking || !lastAiQuestion}
                                                        className="p-1.5 text-textMuted hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                    >
                                                        <RotateCw size={14} className={isAiThinking ? 'animate-spin' : ''} />
                                                    </button>
                                                    <button 
                                                        onClick={handleCopy}
                                                        className={`p-1.5 rounded-lg transition-all ${
                                                            isCopied 
                                                            ? 'text-success bg-success/10' 
                                                            : 'text-textMuted hover:text-primary hover:bg-primary/5'
                                                        }`}
                                                    >
                                                        {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="bg-primary/5 rounded-xl p-3 text-sm text-textMain leading-relaxed border border-primary/10 max-h-60 overflow-y-auto no-scrollbar">
                                                {aiResponse ? aiResponse : <span className="animate-pulse text-textMuted">AI o'ylamoqda...</span>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </GlassCard>
                        </ScrollReveal>
                    </div>
                </div>
            </div>
            
            <EnrollModal isOpen={isEnrollOpen} onClose={() => setIsEnrollOpen(false)} />
        </div>
    );
};