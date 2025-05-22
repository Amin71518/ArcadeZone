import { useState } from 'react';
import { getLastGames } from '../api/api';
import Loader from './Loader';



const LastGamesDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleDropdown = async () => {
    setIsOpen(!isOpen);

    if (games.length === 0 && !loading && !error) {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await getLastGames(token);
        const lastGames = response.records || response;
        setGames(lastGames);
        console.log('lastGames:', lastGames);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить последние рекорды');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="last-games-dropdown" style={{ position: 'relative', display: 'column', marginTop: '1em' }}>
      <button
        onClick={toggleDropdown}
        style={{
          padding: '10px 16px',
          fontSize: '16px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: '#4CAF50',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        Последние рекорды
      </button>

      {isOpen && (
        <div
          className="dropdown-menu"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: '#fff',
            border: '1px solid #ccc',
            padding: '12px',
            minWidth: '16rem',
            zIndex: 1000,
            borderRadius: '10px',
            boxShadow: '0px 6px 12px rgba(0,0,0,0.1)',
            marginTop: '8px'
          }}
        >
          {loading && <Loader />}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!loading && !error && games.length === 0 && (
              <p
                style={{
                  padding: '1rem',
                  color: '#333',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                  Вы ещё ни во что не играли
              </p>
              )}

          {!loading && !error && games.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {games.map((game, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: '#f7f7f7',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    color: '#333'
                  }}
                >
                  <div style={{ marginBottom: '6px', fontWeight: 'bold', fontSize: '16px' }}>
                    🎮 {game.game__name}
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    ⏱ {game.start_time} — {game.end_time}
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    🏆 Очки: <strong>{game.score}</strong>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default LastGamesDropdown;
