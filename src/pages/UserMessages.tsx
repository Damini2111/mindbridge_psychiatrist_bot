import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, ArrowLeft, HeartPulse, Sparkles, 
  ShieldCheck, Activity, Phone, MoreHorizontal 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const API = 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');

const UserMessages = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchProfile();
        // For now, using a mock interval or just one-time fetch. 
        // Real-time would use WebSockets or polling.
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API}/user/profile`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if (data.success) {
                setUserData(data.user);
                if (!data.user.can_message) {
                    toast.error("Clinical access restricted.");
                    navigate('/dashboard');
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const msg = input.trim();
        setInput('');
        
        const newMsg = {
            id: Date.now(),
            sender: 'user',
            content: msg,
            created_at: new Date()
        };

        setMessages(prev => [...prev, newMsg]);
        setLoading(true);

        try {
            // Mocking the psychiatrist response for now as we don't have a real-time psychiatrist backend yet
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'psychiatrist',
                    content: "I have received your message. I will review your latest biometric logs and get back to you shortly during our core sync hours.",
                    created_at: new Date()
                }]);
                setLoading(false);
            }, 1500);
        } catch (e) {
            toast.error("Transmission failed.");
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div className="h-screen flex flex-col bg-[#fafafa]">
            <Navbar userRole="user" onLogout={handleLogout} />
            
            <header className="fixed top-24 left-0 right-0 z-50 px-6 pointer-events-none">
                <div className="container mx-auto flex justify-between items-center pointer-events-auto">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="harmonic-glass px-6 py-3 rounded-2xl flex items-center gap-3 text-slate-600 hover:bg-white transition-all shadow-xl border-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest italic">Dashboard</span>
                    </button>

                    <div className="harmonic-glass px-8 py-3 rounded-2xl border-emerald-500/20 bg-emerald-50/80 flex items-center gap-4 shadow-xl backdrop-blur-xl border-l-[6px] border-l-emerald-600">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700/60 leading-none mb-1">Secure Protocol</p>
                            <h3 className="text-lg font-black text-slate-800 tracking-tighter italic">Clinical Specialist <span className="text-emerald-600">Sync</span></h3>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto max-w-4xl pt-48 pb-32 px-6 flex flex-col relative z-0">
                <div className="flex-1 overflow-y-auto space-y-10 scrollbar-hide py-10">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
                            <div className="w-24 h-24 rounded-[3rem] bg-teal-50 flex items-center justify-center border border-white shadow-soft">
                                <HeartPulse className="w-12 h-12 text-teal-600 animate-pulse" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-4xl font-serif font-black italic tracking-tighter text-slate-900">Clinical Sanctuary</h2>
                                <p className="text-slate-400 font-medium max-w-xs mx-auto">Establishing a secure neural link with your clinical supervisor.</p>
                            </div>
                            <div className="p-8 harmonic-glass border-white/50 rounded-[3rem] text-xs font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-4">
                               <ShieldCheck className="w-5 h-5 text-emerald-500" />
                               RSA-4096 End-to-End Clinical Encryption Active
                            </div>
                        </div>
                    ) : (
                        messages.map((m, i) => (
                            <div key={i} className={cn(
                                "flex animate-in slide-in-from-bottom-4 duration-500",
                                m.sender === 'user' ? "justify-end" : "justify-start"
                            )}>
                                <div className={cn(
                                    "max-w-[75%] space-y-2",
                                    m.sender === 'user' ? "items-end text-right" : "items-start text-left"
                                )}>
                                    <div className={cn(
                                        "p-6 rounded-[2.5rem] shadow-soft text-base font-medium leading-relaxed",
                                        m.sender === 'user' 
                                            ? "bg-teal-600 text-white rounded-tr-none" 
                                            : "harmonic-glass bg-white border-white text-slate-800 rounded-tl-none shadow-harmonic"
                                    )}>
                                        {m.content}
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-4 opacity-60">
                                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={scrollRef} />
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 p-8 z-50">
                <div className="container mx-auto max-w-4xl">
                    <div className="harmonic-glass p-3 shadow-harmonic flex items-center gap-3 border-white rounded-[2.5rem] bg-white/40">
                         <Button variant="ghost" size="icon" className="w-14 h-14 rounded-full text-slate-300 hover:text-teal-600 hover:bg-teal-50 shrink-0">
                            <MoreHorizontal className="w-6 h-6" />
                         </Button>
                         
                         <input 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Message clinical protocol staff..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-base font-medium py-4 px-2 placeholder:text-slate-400"
                         />

                         <Button 
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="w-14 h-14 rounded-2xl bg-teal-600 shadow-xl shadow-teal-200 text-white shrink-0 hover:scale-105 transition-all active:scale-95"
                         >
                            <Send className="w-6 h-6" />
                         </Button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default UserMessages;
