import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Tetris.css';

const COLS = 20;
const ROWS = 20;

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[1, 1, 1], [0, 1, 0]], // T
  [[1, 1, 1], [1, 0, 0]], // L
  [[1, 1, 1], [0, 0, 1]], // J
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]]  // Z
];

const COLORS = ['#00FFFF', '#FFFF00', '#AA00FF', '#FFA500', '#0000FF', '#00FF00', '#FF0000'];

const createEmptyBoard = () => Array(ROWS).fill(null).map(() => Array(COLS).fill(0));

export default function Tetris({ onSessionChange }) {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [pos, setPos] = useState({ x: 4, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const scoreTimerRef = useRef(null);

  const getRandomPiece = useCallback(() => {
    const index = Math.floor(Math.random() * SHAPES.length);
    return { shape: SHAPES[index], color: COLORS[index] };
  }, []);

  const checkCollision = useCallback((shape, offset) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newY = y + offset.y;
          const newX = x + offset.x;
          if (
            newX < 0 || newX >= COLS || newY >= ROWS ||
            (newY >= 0 && board[newY][newX] !== 0)
          ) return true;
        }
      }
    }
    return false;
  }, [board]);

  const merge = useCallback(() => {
    const newBoard = board.map(row => [...row]);
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell && pos.y + y >= 0) newBoard[pos.y + y][pos.x + x] = currentPiece.color;
      });
    });
    return newBoard;
  }, [board, currentPiece, pos]);

  const rotate = (matrix) => matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());

  const clearLines = useCallback((newBoard) => {
    let cleared = 0;
    const result = newBoard.filter(row => {
      if (row.every(cell => cell !== 0)) {
        cleared++;
        return false;
      }
      return true;
    });
    while (result.length < ROWS) result.unshift(Array(COLS).fill(0));
    return result;
  }, []);

  const drop = useCallback(() => {
    const newPos = { x: pos.x, y: pos.y + 1 };
    if (!checkCollision(currentPiece.shape, newPos)) {
      setPos(newPos);
    } else {
      const merged = merge();
      const cleared = clearLines(merged);
      setBoard(cleared);
      const next = nextPiece;
      const spawnPos = { x: 4, y: 0 };
      if (checkCollision(next.shape, spawnPos)) {
        setGameOver(true);
        setIsStarted(false);
        setIsPaused(false);
      } else {
        setCurrentPiece(next);
        setNextPiece(getRandomPiece());
        setPos(spawnPos);
      }
    }
  }, [pos, currentPiece, checkCollision, merge, clearLines, nextPiece, getRandomPiece]);

  const move = useCallback((dx) => {
    const newPos = { x: pos.x + dx, y: pos.y };
    if (!checkCollision(currentPiece.shape, newPos)) setPos(newPos);
  }, [pos, currentPiece, checkCollision]);

  const rotatePiece = useCallback(() => {
    const rotated = rotate(currentPiece.shape);
    if (!checkCollision(rotated, pos)) setCurrentPiece({ ...currentPiece, shape: rotated });
  }, [currentPiece, pos, checkCollision]);

  // ⏱ Очки за каждые 2 секунды
  useEffect(() => {
    if (!isStarted || gameOver || isPaused) return;
    scoreTimerRef.current = setInterval(() => {
      setScore(prev => prev + 1);
    }, 2000);
    return () => clearInterval(scoreTimerRef.current);
  }, [isStarted, gameOver, isPaused]);

  // 🕒 Старт игры
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

  // 🔁 Передаём счёт
  useEffect(() => {
    if (isStarted && startTime && onSessionChange) {
      onSessionChange({ startTime, score });
    }
  }, [score, isStarted, startTime, onSessionChange]);

  useEffect(() => {
    if (!isStarted || gameOver || isPaused) return;
    const interval = setInterval(() => drop(), 600);
    return () => clearInterval(interval);
  }, [drop, gameOver, isStarted, isPaused]);

  useEffect(() => {
    const handleKey = (e) => {
      if (!isStarted || gameOver || !currentPiece || isPaused) return;
      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'ф') move(-1);
      if (key === 'd' || key === 'в') move(1);
      if (key === 's' || key === 'ы') drop();
      if (key === 'w' || key === 'ц') rotatePiece();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [move, drop, rotatePiece, gameOver, isStarted, currentPiece, isPaused]);

  const handleStartPause = () => {
    if (!isStarted) {
      setCurrentPiece(getRandomPiece());
      setNextPiece(getRandomPiece());
      setBoard(createEmptyBoard());
      setScore(0);
      setPos({ x: 4, y: 0 });
      setGameOver(false);
      setIsPaused(false);
      setIsStarted(true);
    } else {
      setIsPaused(prev => !prev);
    }
  };

  const render = () => {
    const display = board.map(row => [...row]);
    currentPiece?.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell && pos.y + y >= 0) display[pos.y + y][pos.x + x] = currentPiece.color;
      });
    });
    return display.map((row, y) => (
      <div key={y} className="tetris-row">
        {row.map((cell, x) => (
          <div
            key={x}
            className="tetris-cell"
            style={{ backgroundColor: cell || '#222' }}
          />
        ))}
      </div>
    ));
  };

  return (
    <div className="tetris-container" style={{ textAlign: 'center' }}>
      <button onClick={handleStartPause} style={{ marginBottom: 10 }}>
        {!isStarted ? 'Начать игру' : isPaused ? 'Продолжить' : 'Пауза'}
      </button>
       <div style={{ position: 'relative', display: 'inline-block' }}>
      <div className="tetris-board" style = {
        {width: !isStarted ? 400 : undefined, // ширина до старта
    transition: 'width 0.3s'}}>
      {currentPiece && render()}
      {isPaused && !gameOver && (
         <div className="pause-overlay">
      <span>Пауза</span>
    </div>
        )}
    </div>

      <div className="tetris-info" style={{ marginTop: 10 }}>
        <p>Счёт: {score}</p>
        {gameOver && <p style={{ color: 'red' }}>Игра окончена</p>}
      </div>
      </div>
    </div>
  );
}
