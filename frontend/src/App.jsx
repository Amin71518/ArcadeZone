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
import ClickerGame from './games/ClickerGame';
import SnakeGame from './games/SnakeGame';
import Tetris from './games/TetrisGame';
import AddGameForm from './pages/AddGameForm';
import Navbar from './components/Navbar';
import GameView from './pages/GameView';


function App() {
return (
<AuthProvider>
<BrowserRouter>
<Navbar />
<Routes>
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/games" element={<Games />} /> {/* Доступна всем */}
<Route path="/account" element={<Account />} /> {/* Только авторизованным */}
<Route path="" element={<Games />} /> {/* По умолчанию */}
<Route path="/logout" element={<Logout />} /> 
<Route path="/clicker" element={<ClickerGame />} />
<Route path="/snake" element={<SnakeGame />} />
<Route path="/tetris" element={<Tetris />} />
<Route path="/add" element={<AddGameForm/>}/>
<Route path="/games/:gameId" element={<GameView />} />
</Routes>
</BrowserRouter>
</AuthProvider>
);
}

export default App;
