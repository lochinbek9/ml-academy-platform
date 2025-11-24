import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPanelPage } from './pages/AdminPanelPage';

const App = () => {
    return (
        <Router>
            <div className="min-h-screen relative overflow-x-hidden text-textMain font-sans bg-background transition-colors duration-300">
                {/* Ambient Background */}
                {/* Blue Orb */}
                <div className="fixed top-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-400/30 dark:bg-blue-900/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
                {/* Yellow/Accent Orb */}
                <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-yellow-200/30 dark:bg-yellow-900/10 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
                {/* Green/Success Hint */}
                <div className="fixed top-[40%] left-[30%] w-[400px] h-[400px] bg-green-200/20 dark:bg-green-900/10 rounded-full blur-[100px] -z-10"></div>

                <Navbar />

                <main>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        {/* Dynamic Course Route */}
                        <Route path="/dashboard/:courseId" element={<DashboardPage />} />
                        <Route path="/adminpanel" element={<AdminPanelPage />} />
                    </Routes>
                </main>

                <Routes>
                    <Route path="/dashboard/:courseId" element={<></>} />
                    <Route path="/adminpanel" element={<></>} />
                    <Route path="*" element={<Footer />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;