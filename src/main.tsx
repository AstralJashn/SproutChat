import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('====================================');
console.log('🚀 SPROUTCHAT APP STARTING');
console.log('Version: main.tsx loaded');
console.log('Timestamp:', new Date().toISOString());
console.log('====================================');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
