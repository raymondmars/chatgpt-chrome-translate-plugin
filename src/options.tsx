import React from 'react';
import { createRoot } from 'react-dom/client';
import Settings from './components/settings';
import TranslatorBox from './components/translator_box';

const Options = () => (
  <div style={{ margin: '0 auto', padding: 24 }}>
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minWidth: 380 }}>
        <Settings />
      </div>
      <div style={{ flex: 1, minWidth: 380 }}>
        <TranslatorBox />
      </div>
    </div>
  </div>
);

const root = document.createElement('div');
document.body.appendChild(root);
createRoot(root).render(<Options />); 
