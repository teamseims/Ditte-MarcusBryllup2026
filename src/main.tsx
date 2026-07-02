import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App';
import { content } from './data/content';
import { validateContent } from './lib/validateContent';

// Fail loudly in dev if the content model is broken (§3). Vite shows the
// thrown message in its error overlay, telling Simon exactly what to fix.
if (import.meta.env.DEV) {
  validateContent(content);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
