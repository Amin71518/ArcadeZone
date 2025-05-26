import React, { useContext, useState } from 'react';
import { getPlayerRecords, getPlayers, admin_get_player, getStaff, deletePlayer, deleteGame, deleteRecord, makeStaff } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './AdmPanel.css';
import AddGameForm from './AddGameForm';


const AdmPanel = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showAddGameForm, setShowAddGameForm] = useState(false);

  const [players, setPlayers] = useState([]);
  const [playersLoaded, setPlayersLoaded] = useState(false);

  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [showGameForm, setShowGameForm] = useState(false);
  const [showRecordForm, setShowRecordForm] = useState(false);

  const [playerIdToDelete, setPlayerIdToDelete] = useState('');
  const [gameIdToDelete, setGameIdToDelete] = useState('');
  const [recordPlayerId, setRecordPlayerId] = useState('');
  const [recordGameId, setRecordGameId] = useState('');

  const [playerMessage, setPlayerMessage] = useState('');
  const [gameMessage, setGameMessage] = useState('');
  const [recordMessage, setRecordMessage] = useState('');
  const [playersMessage, setPlayersMessage] = useState('');

  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const [playersList, setPlayersList] = useState([]);
  const [playersListMessage, setPlayersListMessage] = useState('');
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);

  const [showFindPlayerForm, setShowFindPlayerForm] = useState(false);
  const [findPlayerId, setFindPlayerId] = useState('');
  const [foundPlayer, setFoundPlayer] = useState(null);
  const [findPlayerMessage, setFindPlayerMessage] = useState('');
  const [isFindingPlayer, setIsFindingPlayer] = useState(false);

  const [showPlayerRecordForm, setShowPlayerRecordForm] = useState(false);
  const [recordPlayerIdToFind, setRecordPlayerIdToFind] = useState('');
  const [records, setRecords] = useState([]);
  const [recordSearchMessage, setRecordSearchMessage] = useState('');
  const [isSearchingRecord, setIsSearchingRecord] = useState(false);


  const closeAllForms = () => {
      setShowPlayerForm(false);
      setShowGameForm(false);
      setShowRecordForm(false);
      setShowFindPlayerForm(false);
      setShowAddGameForm(false);
      setShowAllPlayers(false);
      setPlayersLoaded(false);
      setShowPlayerRecordForm(false);
  };



  const [confirmModal, setConfirmModal] = useState({ open: false, playerId: null, action: null });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ open: false, type: '', id: '' });

  const handleShowPlayers = async () => {
    try {
      const data = await getStaff(token);
      setPlayers(data);
      setPlayersLoaded(true);
      setPlayersMessage('');
    } catch (error) {
      setPlayers([]);
      setPlayersLoaded(true);
      setPlayersMessage('Игроки не загружены');
    }
  };

  const handleHidePlayers = () => {
    setPlayersLoaded(false);
    setPlayers([]);
  };

  const handleDeletePlayer = async (e) => {
    e.preventDefault();
    if (!playerIdToDelete) {
      setPlayerMessage('Введите ID игрока для удаления');
      return;
    }
    try {
      await deletePlayer(playerIdToDelete, token);
      setPlayerMessage(`Игрок с ID ${playerIdToDelete} удалён`);
      setPlayerIdToDelete('');
      handleShowPlayers();
    } catch (error) {
      if (error.message === 'confirm_required') {
        setPlayerMessage('Игрок найден. Требуется подтверждение удаления.');
        setDeleteConfirmModal({ open: true, type: 'player', id: playerIdToDelete });
      } else {
        setPlayerMessage(error.message);
      }
    }
  };

  const handleDeleteGame = async (e) => {
    e.preventDefault();
    if (!gameIdToDelete) {
      setGameMessage('Введите ID игры для удаления');
      return;
    }
    try {
      await deleteGame(gameIdToDelete, token);
      setGameMessage(`Игра с ID ${gameIdToDelete} удалена`);
      setGameIdToDelete('');
    } catch (error) {
      if (error.message === 'confirm_required') {
        setGameMessage('Игра найдена. Требуется подтверждение удаления.');
        setDeleteConfirmModal({ open: true, type: 'game', id: gameIdToDelete });
      } else {
        setGameMessage(error.message);
      }
    }
  };

  const handleFindPlayer = async (e) => {
    e.preventDefault();
    setFindPlayerMessage('');
    setFoundPlayer(null);

    if (!findPlayerId) {
      setFindPlayerMessage('Введите ID игрока');
      return;
    }
    setIsFindingPlayer(true);
    try {
      const data = await admin_get_player(findPlayerId, token);
      console.log('Полученные данные игрока:', data);
      console.log('is_superuser:', data.is_admin); // Вот здесь
      setFoundPlayer(data);
      setFindPlayerMessage('');
    } catch (error) {
      setFoundPlayer(null);
      setFindPlayerMessage(error.message || 'Ошибка поиска игрока');
    }
    setIsFindingPlayer(false);
  };

  const handleFindPlayerRecord = async (e) => {
  e.preventDefault();
  setRecordSearchMessage('');
  setRecords([]);

  if (!recordPlayerIdToFind) {
    setRecordSearchMessage('Введите ID игрока');
    return;
  }

  setIsSearchingRecord(true);
  try {
    const result = await getPlayerRecords(recordPlayerIdToFind, token);
    const data = Array.isArray(result) ? result : result.records || [];
    if (data.length === 0) {
      setRecordSearchMessage('У игрока нет рекордов.');
    }
    setRecords(data);
  } catch (err) {
    setRecordSearchMessage(err.message || 'Ошибка при получении рекордов');
  }
  setIsSearchingRecord(false);
};


  const handleShowAllPlayers = async () => {
    if (!showAllPlayers) {
      setPlayersListMessage('');
      setIsLoadingPlayers(true);
      try {
        const data = await getPlayers(token);
        const playersArray = Array.isArray(data) ? data : data.players || [];
        setPlayersList(playersArray);
        if (playersArray.length === 0) {
          setPlayersListMessage('Нет игроков в базе.');
        }
      } catch (error) {
        setPlayersList([]);
        setPlayersListMessage(error.message || 'Ошибка загрузки игроков');
      }
      setIsLoadingPlayers(false);
    }
    setShowAllPlayers(prev => !prev);
  };


  const handleDeleteRecord = async (e) => {
    e.preventDefault();
    if (!recordPlayerId || !recordGameId) {
      return setRecordMessage('Введите ID игрока и ID игры для удаления рекорда');
    }
    try {
      await deleteRecord(recordPlayerId, recordGameId, token);
      setRecordMessage(`Рекорд игрока ${recordPlayerId} для игры ${recordGameId} удалён`);
      setRecordPlayerId('');
      setRecordGameId('');
    } catch (error) {
      setRecordMessage(error.message);
    }
  };

  const handleConfirmedDelete = async () => {
    try {
      const { type, id } = deleteConfirmModal;
      if (type === 'player') {
        await deletePlayer(id, token, true);
        setPlayerMessage(`Игрок с ID ${id} удалён`);
        setPlayerIdToDelete('');
        handleShowPlayers();
      } else if (type === 'game') {
        await deleteGame(id, token, true);
        setGameMessage(`Игра с ID ${id} удалена`);
        setGameIdToDelete('');
      }
    } catch (error) {
      if (deleteConfirmModal.type === 'player') {
        setPlayerMessage(error.message);
      } else {
        setGameMessage(error.message);
      }
    } finally {
      setDeleteConfirmModal({ open: false, type: '', id: '' });
    }
  };

  const openConfirmModal = (playerId, action) => setConfirmModal({ open: true, playerId, action });
  const closeConfirmModal = () => setConfirmModal({ open: false, playerId: null, action: null });

  const handleConfirmAction = async () => {
    try {
      if (confirmModal.action === 'approve') {
        await makeStaff(confirmModal.playerId, token, true);
      } else {
        await makeStaff(confirmModal.playerId, token, false);
      }
      setPlayers(players => players.filter(p => p.id !== confirmModal.playerId));
      closeConfirmModal();
    } catch {
      alert('Ошибка при изменении статуса');
    }
  };

  const resetFormStates = () => {
    setPlayerIdToDelete('');
    setGameIdToDelete('');
    setRecordPlayerId('');
    setRecordGameId('');
    setPlayerMessage('');
    setGameMessage('');
    setRecordMessage('');
  };

  return (
    <div className="adm-row">
      <div className="adm-left">
        {!playersLoaded ? (
          <button
            onClick={() => {
              closeAllForms();
              handleShowPlayers();
            }}
          >
          Показать стажеров
          </button>
        ) : (
          <button onClick={handleHidePlayers}>Скрыть стажеров</button>
        )}
        {playersLoaded && (
          <div style={{ marginTop: '1rem', maxHeight: 300, overflowY: 'auto', border: '1px solid #ddd', padding: 8 }}>
            {players.length > 0 ? (
              <ul>
                {players.map(player => (
                  <li key={player.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {player.username} ({player.email})
                    <button
                      onClick={() => openConfirmModal(player.id, 'approve')}
                      style={{ color: 'green', fontSize: 18, cursor: 'pointer', border: 'none', background: 'none' }}
                      title="Сделать главным админом"
                    >✔️</button>
                    <button
                      onClick={() => openConfirmModal(player.id, 'reject')}
                      style={{ color: 'red', fontSize: 18, cursor: 'pointer', border: 'none', background: 'none' }}
                      title="Снять права staff"
                    >❌</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#888' }}>{playersMessage || 'Игроки не загружены'}</p>
            )}
          </div>
        )}
      </div>

      <div className="adm-right">
        <div className="adm-btn-group">
          <button
            onClick={() => {
              const newState = !showPlayerForm;
              if (!showPlayerForm) closeAllForms();
              setShowPlayerForm((prev) => !prev);
              if (!newState) resetFormStates();
            }}
          >
            Удалить игрока
          </button>
          {showPlayerForm && (
            <div className="adm-popup-form">
              <button className="close" onClick={() => setShowPlayerForm(false)}>×</button>
              <form onSubmit={handleDeletePlayer}>
                <input type="text" placeholder="ID игрока" value={playerIdToDelete} onChange={e => setPlayerIdToDelete(e.target.value)} style={{ marginRight: 8 }} />
                <button type="submit">Удалить</button>
                {playerMessage && <div style={{ color: 'red', marginTop: 4 }}>{playerMessage}</div>}
              </form>
            </div>
          )}
        </div>

        <div className="adm-btn-group">
          <button
            className="adm-btn"
            onClick={() => {
              if (!showPlayerRecordForm) closeAllForms();
              setShowPlayerRecordForm((prev) => !prev);
            }}
          >
            Показать рекорды игрока
          </button>

          {showPlayerRecordForm && (
            <div className="adm-popup-form">
              <button className="close" onClick={() => setShowPlayerRecordForm(false)}>×</button>
              <form onSubmit={handleFindPlayerRecord}>
                <input
                  type="text"
                  placeholder="ID игрока"
                  value={recordPlayerIdToFind}
                  onChange={(e) => setRecordPlayerIdToFind(e.target.value)}
                  style={{ marginRight: 8 }}
                />
                <button type="submit" disabled={isSearchingRecord}>Показать</button>
              </form>
              {recordSearchMessage && (
                <div style={{ color: 'red', marginTop: 4 }}>{recordSearchMessage}</div>
              )}
              {records.length > 0 && (
                <table className="adm-player-table" style={{ marginTop: 12 }}>
                  <thead>
                    <tr>
                      <th>Player name</th>
                      <th>Game Name</th>
                      <th>Score</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((rec, idx) => (
                      <tr key={idx}>
                        <td>{rec.player__username}</td>
                        <td>{rec.game__name}</td>
                        <td>{rec.score}</td>
                        <td>{rec.start_time.split('.')[0]}</td>
                        <td>{rec.end_time.split('.')[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        <div className="adm-btn-group">
          <button
            onClick={() => {
              const newState = !showGameForm;
              if (!showGameForm) closeAllForms();
              setShowGameForm((prev) => !prev);
              if (!newState) resetFormStates();
            }}
          >
            Удалить игру
          </button>
          {showGameForm && (
            <div className="adm-popup-form">
              <button className="close" onClick={() => setShowGameForm(false)}>×</button>
              <form onSubmit={handleDeleteGame}>
                <input
                  type="text"
                  placeholder="ID игры"
                  value={gameIdToDelete}
                  onChange={e => setGameIdToDelete(e.target.value)}
                  style={{ marginRight: 8 }}
                />
                <button type="submit">Удалить</button>
                {gameMessage && <div style={{ color: 'red', marginTop: 4 }}>{gameMessage}</div>}
              </form>
            </div>
          )}
        </div>

        <div className="adm-btn-group">
          <button
            onClick={() => {
              const newState = !showRecordForm;
              if (!showRecordForm) closeAllForms();
              setShowRecordForm((prev) => !prev);
              if (!newState) resetFormStates();
            }}
          >
            Удалить рекорд
          </button>
          {showRecordForm && (
            <div className="adm-popup-form">
              <button className="close" onClick={() => { setShowRecordForm(false); resetFormStates(); }}>×</button>
              <form onSubmit={handleDeleteRecord}>
                <input
                  type="text"
                  placeholder="ID игрока"
                  value={recordPlayerId}
                  onChange={e => setRecordPlayerId(e.target.value)}
                  style={{ marginRight: 8 }}
                />
                <input
                  type="text"
                  placeholder="ID игры"
                  value={recordGameId}
                  onChange={e => setRecordGameId(e.target.value)}
                  style={{ marginRight: 8 }}
                />
                <button type="submit">Удалить</button>
                {recordMessage && <div style={{ color: 'red', marginTop: 4 }}>{recordMessage}</div>}
              </form>
            </div>
          )}
        </div>

        <div className="adm-btn-group">
          <button
            className="adm-btn"
            onClick={() => {
                if (!showAllPlayers) closeAllForms();
                handleShowAllPlayers();
            }}>
            {showAllPlayers ? 'Закрыть список игроков' : 'Показать всех игроков'}
          </button>
        </div>

{showAllPlayers && (
  <div className="modal-overlay" onClick={() => setShowAllPlayers(false)}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <button className="modal-close" onClick={() => setShowAllPlayers(false)}>×</button>
      <h3>Список игроков</h3>

      {playersList.length === 0 && !playersListMessage && (
        <p>Загрузка...</p>
      )}

      {playersListMessage && (
        <p style={{ color: 'red' }}>{playersListMessage}</p>
      )}

      {playersList.length > 0 && (
        <table className="adm-player-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Last login</th>
              <th>Is SuperUser</th>
              <th>Created at</th>
              <th>Updated at</th>
            </tr>
          </thead>
          <tbody>
            {playersList.map(player => (
              <tr key={player.id}>
                <td>{player.id}</td>
                <td>{player.username}</td>
                <td>{player.email}</td>
                <td>{new Date(player.last_login).toLocaleString()}</td>
                <td>{player.is_superuser ? 'True' : 'False'}</td>
                <td>{new Date(player.created_at).toLocaleString()}</td>
                <td>{new Date(player.updated_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
)}

        <div className="adm-btn-group">
          <button
            className="adm-btn"
            onClick={() => {
              if (!showFindPlayerForm) closeAllForms();
              setShowFindPlayerForm((prev) => !prev);
            }}>
            Найти игрока
          </button>
          {showFindPlayerForm && (
            <div className="adm-popup-form">
              <button className="close" onClick={() => setShowFindPlayerForm(false)}>×</button>
              <form onSubmit={handleFindPlayer}>
                <input
                  type="text"
                  placeholder="ID игрока"
                  value={findPlayerId}
                  onChange={e => setFindPlayerId(e.target.value)}
                  style={{ marginRight: 8 }}
                />
                <button type="submit" disabled={isFindingPlayer}>Найти</button>
              </form>
              {findPlayerMessage && (
                <div style={{ color: 'red', marginTop: 4 }}>{findPlayerMessage}</div>
              )}
              {foundPlayer && (
                <div style={{ marginTop: 8, color: 'green' }}>
                  <div><b>ID:</b> {foundPlayer.id}</div>
                  <div><b>Username:</b> {foundPlayer.username}</div>
                  <div><b>Email:</b> {foundPlayer.email}</div>
                  <div><b>Is superuser:</b> {foundPlayer.is_admin ? 'True' : 'False'}</div>
                  <div><b>Last login:</b> {foundPlayer.last_login}</div>
                  <div><b>Created at:</b> {new Date(foundPlayer.created_at).toLocaleString()}</div>
                  <div><b>Updated at:</b> {new Date(foundPlayer.updated_at).toLocaleString()}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="adm-btn-group">
          <button
            className="adm-btn"
            onClick={() => {
                if (!showAddGameForm) closeAllForms();
                setShowAddGameForm((prev) => !prev);
            }}
            style={{ marginBottom: 16 }}
          >
            Добавить игру
          </button>
          {showAddGameForm && (
            <div className="adm-popup-form">
              <button className="close" onClick={() => setShowAddGameForm(false)}>×</button>
              <AddGameForm />
            </div>
          )}
        </div>
        <button onClick={() => navigate('/account')} style={{ marginTop: 32 }}>
          Вернуться в аккаунт
        </button>
      </div>

      {confirmModal.open && (
        <div className="adm-popup-form" style={{ left: '50%', top: '30%', transform: 'translate(-50%, 0)' }}>
          <div style={{ marginBottom: 8 }}>
            {confirmModal.action === 'approve'
              ? 'Сделать пользователя главным админом?'
              : 'Снять с пользователя права staff?'}
          </div>
          <button onClick={handleConfirmAction}>Подтвердить</button>
          <button onClick={closeConfirmModal} style={{ marginLeft: 8 }}>Отмена</button>
        </div>
      )}

      {deleteConfirmModal.open && (
        <div className="adm-popup-form" style={{ left: '50%', top: '30%', transform: 'translate(-50%, 0)' }}>
          <p>
            {deleteConfirmModal.type === 'player'
              ? 'У игрока есть рекорды. Удалить игрока и все связанные записи?'
              : 'У игры есть рекорды. Удалить игру и все связанные записи?'}
          </p>
          <button onClick={handleConfirmedDelete}>Подтвердить</button>
          <button onClick={() => setDeleteConfirmModal({ open: false, type: '', id: '' })} style={{ marginLeft: 8 }}>Отмена</button>
        </div>
      )}
    </div>
  );
};

export default AdmPanel;
