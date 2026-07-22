import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
import { getItems } from '../utils/api';
import './MapPage.css';

const MAP_CENTER = { lat: 30.3165, lng: 78.0322 }; // Dehradun

const MAP_STYLES = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

export default function MapPage() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('');

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY || '',
  });

  useEffect(() => {
    getItems({ limit: 100 }).then((res) => {
      setItems(res.data.data.filter((i) => i.location?.coordinates?.lat));
    });
  }, []);

  const filtered = filter ? items.filter((i) => i.type === filter) : items;

  if (!isLoaded) return <div className="loading">Loading map...</div>;

  return (
    <div className="page map-page">
      <div className="map-header">
        <div>
          <h1>Items Map</h1>
          <p>View all lost & found items on the map</p>
        </div>
        <div className="map-filters">
          <button className={`map-filter-btn ${filter === '' ? 'active' : ''}`} onClick={() => setFilter('')}>All</button>
          <button className={`map-filter-btn lost ${filter === 'lost' ? 'active' : ''}`} onClick={() => setFilter('lost')}>Lost</button>
          <button className={`map-filter-btn found ${filter === 'found' ? 'active' : ''}`} onClick={() => setFilter('found')}>Found</button>
        </div>
      </div>

      <div className="map-wrap">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '500px', borderRadius: '10px' }}
          center={MAP_CENTER}
          zoom={12}
          options={{ styles: MAP_STYLES, disableDefaultUI: false }}
        >
          {filtered.map((item) => (
            <Marker
              key={item._id}
              position={{ lat: item.location.coordinates.lat, lng: item.location.coordinates.lng }}
              icon={{
                url: item.type === 'lost'
                  ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                  : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
              }}
              onClick={() => setSelected(item)}
            />
          ))}

          {selected && (
            <InfoWindow
              position={{ lat: selected.location.coordinates.lat, lng: selected.location.coordinates.lng }}
              onCloseClick={() => setSelected(null)}
            >
              <div className="map-info-window">
                <span className={`tag tag-${selected.type}`}>{selected.type.toUpperCase()}</span>
                <div className="info-title">{selected.title}</div>
                <div className="info-loc">📍 {selected.location.address}</div>
                <Link to={`/item/${selected._id}`} className="info-link">View Details →</Link>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Legend + stats */}
      <div className="map-legend-row">
        <div className="map-legend">
          <div className="legend-item"><span className="legend-dot lost" />Lost items ({items.filter(i => i.type === 'lost').length})</div>
          <div className="legend-item"><span className="legend-dot found" />Found items ({items.filter(i => i.type === 'found').length})</div>
        </div>
        <p className="map-note">Tip: Add lat/lng when posting an item to show it on the map.</p>
      </div>

      {/* Item list below map */}
      <div className="map-item-list">
        <h2 className="map-list-title">Items with Location ({filtered.length})</h2>
        <div className="items-grid">
          {filtered.map((item) => (
            <Link key={item._id} to={`/item/${item._id}`} className="item-card">
              <div className="item-card-img">
                {item.images?.[0] ? <img src={item.images[0]} alt={item.title} /> : <span>📦</span>}
              </div>
              <div className="item-card-body">
                <div className="item-card-tags">
                  <span className={`tag tag-${item.type}`}>{item.type.toUpperCase()}</span>
                </div>
                <div className="item-card-title">{item.title}</div>
                <div className="item-card-meta">📍 {item.location.address}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
