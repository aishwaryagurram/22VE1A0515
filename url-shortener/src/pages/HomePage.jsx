import React, { useState, useEffect } from 'react';
import UrlShortenerForm from '../components/UrlShortenerForm.jsx';
import ShortenedUrlResults from '../components/ShortenedUrlResults.jsx';
import logger from '../services/logger.js';
import storageService from '../services/storageService.js';

const HomePage = () => {
  const [recentShortenedUrls, setRecentShortenedUrls] = useState([]);
  const [storageStats, setStorageStats] = useState(null);

  useEffect(() => {
    logger.userAction('Visited home page');

    const stats = storageService.getStorageStats();
    setStorageStats(stats);

    logger.info('Home page loaded', { storageStats: stats });
  }, []);

  const handleUrlsShortened = (shortenedUrls) => {
    setRecentShortenedUrls(shortenedUrls);

    const updatedStats = storageService.getStorageStats();
    setStorageStats(updatedStats);

    logger.success(`URLs shortened successfully on home page`, {
      count: shortenedUrls.length,
      shortcodes: shortenedUrls.map(url => url.shortcode)
    });

    setTimeout(() => {
      const resultsElement = document.querySelector('.shortened-url-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  const clearResults = () => {
    setRecentShortenedUrls([]);
    logger.userAction('Cleared recent results');
  };

  return (
    <div className="home-page">
      <header className="page-header">
        <h1>URL Shortener</h1>
        <p className="page-subtitle">
          Transform long URLs into short, manageable links that are easy to share and track.
        </p>
      </header>

      <main className="page-content">
        {storageStats && (
          <div className="stats-summary">
            <h3>Quick Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{storageStats.totalUrls}</span>
                <span className="stat-label">Total URLs</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{storageStats.activeUrls}</span>
                <span className="stat-label">Active URLs</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{storageStats.totalClicks}</span>
                <span className="stat-label">Total Clicks</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{storageStats.expiredUrls}</span>
                <span className="stat-label">Expired URLs</span>
              </div>
            </div>
          </div>
        )}

        <section className="shortener-section">
          <UrlShortenerForm onUrlsShortened={handleUrlsShortened} />
        </section>

        {recentShortenedUrls.length > 0 && (
          <section className="results-section">
            <div className="results-header">
              <h3>Recent Results</h3>
              <button
                onClick={clearResults}
                className="clear-results-button"
                title="Clear recent results"
              >
                Clear Results
              </button>
            </div>
            <ShortenedUrlResults shortenedUrls={recentShortenedUrls} />
          </section>
        )}
        <section className="features-section">
          <h3>Features</h3>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🔗</div>
              <h4>Bulk Shortening</h4>
              <p>Shorten up to 5 URLs at once with custom validity periods and shortcodes.</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">⏰</div>
              <h4>Custom Expiry</h4>
              <p>Set custom validity periods from 1 minute to 1 week for each URL.</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <h4>Click Analytics</h4>
              <p>Track clicks, referrers, and geographic data for all your shortened URLs.</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <h4>Custom Shortcodes</h4>
              <p>Create memorable, branded shortcodes for your URLs.</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">💾</div>
              <h4>Local Storage</h4>
              <p>All data is stored locally in your browser for privacy and persistence.</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">📱</div>
              <h4>Responsive Design</h4>
              <p>Works seamlessly on desktop, tablet, and mobile devices.</p>
            </div>
          </div>
        </section>

        <section className="how-it-works-section">
          <h3>How It Works</h3>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Enter Your URLs</h4>
                <p>Paste up to 5 long URLs that you want to shorten. Each URL can have its own settings.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Customize Settings</h4>
                <p>Set validity periods and custom shortcodes for each URL. All fields are optional except the URL itself.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Get Short URLs</h4>
                <p>Click "Shorten URLs" to generate your short links. Copy them to your clipboard with one click.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Track Performance</h4>
                <p>Visit the Statistics page to see detailed analytics for all your shortened URLs.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
