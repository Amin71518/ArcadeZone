import { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { updateCurrentUser } from '../api/api';
import LastGamesDropdown from '../components/LastGamesDropdown';
import '../components/UpdateData.css';
import AdminAccessForm from '../pages/AdminAccessForm';

const Account = () => {
  const { token, user, logoutUser, loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    username: user?.username || '',
    password: '',
    current_password: ''
  });
  const [message, setMessage] = useState(null);

  const [showAdminForm, setShowAdminForm] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const updatedUser = await updateCurrentUser(token, formData);
      loginUser(token, updatedUser); // обновить AuthContext
      setMessage('Данные успешно обновлены!');
      setEditMode(false);
    } catch (err) {
      setMessage(err.message || 'Ошибка при обновлении данных');
    }
  };

  return (
  <div style={{ padding: '1rem', marginTop: '-150px' }}>
    <h2>Аккаунт</h2>
    <p>Вы вошли как: {user?.username}</p>
    <Link to="/logout">
      <button>Выйти</button>
    </Link>

    <button onClick={() => setEditMode((prev) => !prev)} style={{ marginLeft: '1rem' }}>
      {editMode ? 'Отменить' : 'Изменить данные'}
    </button>

    {editMode && (
      <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', marginBottom: 2, marginLeft: 0, textAlign: 'left' }}>Текущий пароль:</label>
          <input
            type="password"
            name="current_password"
            value={formData.current_password}
            onChange={handleChange}
            required
            style={{ background: 'transparent', border: '1px solid #bbb', marginBottom: 0, width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', marginBottom: 2, marginLeft: 0, textAlign: 'left' }}>Новый email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ background: 'transparent', border: '1px solid #bbb', marginBottom: 0, width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', marginBottom: 2, marginLeft: 0, textAlign: 'left' }}>Новое имя пользователя:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            style={{ background: 'transparent', border: '1px solid #bbb', marginBottom: 0, width: '100%' }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block', marginBottom: 2, marginLeft: 0, textAlign: 'left' }}>Новый пароль:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{ background: 'transparent', border: '1px solid #bbb', marginBottom: 0, width: '100%' }}
          />
        </div>
        <button type="submit">Сохранить</button>
      </form>
    )}

    {/* Кнопки "Последние рекорды" и "Панель администратора" в одной строке с очень большим горизонтальным отступом */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '8rem', marginTop: '1.5rem' }}>
      <LastGamesDropdown />
      {user && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button onClick={() => setShowAdminForm((prev) => !prev)}>
            {showAdminForm ? 'Скрыть админ-доступ' : 'Панель администратора'}
          </button>
          {showAdminForm && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: '110%',
                zIndex: 1000,
                minWidth: '320px',
                background: 'transparent',
                border: 'none',
                borderRadius: 0,
                boxShadow: 'none',
                padding: 0,
              }}
            >
              <AdminAccessForm
                user={user}
                token={token}
                onClose={() => setShowAdminForm(false)}
              />
            </div>
          )}
        </div>
      )}
    </div>

    {message && <p style={{ marginTop: '1rem', color: 'blue' }}>{message}</p>}
  </div>
);

}

export default Account;
