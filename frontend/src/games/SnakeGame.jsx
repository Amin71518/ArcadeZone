import React, { useState, useEffect, useCallback } from 'react';
import './SnakeGame.css';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: 0 };

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Генерация новой еды
  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    
    // Проверка, чтобы еда не появилась на змейке
    if (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      return generateFood();
    }
    
    return newFood;
  }, [snake]);

  // Обработка нажатий клавиш
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isPlaying) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [direction, isPlaying]);

  // Движение змейки
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const moveSnake = () => {
      setSnake(prev => {
        const newSnake = [...prev];
        const head = { 
          x: newSnake[0].x + direction.x,
          y: newSnake[0].y + direction.y
        };

        // Проверка столкновения с границами
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          return prev;
        }

        // Проверка самопересечения
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return prev;
        }

        newSnake.unshift(head);

        // Проверка съедания еды
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 1);
          setFood(generateFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const gameInterval = setInterval(moveSnake, 150);
    return () => clearInterval(gameInterval);
  }, [direction, food, gameOver, isPlaying, generateFood]);

  // Старт игры
  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setGameOver(false);
    setScore(0);
    setIsPlaying(true);
  };

  return (
    <div className="snake-game">
      <div className="score">Счет: {score}</div>
      
      <div className="grid">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE;
          const y = Math.floor(index / GRID_SIZE);
          const isSnake = snake.some(segment => segment.x === x && segment.y === y);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;

          return (
            <div 
              key={index}
              className={`cell 
                ${isHead ? 'head' : ''} 
                ${isSnake ? 'snake' : ''} 
                ${isFood ? 'food' : ''}`}
            />
          );
        })}
      </div>

      {gameOver && <div className="game-over">Игра окончена!</div>}
      
      <button 
        className="start-button"
        onClick={startGame}
      >
        {isPlaying ? 'Перезапуск' : 'Начать игру'}
      </button>
    </div>
  );
};

export default SnakeGame;