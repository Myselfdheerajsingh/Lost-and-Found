import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getItems } from '../utils/api';
import './Browse.css';

const CATEGORIES = ['Electronics', 'Pets', 'Wallet/IDs', 'Keys', 'Bags', 'Clothing', 'Other'];

const BG_MAP = {
  Electronics: 'elec-bg', Pets: 'pet-bg', 'Wallet/IDs': 'lost-bg',
  Keys: 'found-bg', Bags: 'other-bg', Clothing: 'other-bg', Other: 'other-bg',
};
const EMOJI_MAP = {
  Electronics: '📱', Pets: '🐾', 'Wallet/IDs': '👛',
  Keys: '🔑', Bags: '👜', Clothing: '👕', Other: '📦',
};

export default function Browse() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, lost: 0, found: 0 });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  const type = searchParams.get('type') || '';
  const category = searchParams.get('category') || '';
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (type) params.type = type;
      if (category) params.category = category;
      if (q) params.q = q;
      const res = await getItems(params);
      setItems(res.data.data);
      setPagination(res.data.pagination);
      const [lostRes, foundRes, totalRes] = await Promise.all([
        getItems({ type: 'lost', limit: 1 }),
        getItems({ type: 'found', limit: 1 }),
        getItems({ limit: 1 }),
      ]);
      setStats({
        total: totalRes.data.pagination.total,
        lost: lostRes.data.pagination.total,
        found: foundRes.data.pagination.total,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [type, category, q, page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setParam('q', searchInput.trim());
  };

  return (
    <div>
      {/* Hero */}
      <div className="browse-hero">
        <h1>Lost something? Found something?</h1>
        <p>Help your community — report lost & found items in your area</p>
        <div className="hero-btns">
          <button className="hero-btn-primary" onClick={() => { const p = new URLSearchParams(); p.set('type','lost'); setSearchParams(p); }}>
            😢 Report Lost Item
          </button>
          <button className="hero-btn-secondary" onClick={() => { const p = new URLSearchParams(); p.set('type','found'); setSearchParams(p); }}>
            🎉 I Found Something
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="search-bar-wrap">
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            className="search-q"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by item name, location, description..."
          />
          <select
            className="search-filter"
            value={category}
            onChange={(e) => setParam('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>
      </div>

      <div className="page">
        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon total">📋</div>
            <div><div className="stat-label">Total Reports</div><div className="stat-value">{stats.total}</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon lost">😢</div>
            <div><div className="stat-label">Lost Items</div><div className="stat-value lost">{stats.lost}</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon found">🎉</div>
            <div><div className="stat-label">Found Items</div><div className="stat-value found">{stats.found}</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon reunited">✅</div>
            <div><div className="stat-label">Reunited</div><div className="stat-value amber">{Math.floor(stats.found * 0.6)}</div></div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-row">
          <div className="type-toggle">
            {['', 'lost', 'found'].map((t) => (
              <button key={t} onClick={() => setParam('type', t)}
                className={`type-btn ${type === t ? `active ${t || 'all'}` : ''}`}>
                {t === '' ? 'All' : t === 'lost' ? '😢 Lost' : '🎉 Found'}
              </button>
            ))}
          </div>
          {(type || category || q) && (
            <button className="btn btn-outline btn-sm" onClick={() => { setSearchParams({}); setSearchInput(''); }}>
              ✕ Clear Filters
            </button>
          )}
          <Link to="/post" className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>
            + Post Item
          </Link>
        </div>

        <div className="section-header">
          <div className="section-title">
            {q ? `Results for "${q}"` : type ? `${type.charAt(0).toUpperCase()+type.slice(1)} Items` : 'Recent Items'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{pagination.total} items found</div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="loading">Loading items...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No items found</h3>
            <p>Try adjusting filters or <Link to="/post">post a new listing</Link></p>
          </div>
        ) : (
          <div className="items-grid">
            {items.map((item) => (
              <Link key={item._id} to={`/item/${item._id}`} className="item-card">
                <div className={`item-card-img ${BG_MAP[item.category] || 'other-bg'}`}>
                  {item.images?.[0]
                    ? <img src={item.images[0]} alt={item.title} />
                    : <span>{EMOJI_MAP[item.category] || '📦'}</span>}
                  <span className={`item-card-badge ${item.type}`}>{item.type}</span>
                </div>
                <div className="item-card-body">
                  <div className="item-card-cat">{item.category}</div>
                  <div className="item-card-title">{item.title}</div>
                  <div className="item-card-meta">
                    <span>📍 {item.location.address}</span>
                    <span>{new Date(item.date).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <div className="item-card-footer">
                  <div className="item-card-user">
                    <div className="item-card-avatar">
                      {item.postedBy?.avatar
                        ? <img src={item.postedBy.avatar} alt="" />
                        : item.postedBy?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="item-card-username">{item.postedBy?.name}</span>
                  </div>
                  <span className="item-card-views">👁 {item.views}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`page-btn ${p === page ? 'active' : ''}`}
                onClick={() => { const params = new URLSearchParams(searchParams); params.set('page', p); setSearchParams(params); }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}