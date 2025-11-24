import { Course, Lesson, Comment, User } from './types';

// Auth Configuration
// These are the ONLY accounts that can log in initially.
export const USERS_DB: User[] = [
    {
        id: 'u_student_1',
        email: 'student@mlacademy.com',
        password: 'password123',
        name: 'Jasurbek (Frontend)',
        avatar: 'https://picsum.photos/id/55/200/200',
        role: 'student',
        joinedDate: '2023-11-15T10:00:00.000Z',
        lastLoginDate: new Date().toISOString(),
        allowedCourses: ['course-frontend'] // Only Frontend access
    },
    {
        id: 'u_student_ai',
        email: 'ai@mlacademy.com',
        password: 'ai123',
        name: 'Malika (AI Student)',
        avatar: 'https://picsum.photos/id/65/200/200',
        role: 'student',
        joinedDate: '2024-01-10T10:00:00.000Z',
        lastLoginDate: new Date().toISOString(),
        allowedCourses: ['course-ai'] // Only AI access
    },
    {
        id: 'u_admin_1',
        email: 'admin@mlacademy.com',
        password: 'admin',
        name: 'Admin User',
        avatar: 'https://picsum.photos/id/100/200/200',
        role: 'admin',
        joinedDate: '2023-10-01T10:00:00.000Z',
        lastLoginDate: new Date().toISOString(),
        allowedCourses: ['course-frontend', 'course-ai'] // Access to all
    }
];

export const DEMO_LESSON_ID = "demo"; // Key to identify demo lessons (logic handled in components)

// Mock Courses Data
export const COURSES: Course[] = [
    {
        id: "course-frontend",
        title: "React va Frontend",
        description: "Zamonaviy veb dasturlash, React, TypeScript va Tailwind CSS texnologiyalari.",
        author: "Senior Frontend Dev",
        thumbnail: "https://picsum.photos/id/1/800/600",
        category: "programming",
        lessons: [
            {
                id: "l_fe_1",
                title: "1. Kirish va O'rnatish (Bepul)",
                duration: "10:24",
                description: "Ushbu darsda biz kerakli dasturlarni o'rnatamiz va loyiha strukturasini tuzamiz.",
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                thumbnail: "https://picsum.photos/id/1/300/200"
            },
            {
                id: "l_fe_2",
                title: "2. JSX va Komponentlar",
                duration: "15:30",
                description: "React komponentlari qanday ishlashini va JSX sintaksisini o'rganamiz.",
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                thumbnail: "https://picsum.photos/id/2/300/200"
            },
            {
                id: "l_fe_3",
                title: "3. Hooks: useState va useEffect",
                duration: "20:15",
                description: "Reactning eng muhim xususiyatlari bo'lgan Hooklar bilan tanishamiz.",
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                thumbnail: "https://picsum.photos/id/3/300/200"
            }
        ]
    },
    {
        id: "course-ai",
        title: "Sun'iy Intellekt Asoslari",
        description: "Python, Machine Learning va Neural Networks dunyosiga sayohat.",
        author: "AI Researcher",
        thumbnail: "https://picsum.photos/id/26/800/600",
        category: "ai",
        lessons: [
             {
                id: "l_ai_1",
                title: "1. AI ga kirish (Bepul)",
                duration: "12:00",
                description: "Sun'iy intellekt nima va u qanday ishlaydi? Asosiy tushunchalar.",
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                thumbnail: "https://picsum.photos/id/20/300/200"
            },
            {
                id: "l_ai_2",
                title: "2. Python Asoslari",
                duration: "25:00",
                description: "Data Science uchun Python dasturlash tilining asosiy kutubxonalari.",
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
                thumbnail: "https://picsum.photos/id/22/300/200"
            },
            {
                id: "l_ai_3",
                title: "3. Neural Networks",
                duration: "30:15",
                description: "Neyron tarmoqlar arxitekturasi va ularni o'qitish jarayoni.",
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
                thumbnail: "https://picsum.photos/id/24/300/200"
            }
        ]
    }
];

export const MOCK_COMMENTS: Comment[] = [
    {
        id: "c1",
        userId: "u2",
        userName: "Azizbek Tursunov",
        userAvatar: "https://picsum.photos/id/64/50/50",
        text: "Juda foydali dars bo'ldi, rahmat! Tushuntirish uslubi a'lo.",
        date: "2 soat oldin"
    },
    {
        id: "c2",
        userId: "u3",
        userName: "Madina Karimova",
        userAvatar: "https://picsum.photos/id/65/50/50",
        text: "Keyingi darslarni intizorlik bilan kutaman.",
        date: "5 soat oldin"
    }
];

export const SOCIAL_LINKS = {
    telegram: "https://t.me/username",
    instagram: "https://instagram.com/username",
    linkedin: "https://linkedin.com/in/username"
};