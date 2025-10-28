import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { initAudioDevTools, autoCheckAudioHealth } from './utils/audioDevTools';

// Initialize audio development tools
initAudioDevTools();
autoCheckAudioHealth();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
