import React, { useState, useEffect } from 'react';
import './ClickerGame.css';

const ClickerGame = () => {
  const [score, setScore] = useState(0);
  const [upgradeLevel, setUpgradeLevel] = useState(1);
  const [autoClicker, setAutoClicker] = useState(0);
  const [upgradeCost, setUpgradeCost] = useState(10);
  const [autoClickerCost, setAutoClickerCost] = useState(50);

  // Автокликеры
  useEffect(() => {
    if (autoClicker > 0) {
      const interval = setInterval(() => {
        setScore(prev => prev + autoClicker);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoClicker]);

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
      <h1>Кликерная Игра</h1>
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