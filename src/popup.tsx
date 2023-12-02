import React from 'react';
import Home from './components/home';
import { createRoot } from 'react-dom/client';


createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);
