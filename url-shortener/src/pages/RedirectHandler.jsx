import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import storageService from '../services/storageService.js';
import logger from '../services/logger.js';
import { isUrlValid, formatDate, getTimeRemaining } from '../utils/dataModels.js';

const RedirectHandler = () => {
  const { shortcode } = useParams();
  const [status, setStatus] = useState('loading');
  const [urlData, setUrlData] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState('');

  useEffect(() => {
    handleRedirect();
  }, [shortcode]);

  useEffect(() => {
    if (status === 'redirecting' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'redirecting' && countdown === 0) {
      performRedirect();
    }
  }, [status, countdown]);

  const handleRedirect = async () => {
    try {
      logger.userAction('Attempting redirect', { shortcode });

      if (!shortcode || shortcode.length < 3) {
        setStatus('not-found');
        setError('Invalid shortcode format');
        logger.error('Invalid shortcode format', { shortcode });
        return;
      }

      const url = storageService.getUrlByShortcode(shortcode);

      if (!url) {
        setStatus('not-found');
        setError('Shortcode not found');
        logger.error('Shortcode not found', { shortcode });
        return;
      }

      setUrlData(url);

      if (!isUrlValid(url)) {
        setStatus('expired');
        setError('This short URL has expired');
        logger.error('URL expired', { shortcode, expiryTime: url.expiryTime });
        return;
      }

      const referrer = document.referrer || '';
      const userAgent = navigator.userAgent || '';

      storageService.logClick(shortcode, referrer, userAgent);
      storageService.incrementClickCount(shortcode);

      logger.success('Click logged successfully', {
        shortcode,
        referrer,
        destination: url.longUrl
      });

      setStatus('redirecting');

    } catch (error) {
      logger.error('Error during redirect handling', error.message);
      setStatus('error');
      setError('An unexpected error occurred');
    }
  };

  const performRedirect = () => {
    if (urlData && urlData.longUrl) {
      logger.userAction('Performing redirect', { 
        shortcode, 
        destination: urlData.longUrl 
      });
      
      window.location.href = urlData.longUrl;
    }
  };

  const handleManualRedirect = () => {
    if (urlData && urlData.longUrl) {
      performRedirect();
    }
  };

  if (status === 'loading') {
    return (
      <div className="redirect-page">
        <div className="redirect-container">
          <div className="loading-spinner"></div>
          <h2>Looking up your URL...</h2>
          <p>Please wait while we find your destination.</p>
        </div>
      </div>
    );
  }

  if (status === 'redirecting') {
    return (
      <div className="redirect-page">
        <div className="redirect-container">
          <div className="redirect-success">
            <div className="success-icon">✅</div>
            <h2>Redirecting...</h2>
            <p>You will be redirected to your destination in <strong>{countdown}</strong> seconds.</p>
            
            {urlData && (
              <div className="redirect-details">
                <div className="destination-info">
                  <label>Destination:</label>
                  <a 
                    href={urlData.longUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="destination-link"
                  >
                    {urlData.longUrl}
                  </a>
                </div>
                
                <div className="redirect-actions">
                  <button 
                    onClick={handleManualRedirect}
                    className="redirect-now-button"
                  >
                    Go Now
                  </button>
                  
                  <Link to="/" className="cancel-redirect-button">
                    Cancel
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="redirect-page">
      <div className="redirect-container">
        <div className="redirect-error">
          {status === 'not-found' && (
            <>
              <div className="error-icon">❌</div>
              <h2>Short URL Not Found</h2>
              <p>The short URL <strong>/{shortcode}</strong> does not exist or has been removed.</p>
              <div className="error-details">
                <p>This could happen if:</p>
                <ul>
                  <li>The URL was never created</li>
                  <li>There's a typo in the shortcode</li>
                  <li>The URL was manually deleted</li>
                </ul>
              </div>
            </>
          )}

          {status === 'expired' && urlData && (
            <>
              <div className="error-icon">⏰</div>
              <h2>Short URL Expired</h2>
              <p>The short URL <strong>/{shortcode}</strong> has expired and is no longer valid.</p>
              <div className="expired-details">
                <div className="detail-row">
                  <label>Original URL:</label>
                  <span>{urlData.longUrl}</span>
                </div>
                <div className="detail-row">
                  <label>Created:</label>
                  <span>{formatDate(urlData.createdAt)}</span>
                </div>
                <div className="detail-row">
                  <label>Expired:</label>
                  <span>{formatDate(urlData.expiryTime)}</span>
                </div>
                <div className="detail-row">
                  <label>Total Clicks:</label>
                  <span>{urlData.totalClicks || 0}</span>
                </div>
              </div>
              <div className="expired-actions">
                <a 
                  href={urlData.longUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="visit-original-button"
                >
                  Visit Original URL
                </a>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="error-icon">⚠️</div>
              <h2>Something Went Wrong</h2>
              <p>We encountered an unexpected error while processing your request.</p>
              <div className="error-details">
                <p><strong>Error:</strong> {error}</p>
                <p>Please try again or contact support if the problem persists.</p>
              </div>
            </>
          )}

          <div className="error-actions">
            <Link to="/" className="home-button">
              ← Back to Home
            </Link>
            
            <Link to="/stats" className="stats-button">
              View Statistics
            </Link>
            
            <button 
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedirectHandler;
