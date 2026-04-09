import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from '@/components/home';
import { Dashboard } from '@/components/dashboard';
import { ThemeCtx, useThemeProvider } from '@/hooks/use-theme';

function App() {
  const themeCtx = useThemeProvider();

  return (
    <ThemeCtx.Provider value={themeCtx}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/monitor/:id" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </ThemeCtx.Provider>
  );
}

export default App;
