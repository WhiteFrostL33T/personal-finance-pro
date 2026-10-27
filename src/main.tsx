import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Auto-register offline Service Worker for full offline PWA execution
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New content available, refreshing...');
  },
  onOfflineReady() {
    console.log('Personal Finance Pro is ready to work completely offline.');
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
