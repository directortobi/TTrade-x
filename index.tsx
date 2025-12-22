
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { SignalProvider } from './contexts/SignalContext';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <SignalProvider>
          <App />
        </SignalProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}
