const BASE_URL = import.meta.env.VITE_API_URL;
//const BASE_URL = '[http://localhost:8000](http://localhost:8000)'; // или адрес твоего backend-сервера

// Авторизация
export async function loginPlayer(email, password) {
const response = await fetch(`${BASE_URL}/players/login/`, {
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
const response = await fetch(`${BASE_URL}/players/register/`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ "user": userData }),
});

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Сервер вернул некорректный ответ');
  }

  if (!response.ok) {
  let message = 'Ошибка регистрации';

  if (typeof data === 'object' && data !== null) {
    const errorMessages = Object.values(data)
      .flat()
      .filter(Boolean);
    if (errorMessages.length > 0) {
      message = errorMessages.join('\n');  // ← здесь главное изменение
    }
  }

  throw new Error(message);
}

  return data;
}

export async function updateCurrentUser(token, updateData) {
  const response = await fetch(`${BASE_URL}/players/update_player/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({ user: updateData }),
  });

  const data = await response.json();

  if (!response.ok) {
    // Ошибки внутри data.errors
    let message = 'Ошибка обновления данных пользователя';

    if (data?.errors && typeof data.errors === 'object') {
      const firstKey = Object.keys(data.errors)[0];
      const errorValue = data.errors[firstKey];

      if (Array.isArray(errorValue)) {
        message = errorValue[0];
      } else if (typeof errorValue === 'string') {
        message = errorValue;
      }
      throw new Error(message);
    }
  }


return data;
}

export async function logoutPlayer(token) {
const response = await fetch(`${BASE_URL}/players/logout/`, {
method: 'POST',
headers: {
Authorization: `Token ${token}`,
},
});

if (!response.ok) throw new Error('Ошибка выхода');

return await response.json();
}

// Игроки
export async function getPlayers(token) {
const response = await fetch(`${BASE_URL}/players/`, {
headers: {
Authorization: `Token ${token}`,
},
});

if (!response.ok) throw new Error('Ошибка получения игроков');

return await response.json();
}

export async function deletePlayer(playerId, token) {
console.log(playerId);
const response = await fetch(`${BASE_URL}/players/${playerId}/delete/`, {
method: 'DELETE',
headers: {
Authorization: `Token ${token}`,
},
});

if (!response.ok) throw new Error('Ошибка удаления игрока');
}

// Игры
export async function getGames(token) {
const response = await fetch(`${BASE_URL}/games/`, {
headers: {
Authorization: `Token ${token}`,
},
});

if (!response.ok) throw new Error('Ошибка получения игр');

return await response.json();
}

export async function getLastGames(token) {
const response = await fetch(`${BASE_URL}/games/last`, {
headers: {
Authorization: `Token ${token}`,
},
});

if (!response.ok) throw new Error('Ошибка получения последних игр');

return await response.json();
}

export async function getGame(gameId, token) {
const response = await fetch(`${BASE_URL}/games/${gameId}/`, {
headers: {
Authorization: `Token ${token}`,
},
});

if (!response.ok) throw new Error('Ошибка получения игры');

return await response.json();
}

export async function addGame(gameData, token) {
const response = await fetch(`${BASE_URL}/games/add/`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
Authorization: `Token ${token}`,
},
body: JSON.stringify(gameData),
});

if (!response.ok) throw new Error('Ошибка добавления игры');

return await response.json();
}

export async function deleteGame(gameId, token) {
const response = await fetch(`${BASE_URL}/games/${gameId}/delete/`, {
method: 'DELETE',
headers: {
Authorization: `Token ${token}`,
},
});

if (!response.ok) throw new Error('Ошибка удаления игры');
}

// Рекорды
export async function createRecord(recordData, token) {
const response = await fetch(`${BASE_URL}/records/add/`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
Authorization: `Token ${token}`,
},
body: JSON.stringify(recordData),
});

if (!response.ok) throw new Error('Ошибка добавления рекорда');

return await response.json();
}


export async function getPlayerRecord(playerId, gameId, token) {
const response = await fetch(`${BASE_URL}/records/player/${playerId}/${gameId}/`, {
headers: {
Authorization: `Token ${token}`,
},
});

if (!response.ok) throw new Error('Ошибка получения рекорда игрока');

return await response.json();
}

export async function getTop10Records(gameId, token) {
const response = await fetch(`${BASE_URL}/records/top/${gameId}/`, {
headers: {
Authorization: `Token ${token}`,
},
});

if (!response.ok) throw new Error('Ошибка получения топа рекордов');

return await response.json();
}

export async function deleteRecord(playerId, gameId, token) {
const response = await fetch(`${BASE_URL}/records/player/${playerId}/game/${gameId}/delete/`, {
method: 'DELETE',
headers: {
Authorization: `Token ${token}`,
},
});

if (!response.ok) throw new Error('Ошибка удаления рекорда');
}

export async function new_check_adm(token, email, password) {
  const response = await fetch(`${BASE_URL}/admpanel/check-adm/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({ user: { email, password } }),
  });
  if (response.status === 200) {
    return { valid: true };
  }
  const data = await response.json();
  return data;
}


export async function getStaff(token) {
console.log(token);
const response = await fetch(`${BASE_URL}/admpanel/players/`, {
headers: {
Authorization: `Token ${token}`,
},
});
if (!response.ok) throw new Error('Ошибка загрузки игроков');
return await response.json();
}

export async function makeStaff(playerId, token, approve) {
  const response = await fetch(`${BASE_URL}/admpanel/player/${playerId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({ approve }),
  });
  if (!response.ok) throw new Error('Ошибка изменения статуса');
  return await response.json();
} 