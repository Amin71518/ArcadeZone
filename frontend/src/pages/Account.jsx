import { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { updateCurrentUser } from '../api/api';
import LastGamesDropdown from '../components/LastGamesDropdown';
import '../components/UpdateData.css';

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

useEffect(() => {
if (!token) {
navigate('/login');
}
}, [token]);

const handleChange = (e) => {
const { name, value } = e.target;
setFormData((prev) => ({ ...prev, [name]: value }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage(null);
  try {
    console.log('Отправка:', formData);
    const updatedUser = await updateCurrentUser(token, formData);
    console.log('Ответ от сервера:', updatedUser);
    loginUser(token, updatedUser); // обновить AuthContext
    setMessage('Данные успешно обновлены!');
    setEditMode(false);
  } catch (err) {
    console.error(err);
    setMessage(err.message || 'Ошибка при обновлении данных');
  }
};

return (
<div style={{ padding: '1rem' }}>
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
      <div>
        <label>Текущий пароль:</label>
        <input type="password" name="current_password"
        value={formData.current_password} onChange={handleChange} required />
      </div>
      <div>
        <label>Email:</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
      </div>
      <div>
        <label>Имя пользователя:</label>
        <input type="text" name="username" value={formData.username} onChange={handleChange} required />
      </div>
      <div>
        <label>Новый пароль:</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
      </div>
      <button type="submit">Сохранить</button>
    </form>
  )}

<LastGamesDropdown/>

  {message && <p style={{ marginTop: '1rem', color: 'blue' }}>{message}</p>}
</div>
);
};
export default Account;