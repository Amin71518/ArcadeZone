import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './GamesList.css';
import { getTop10Records } from '../api/api';

const GamesList = ({ games }) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [records, setRecords] = useState([]);
  const [showRecords, setShowRecords] = useState(false);

  // Показываем контекстное меню при ПКМ
  const handleContextMenu = (event, game) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      game,
    });
    setShowRecords(false);
    setRecords([]);
  };

  // Загружаем рекорды при клике на кнопку
  const loadRecords = async () => {
    try {
      const data = await getTop10Records(contextMenu.game.id);
      setRecords(data.top_10 || []);
      setShowRecords(true);
    } catch (error) {
      console.error(error);
      setRecords([]);
      setShowRecords(true);
    }
  };

  // Закрываем меню при клике вне его
  const handleClickOutside = (event) => {
    if (contextMenu) {
      const menu = document.querySelector('.custom-context-menu');
      if (menu && !menu.contains(event.target)) {
        setContextMenu(null);
        setShowRecords(false);
        setRecords([]);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu]);

  if (games.length === 0) {
    return (
      <div className="no-games">
        <p>Пока нет доступных игр</p>
        <Link to="/" className="home-link">Вернуться на главную</Link>
      </div>
    );
  }

  return (
    <>
      <div className="games-grid">
        {games.map((game) => (
          <div
            key={game.id}
            className="game-card"
            onContextMenu={(e) => handleContextMenu(e, game)}
          >
            <Link to={`/games/${game.id}`} className="game-link">
              {game.pictures && (
                <img
                  src={game.pictures}
                  alt={game.name}
                  className="game-image"
                />
              )}
              <div className="game-info">
                <h3 className="game-title">{game.name}</h3>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {contextMenu && (
        <div
          className="custom-context-menu"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
        >
          <button onClick={loadRecords}>
            Посмотреть рекорды
          </button>

          {showRecords && (
            records.length > 0 ? (
              <ul className="records-list">
                {records.map((record) => (
                  <li key={record.record_id}>
                    Игрок {record.player_name}: {record.score} очков
                  </li>
                ))}
              </ul>
            ) : (
              <p>Рекорды не найдены</p>
            )
          )}
        </div>
      )}
    </>
  );
};

GamesList.propTypes = {
  games: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      pictures: PropTypes.string,
    })
  ).isRequired,
};

export default GamesList;
