import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './global.css';

// Ensure the root element exists
const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find the root element');
}

// Create a root and render the app
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
