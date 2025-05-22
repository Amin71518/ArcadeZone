import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { loginPlayer } from '../api/api';
import { useNavigate, Link } from 'react-router-dom'; // Добавлен Link

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const data = await loginPlayer(email, password);
      loginUser(data.token, { email: data.email, username: data.username });
      navigate('/games');
    } catch (err) {
      setError('Неверный email или пароль');
    }
  };

  return (
    <div className="login-container">
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ marginLeft: '0.6rem' }}>
            Войти
        </button>
      </form>

      {/* Новая часть — кнопка регистрации */}
      <div style={{ marginTop: '1rem' }}>
        <p>Впервые здесь?</p>
        <Link to="/register">
          <button>Зарегистрироваться</button>
        </Link>
      </div>
    </div>
  );
};

export default Login;
