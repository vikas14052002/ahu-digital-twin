import { HashRouter, Routes, Route } from 'react-router-dom';
import { Home } from '@/components/home';
import { Dashboard } from '@/components/dashboard';
import { ThemeCtx, useThemeProvider } from '@/hooks/use-theme';

function App() {
  const themeCtx = useThemeProvider();

  return (
    <ThemeCtx.Provider value={themeCtx}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/monitor/:id" element={<Dashboard />} />
        </Routes>
      </HashRouter>
    </ThemeCtx.Provider>
  );
}

export default App;
