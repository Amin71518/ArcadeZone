import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { registerPlayer } from '../api/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
const [formData, setFormData] = useState({ email: '', username: '', password: '' });
const [error, setError] = useState(null);
const { loginUser } = useContext(AuthContext);
const navigate = useNavigate();

const handleSubmit = async (e) => {
e.preventDefault();
setError(null);
try {
const data = await registerPlayer(formData);
loginUser(data.token, { email: data.email, username: data.username });
navigate('/account');
} catch (err) {
setError('Ошибка регистрации');
}
};

return (
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
<button type="submit">Зарегистрироваться</button>
{error && <p style={{ color: 'red' }}>{error}</p>}
</form>
);
};

export default Register;