import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Account = () => {
const { token, user, logoutUser } = useContext(AuthContext);
const navigate = useNavigate();

useEffect(() => {
if (!token) {
navigate('/login');
}
}, [token]);

return (
<div>
<h2>Аккаунт</h2>
<p>Вы вошли как: {user?.username}</p>
<button onClick={logoutUser}>Выйти</button>
</div>
);
};

export default Account;