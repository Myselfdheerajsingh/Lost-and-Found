import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getItem, resolveItem, deleteItem, sendMessage } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './ItemDetail.css';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msgText, setMsgText] = useState('');
  const [msgSent, setMsgSent] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    getItem(id)
      .then((res) => setItem(res.data.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleResolve = async () => {
    if (!window.confirm('Mark this item as resolved/reunited?')) return;
    const res = await resolveItem(id);
    setItem(res.data.data);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this item permanently?')) return;
    await deleteItem(id);
    navigate('/');
  };

  const handleMessage = async (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    await sendMessage({ receiverId: item.postedBy._id, itemId: item._id, text: msgText });
    setMsgSent(true);
    setMsgText('');
  };

  if (loading) return <div className="loading">Loading item...</div>;
  if (!item) return null;

  const isOwner = user?._id === item.postedBy._id || user?.id === item.postedBy._id;
  const EMOJI_MAP = { Electronics:'📱', Pets:'🐾', 'Wallet/IDs':'👛', Keys:'🔑', Bags:'👜', Clothing:'👕', Other:'📦' };

  return (
    <div className="page">
      <Link to="/" className="back-link">← Back to listings</Link>

      <div className="detail-layout">
        {/* Left — Images */}
        <div className="detail-images">
          <div className="main-image">
            {item.images?.length > 0
              ? <img src={item.images[activeImg]} alt={item.title} />
              : <span className="detail-emoji">{EMOJI_MAP[item.category] || '📦'}</span>}
          </div>
          {item.images?.length > 1 && (
            <div className="thumb-row">
              {item.images.map((img, i) => (
                <img
                  key={i} src={img} alt="" className={`thumb ${i === activeImg ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right — Info */}
        <div className="detail-info">
          <div className="detail-tags">
            <span className={`tag tag-${item.type}`}>{item.type.toUpperCase()}</span>
            <span className="tag tag-cat">{item.category}</span>
            {item.status === 'resolved' && <span className="tag tag-resolved">✓ Resolved</span>}
          </div>

          <h1 className="detail-title">{item.title}</h1>

          <div className="detail-meta-grid">
            <div className="meta-item"><span className="meta-icon">📍</span><span>{item.location.address}</span></div>
            <div className="meta-item"><span className="meta-icon">📅</span><span>{new Date(item.date).toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' })}</span></div>
            <div className="meta-item"><span className="meta-icon">👁</span><span>{item.views} views</span></div>
            <div className="meta-item"><span className="meta-icon">🕒</span><span>Posted {new Date(item.createdAt).toLocaleDateString('en-IN')}</span></div>
          </div>

          <div className="detail-desc">
            <div className="detail-section-title">Description</div>
            <p>{item.description}</p>
          </div>

          {/* Posted by */}
          <div className="poster-card">
            <div className="poster-avatar">
              {item.postedBy.avatar
                ? <img src={item.postedBy.avatar} alt={item.postedBy.name} />
                : item.postedBy.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="poster-name">{item.postedBy.name}</div>
              <div className="poster-label">Posted by</div>
            </div>
            <Link to={`/profile/${item.postedBy._id}`} className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }}>
              View Profile
            </Link>
          </div>

          {/* Contact */}
          {item.contactEmail && (
            <div className="contact-box">
              <div className="detail-section-title">Contact</div>
              <a href={`mailto:${item.contactEmail}`} className="contact-link">✉ {item.contactEmail}</a>
              {item.contactPhone && <a href={`tel:${item.contactPhone}`} className="contact-link">📞 {item.contactPhone}</a>}
            </div>
          )}

          {/* Owner actions */}
          {isOwner && (
            <div className="owner-actions">
              {item.status === 'active' && (
                <button className="btn btn-primary btn-sm" onClick={handleResolve}>✓ Mark Resolved</button>
              )}
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
            </div>
          )}

          {/* Message form */}
          {user && !isOwner && item.status === 'active' && (
            <div className="message-form card">
              <div className="detail-section-title">Send a Message</div>
              {msgSent ? (
                <div className="alert alert-success">Message sent! Check your messages for a reply.</div>
              ) : (
                <form onSubmit={handleMessage}>
                  <textarea
                    className="form-textarea"
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    placeholder={`Hi, I ${item.type === 'lost' ? 'think I found' : 'lost'} this item...`}
                    rows={3}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button type="submit" className="btn btn-primary">Send Message</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {!user && (
            <div className="alert alert-error">
              <Link to="/login">Login</Link> to contact the poster.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
