import React, { useState, useEffect, useRef, useCallback } from 'react';

const BOARD_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };

const spawnFood = (currentSnake: {x: number, y: number}[]) => {
  let newFood: {x: number, y: number} = {x: 0, y: 0};
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
    const onSnake = currentSnake.some(s => s.x === newFood.x && s.y === newFood.y);
    if (!onSnake) break;
  }
  return newFood;
};

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [speed, setSpeed] = useState(150);

  const directionRef = useRef(INITIAL_DIRECTION);
  const lastProcessedDirection = useRef(INITIAL_DIRECTION); 
  
  useEffect(() => {
    const stored = localStorage.getItem('snakeHighScore');
    if (stored) setHighScore(parseInt(stored, 10));
  }, []);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    lastProcessedDirection.current = INITIAL_DIRECTION;
    setScore(0);
    setSpeed(150);
    setGameOver(false);
    setIsStarted(true);
    setFood(spawnFood(INITIAL_SNAKE));
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isStarted || gameOver) return;
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }

    const { x, y } = lastProcessedDirection.current;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (y !== 1) directionRef.current = { x: 0, y: -1 };
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (y !== -1) directionRef.current = { x: 0, y: 1 };
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (x !== 1) directionRef.current = { x: -1, y: 0 };
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (x !== -1) directionRef.current = { x: 1, y: 0 };
        break;
    }
  }, [isStarted, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!isStarted || gameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const currentDir = directionRef.current;
        lastProcessedDirection.current = currentDir;

        const newHead = { x: head.x + currentDir.x, y: head.y + currentDir.y };

        if (newHead.x < 0 || newHead.x >= BOARD_SIZE || newHead.y < 0 || newHead.y >= BOARD_SIZE) {
          handleGameOver();
          return prevSnake;
        }

        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          handleGameOver();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setSpeed(s => Math.max(50, s - 5));
          setFood(spawnFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, speed);
    return () => clearInterval(intervalId);
  }, [isStarted, gameOver, food, speed]);

  const handleGameOver = () => {
    setGameOver(true);
    setIsStarted(false);
  };

  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeHighScore', score.toString());
    }
  }, [gameOver, score, highScore]);

  const manualMove = (dx: number, dy: number) => {
     const { x, y } = lastProcessedDirection.current;
     if (dx !== 0 && x === -dx) return;
     if (dy !== 0 && y === -dy) return;
     directionRef.current = { x: dx, y: dy };
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-[800px]">
      {/* Main Game Screen */}
      <div className="glitch-box p-4 flex-1 flex flex-col items-center">
        <div className="w-full flex justify-between items-end mb-4 border-b-2 border-[#00ffff] pb-2">
          <div>
            <div className="text-[#ff00ff] font-sys text-sm tracking-widest uppercase">SYS_MEM_ALLOC</div>
            <div className="font-pixel text-2xl text-[#00ffff] mt-1">{String(score).padStart(6, '0')}</div>
          </div>
          <div className="text-right">
            <div className="text-[#ff00ff] font-sys text-sm tracking-widest uppercase">PEAK_MEM</div>
            <div className="font-pixel text-xl text-gray-400 mt-1">{String(highScore).padStart(6, '0')}</div>
          </div>
        </div>

        <div 
          className="w-full max-w-[400px] aspect-square bg-[#111] relative overflow-hidden touch-none" 
          style={{ border: '2px solid #ff00ff' }}
        >
          {snake.map((segment, idx) => (
            <div 
              key={`${idx}-${segment.x}-${segment.y}`}
              className="absolute"
              style={{ 
                 width: `${100 / BOARD_SIZE}%`, height: `${100 / BOARD_SIZE}%`, 
                 left: `${segment.x * (100 / BOARD_SIZE)}%`, top: `${segment.y * (100 / BOARD_SIZE)}%`,
                 backgroundColor: idx === 0 ? '#fff' : '#00ffff',
                 border: '1px solid #111',
                 zIndex: idx === 0 ? 10 : 1,
              }}
            />
          ))}

          <div 
            className="absolute bg-[#ff00ff]"
            style={{ 
               width: `${100 / BOARD_SIZE}%`, height: `${100 / BOARD_SIZE}%`, 
               left: `${food.x * (100 / BOARD_SIZE)}%`, top: `${food.y * (100 / BOARD_SIZE)}%`,
               animation: 'screen-tear 1s infinite'
            }}
          />

          {!isStarted && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20">
               {gameOver && <h3 className="glitch-text text-3xl mb-8" data-text="CORRUPTION">CORRUPTION</h3>}
               <button onClick={startGame} className="btn-brutal">
                 {gameOver ? "> OVERRIDE_INIT()" : "> EXECUTE_SNAKE.EXE"}
               </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 grid-rows-3 gap-2 w-48 sm:hidden mt-6">
           <div />
           <button onClick={() => manualMove(0, -1)} className="btn-brutal p-2">W</button>
           <div />
           <button onClick={() => manualMove(-1, 0)} className="btn-brutal p-2">A</button>
           <div className="bg-[#111]" />
           <button onClick={() => manualMove(1, 0)} className="btn-brutal p-2">D</button>
           <div />
           <button onClick={() => manualMove(0, 1)} className="btn-brutal p-2">S</button>
           <div />
        </div>
      </div>
      
      {/* Side Logs / Stats Panel */}
      <div className="glitch-box p-4 w-full lg:w-64 flex flex-col h-fit">
        <h2 className="font-pixel text-[#00ffff] border-b-2 border-[#ff00ff] pb-2 mb-4 text-sm mt-2">KERNEL_STATS</h2>
        
        <div className="flex-1 font-sys text-xl text-[#00ffff] space-y-2 uppercase opacity-80 leading-tight">
          <p className="text-[#ff00ff]">&gt; OVERCLOCK: x{((speed > 0 ? 150 / speed : 1)).toFixed(1)}</p>
          <p>&gt; SYNC_RATE: {(1000/speed).toFixed(1)} Hz</p>
          <p>&gt; GRID: {BOARD_SIZE}x{BOARD_SIZE}</p>
          <p className="mt-8 text-white pt-8">&lt;&lt; SYS LOGS &gt;&gt;</p>
          <p className="opacity-50">INITIALIZING CORE...</p>
          <p className="opacity-50">W/A/S/D REGISTERED.</p>
          {isStarted && <p className="animate-pulse text-[#00ffff]">&gt; AWAITING INPUT</p>}
          {gameOver && <p className="text-[#ff00ff] font-bold screen-tear">&gt; CORE DUMP FAILED</p>}
        </div>
      </div>
    </div>
  );
}
