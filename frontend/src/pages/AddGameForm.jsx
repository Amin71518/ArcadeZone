import { useState, useContext  } from 'react';
import { addGame } from '../api/api';
import { AuthContext } from '../context/AuthContext';

function AddGameForm() {
const { token } = useContext(AuthContext);
const [formData, setFormData] = useState({
id: '',
name: '',
genre: '',
pictures: '',
code: ''
});

const handleChange = (e) => {
setFormData((prev) => ({
...prev,
[e.target.name]: e.target.value
}));
};

const handleSubmit = async (e) => {
e.preventDefault();
try {
await addGame(formData, token);
alert('Игра добавлена!');
} catch (err) {
console.error('Ошибка при добавлении игры:', err);
}
};

return (
<form onSubmit={handleSubmit}>
<input name="id" placeholder="ID" value={formData.id} onChange={handleChange} required />
<input name="name" placeholder="Название" onChange={handleChange} required />
<input name="genre" placeholder="Жанр" onChange={handleChange} />
<input name="pictures" placeholder="Ссылка на изображение" onChange={handleChange} />
<input name="code" placeholder="Имя компонента" value={formData.code} onChange={handleChange} required />
<button type="submit">Добавить игру</button>
</form>
);
}

export default AddGameForm;