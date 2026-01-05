import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { runMigrations } from '@/services/migrationService';

// Run lightweight client-side migrations before app boot
try { runMigrations(); } catch (e) { console.warn('Migration runner error:', e); }

createRoot(document.getElementById('root')!).render(<App />);

