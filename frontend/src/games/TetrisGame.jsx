import React, { useState, useEffect, useCallback } from 'react';
import './Tetris.css';

// Размеры игрового поля
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// Фигуры тетромино
const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[1, 1, 1], [0, 1, 0]], // T
  [[1, 1, 1], [1, 0, 0]], // L
  [[1, 1, 1], [0, 0, 1]], // J
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]]  // Z
];

// Цвета фигур
const COLORS = [
  '#00FFFF', // I
  '#FFFF00', // O
  '#AA00FF', // T
  '#FFA500', // L
  '#0000FF', // J
  '#00FF00', // S
  '#FF0000'  // Z
];

const Tetris = () => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Создание пустого поля
  function createEmptyBoard() {
    return Array(ROWS).fill().map(() => Array(COLS).fill(0));
  }

  // Генерация случайной фигуры
  const getRandomPiece = useCallback(() => {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    return {
      shape: SHAPES[shapeIndex],
      color: COLORS[shapeIndex]
    };
  }, []);

  // Инициализация игры
  const startGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentPiece(getRandomPiece());
    setNextPiece(getRandomPiece());
    setPosition({ x: Math.floor(COLS / 2) - 1, y: 0 });
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setIsPaused(false);
    setGameStarted(true);
  }, [getRandomPiece]);

  // Проверка столкновений
  const checkCollision = useCallback((piece, pos) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] !== 0) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          
          if (
            newX < 0 || 
            newX >= COLS || 
            newY >= ROWS || 
            (newY >= 0 && board[newY][newX] !== 0)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, [board]);

  // Фиксация фигуры на поле
  const lockPiece = useCallback(() => {
    const newBoard = [...board];
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x] !== 0) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }
    setBoard(newBoard);
    setCurrentPiece(nextPiece);
    setNextPiece(getRandomPiece());
    setPosition({ x: Math.floor(COLS / 2) - 1, y: 0 });

    // Проверка проигрыша
    if (checkCollision(nextPiece, { x: Math.floor(COLS / 2) - 1, y: 0 })) {
      setGameOver(true);
    }
  }, [board, currentPiece, nextPiece, position, checkCollision, getRandomPiece]);

  // Движение фигуры вниз
  const moveDown = useCallback(() => {
    if (gameOver || isPaused || !gameStarted) return;

    const newPosition = { ...position, y: position.y + 1 };
    if (!checkCollision(currentPiece, newPosition)) {
      setPosition(newPosition);
    } else {
      lockPiece();
      clearLines();
    }
  }, [position, currentPiece, checkCollision, lockPiece, gameOver, isPaused, gameStarted]);

  // Движение влево/вправо
  const move = useCallback((direction) => {
    if (gameOver || isPaused || !gameStarted) return;

    const newPosition = { ...position, x: position.x + direction };
    if (!checkCollision(currentPiece, newPosition)) {
      setPosition(newPosition);
    }
  }, [position, currentPiece, checkCollision, gameOver, isPaused, gameStarted]);

  // Поворот фигуры
  const rotate = useCallback(() => {
    if (gameOver || isPaused || !gameStarted) return;

    const rotated = {
      ...currentPiece,
      shape: currentPiece.shape[0].map((_, i) => 
        currentPiece.shape.map(row => row[i]).reverse()
      )
    };

    if (!checkCollision(rotated, position)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, position, checkCollision, gameOver, isPaused, gameStarted]);

  // Очистка заполненных линий
  const clearLines = useCallback(() => {
    let linesCleared = 0;
    const newBoard = [...board];
    
    for (let y = ROWS - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== 0)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(COLS).fill(0));
        linesCleared++;
        y++; // Проверить ту же строку снова
      }
    }

    if (linesCleared > 0) {
      setBoard(newBoard);
      setScore(prev => prev + linesCleared * 100 * level);
      if (score >= level * 1000) {
        setLevel(prev => prev + 1);
      }
    }
  }, [board, level, score]);

  // Обработка клавиш
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted) return;

      switch (e.key) {
        case 'ArrowLeft':
          move(-1);
          break;
        case 'ArrowRight':
          move(1);
          break;
        case 'ArrowDown':
          moveDown();
          break;
        case 'ArrowUp':
          rotate();
          break;
        case ' ':
          setIsPaused(prev => !prev);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [move, moveDown, rotate, gameStarted]);

  // Игровой цикл
  useEffect(() => {
    if (gameOver || isPaused || !gameStarted) return;

    const speed = 1000 - (level - 1) * 100;
    const gameInterval = setInterval(moveDown, Math.max(speed, 100));
    return () => clearInterval(gameInterval);
  }, [moveDown, gameOver, isPaused, level, gameStarted]);

  // Рендер игрового поля
  const renderBoard = () => {
    const displayBoard = [...board];

    // Отображение текущей фигуры
    if (currentPiece && !gameOver) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x] !== 0) {
            const boardY = position.y + y;
            const boardX = position.x + x;
            if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="tetris-row">
        {row.map((cell, x) => (
          <div 
            key={x} 
            className="tetris-cell" 
            style={{ 
              backgroundColor: cell || '#1a1a1a',
              border: cell ? 'none' : '1px solid #333'
            }}
          />
        ))}
      </div>
    ));
  };

  // Рендер следующей фигуры
  const renderNextPiece = () => {
    if (!nextPiece) return null;

    return (
      <div className="next-piece">
        {nextPiece.shape.map((row, y) => (
          <div key={y} className="next-piece-row">
            {row.map((cell, x) => (
              <div 
                key={x} 
                className="next-piece-cell" 
                style={{ 
                  backgroundColor: cell ? nextPiece.color : 'transparent'
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="tetris-container">
      <div className="tetris-game">
        <div className="tetris-board">
          {renderBoard()}
        </div>
        
        <div className="tetris-info">
          <h2>Tetris</h2>
          
          <div className="info-section">
            <h3>Следующая фигура:</h3>
            {renderNextPiece()}
          </div>
          
          <div className="info-section">
            <h3>Очки: {score}</h3>
            <h3>Уровень: {level}</h3>
          </div>
          
          {!gameStarted ? (
            <button className="tetris-button" onClick={startGame}>
              Начать игру
            </button>
          ) : (
            <button 
              className="tetris-button" 
              onClick={() => setIsPaused(prev => !prev)}
            >
              {isPaused ? 'Продолжить' : 'Пауза'}
            </button>
          )}
          
          {gameOver && (
            <div className="game-over-message">
              <h2>Игра окончена!</h2>
              <button className="tetris-button" onClick={startGame}>
                Играть снова
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="tetris-controls">
        <p>Управление:</p>
        <p>← → - Движение</p>
        <p>↑ - Поворот</p>
        <p>↓ - Ускорение</p>
        <p>Пробел - Пауза</p>
      </div>
    </div>
  );
};

export default Tetris;