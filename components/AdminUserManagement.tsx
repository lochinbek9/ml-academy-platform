import React, { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Shield, User, Save, Lock } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { USERS_DB } from '../constants';
import { User as UserType } from '../types';

interface AdminUserManagementProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ isOpen, onClose }) => {
    const [users, setUsers] = useState<UserType[]>([]);
    
    // Form State
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    // newRole state removed, defaulting to student

    useEffect(() => {
        if (isOpen) {
            loadUsers();
        }
    }, [isOpen]);

    const loadUsers = () => {
        // Load default users
        const defaultUsers = USERS_DB;
        // Load stored users
        let storedUsers: UserType[] = [];
        try {
            const stored = localStorage.getItem('ml-academy-db-users');
            if (stored) {
                storedUsers = JSON.parse(stored);
            }
        } catch (e) {
            console.error("Error loading users", e);
        }
        
        // Combine
        setUsers([...defaultUsers, ...storedUsers]);
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
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
            role: 'student', // Always default to student
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=random`,
            joinedDate: new Date().toISOString(),
            allowedCourses: [] // Default to no access
        };

        // Save to LocalStorage
        const stored = localStorage.getItem('ml-academy-db-users');
        const currentStored: UserType[] = stored ? JSON.parse(stored) : [];
        const updatedStored = [...currentStored, newUser];
        
        localStorage.setItem('ml-academy-db-users', JSON.stringify(updatedStored));
        
        // Update State
        loadUsers();
        
        // Reset Form
        setNewName('');
        setNewEmail('');
        setNewPassword('');
        
        alert("Foydalanuvchi muvaffaqiyatli qo'shildi!");
    };

    const handleDeleteUser = (userId: string, isDefault: boolean) => {
        if (isDefault) {
            alert("Boshlang'ich admin yoki studentni o'chirib bo'lmaydi!");
            return;
        }

        if (confirm("Rostdan ham bu foydalanuvchini o'chirmoqchimisiz?")) {
             const stored = localStorage.getItem('ml-academy-db-users');
             if (stored) {
                 const currentStored: UserType[] = JSON.parse(stored);
                 const updatedStored = currentStored.filter(u => u.id !== userId);
                 localStorage.setItem('ml-academy-db-users', JSON.stringify(updatedStored));
                 loadUsers();
             }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-glassBorder flex items-center justify-between bg-primary/10">
                    <div>
                        <h2 className="text-2xl font-bold text-textMain flex items-center gap-2">
                            <Shield className="text-primary" /> Admin Panel
                        </h2>
                        <p className="text-textMuted text-sm">Foydalanuvchilar va kirish huquqlarini boshqarish</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-textMuted">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row h-full overflow-hidden">
                    {/* Add User Form */}
                    <div className="w-full md:w-1/3 p-6 border-r border-glassBorder bg-glass/30 overflow-y-auto">
                        <h3 className="font-bold text-textMain mb-4 flex items-center gap-2">
                            <UserPlus size={18} /> Yangi qo'shish
                        </h3>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-textMuted uppercase">Ism Familiya</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="Valijon G'aniyev"
                                    className="w-full mt-1 px-3 py-2 bg-glass border border-glassBorder rounded-lg focus:outline-none focus:border-primary text-textMain"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-textMuted uppercase">Email (Login)</label>
                                <input 
                                    type="email" 
                                    required
                                    value={newEmail}
                                    onChange={e => setNewEmail(e.target.value)}
                                    placeholder="student@example.com"
                                    className="w-full mt-1 px-3 py-2 bg-glass border border-glassBorder rounded-lg focus:outline-none focus:border-primary text-textMain"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-textMuted uppercase">Parol</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="parol123"
                                    className="w-full mt-1 px-3 py-2 bg-glass border border-glassBorder rounded-lg focus:outline-none focus:border-primary text-textMain"
                                />
                            </div>

                            <button type="submit" className="w-full py-3 bg-success text-white rounded-xl font-bold hover:bg-green-600 transition shadow-lg shadow-success/20 flex items-center justify-center gap-2">
                                <Save size={18} /> Saqlash
                            </button>
                        </form>
                    </div>

                    {/* Users List */}
                    <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 dark:bg-black/20">
                        <h3 className="font-bold text-textMain mb-4">Mavjud Foydalanuvchilar ({users.length})</h3>
                        <div className="space-y-3">
                            {users.map(u => {
                                const isDefault = USERS_DB.some(dbUser => dbUser.id === u.id);
                                return (
                                    <div key={u.id} className="bg-glass border border-glassBorder p-4 rounded-xl flex items-center justify-between group hover:border-primary/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full border border-glassBorder" />
                                                {u.role === 'admin' && (
                                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full border border-white" title="Admin">
                                                        <Shield size={10} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-textMain text-sm">{u.name}</h4>
                                                <p className="text-xs text-textMuted">{u.email}</p>
                                                <p className="text-[10px] text-textMuted mt-0.5 font-mono bg-black/5 dark:bg-white/5 inline-block px-1 rounded">Parol: {u.password}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            {isDefault ? (
                                                <span className="text-xs text-textMuted bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">Tizim</span>
                                            ) : (
                                                <button 
                                                    onClick={() => handleDeleteUser(u.id, isDefault)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                    title="O'chirish"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};