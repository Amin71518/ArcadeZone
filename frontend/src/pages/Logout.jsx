import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutPlayer } from '../api/api';
import { AuthContext } from '../context/AuthContext';

const Logout = () => {
const { token, logoutUser } = useContext(AuthContext);
const navigate = useNavigate();

useEffect(() => {

const performLogout = async () => {
try {
if (token) {
await logoutPlayer(token);
}
} catch (err) {
console.error('Ошибка при выходе:', err);
} finally {
logoutUser(); // удаляет токен и user из контекста
navigate('/login'); // перенаправить после выхода

}
};
performLogout();
}, [token]);

return <p>Выход...</p>;
};

export default Logout;