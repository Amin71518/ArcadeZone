import React, { useContext, useState } from 'react';
import { getStaff, deletePlayer, deleteGame, deleteRecord, makeStaff } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './AdmPanel.css';
import AddGameForm from './AddGameForm';


const AdmPanel = () => {
  const { token } = useContext(AuthContext);

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

  const [confirmModal, setConfirmModal] = useState({ open: false, playerId: null, action: null });

  const navigate = useNavigate();

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
      setPlayerMessage(error.message);
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
      setGameMessage(error.message);
    }
  };

  const handleDeleteRecord = async (e) => {
    e.preventDefault();
    if (!recordPlayerId || !recordGameId) {
      setRecordMessage('Введите ID игрока и ID игры для удаления рекорда');
      return;
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

  // Галочка/крестик
  function openConfirmModal(playerId, action) {
    setConfirmModal({ open: true, playerId, action });
  }

  function closeConfirmModal() {
    setConfirmModal({ open: false, playerId: null, action: null });
  }

  async function handleConfirmAction() {
    try {
      if (confirmModal.action === 'approve') {
        await makeStaff(confirmModal.playerId, token, true);
      } else {
        await makeStaff(confirmModal.playerId, token, false);
      }
      setPlayers(players => players.filter(p => p.id !== confirmModal.playerId));
      closeConfirmModal();
    } catch (e) {
      alert('Ошибка при изменении статуса');
    }
  }

  return (
    <div className="adm-row">
      {/* Левая половина */}
      <div className="adm-left">
        {!playersLoaded ? (
          <button onClick={handleShowPlayers}>Показать стажеров</button>
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

      {/* Правая половина */}
      <div className="adm-right">
        <div className="adm-btn-group">
          <button
            onClick={() => {
              setShowPlayerForm((prev) => !prev);
              setShowGameForm(false);
              setShowRecordForm(false);
            }}
          >
            Удалить игрока
          </button>
          {showPlayerForm && (
            <div className="adm-popup-form">
              <button className="close" onClick={() => setShowPlayerForm(false)}>×</button>
              <form onSubmit={handleDeletePlayer}>
                <input
                  type="text"
                  placeholder="ID игрока"
                  value={playerIdToDelete}
                  onChange={e => setPlayerIdToDelete(e.target.value)}
                  style={{ marginRight: 8 }}
                />
                <button type="submit">Удалить</button>
                {playerMessage && <div style={{ color: 'red', marginTop: 4 }}>{playerMessage}</div>}
              </form>
            </div>
          )}
        </div>

        <div className="adm-btn-group">
          <button
            onClick={() => {
              setShowGameForm((prev) => !prev);
              setShowPlayerForm(false);
              setShowRecordForm(false);
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
              setShowRecordForm((prev) => !prev);
              setShowPlayerForm(false);
              setShowGameForm(false);
            }}
          >
            Удалить рекорд
          </button>
          {showRecordForm && (
            <div className="adm-popup-form">
              <button className="close" onClick={() => setShowRecordForm(false)}>×</button>
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
            className="adm-btn" // тот же класс, что и у кнопок удаления
            onClick={() => setShowAddGameForm((prev) => !prev)}
            style={{ marginBottom: 16 }}
          >
            {showAddGameForm ? 'Скрыть форму' : 'Добавить игру'}
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

      {/* Модалка подтверждения */}
      {confirmModal.open && (
        <div className="adm-popup-form" style={{ left: '50%', top: '30%', transform: 'translate(-50%, 0)' }}>
          <div style={{ marginBottom: 8 }}>
            {confirmModal.action === 'approve'
              ? 'Сделать пользователя главным админом?'
              : 'Снять с пользователя права staff?'}
          </div>
          <button onClick={handleConfirmAction}>Подтвердить</button>
          <button onClick={closeConfirmModal} style={{ marginLeft: 8 }}>Отменить</button>
        </div>
      )}
    </div>
  );
};

export default AdmPanel;
