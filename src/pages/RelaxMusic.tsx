import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import Navbar from '@/components/Navbar';
import AnimatedBot from '@/components/AnimatedBot';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Shuffle, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Track {
  id: string;
  title: string;
  category: string;
  emoji: string;
  duration: string;
  gradient: string;
  url: string;
}

const RelaxMusic = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [volume, setVolume] = useState([70]);
  const [isMuted, setIsMuted] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All', emoji: '🎵' },
    { id: 'nature', label: 'Nature', emoji: '🌿' },
    { id: 'rain', label: 'Rain', emoji: '🌧️' },
    { id: 'meditation', label: 'Meditation', emoji: '🧘' },
    { id: 'ambient', label: 'Ambient', emoji: '✨' },
  ];

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (currentTrack) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = currentTrack.url;
        audioRef.current.volume = (volume[0] || 70) / 100;
        if (isPlaying) audioRef.current.play().catch(console.error);
      } else {
        audioRef.current = new Audio(currentTrack.url);
        audioRef.current.volume = (volume[0] || 70) / 100;
        audioRef.current.loop = true;
        if (isPlaying) audioRef.current.play().catch(console.error);
      }
    }
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(console.error);
      else audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : (volume[0] || 70) / 100;
    }
  }, [volume, isMuted]);

  const tracks: Track[] = [
    { id: '1', title: 'Ocean Waves', category: 'nature', emoji: '🌊', duration: '10:00', gradient: 'from-blue-400 to-cyan-500', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: '2', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', title: 'Forest Birds', category: 'nature', emoji: '🐦', duration: '8:30', gradient: 'from-green-400 to-emerald-500' },
    { id: '3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', title: 'Gentle Rain', category: 'rain', emoji: '🌧️', duration: '15:00', gradient: 'from-gray-400 to-slate-500' },
    { id: '4', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', title: 'Thunderstorm', category: 'rain', emoji: '⛈️', duration: '12:00', gradient: 'from-purple-400 to-violet-500' },
    { id: '5', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', title: 'Zen Garden', category: 'meditation', emoji: '🪷', duration: '20:00', gradient: 'from-pink-400 to-rose-500' },
    { id: '6', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', title: 'Deep Breathing', category: 'meditation', emoji: '🧘', duration: '5:00', gradient: 'from-teal-400 to-cyan-500' },
    { id: '7', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', title: 'Cosmic Journey', category: 'ambient', emoji: '🌌', duration: '30:00', gradient: 'from-indigo-400 to-purple-500' },
    { id: '8', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', title: 'Starlight', category: 'ambient', emoji: '⭐', duration: '25:00', gradient: 'from-amber-400 to-orange-500' },
    { id: '9', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', title: 'Mountain Stream', category: 'nature', emoji: '🏔️', duration: '10:00', gradient: 'from-sky-400 to-blue-500' },
    { id: '10', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', title: 'Night Crickets', category: 'nature', emoji: '🦗', duration: '12:00', gradient: 'from-lime-400 to-green-500' },
  ];

  const filteredTracks = activeCategory === 'all'
    ? tracks
    : tracks.filter(t => t.category === activeCategory);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    const idx = filteredTracks.findIndex(t => t.id === currentTrack?.id);
    const next = filteredTracks[(idx + 1) % filteredTracks.length];
    if (next) playTrack(next);
  };

  const handlePrev = () => {
    const idx = filteredTracks.findIndex(t => t.id === currentTrack?.id);
    const prev = filteredTracks[(idx - 1 + filteredTracks.length) % filteredTracks.length];
    if (prev) playTrack(prev);
  };

  const handleShuffle = () => {
    const random = filteredTracks[Math.floor(Math.random() * filteredTracks.length)];
    if (random) playTrack(random);
  };

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleNext);
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleNext);
    };
  }, [audioRef.current, filteredTracks, currentTrack]);

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  };

  return (
    <div className="min-h-screen">
      <Navbar userRole="user" onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 fade-in-up">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
            Relax & Unwind
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Immerse yourself in calming sounds and nature visualizations
          </p>
        </div>

        {/* Visual area with animated bot */}
        <Card variant="glass" className="mb-8 overflow-hidden">
          <CardContent className="p-0">
            <div className={cn(
              'relative h-64 md:h-80 flex items-center justify-center transition-all duration-1000',
              currentTrack
                ? `bg-gradient-to-br ${currentTrack.gradient}`
                : 'bg-gradient-to-br from-primary/20 to-highlight/20'
            )}>
              {/* Animated circles */}
              <div className="absolute inset-0 overflow-hidden">
                {isPlaying && (
                  <>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-white/10 breathe-circle" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/5 breathe-circle" style={{ animationDelay: '0.5s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-white/5 breathe-circle" style={{ animationDelay: '1s' }} />
                  </>
                )}
              </div>

              <div className="relative z-10 text-center">
                {currentTrack ? (
                  <div className="fade-in-up">
                    <span className="text-6xl mb-4 block">{currentTrack.emoji}</span>
                    <h2 className="font-serif text-2xl font-bold text-white">
                      {currentTrack.title}
                    </h2>
                    <p className="text-white/70 mt-1">{currentTrack.duration}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <AnimatedBot size="lg" mood="happy" />
                    <p className="text-foreground mt-4 font-medium">
                      Select a track to begin relaxing
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Player controls */}
        {currentTrack && (
          <Card variant="glass" className="mb-8 fade-in-up">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Main controls */}
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={handleShuffle}>
                    <Shuffle className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handlePrev}>
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="hero"
                    size="icon"
                    className="w-14 h-14 rounded-full"
                    onClick={togglePlay}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleNext}>
                    <SkipForward className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Repeat className="w-4 h-4" />
                  </Button>
                </div>

                {/* Progress bar */}
                <div className="flex-1 w-full md:w-auto">
                  <Slider
                    defaultValue={[0]}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2 w-32">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                  <Slider
                    value={isMuted ? [0] : volume}
                    onValueChange={setVolume}
                    max={100}
                    step={1}
                    className="w-20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'default' : 'glass'}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="mr-1">{cat.emoji}</span>
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Track list */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTracks.map((track, index) => (
            <Card
              key={track.id}
              variant="interactive"
              className={cn(
                'fade-in-up cursor-pointer',
                currentTrack?.id === track.id && 'ring-2 ring-primary'
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => playTrack(track)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center text-2xl',
                  `bg-gradient-to-br ${track.gradient}`
                )}>
                  {track.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{track.title}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {track.category} • {track.duration}
                  </p>
                </div>
                {currentTrack?.id === track.id && isPlaying ? (
                  <div className="flex gap-0.5">
                    <span className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                ) : (
                  <Play className="w-5 h-5 text-muted-foreground" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tip */}
        <Card variant="calm" className="mt-8 max-w-2xl mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              💡 <strong>Tip:</strong> For best results, use headphones and find a comfortable, quiet space.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RelaxMusic;