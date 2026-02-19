import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Questionnaire from './components/Questionnaire';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import AiCompanion from './pages/AiCompanion';
import './index.css';


import { EnvironmentProvider } from './context/EnvironmentContext';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';

import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <ThemeProvider>
      <EnvironmentProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Router>
              <div className="min-h-screen transition-colors duration-300">
                <Navbar />
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/companion" element={<AiCompanion />} />

                    {/* Protected Routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/assessment"
                      element={
                        <ProtectedRoute>
                          <Questionnaire />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </AnimatePresence>
                <ChatWidget />
              </div>
            </Router>
          </ErrorBoundary>
        </AuthProvider>
      </EnvironmentProvider>
    </ThemeProvider>
  );
}

export default App;
