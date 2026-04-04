import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, RotateCcw, TrendingUp, Heart, Brain, Zap, Sparkles, ShieldCheck } from 'lucide-react';
import StressGauge from '@/components/StressGauge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const API = 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token') || '';

const QUESTIONS = [
  {
    id: 1, category: 'stress',
    emoji: '🌊',
    text: "How often have you felt swept away by things outside your control?",
    color: 'text-primary',
    bg: 'bg-primary/10',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'],
  },
  {
    id: 2, category: 'stress',
    emoji: '😤',
    text: "How often have you felt nervous or stressed about something important?",
    color: 'text-accent',
    bg: 'bg-accent/10',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'],
  },
  {
    id: 3, category: 'coping',
    emoji: '🧘',
    text: "How often have you been able to control irritations in your life?",
    color: 'text-success',
    bg: 'bg-success/10',
    reversed: true,
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'],
  },
  {
    id: 4, category: 'stress',
    emoji: '🔋',
    text: "How often have you felt difficulties were piling up so high that you couldn't overcome them?",
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'],
  },
  {
    id: 5, category: 'coping',
    emoji: '🎯',
    text: "How often have you felt confident about your ability to handle personal problems?",
    color: 'text-warning',
    bg: 'bg-warning/10',
    reversed: true,
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'],
  },
  {
    id: 6, category: 'anxiety',
    emoji: '😟',
    text: "Over the last 2 weeks, how often have you felt little interest or pleasure in doing things?",
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    options: ['Not at all', 'Several days', 'More than half', 'Nearly every day'],
  },
  {
    id: 7, category: 'anxiety',
    emoji: '😰',
    text: "Over the last 2 weeks, how often have you felt feeling down, depressed, or hopeless?",
    color: 'text-primary',
    bg: 'bg-primary/10',
    options: ['Not at all', 'Several days', 'More than half', 'Nearly every day'],
  },
  {
    id: 8, category: 'anxiety',
    emoji: '🫀',
    text: "Over the last 2 weeks, how often have you felt feeling anxious, worried, or on edge?",
    color: 'text-accent',
    bg: 'bg-accent/10',
    options: ['Not at all', 'Several days', 'More than half', 'Nearly every day'],
  },
  {
    id: 9, category: 'lifestyle',
    emoji: '😴',
    text: "How would you rate your sleep quality lately?",
    color: 'text-primary',
    bg: 'bg-primary/10',
    options: ['Excellent', 'Good', 'Fair', 'Poor', 'Very poor'],
  },
  {
    id: 10, category: 'lifestyle',
    emoji: '🏃',
    text: "How often do you engage in physical activity or something that relaxes you?",
    color: 'text-success',
    bg: 'bg-success/10',
    reversed: true,
    options: ['Daily', 'Few times/week', 'Once a week', 'Rarely', 'Never'],
  },
];

interface Result {
  score: number;
  maxScore: number;
  percent: number;
  level: 'low' | 'moderate' | 'high' | 'severe';
  label: string;
  color: string;
  emoji: string;
  description: string;
  tips: string[];
}

function calcResult(answers: number[]): Result {
  let total = 0;
  QUESTIONS.forEach((q, i) => {
    const maxOpts = q.options.length - 1;
    const raw = answers[i] ?? 0;
    total += q.reversed ? maxOpts - raw : raw;
  });

  const maxScore = 40;
  const pct = Math.round((total / maxScore) * 100);

  if (pct <= 25) return {
    score: total, maxScore, percent: pct, level: 'low', label: 'Thriving',
    color: 'text-success', emoji: '🌟',
    description: "You're managing stress really well! Your coping skills are strong and your mental wellbeing looks healthy.",
    tips: ['Keep up your current healthy habits', 'Practice gratitude daily', 'Share your coping strategies with others'],
  };
  if (pct <= 50) return {
    score: total, maxScore, percent: pct, level: 'moderate', label: 'Balanced',
    color: 'text-warning', emoji: '🌤️',
    description: "You're handling life reasonably well but some areas could use attention. Small changes can make a big difference.",
    tips: ['Try 5-minute daily breathing exercises', 'Limit news/social media before bed', 'Reach out to a friend this week'],
  };
  if (pct <= 75) return {
    score: total, maxScore, percent: pct, level: 'high', label: 'Elevated Stress',
    color: 'text-accent', emoji: '🌩️',
    description: "You're under significant stress. Your body and mind are working overtime. It's time to prioritise self-care.",
    tips: ['Start the Relaxation exercises in MindBridge', 'Talk to Dr. Mind daily for 10 minutes', 'Consider speaking with a counsellor'],
  };
  return {
    score: total, maxScore, percent: pct, level: 'severe', label: 'High Distress',
    color: 'text-destructive', emoji: '🆘',
    description: "Your stress levels are very high. Please don't face this alone — support is available and things can get better.",
    tips: ['Contact our crisis support toggle', 'Talk to Dr. Mind right now', 'Ask someone you trust for help today'],
  };
}

