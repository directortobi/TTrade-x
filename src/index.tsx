import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { SignalProvider } from './contexts/SignalContext.tsx';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <SignalProvider>
        <App />
      </SignalProvider>
    </ThemeProvider>
  </React.StrictMode>,
);