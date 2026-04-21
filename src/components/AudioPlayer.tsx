import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

const TRACKS = [
  { id: 1, title: "DATA_CORRUPT_01", artist: "NULL_SECTOR", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "BUFFER_UNDERRUN", artist: "MEM_LEAK", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "NEURAL_STATIC", artist: "GHOST_IN_SYS", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

export default function AudioPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = TRACKS[currentIndex];

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => setIsPlaying(false));
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => setCurrentIndex(prev => (prev + 1) % TRACKS.length);
  const prevTrack = () => setCurrentIndex(prev => (prev - 1 + TRACKS.length) % TRACKS.length);

  const handleTimeUpdate = () => {
     if (audioRef.current) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
     }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
     if (audioRef.current && e.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickPos = (e.clientX - rect.left) / rect.width;
        audioRef.current.currentTime = clickPos * audioRef.current.duration;
     }
  };

  return (
    <div className="glitch-box p-5 flex flex-col w-full xl:max-w-[400px]">
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={nextTrack}
        onTimeUpdate={handleTimeUpdate}
        crossOrigin="anonymous"
      />
      
      <h2 className="font-pixel text-[#ff00ff] bg-[#00ffff] text-[#000] p-2 text-xs uppercase mb-6 shadow-[2px_2px_0_#ff00ff] inline-block w-max">
        &gt; AUDIO_DAEMON
      </h2>
      
      <div className="flex-1 flex flex-col font-sys text-2xl border-2 border-[#00ffff] p-3 mb-6 bg-[#111] h-[180px] overflow-y-auto">
         {TRACKS.map((track, i) => (
            <div 
               key={track.id} 
               onClick={() => { setCurrentIndex(i); setIsPlaying(true); }} 
               className={`p-2 cursor-pointer truncate ${i === currentIndex ? 'bg-[#ff00ff] text-[#000] font-bold' : 'text-[#00ffff] hover:bg-[#00ffff] hover:text-[#000]'}`}
            >
               {i === currentIndex ? '> ' : ''}{track.title}
            </div>
         ))}
      </div>

      <div className="mt-auto">
         <div className="text-[#ff00ff] font-sys uppercase text-xl mb-2">&gt; SOURCE: {currentTrack.artist}</div>
         
         <div 
           className="h-6 bg-[#111] w-full mb-6 border border-[#00ffff] cursor-pointer" 
           onClick={handleProgressClick}
         >
            <div 
               className="h-full bg-[#ff00ff] transition-all duration-100 ease-linear" 
               style={{ width: `${progress}%` }}
            ></div>
         </div>
         
         <div className="flex justify-between items-center mb-6">
            <button onClick={prevTrack} className="btn-brutal">&lt;&lt;</button>
            <button onClick={togglePlay} className="btn-brutal !px-8">
               {isPlaying ? 'PAUSE' : 'PLAY'}
            </button>
            <button onClick={nextTrack} className="btn-brutal">&gt;&gt;</button>
         </div>
         
         <div className="flex items-center gap-3 font-sys text-[#00ffff] text-2xl uppercase bg-[#111] border border-[#ff00ff] p-3">
            <button onClick={() => setIsMuted(!isMuted)}>
               {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
            <span className="w-12 text-center text-[#ff00ff]">VOL</span>
            <input 
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                 setVolume(parseFloat(e.target.value));
                 setIsMuted(false);
              }}
              className="flex-1 h-3 bg-[#00ffff] appearance-none cursor-pointer"
              style={{
                 accentColor: '#ff00ff'
              }}
            />
         </div>
      </div>
    </div>
  );
}
