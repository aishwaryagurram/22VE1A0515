import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Navigation from './components/Navigation.jsx';
import HomePage from './pages/HomePage.jsx';
import StatisticsPage from './pages/StatisticsPage.jsx';
import RedirectHandler from './pages/RedirectHandler.jsx';
import logger from './services/logger.js';
import './App.css';

function App() {
  useEffect(() => {
    logger.info('URL Shortener application started');
    window.addEventListener('error', (event) => {
      logger.error('Global error caught', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled promise rejection', {
        reason: event.reason
      });
    });

    return () => {
      logger.info('URL Shortener application cleanup');
    };
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          <Navigation />

          <main className="main-content">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/stats" element={<StatisticsPage />} />
                <Route path="/:shortcode" element={<RedirectHandler />} />
              </Routes>
            </ErrorBoundary>
          </main>

          <footer className="app-footer">
            <div className="footer-content">
              <p> URL Shortener. Built with React</p>
              <div className="footer-links">
                <a href="/" className="footer-link">Home</a>
                <a href="/stats" className="footer-link">Statistics</a>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App
