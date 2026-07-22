import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUser, getUserItems, updateProfile } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const EMOJI_MAP = { Electronics:'📱', Pets:'🐾', 'Wallet/IDs':'👛', Keys:'🔑', Bags:'👜', Clothing:'👕', Other:'📦' };

export default function Profile() {
  const { userId } = useParams();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', location: '', bio: '' });
  const [saveMsg, setSaveMsg] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const targetId = userId || authUser?._id || authUser?.id;
  const isOwn = !userId || userId === (authUser?._id || authUser?.id);

  useEffect(() => {
    if (!targetId) return;
    Promise.all([getUser(targetId), getUserItems(targetId)])
      .then(([userRes, itemsRes]) => {
        setProfile(userRes.data.data);
        setItems(itemsRes.data.data);
        const u = userRes.data.data;
        setForm({ name: u.name || '', phone: u.phone || '', location: u.location || '', bio: u.bio || '' });
      })
      .finally(() => setLoading(false));
  }, [targetId]);

  const handleSave = async () => {
    await updateProfile(form);
    setProfile((p) => ({ ...p, ...form }));
    setEditing(false);
    setSaveMsg('Profile updated!');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const filteredItems = items.filter((i) => {
    if (activeTab === 'lost') return i.type === 'lost';
    if (activeTab === 'found') return i.type === 'found';
    if (activeTab === 'resolved') return i.status === 'resolved';
    return true;
  });

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!profile) return <div className="loading">User not found.</div>;

  return (
    <div className="page">
      {/* Profile card */}
      <div className="profile-card card">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            {profile.avatar
              ? <img src={profile.avatar} alt={profile.name} />
              : profile.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="profile-main">
          {editing ? (
            <div className="edit-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, State" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2} placeholder="Tell us a bit about yourself..." />
              </div>
              <div className="edit-actions">
                <button className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={handleSave}>Save Changes</button>
              </div>
            </div>
          ) : (
            <>
              <div className="profile-name-row">
                <h1 className="profile-name">{profile.name}</h1>
                {isOwn && (
                  <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>Edit Profile</button>
                )}
              </div>
              {saveMsg && <div className="alert alert-success" style={{ marginTop: 8 }}>{saveMsg}</div>}
              <div className="profile-meta">
                {profile.location && <span>📍 {profile.location}</span>}
                {profile.phone && <span>📞 {profile.phone}</span>}
                <span>📅 Joined {new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}</span>
              </div>
              {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            </>
          )}
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="pstat">
            <div className="pstat-val">{profile.itemsPosted || items.length}</div>
            <div className="pstat-label">Posted</div>
          </div>
          <div className="pstat">
            <div className="pstat-val found">{profile.itemsResolved || items.filter(i => i.status === 'resolved').length}</div>
            <div className="pstat-label">Resolved</div>
          </div>
          <div className="pstat">
            <div className="pstat-val">{items.filter(i => i.type === 'lost').length}</div>
            <div className="pstat-label">Lost</div>
          </div>
          <div className="pstat">
            <div className="pstat-val">{items.filter(i => i.type === 'found').length}</div>
            <div className="pstat-label">Found</div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="profile-listings">
        <div className="listings-tabs">
          {[['all','All'], ['lost','Lost'], ['found','Found'], ['resolved','Resolved']].map(([val, label]) => (
            <button key={val} className={`listings-tab ${activeTab === val ? 'active' : ''}`} onClick={() => setActiveTab(val)}>
              {label}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No items yet</h3>
            {isOwn && <Link to="/post" className="btn btn-primary" style={{ marginTop: 12 }}>Post your first item</Link>}
          </div>
        ) : (
          <div className="items-grid">
            {filteredItems.map((item) => (
              <Link key={item._id} to={`/item/${item._id}`} className="item-card">
                <div className="item-card-img">
                  {item.images?.[0] ? <img src={item.images[0]} alt={item.title} /> : <span>{EMOJI_MAP[item.category] || '📦'}</span>}
                </div>
                <div className="item-card-body">
                  <div className="item-card-tags">
                    <span className={`tag tag-${item.type}`}>{item.type.toUpperCase()}</span>
                    {item.status === 'resolved' && <span className="tag tag-resolved">Resolved</span>}
                  </div>
                  <div className="item-card-title">{item.title}</div>
                  <div className="item-card-meta">
                    <span>📍 {item.location?.address}</span>
                    <span>{new Date(item.date).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
