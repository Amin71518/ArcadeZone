const BASE_URL = import.meta.env.VITE_API_URL;
//const BASE_URL = '[http://localhost:8000](http://localhost:8000)'; // или адрес твоего backend-сервера

// Авторизация
export async function loginPlayer(email, password) {
const response = await fetch('${BASE_URL}/players/login/', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ user: { email, password } }),
});

if (!response.ok) throw new Error('Ошибка авторизации');

return await response.json();
}

export async function registerPlayer(userData) {
const response = await fetch('${BASE_URL}/players/register/', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ user: userData }),
});

if (!response.ok) throw new Error('Ошибка регистрации');

return await response.json();
}

export async function logoutPlayer(token) {
const response = await fetch('${BASE_URL}/players/logout/', {
method: 'POST',
headers: {
Authorization: 'Token ${token}',
},
});

if (!response.ok) throw new Error('Ошибка выхода');

return await response.json();
}

// Игроки
export async function getPlayers(token) {
const response = await fetch('${BASE_URL}/players/', {
headers: {
Authorization: 'Token ${token}',
},
});

if (!response.ok) throw new Error('Ошибка получения игроков');

return await response.json();
}

export async function deletePlayer(token) {
const response = await fetch('${BASE_URL}/players/delete/', {
method: 'DELETE',
headers: {
Authorization: 'Token ${token}',
},
});

if (!response.ok) throw new Error('Ошибка удаления игрока');
}

export async function updateCurrentUser(token, updateData) {
const response = await fetch('${BASE_URL}/players/update_player/', {
method: 'PUT',
headers: {
'Content-Type': 'application/json',
Authorization: 'Token ${token}',
},
body: JSON.stringify(updateData),
});

if (!response.ok) throw new Error('Ошибка обновления данных пользователя');

return await response.json();
}

// Игры
export async function getGames(token) {
const response = await fetch('${BASE_URL}/games/', {
headers: {
Authorization: 'Token ${token}',
},
});

if (!response.ok) throw new Error('Ошибка получения игр');

return await response.json();
}

export async function getGame(gameId, token) {
const response = await fetch('${BASE_URL}/games/${gameId}/', {
headers: {
Authorization: 'Token ${token}',
},
});

if (!response.ok) throw new Error('Ошибка получения игры');

return await response.json();
}

export async function addGame(gameData, token) {
const response = await fetch('${BASE_URL}/games/add/', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
Authorization: 'Token ${token}',
},
body: JSON.stringify(gameData),
});

if (!response.ok) throw new Error('Ошибка добавления игры');

return await response.json();
}

export async function deleteGame(gameId, token) {
const response = await fetch('${BASE_URL}/games/${gameId}/delete/', {
method: 'DELETE',
headers: {
Authorization: 'Token ${token}',
},
});

if (!response.ok) throw new Error('Ошибка удаления игры');
}

// Рекорды
export async function createRecord(recordData, token) {
const response = await fetch('${BASE_URL}/records/add/', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
Authorization: 'Token ${token}',
},
body: JSON.stringify(recordData),
});

if (!response.ok) throw new Error('Ошибка добавления рекорда');

return await response.json();
}

export async function updateScore(playerId, gameId, newScore, token) {
const response = await fetch('${BASE_URL}/records/${playerId}/${gameId}/update/', {
method: 'PUT',
headers: {
'Content-Type': 'application/json',
Authorization: 'Token ${token}',
},
body: JSON.stringify({ score: newScore }),
});

if (!response.ok) throw new Error('Ошибка обновления рекорда');

return await response.json();
}

export async function getPlayerRecord(playerId, gameId, token) {
const response = await fetch('${BASE_URL}/records/player/${playerId}/${gameId}/', {
headers: {
Authorization: 'Token ${token}',
},
});

if (!response.ok) throw new Error('Ошибка получения рекорда игрока');

return await response.json();
}

export async function getTop10Records(gameId, token) {
const response = await fetch('${BASE_URL}/records/top/${gameId}/', {
headers: {
Authorization: 'Token ${token}',
},
});

if (!response.ok) throw new Error('Ошибка получения топа рекордов');

return await response.json();
}

export async function deleteRecord(playerId, gameId, token) {
const response = await fetch('${BASE_URL}/records/${playerId}/${gameId}/delete/', {
method: 'DELETE',
headers: {
Authorization: 'Token ${token}',
},
});

if (!response.ok) throw new Error('Ошибка удаления рекорда');
}

