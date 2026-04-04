import React, { useState } from 'react';
import { 
  X, Bell, Calendar, Type, AlignLeft, 
  Sparkles, ShieldCheck, HeartPulse, Brain, Moon, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddReminderModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const API = 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');

const AddReminderModal: React.FC<AddReminderModalProps> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    reminderTime: '',
    reminderDays: 'Daily',
    icon: '🔔',
    color: 'text-teal-600'
  });
  const [loading, setLoading] = useState(false);

  const icons = [
    { name: 'Bell', icon: Bell, value: '🔔' },
    { name: 'Mind', icon: Brain, value: '🧠' },
    { name: 'Heart', icon: HeartPulse, value: '❤️' },
    { name: 'Night', icon: Moon, value: '🌙' },
    { name: 'Activity', icon: ShieldCheck, value: '🛡️' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.reminderTime) {
      toast.error("Please provide a title and time.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/reminders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}` 
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Neural Reminder Synchronized");
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Protocol Failure");
      }
    } catch (error) {
      toast.error("Network Synchronicity Lost");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-2xl animate-fade-in">
      <Card className="w-full max-w-xl harmonic-glass border-white p-12 space-y-10 shadow-iris relative overflow-hidden rounded-[4rem]">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 rounded-2xl hover:bg-slate-50 text-slate-400 transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="space-y-4 text-center">
            <div className="w-20 h-20 rounded-[2.5rem] bg-teal-50 flex items-center justify-center border border-white mx-auto shadow-inner">
                <Bell className="w-10 h-10 text-teal-600 animate-float-harmonic" />
            </div>
            <div>
                <h2 className="text-4xl font-serif font-black italic tracking-tighter text-slate-800">Establish Neural Link</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-600/60 leading-none">Establishing Routine Consistency Protocol</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="relative group">
              <Type className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
              <input 
                placeholder="Reminder Title (e.g. Zen Meditation)"
                className="w-full h-16 pl-16 pr-8 rounded-2xl harmonic-glass-hover bg-white/50 border-white text-base font-black text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 shadow-soft"
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="relative group">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="time"
                        className="w-full h-16 pl-16 pr-8 rounded-2xl harmonic-glass-hover bg-white/50 border-white text-base font-black text-slate-900 placeholder:text-slate-400 focus:outline-none shadow-soft"
                        value={form.reminderTime}
                        onChange={e => setForm({...form, reminderTime: e.target.value})}
                    />
                </div>
                <select 
                    className="w-full h-16 px-8 rounded-2xl harmonic-glass-hover bg-white/50 border-white text-xs font-black uppercase tracking-widest text-slate-900 focus:outline-none shadow-soft"
                    value={form.reminderDays}
                    onChange={e => setForm({...form, reminderDays: e.target.value})}
                >
                    <option value="Daily">Daily Sync</option>
                    <option value="Weekdays">Weekdays Only</option>
                    <option value="Weekends">Weekends Only</option>
                </select>
            </div>

            <div className="relative group">
              <AlignLeft className="absolute left-6 top-8 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
              <textarea 
                placeholder="Neural Description (Optional)..."
                rows={3}
                className="w-full pl-16 pr-8 py-6 rounded-3xl harmonic-glass-hover bg-white/50 border-white text-base font-black text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 shadow-soft"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-3xl bg-teal-50/50 border border-teal-100/50 border-dashed">
             <p className="text-[9px] font-black uppercase tracking-widest text-teal-600 px-4">Neural Icon Protocol:</p>
             <div className="flex gap-4">
                {icons.map((item, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setForm({...form, icon: item.value})}
                        className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                            form.icon === item.value ? "bg-teal-600 text-white shadow-lg scale-110" : "bg-white text-slate-300 hover:text-teal-600"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                    </button>
                ))}
             </div>
          </div>

          <Button 
            disabled={loading}
            className="w-full h-20 btn-aura rounded-3xl text-xs font-black uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95"
          >
            {loading ? 'Synchronizing Neural Link...' : 'Baseline Reminder'}
            <Sparkles className="ml-4 w-5 h-5 text-amber-300" />
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AddReminderModal;
