// import logo from './media/logo.svg';
import React, { useContext, useMemo, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import Main from './pages/Main';
import 'normalize.css';
import { CommsContext } from './contexts/CommsContext';
import DebugContextProvider from './contexts/DebugContext';
import { buildAppTheme } from './theme/appTheme';

function App(props) {
  const { setServerHost } = useContext(CommsContext);
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('hapticapThemeMode') || 'light');

  const theme = useMemo(() => buildAppTheme(themeMode), [themeMode]);

  function toggleThemeMode() {
    setThemeMode((previousMode) => {
      const nextMode = previousMode === 'dark' ? 'light' : 'dark';
      localStorage.setItem('hapticapThemeMode', nextMode);
      return nextMode;
    });
  }

  setServerHost(props.hostAddress);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DebugContextProvider>
        <div className="App">
          <Routes>
            <Route
              path="*"
              element={<Main themeMode={themeMode} onToggleThemeMode={toggleThemeMode} />}
            />
          </Routes>
        </div>
      </DebugContextProvider>
    </ThemeProvider>
  );
}

export default App;
