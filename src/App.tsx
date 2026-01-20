import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import JobTracker from './pages/JobTracker';
import { Profiles } from './pages/Profiles';
import { Settings } from './pages/Settings';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/client';
import { useEffect } from 'react';

function App() {
  const settings = useLiveQuery(() => db.settings.toCollection().first());

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (settings?.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else if (settings?.theme) {
      root.classList.add(settings.theme);
    }
  }, [settings?.theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (settings?.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings?.theme]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<JobTracker />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
