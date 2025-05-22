import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { registerPlayer } from '../api/api';
import { useNavigate, Link } from 'react-router-dom'; // Добавлен Link

const Register = () => {
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });
  const [errors, setErrors] = useState([]);
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    try {
      const data = await registerPlayer(formData);
      loginUser(data.token, { email: data.email, username: data.username });
      navigate('/account');
    } catch (err) {
      console.error(err);

      if (err.message.includes('\n')) {
        setErrors(err.message.split('\n'));
      } else {
        setErrors([err.message]);
      }
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit}>
        <h2>Регистрация</h2>

        <input
          type="text"
          placeholder="Имя"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <input
          type="password"
          placeholder="Пароль"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <button type="submit" style={{ marginLeft: '0.6rem' }}>
            Зарегистрироваться
            </button>

        {errors.length > 0 && (
          <ul style={{ color: 'red', marginTop: '1rem' }}>
            {errors.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        )}
      </form>

      <div style={{ marginTop: '1rem' }}>
        <p>Уже есть аккаунт?</p>
        <Link to="/login">
          <button>Авторизоваться</button>
        </Link>
      </div>
    </div>
  );
};

export default Register;
