import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@/store/store';
import { initClientErrorReporting } from '@/errorReporting';
import '@/i18n';
import '@/design-system/global.css';
import App from '@/App';

initClientErrorReporting();

// Apply saved theme before first paint to avoid flash
const savedTheme = localStorage.getItem('arqitekt-theme') ?? 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