export default function StressQuiz() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(QUESTIONS.length).fill(-1));
  const [selected, setSelected] = useState<number | null>(null);
  const [animDir, setAnimDir] = useState<'in' | 'out'>('in');
  const [result, setResult] = useState<Result | null>(null);
  const [saving, setSaving] = useState(false);

  const q = QUESTIONS[current];
  const progress = ((current) / QUESTIONS.length) * 100;

  const saveToBackend = async (r: Result) => {
    setSaving(true);
    try {
      // Primary Quiz Persistence
      await fetch(`${API}/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          quizType: 'STRESS_LEVEL',
          answers: answers, // Stores the array of raw scores
          score: r.score,
          severity: r.level
        }),
      });
    } catch (e) {
      console.error("Quiz persistence failed:", e);
    } finally { setSaving(false); }
  };

  const selectAnswer = (idx: number) => {
    setSelected(idx);
    const newAns = [...answers];
    newAns[current] = idx;
    setAnswers(newAns);
  };

  const next = () => {
    if (selected === null) return;
    if (current < QUESTIONS.length - 1) {
      setAnimDir('out');
      setTimeout(() => {
        setCurrent(c => c + 1);
        setSelected(answers[current + 1] >= 0 ? answers[current + 1] : null);
        setAnimDir('in');
      }, 180);
    } else {
      const r = calcResult(answers);
      setResult(r);
      saveToBackend(r);
      setPhase('result');
    }
  };

  const prev = () => {
    if (current === 0) return;
    setAnimDir('out');
    setTimeout(() => {
      setCurrent(c => c - 1);
      setSelected(answers[current - 1] >= 0 ? answers[current - 1] : null);
      setAnimDir('in');
    }, 180);
  };

  const categoryIcon = (cat: string) => {
    if (cat === 'stress')   return <Zap size={14}/>;
    if (cat === 'anxiety')  return <Heart size={14}/>;
    if (cat === 'coping')   return <Brain size={14}/>;
    return <TrendingUp size={14}/>;
  };

  if (phase === 'intro') return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="max-w-lg w-full glass-card border-none shadow-glow p-8 space-y-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            Clinical Standard
        </div>
        
        <div className="space-y-3">
            <h1 className="text-4xl font-serif font-bold tracking-tight">MindBridge Analysis</h1>
            <p className="text-muted-foreground font-medium leading-relaxed">
              Based on the <strong>PSS-10</strong> and <strong>PHQ-4</strong> standards. 
              Gain deep insight into your emotional state in just 3 minutes.
            </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
            {[
                { icon: ShieldCheck, text: 'HIPAA Private' },
                { icon: Zap, text: 'Instant Insights' },
                { icon: Brain, text: 'Clinical Logic' },
                { icon: Heart, text: 'Caring Result' },
            ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/50 group hover:bg-secondary transition-colors">
                    <f.icon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-bold text-foreground">{f.text}</span>
                </div>
            ))}
        </div>

        <Button onClick={() => setPhase('quiz')} size="xl" className="w-full btn-primary-gradient rounded-2xl shadow-glow gap-2 text-lg">
          Initialize Check-in
          <ArrowRight className="w-5 h-5" />
        </Button>
      </Card>
    </div>
  );

  if (phase === 'result' && result) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="max-w-xl w-full glass-card border-none shadow-glow overflow-hidden animate-fade-in">
        <div className="p-10 space-y-10">
            <div className="text-center space-y-4">
                <div className="text-6xl animate-bounce-slow inline-block">{result.emoji}</div>
                <h2 className={cn("text-5xl font-serif font-black tracking-tighter", result.color)}>
                    {result.label}
                </h2>
            </div>

            <StressGauge level={result.percent} className="scale-125 my-8" />

            <div className="p-6 rounded-3xl bg-secondary/30 border border-white/20">
                <p className="text-lg text-foreground font-medium leading-relaxed italic">
                    "{result.description}"
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Recommended Roadmap</h3>
                <div className="grid gap-3">
                    {result.tips.map((tip, i) => (
                        <div key={i} className="flex gap-4 items-center p-4 rounded-2xl glass-card border-none shadow-soft">
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-soft", result.color.replace('text-', 'bg-'))}>
                                {i + 1}
                            </div>
                            <span className="text-sm font-bold text-foreground">{tip}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4 pt-4">
                <Button onClick={() => navigate('/chat')} size="xl" className="btn-primary-gradient rounded-2xl shadow-glow text-lg">
                    Discuss with Dr. Mind
                </Button>
                <div className="flex gap-4">
                    <Button onClick={() => navigate('/exercises')} variant="outline" className="flex-1 h-14 rounded-2xl font-bold border-2">
                        View Exercises
                    </Button>
                    <Button onClick={() => setPhase('intro')} variant="ghost" className="h-14 rounded-2xl font-bold gap-2 text-muted-foreground">
                        <RotateCcw className="w-4 h-4" />
                        Retake
                    </Button>
                </div>
            </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="max-w-2xl w-full glass-card border-none shadow-glow p-10 space-y-10 relative">
        {/* Header Progress */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", q.bg)}>
                    {categoryIcon(q.category)}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">{q.category}</span>
            </div>
            <div className="text-xs font-black tracking-tighter bg-secondary px-3 py-1 rounded-lg">
                {current + 1} <span className="opacity-40 mx-0.5">/</span> {QUESTIONS.length}
            </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div 
                className="h-full bg-primary transition-all duration-500 ease-out shadow-glow"
                style={{ width: `${progress}%` }}
            />
        </div>

        {/* Question Area */}
        <div className={cn(
            "space-y-8 transition-all duration-300",
            animDir === 'out' ? "opacity-0 translate-y-4 scale-95" : "opacity-100 translate-y-0 scale-100"
        )}>
            <div className="text-6xl text-center">{q.emoji}</div>
            <h2 className="text-3xl font-serif font-bold text-center leading-tight">
                {q.text}
            </h2>

            <div className="grid gap-3 pt-4">
                {q.options.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => selectAnswer(i)}
                        className={cn(
                            "w-full p-5 rounded-2xl text-left font-bold transition-all duration-200 border-2",
                            selected === i 
                                ? "border-primary bg-primary/5 text-primary shadow-soft translate-x-2" 
                                : "border-secondary bg-transparent text-foreground hover:bg-secondary/50"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <span>{opt}</span>
                            <div className={cn(
                                "w-6 h-6 rounded-full border-2 transition-all",
                                selected === i ? "border-primary bg-primary scale-110" : "border-secondary"
                            )}>
                                {selected === i && (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-6">
            <Button 
                onClick={prev} 
                disabled={current === 0}
                variant="ghost" 
                className="rounded-xl font-bold h-12 px-6 gap-2"
            >
                <ArrowLeft className="w-4 h-4" />
                Previous
            </Button>
            <Button 
                onClick={next}
                disabled={selected === null}
                className="rounded-xl btn-primary-gradient font-bold h-12 px-8 gap-2 shadow-glow"
            >
                {current === QUESTIONS.length - 1 ? 'View Analytics' : 'Next Question'}
                <ArrowRight className="w-4 h-4" />
            </Button>
        </div>
      </Card>
    </div>
  );
}