import React, { useState, useEffect } from 'react';
import './ClickerGame.css';

const ClickerGame = ({ onSessionChange }) => {
  const [score, setScore] = useState(0);
  const [upgradeLevel, setUpgradeLevel] = useState(1);
  const [autoClicker, setAutoClicker] = useState(0);
  const [upgradeCost, setUpgradeCost] = useState(10);
  const [autoClickerCost, setAutoClickerCost] = useState(50);
  const [startTime, setStartTime] = useState(null);

useEffect(() => {
  // Фиксируем старт игры в формате HH:MM:SS
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const timeString = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  setStartTime(timeString);
  onSessionChange && onSessionChange({ startTime: timeString, score: 0 });
}, []);



  // Автокликеры
  useEffect(() => {
    if (autoClicker > 0) {
      const interval = setInterval(() => {
        setScore(prev => prev + autoClicker);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoClicker]);
  useEffect(() => {
    // Сообщаем родителю о каждом изменении счета
    if (startTime) {
      onSessionChange && onSessionChange({ startTime, score });
    }
  }, [score, startTime]);
  const handleClick = () => {
    setScore(prev => prev + upgradeLevel);
  };

  const buyUpgrade = () => {
    if (score >= upgradeCost) {
      setScore(prev => prev - upgradeCost);
      setUpgradeLevel(prev => prev + 1);
      setUpgradeCost(prev => Math.round(prev * 1.5));
    }
  };

  const buyAutoClicker = () => {
    if (score >= autoClickerCost) {
      setScore(prev => prev - autoClickerCost);
      setAutoClicker(prev => prev + 1);
      setAutoClickerCost(prev => Math.round(prev * 2.5));
    }
  };

  return (
    <div className="clicker-game">
      <div className="score-board">
        <h2>Очков: {score}</h2>
      </div>
      
      <button className="click-button" onClick={handleClick}>
        Кликай меня!
        <div className="click-power">+{upgradeLevel} за клик</div>
      </button>

      <div className="shop">
        <h3>Магазин улучшений</h3>
        
        <button 
          className="upgrade-button"
          onClick={buyUpgrade}
          disabled={score < upgradeCost}
        >
          Улучшение клика ({upgradeCost} очков)
          <div>Текущий уровень: {upgradeLevel}</div>
        </button>

        <button 
          className="upgrade-button"
          onClick={buyAutoClicker}
          disabled={score < autoClickerCost}
        >
          Автокликер ({autoClickerCost} очков)
          <div>Количество: {autoClicker} (+{autoClicker}/сек)</div>
        </button>
      </div>
    </div>
  );
};

export default ClickerGame;