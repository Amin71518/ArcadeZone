import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGame, createRecord } from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ClickerGame from '../games/ClickerGame';
import SnakeGame from '../games/SnakeGame';
import TetrisGame from '../games/TetrisGame';

const GAME_COMPONENTS = {
  ClickerGame,
  SnakeGame,
  TetrisGame
};

const GameView = () => {
  const { gameId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [error, setError] = useState(null);
  const [session, setSession] = useState({ startTime: null, score: 0 });

  useEffect(() => {
    if (!token) {
      setError('Для просмотра игры требуется авторизация.');
      return;
    }
    getGame(gameId, token)
      .then((gameData) => setGame(gameData))
      .catch(() => setError('Ошибка загрузки игры'));
  }, [gameId, token]);

  function getPlayerIdFromToken(token) {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || payload.id || payload.sub;
    } catch {
      return null;
    }
  }
  const playerId = getPlayerIdFromToken(token);

  const pad = (n) => n.toString().padStart(2, '0');

  const handleSaveResult = async () => {
    const now = new Date();
    const endTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const recordData = {
      player_id: playerId,
      game_id: Number(gameId),
      start_time: session.startTime,
      end_time: endTime,
      score: session.score,
    };
    try {
      const response = await createRecord(recordData, token);
      if (response && response.message) {
        toast.success(response.message, { position: "bottom-right", autoClose: 3000 });
      }
    } catch (err) {
      toast.error("Ошибка при сохранении результата", { position: "bottom-right", autoClose: 3000 });
    }
  };

  if (error) return <p>{error}</p>;
  if (!game) return <p>Загрузка...</p>;

  const GameComponent = GAME_COMPONENTS[game.code];

  return (
    <div className="game-view-flex" style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', marginLeft: '100px' }}>
      {/* Левая часть: игра */}
      <div style={{ flex: 1 }}>
        <h2>{game.name}</h2>
        <p>{game.description}</p>
        {game.image && <img src={game.image} alt={game.name} width={300} />}
        <div style={{ marginTop: '1rem' }}>
          {GameComponent ? (
            <GameComponent onSessionChange={setSession} />
          ) : (
            <p>Компонент игры с кодом "{game.code}" не найден.</p>
          )}
        </div>
      </div>
      {/* Правая часть: боковая панель с кнопками */}
      <div className="side-panel" style={{
        minWidth: 220,
        background: '#222',
        padding: '24px 18px',
        borderRadius: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        alignSelf: 'end'
      }}>
        <button
          onClick={async () => navigate('/')}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '12px'
          }}
        >
          Выйти
        </button>
        <button
          onClick={handleSaveResult}
          disabled={!session.startTime || playerId == null}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Сохранить
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default GameView;
