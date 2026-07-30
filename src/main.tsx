import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App.tsx';
import { AdminApp } from './admin/AdminApp.tsx';

// Firebase Hosting rewrites everything to index.html (SPA), so path-based
// routing is done client-side here. Just two routes for now — the public form
// and the admin analytics view.
const isAdmin = window.location.pathname.startsWith('/admin');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? <AdminApp /> : <App />}
  </StrictMode>,
);
