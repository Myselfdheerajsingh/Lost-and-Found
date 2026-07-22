import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem } from '../utils/api';
import './PostItem.css';

const CATEGORIES = ['Electronics', 'Pets', 'Wallet/IDs', 'Keys', 'Bags', 'Clothing', 'Other'];

function MapPicker({ onSelect, selected }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    const map = L.map(mapRef.current).setView([30.3165, 78.0322], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;

      // Remove old marker
      if (markerRef.current) markerRef.current.remove();

      // Add new marker
      markerRef.current = L.marker([lat, lng]).addTo(map);

      // Reverse geocode to get address
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();
        const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        onSelect({ lat, lng, address });
        markerRef.current.bindPopup(address.split(',').slice(0, 2).join(',')).openPopup();
      } catch {
        onSelect({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
      }
    });

    mapInstanceRef.current = map;
  }, [mapLoaded, onSelect]);

  return (
    <div className="map-picker-wrap">
      <div className="map-picker-hint">
        📍 Click anywhere on the map to pin the location
      </div>
      <div ref={mapRef} className="map-picker-map" />
      {selected && (
        <div className="map-selected">
          <span>📍</span>
          <div>
            <div className="map-selected-coords">
              Lat: {selected.lat.toFixed(4)}, Lng: {selected.lng.toFixed(4)}
            </div>
            <div className="map-selected-addr">
              {selected.address?.split(',').slice(0, 3).join(',')}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              if (markerRef.current) markerRef.current.remove();
              markerRef.current = null;
              onSelect(null);
            }}
          >
            ✕ Clear
          </button>
        </div>
      )}
    </div>
  );
}

export default function PostItem() {
  const navigate = useNavigate();
  const [type, setType] = useState('lost');
  const [form, setForm] = useState({
    title: '', category: 'Electronics', description: '',
    address: '', date: '',
    contactEmail: '', contactPhone: '',
  });
  const [location, setLocation] = useState(null);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleLocationSelect = (loc) => {
    setLocation(loc);
    if (loc) {
      setForm((f) => ({
        ...f,
        address: f.address || loc.address?.split(',').slice(0, 3).join(','),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.description || !form.address || !form.date) {
      setError('Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('type', type);
      fd.append('title', form.title);
      fd.append('category', form.category);
      fd.append('description', form.description);
      fd.append('address', form.address);
      fd.append('date', form.date);
      if (form.contactEmail) fd.append('contactEmail', form.contactEmail);
      if (form.contactPhone) fd.append('contactPhone', form.contactPhone);
      if (location) {
        fd.append('lat', location.lat);
        fd.append('lng', location.lng);
      }
      images.forEach((img) => fd.append('images', img));
      const res = await createItem(fd);
      navigate(`/item/${res.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post item. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="post-header">
        <h1>Post an Item</h1>
        <p>Report a lost or found item to help reunite it with its owner</p>
      </div>
      <div className="post-form card">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>

          {/* Type toggle */}
          <div className="form-group">
            <div className="form-label">Item Type *</div>
            <div className="post-type-toggle">
              <button type="button" className={`type-opt ${type === 'lost' ? 'active-lost' : ''}`} onClick={() => setType('lost')}>
                😢 I Lost Something
              </button>
              <button type="button" className={`type-opt ${type === 'found' ? 'active-found' : ''}`} onClick={() => setType('found')}>
                🎉 I Found Something
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input name="title" className="form-input" placeholder="e.g. Black Leather Wallet" value={form.title} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select name="category" className="form-select" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea name="description" className="form-textarea"
              placeholder="Describe the item — color, brand, distinguishing features..."
              value={form.description} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location / Address *</label>
              <input name="address" className="form-input" placeholder="e.g. Rajpur Road, Dehradun" value={form.address} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Date {type === 'lost' ? 'Lost' : 'Found'} *</label>
              <input name="date" type="date" className="form-input" value={form.date} onChange={handleChange} max={new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          {/* Map picker */}
          <div className="form-group">
            <label className="form-label">Pin Exact Location on Map (optional)</label>
            <MapPicker onSelect={handleLocationSelect} selected={location} />
          </div>

          {/* Image upload */}
          <div className="form-group">
            <label className="form-label">Upload Images (up to 5)</label>
            <label className="upload-zone">
              <input type="file" accept="image/*" multiple onChange={handleImages} style={{ display: 'none' }} />
              <span className="upload-icon">📷</span>
              <span>Click to upload photos</span>
              <span className="upload-hint">JPG, PNG up to 5MB each</span>
            </label>
            {previews.length > 0 && (
              <div className="preview-row">
                {previews.map((p, i) => <img key={i} src={p} alt="" className="preview-thumb" />)}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input name="contactEmail" type="email" className="form-input" placeholder="your@email.com" value={form.contactEmail} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone (optional)</label>
              <input name="contactPhone" className="form-input" placeholder="+91 98765 43210" value={form.contactPhone} onChange={handleChange} />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Posting...' : 'Submit Report'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}