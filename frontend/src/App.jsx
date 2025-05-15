import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Games from './pages/Games';
import Account from './pages/Account';
import Logout from './pages/Logout';
function App() {
return (
<AuthProvider>
<BrowserRouter>
<Routes>
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/games" element={<Games />} /> {/* Доступна всем */}
<Route path="/account" element={<Account />} /> {/* Только авторизованным */}
<Route path="" element={<Games />} /> {/* По умолчанию */}

<Route path="/logout" element={<Logout />} /> 
</Routes>
</BrowserRouter>
</AuthProvider>
);
}

export default App;
