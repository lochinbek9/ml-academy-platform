export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role?: 'admin' | 'student'; // Role based access
    password?: string; // For mock DB management only
    lastLoginDate?: string; // ISO Date string for stats
    joinedDate: string; // ISO Date string for growth stats
    allowedCourses: string[]; // IDs of courses the user can access
}

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
    date: string;
}

export interface Lesson {
    id: string;
    title: string;
    duration: string;
    videoUrl: string; // In a real app, this would be a stream URL
    description: string;
    thumbnail: string;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    author: string;
    lessons: Lesson[];
    thumbnail: string;
    category: 'programming' | 'ai';
}

export interface DailyProgress {
    date: string; // YYYY-MM-DD
    count: number; // Number of lessons completed
    minutesWatched?: number; // Total minutes watched
}

export interface Lead {
    id: string;
    name: string;
    phone: string;
    date: string;
    status: 'new' | 'contacted';
}