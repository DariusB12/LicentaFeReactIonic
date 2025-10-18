import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// RUN: npm run dev
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);