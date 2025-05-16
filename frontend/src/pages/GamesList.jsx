import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './GamesList.css';

const GamesList = ({ games }) => {
  if (games.length === 0) {
    return (
      <div className="no-games">
        <p>Пока нет доступных игр</p>
        <Link to="/" className="home-link">Вернуться на главную</Link>
      </div>
    );
  }

  return (
    <div className="games-grid">
      {games.map((game) => (
        <div key={game.id} className="game-card">
          <Link to={`/games/${game.slug || game.id}`} className="game-link">
            {game.image && (
              <img 
                src={game.image} 
                alt={game.name} 
                className="game-image"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = '/fallback-game-image.jpg';
                }}
              />
            )}
            <div className="game-info">
              <h3 className="game-title">{game.name}</h3>
              {game.description && (
                <p className="game-description">{game.description}</p>
              )}
              {game.rating && (
                <div className="game-rating">
                  Рейтинг: {game.rating}/5
                </div>
              )}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

GamesList.propTypes = {
  games: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      image: PropTypes.string,
      slug: PropTypes.string,
      rating: PropTypes.number
    })
  ).isRequired
};

export default GamesList;