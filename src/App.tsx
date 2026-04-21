import React from 'react';
import AudioPlayer from './components/AudioPlayer';
import SnakeGame from './components/SnakeGame';

export default function App() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 bg-black relative">
      <div className="static-noise-bg"></div>
      <div className="scanlines-overlay"></div>
      
      <div className="z-10 w-full max-w-[1200px] mt-8 flex flex-col items-center">
        <header className="mb-12 text-center screen-tear relative">
          <h1 className="glitch-text text-4xl md:text-6xl m-0 tracking-widest break-all" data-text="SYSTEM.BREACH">
            SYSTEM.BREACH
          </h1>
          <div className="mt-4">
             <p className="text-[#ff00ff] font-sys text-xl uppercase tracking-widest font-bold bg-black inline-block p-2 border border-[#00ffff]">
               &lt;!&gt; NEURO-LINK COMPROMISED &lt;!&gt;
             </p>
          </div>
        </header>

        <div className="w-full flex flex-col xl:flex-row gap-12 justify-center items-start">
           <AudioPlayer />
           <SnakeGame />
        </div>
      </div>
    </div>
  );
}
