import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { Portfolio } from './pages/Portfolio';
import { Contact } from './pages/Contact';
import AdminPage from './pages/Admin';
import { SplashScreen } from './components/ui/SplashScreen';
import { Chatbot } from './components/ui/Chatbot';

function PublicSite() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <SplashScreen key="splash" finishLoading={() => setIsLoading(false)} />
      ) : (
        <>
          <Layout key="layout">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </Layout>
          <Chatbot />
        </>
      )}
    </AnimatePresence>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/odc');

  if (isAdmin) return <AdminPage />;
  return <PublicSite />;
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;