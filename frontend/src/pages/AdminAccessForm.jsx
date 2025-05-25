import React, { useState } from 'react';
import { new_check_adm } from '../api/api';
import { useNavigate } from 'react-router-dom';

const AdminAccessForm = ({ token, onClose }) => {
  const [form, setForm] = useState({ email: '',  password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  try {
    const response = await new_check_adm(token, form.email, form.password);
    if (response.valid) {
      navigate('/admin-panel');
    } else if (response.detail) {
      setError(response.detail);
    } else {
      setError('Доступ запрещён');
    }
  } catch {
    setError('Ошибка при проверке прав');
  }
};

  return (
  <form onSubmit={handleSubmit} style={{
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    minWidth: 320
  }}>
    <div style={{ marginBottom: 8 }}>
      <label style={{
        display: 'block',
        marginBottom: 2,
        marginLeft: 0,
        textAlign: 'left'
      }}>
        Почта:
      </label>
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        required
        style={{
          background: 'transparent',
          border: '1px solid #bbb',
          marginBottom: 0,
          width: '100%'
        }}
      />
    </div>
    <div style={{ marginBottom: 8 }}>
      <label style={{
        display: 'block',
        marginBottom: 2,
        marginLeft: 0,
        textAlign: 'left'
      }}>
        Пароль:
      </label>
      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        required
        style={{
          background: 'transparent',
          border: '1px solid #bbb',
          marginBottom: 0,
          width: '100%'
        }}
      />
    </div>
    <button type="submit">Войти в админ-панель</button>
    {error && <p style={{ color: 'red' }}>{error}</p>}
  </form>
);
};

export default AdminAccessForm;
