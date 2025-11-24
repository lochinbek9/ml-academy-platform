import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Play, Pause, Maximize, Volume2, VolumeX, Zap, ZapOff, Lock, Gauge } from 'lucide-react';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    onEnded?: () => void;
    lessonId: string;
    isLocked?: boolean;
    onEnrollClick?: () => void;
    userId?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, onEnded, lessonId, isLocked = false, onEnrollClick, userId }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    
    // Unique storage key for this user and lesson
    const storageKey = userId 
        ? `video-progress-${userId}-${lessonId}` 
        : `video-progress-${lessonId}`;

    // Autoplay State
    const [isAutoplay, setIsAutoplay] = useState(() => {
        return localStorage.getItem('ml-academy-autoplay') === 'true';
    });
    
    // Track last saved time to throttle localStorage writes
    const lastSavedTimeRef = useRef<number>(0);

    const togglePlay = useCallback(() => {
        if (isLocked) return;
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    }, [isLocked]);

    const toggleMute = useCallback(() => {
        if (videoRef.current) {
            const newMute = !videoRef.current.muted;
            videoRef.current.muted = newMute;
            setIsMuted(newMute);
        }
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement && containerRef.current) {
            containerRef.current.requestFullscreen();
        } else {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
        }
    }, []);

    const changeSpeed = (rate: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
            setPlaybackRate(rate);
            setShowSpeedMenu(false);
        }
    };

    const toggleAutoplay = () => {
        const newValue = !isAutoplay;
        setIsAutoplay(newValue);
        localStorage.setItem('ml-academy-autoplay', String(newValue));
    };

    // Keyboard Controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isLocked) return;
            
            // Ignore keyboard shortcuts if user is typing in an input field
            if (document.activeElement instanceof HTMLInputElement || 
                document.activeElement instanceof HTMLTextAreaElement) {
                return;
            }

            if (!videoRef.current) return;

            switch (e.key) {
                case ' ': // Spacebar to Play/Pause
                case 'k':
                    e.preventDefault(); // Prevent page scrolling
                    togglePlay();
                    break;
                case 'ArrowRight': // Seek forward 5s
                    e.preventDefault();
                    videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 5);
                    break;
                case 'ArrowLeft': // Seek backward 5s
                    e.preventDefault();
                    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
                    break;
                case 'ArrowUp': // Increase Volume
                    e.preventDefault();
                    videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.1);
                    if (videoRef.current.muted && videoRef.current.volume > 0) {
                        toggleMute(); // Unmute if volume is increased
                    }
                    break;
                case 'ArrowDown': // Decrease Volume
                    e.preventDefault();
                    videoRef.current.volume = Math.max(0, videoRef.current.volume - 0.1);
                    if (videoRef.current.volume === 0 && !videoRef.current.muted) {
                        toggleMute(); // Mute if volume hits 0
                    }
                    break;
                case 'f': // Fullscreen
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'm': // Mute
                    e.preventDefault();
                    toggleMute();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay, toggleFullscreen, toggleMute, isLocked]);

    // Update play state when src changes if autoplay is on
    useEffect(() => {
        if (videoRef.current && !isLocked) {
            if (isAutoplay) {
                // Logic handled by autoPlay prop, but we ensure state sync
                setIsPlaying(true);
            } else {
                setIsPlaying(false);
            }
        }
    }, [src, isAutoplay, isLocked]);

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const savedProgress = localStorage.getItem(storageKey);
            if (savedProgress) {
                const time = parseFloat(savedProgress);
                if (!isNaN(time) && isFinite(time)) {
                    // Resume if saved time is valid and not at the very end
                    if (time < videoRef.current.duration - 2) {
                        videoRef.current.currentTime = time;
                    }
                }
            }
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            if (duration) {
                setProgress((current / duration) * 100);
            }

            // Save progress every 1 second
            if (Math.abs(current - lastSavedTimeRef.current) > 1) {
                localStorage.setItem(storageKey, current.toString());
                lastSavedTimeRef.current = current;
            }
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isLocked) return;
        const seekTo = parseFloat(e.target.value);
        if (videoRef.current) {
            const time = (videoRef.current.duration / 100) * seekTo;
            videoRef.current.currentTime = time;
            setProgress(seekTo);
        }
    };

    const formatTime = (seconds: number) => {
        if (!seconds) return "00:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div 
            ref={containerRef} 
            className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-200 group select-none"
            onMouseEnter={() => !isLocked && setIsHovering(true)}
            onMouseLeave={() => {
                setIsHovering(false);
                setShowSpeedMenu(false);
            }}
        >
            {isLocked ? (
                // Locked Overlay
                <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20 p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 border border-white/20 shadow-lg">
                        <Lock size={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Premium Dars</h3>
                    <p className="text-gray-300 max-w-md mb-6">
                        Bu darsni ko'rish uchun siz maxsus ruxsatga ega bo'lishingiz kerak. Iltimos, kursga to'liq yoziling.
                    </p>
                    <button 
                        onClick={onEnrollClick}
                        className="px-6 py-2 bg-accent text-accent-foreground rounded-lg font-bold hover:bg-yellow-400 transition"
                    >
                        Kursga yozilish
                    </button>
                </div>
            ) : (
                // Actual Video
                <video
                    ref={videoRef}
                    src={src}
                    poster={poster}
                    autoPlay={isAutoplay}
                    className="w-full h-full object-cover"
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => {
                        setIsPlaying(false);
                        // Clear progress when video finishes so next time it starts from 0
                        localStorage.removeItem(storageKey);
                        if (onEnded) onEnded();
                    }}
                    onClick={togglePlay}
                    playsInline
                />
            )}

            {/* Overlay Controls (Only if not locked) */}
            {!isLocked && (
                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-8 transition-opacity duration-300 ${isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                    
                    {/* Progress Bar */}
                    <div className="relative w-full h-1 bg-white/30 rounded-full mb-4 cursor-pointer group/progress hover:h-1.5 transition-all">
                        <div 
                            className="absolute top-0 left-0 h-full bg-accent rounded-full transition-all" 
                            style={{ width: `${progress}%` }} 
                        />
                        <div 
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg"
                            style={{ left: `${progress}%` }} 
                        />
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={progress} 
                            onChange={handleSeek} 
                            className="absolute top-[-5px] w-full h-4 opacity-0 cursor-pointer z-10"
                        />
                    </div>

                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-4">
                            <button onClick={togglePlay} className="hover:text-accent transition focus:outline-none" title="Play/Pause (Space)">
                                {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
                            </button>

                            <button onClick={toggleMute} className="hover:text-accent transition focus:outline-none" title="Mute/Unmute (M)">
                                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>

                            <span className="text-sm font-medium tabular-nums">
                                {videoRef.current ? formatTime(videoRef.current.currentTime) : "00:00"} / 
                                {videoRef.current ? formatTime(videoRef.current.duration) : "00:00"}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 relative">
                            <button 
                                onClick={toggleAutoplay} 
                                className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors hover:bg-white/10 ${isAutoplay ? 'text-accent' : 'text-white/70'}`}
                                title={isAutoplay ? "Autoplay On" : "Autoplay Off"}
                            >
                                {isAutoplay ? <Zap size={18} className="fill-current" /> : <ZapOff size={18} />}
                                <span className="text-xs font-bold hidden sm:inline">AUTO</span>
                            </button>

                            <div className="relative">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowSpeedMenu(!showSpeedMenu);
                                    }}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded transition-colors hover:bg-white/10 text-white/90 hover:text-white"
                                    title="Playback Speed"
                                >
                                    <Gauge size={18} />
                                    <span className="text-sm font-bold tabular-nums">{playbackRate}x</span>
                                </button>
                                {showSpeedMenu && (
                                    <div className="absolute bottom-full mb-3 right-0 bg-black/90 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 flex flex-col min-w-[100px] shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                                        {[0.5, 1.0, 1.25, 1.5, 2.0].map(rate => (
                                            <button 
                                                key={rate} 
                                                onClick={() => changeSpeed(rate)}
                                                className={`px-4 py-2.5 text-left text-sm hover:bg-white/20 flex justify-between items-center transition-colors ${playbackRate === rate ? 'text-accent bg-white/10' : 'text-white'}`}
                                            >
                                                <span>{rate}x</span>
                                                {playbackRate === rate && <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(250,204,21,0.8)]" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button onClick={toggleFullscreen} className="hover:text-accent transition focus:outline-none" title="Fullscreen (F)">
                                <Maximize size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Center Play Button when paused and not locked */}
            {!isPlaying && !isLocked && (
                <div 
                    onClick={togglePlay}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center 
                    border border-white/40 hover:scale-110 hover:bg-white/20 transition-all cursor-pointer group/play shadow-2xl z-10"
                >
                    <Play size={32} fill="white" className="ml-1 opacity-90 group-hover/play:opacity-100" />
                </div>
            )}
        </div>
    );
};