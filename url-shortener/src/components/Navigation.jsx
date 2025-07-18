import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import storageService from '../services/storageService.js';
import logger from '../services/logger.js';

const Navigation = () => {
  const location = useLocation();
  const [storageStats, setStorageStats] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const stats = storageService.getStorageStats();
    setStorageStats(stats);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    logger.userAction('Toggled mobile menu', { isOpen: !isMenuOpen });
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link" onClick={closeMenu}>
            <span className="brand-icon">🔗</span>
            <span className="brand-text">URL Shortener</span>
          </Link>
        </div>

        <button
          className="mobile-menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
        <div className={`nav-links ${isMenuOpen ? 'nav-links-open' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
            onClick={closeMenu}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </Link>

          <Link 
            to="/stats" 
            className={`nav-link ${isActive('/stats') ? 'nav-link-active' : ''}`}
            onClick={closeMenu}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Statistics</span>
            {storageStats && storageStats.totalUrls > 0 && (
              <span className="nav-badge">{storageStats.totalUrls}</span>
            )}
          </Link>

          {isMenuOpen && storageStats && (
            <div className="mobile-quick-stats">
              <div className="quick-stat">
                <span className="stat-label">URLs:</span>
                <span className="stat-value">{storageStats.totalUrls}</span>
              </div>
              <div className="quick-stat">
                <span className="stat-label">Clicks:</span>
                <span className="stat-value">{storageStats.totalClicks}</span>
              </div>
              <div className="quick-stat">
                <span className="stat-label">Active:</span>
                <span className="stat-value">{storageStats.activeUrls}</span>
              </div>
            </div>
          )}
        </div>

        {storageStats && (
          <div className="desktop-quick-stats">
            <div className="quick-stat-item">
              <span className="stat-number">{storageStats.totalUrls}</span>
              <span className="stat-label">URLs</span>
            </div>
            <div className="quick-stat-item">
              <span className="stat-number">{storageStats.totalClicks}</span>
              <span className="stat-label">Clicks</span>
            </div>
          </div>
        )}
      </div>
      {isMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={closeMenu}
          aria-hidden="true"
        ></div>
      )}
    </nav>
  );
};

export default Navigation;
