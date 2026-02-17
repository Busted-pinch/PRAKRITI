import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Questionnaire from './components/Questionnaire';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import './index.css';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/assessment" element={<Questionnaire />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen transition-colors duration-300">
          <Navbar />
          <AnimatedRoutes />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
