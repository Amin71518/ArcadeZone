import { useEffect, useState } from 'react';
import { getGames } from '../api/api';

const Games = () => {
const [games, setGames] = useState([]);

useEffect(() => {
getGames()
.then((data) => setGames(data.games))
.catch((err) => console.error('Ошибка загрузки игр', err));
}, []);

return (
<div>
<h2>Игры</h2>
{games.length === 0 ? (
<p>Нет доступных игр</p>
) : (
<ul>
{games.map((game) => (
<li key={game.id}>{game.name}</li>
))}
</ul>
)}
</div>
);
};

export default Games;