import { useEffect, useState } from 'react';
import { getGames } from '../api/api';
import GamesList from '../pages/GamesList';
import Loader from '../components/Loader'; // Создайте простой компонент-лоадер

const Games = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await getGames();
        
        // Варианты обработки разных структур ответа
        const gamesData = response.data?.games || 
                         response.games || 
                         response.data || 
                         response;
        
        if (!Array.isArray(gamesData)) {
          throw new Error('Получен некорректный формат данных');
        }
        
        setGames(gamesData);
      } catch (err) {
        console.error('Ошибка загрузки:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Произошла ошибка</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Попробовать снова</button>
      </div>
    );
  }

  return (
    <div className="games-page">
      <h1>Каталог игр</h1>
      <GamesList games={games} />
    </div>
  );
};

export default Games;