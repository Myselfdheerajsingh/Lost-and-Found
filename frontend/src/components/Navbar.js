import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.body.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">F</div>
          FindIt
        </Link>
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Browse</Link>
          <Link to="/map" className={`nav-link ${isActive('/map') ? 'active' : ''}`}>Map</Link>
          {user && <Link to="/messages" className={`nav-link ${isActive('/messages') ? 'active' : ''}`}>Messages</Link>}
        </div>
        <div className="navbar-right">
          {/* Dark/Light toggle */}
          <button className="theme-toggle" onClick={() => setDark(!dark)} title="Toggle theme">
            {dark ? '☀️' : '🌙'}
          </button>

          {user ? (
            <>
              <Link to="/post" className="btn btn-primary btn-sm">+ Post Item</Link>
              <div className="avatar-menu" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="navbar-avatar">
                  {user.avatar ? <img src={user.avatar} alt={user.name} /> : user.name?.charAt(0).toUpperCase()}
                </div>
                {menuOpen && (
                  <div className="dropdown">
                    <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>👤 My Profile</Link>
                    <Link to="/post" className="dropdown-item" onClick={() => setMenuOpen(false)}>+ Post Item</Link>
                    <Link to="/messages" className="dropdown-item" onClick={() => setMenuOpen(false)}>💬 Messages</Link>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item danger" onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}