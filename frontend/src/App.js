import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Browse from './pages/Browse';
import ItemDetail from './pages/ItemDetail';
import PostItem from './pages/PostItem';
import MapPage from './pages/MapPage';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Browse />} />
            <Route path="/item/:id" element={<ItemDetail />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/post" element={<PrivateRoute><PostItem /></PrivateRoute>} />
            <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
            <Route path="/messages/:convId" element={<PrivateRoute><Messages /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/profile/:userId" element={<Profile />} />
          </Routes>
        </main>
        <footer style={{
          textAlign: 'center',
          padding: '20px',
          fontSize: '13px',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border)',
          marginTop: '40px',
          background: 'var(--surface)'
        }}>
          Made with ❤️ by <strong>Dheeraj Singh</strong>
        </footer>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;