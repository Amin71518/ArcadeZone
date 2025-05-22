import React, { useState, useEffect, useRef } from "react";
import './SnakeGame.css';

const SIZE = 20;
const INIT_SNAKE = [[10, 10]];
const INIT_DIR = 0;
const SPEED = 200;

const dirs = [
  [0, -1],  // вверх
  [1, 0],   // вправо
  [0, 1],   // вниз
  [-1, 0],  // влево
];

const keyToTurn = {
  a: -1, ArrowLeft: -1,
  d: 1, ArrowRight: 1,
};

function areOpposite(dir1, dir2) {
  return dir1[0] === -dir2[0] && dir1[1] === -dir2[1];
}

function getRandomFood(snake) {
  while (true) {
    const food = [
      Math.floor(Math.random() * SIZE),
      Math.floor(Math.random() * SIZE),
    ];
    if (!snake.some(([x, y]) => x === food[0] && y === food[1])) return food;
  }
}

export default function SnakeGame({ onSessionChange }) {
  const [snake, setSnake] = useState(INIT_SNAKE);
  const [dirIdx, setDirIdx] = useState(INIT_DIR);
  const [food, setFood] = useState(getRandomFood(INIT_SNAKE));
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // <-- новое состояние
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const turnQueue = useRef([]);

  useEffect(() => {
    const handleKey = (e) => {
      if (keyToTurn[e.key] !== undefined) {
        turnQueue.current.push(keyToTurn[e.key]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Фиксируем startTime при старте игры
  useEffect(() => {
    if (isStarted) {
      const now = new Date();
      const pad = (n) => n.toString().padStart(2, '0');
      const timeString = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      setStartTime(timeString);
      if (onSessionChange) {
        onSessionChange({ startTime: timeString, score: 0 });
      }
    }
  }, [isStarted, onSessionChange]);

  // Сообщаем о каждом изменении счёта
  useEffect(() => {
    if (isStarted && startTime && onSessionChange) {
      onSessionChange({ startTime, score });
    }
  }, [score, isStarted, startTime, onSessionChange]);

  useEffect(() => {
    if (!isStarted || gameOver || isPaused) return; // <-- добавлено isPaused
    const interval = setInterval(() => {
      setSnake((snake) => {
        let newDirIdx = dirIdx;
        if (turnQueue.current.length > 0) {
          const turn = turnQueue.current.shift();
          newDirIdx = (dirIdx + turn + 4) % 4;
          if (snake.length > 1 && areOpposite(dirs[dirIdx], dirs[newDirIdx])) {
            newDirIdx = dirIdx;
          } else {
            setDirIdx(newDirIdx);
          }
        }

        const dir = dirs[newDirIdx];
        const head = snake[0];
        const newHead = [head[0] + dir[0], head[1] + dir[1]];

        if (
          newHead[0] < 0 || newHead[0] >= SIZE ||
          newHead[1] < 0 || newHead[1] >= SIZE
        ) {
          setGameOver(true);
          setIsStarted(false);
          return snake;
        }

        if (
          snake.length > 1 &&
          snake.some(([x, y]) => x === newHead[0] && y === newHead[1])
        ) {
          setGameOver(true);
          setIsStarted(false);
          return snake;
        }

        let newSnake;
        if (newHead[0] === food[0] && newHead[1] === food[1]) {
          newSnake = [newHead, ...snake];
          setFood(getRandomFood(newSnake));
          setScore((prev) => prev + 1);
        } else {
          newSnake = [newHead, ...snake.slice(0, -1)];
        }

        return newSnake;
      });
    }, SPEED);
    return () => clearInterval(interval);
  }, [dirIdx, food, gameOver, isStarted, isPaused]); // <-- добавлено isPaused

  const handleStart = () => {
    setSnake(INIT_SNAKE);
    setDirIdx(INIT_DIR);
    if (!isStarted || gameOver) { // Добавляем условие: генерируем еду только если игра не стартовала или был Game Over
        setFood(getRandomFood(INIT_SNAKE));
    }
    turnQueue.current = [];
    setGameOver(false);
    setScore(0);
    setIsPaused(false); // <-- сбрасываем паузу при старте
    setIsStarted(true);
  };

  const handlePause = () => {
    setIsPaused((prev) => !prev);
  };


  const renderField = () => (
    // snake-board теперь просто обертка для позиционирования
    <div className="snake-board">
      {/* snake-grid теперь будет основным контейнером для ячеек и слоев */}
      <div className="snake-grid">
        {[...Array(SIZE * SIZE)].map((_, i) => {
          const x = i % SIZE;
          const y = Math.floor(i / SIZE);
          const isSnake = snake.some(([sx, sy]) => sx === x && sy === y);
          const isHead = snake[0][0] === x && snake[0][1] === y;
          const isFood = food[0] === x && food[1] === y;
          return (
            <div
              key={i}
              className={
                isHead ? "head" :
                isSnake ? "snake" :
                isFood ? "food" : "cell"
              }
            />
          );
        })}
        {isPaused && isStarted && !gameOver && (
          <>
            <div className="pause-blur" />
            <div className="pause-label">
              <span>Пауза</span>
            </div>
          </>
        )}
      </div>
    </div>
  );


  return (
    <div style={{ textAlign: "center" }}>
    {!isStarted && (
      <button onClick={handleStart} style={{ marginBottom: 10 }}>
        {gameOver ? "Restart" : "Start"}
      </button>
    )}
    {isStarted && !gameOver && (
      <button onClick={handlePause} style={{ marginBottom: 10, marginLeft: 10 }}>
        {isPaused ? "Продолжить" : "Пауза"}
      </button>
    )}
    {gameOver && <div style={{ marginBottom: 10 }}>Game Over!</div>}
    <p>Управление: A/D или стрелки влево/вправо</p>
    {renderField()}
    <div style={{ marginBottom: 10 }}>
      Счёт: <strong>{score}</strong>
    </div>
  </div>
  );
}
