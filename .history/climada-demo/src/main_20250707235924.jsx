// src/main.jsx
import 'leaflet/dist/leaflet.css';   // ✅ Aqui, fora do React
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
