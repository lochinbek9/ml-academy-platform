import React, { useState } from 'react';
import { X, User, Phone, Send, CheckCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Lead } from '../types';

interface EnrollModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EnrollModal: React.FC<EnrollModalProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone) return;

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            const newLead: Lead = {
                id: 'lead_' + Date.now(),
                name,
                phone,
                date: new Date().toISOString(),
                status: 'new'
            };

            // Save to localStorage
            const savedLeads = localStorage.getItem('ml-academy-leads');
            const leads: Lead[] = savedLeads ? JSON.parse(savedLeads) : [];
            localStorage.setItem('ml-academy-leads', JSON.stringify([newLead, ...leads]));

            setIsSubmitting(false);
            setIsSuccess(true);
            
            // Reset form
            setName('');
            setPhone('');

            // Close after 2 seconds
            setTimeout(() => {
                setIsSuccess(false);
                onClose();
            }, 2000);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            <GlassCard className="w-full max-w-md p-8 relative animate-in fade-in zoom-in-95 duration-200">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-textMuted hover:text-textMain transition-colors"
                >
                    <X size={24} />
                </button>

                {isSuccess ? (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-textMain mb-2">Arizangiz qabul qilindi!</h2>
                        <p className="text-textMuted">Tez orada operatorlarimiz siz bilan bog'lanishadi.</p>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-primary mb-2">Kursga Yozilish</h2>
                            <p className="text-textMuted text-sm">Ma'lumotlaringizni qoldiring va biz sizga kurs haqida to'liq ma'lumot beramiz.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-textMain ml-1 uppercase">Ism Familiya</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted">
                                        <User size={18} />
                                    </div>
                                    <input 
                                        type="text" 
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Azizbek Tursunov"
                                        className="w-full pl-11 pr-4 py-3 bg-glass/50 border border-glassBorder rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-textMain"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-textMain ml-1 uppercase">Telefon Raqam</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted">
                                        <Phone size={18} />
                                    </div>
                                    <input 
                                        type="tel" 
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+998 90 123 45 67"
                                        className="w-full pl-11 pr-4 py-3 bg-glass/50 border border-glassBorder rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-textMain"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-accent text-accent-foreground rounded-xl font-bold shadow-lg shadow-accent/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        Yuborish <Send size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </GlassCard>
        </div>
    );
};