import { useState } from 'react';
import { addGame } from '../api/api';

function AddGameForm() {
const [formData, setFormData] = useState({
name: '',
description: '',
image: '',
rating: 0,
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
await addGame(formData);
alert('Игра добавлена!');
} catch (err) {
console.error('Ошибка при добавлении игры:', err);
}
};

return (
<form onSubmit={handleSubmit}>
<input name="name" placeholder="Название" onChange={handleChange} required />
<input name="description" placeholder="Описание" onChange={handleChange} />
<input name="image" placeholder="Ссылка на изображение" onChange={handleChange} />
<input name="rating" type="number" step="0.1" min="0" max="5" onChange={handleChange} />
<input name="code" placeholder="Имя компонента (например, ClickerGame)" value={formData.code} onChange={handleChange} required />
<button type="submit">Добавить игру</button>
</form>
);
}

export default AddGameForm;