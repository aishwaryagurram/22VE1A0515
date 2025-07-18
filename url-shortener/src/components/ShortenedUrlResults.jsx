import React, { useState } from 'react';
import { formatDate, getTimeRemaining } from '../utils/dataModels.js';
import logger from '../services/logger.js';

const ShortenedUrlResults = ({ shortenedUrlList }) => {
  const [currentlyCopiedShortcode, setCurrentlyCopiedShortcode] = useState('');

  const handleCopyUrlToClipboard = async (urlToCopy, associatedShortcode) => {
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCurrentlyCopiedShortcode(associatedShortcode);
      logger.userAction('Copied URL to clipboard', { shortcode: associatedShortcode });

      setTimeout(() => {
        setCurrentlyCopiedShortcode('');
      }, 2000);
    } catch (clipboardError) {
      logger.error('Failed to copy URL to clipboard', clipboardError.message);
      const temporaryTextArea = document.createElement('textarea');
      temporaryTextArea.value = urlToCopy;
      document.body.appendChild(temporaryTextArea);
      temporaryTextArea.select();
      document.execCommand('copy');
      document.body.removeChild(temporaryTextArea);
      setCurrentlyCopiedShortcode(associatedShortcode);
      setTimeout(() => {
        setCurrentlyCopiedShortcode('');
      }, 2000);
    }
  };

  if (!shortenedUrlList || shortenedUrlList.length === 0) {
    return null;
  }

  return (
    <div className="shortened-url-results">
      <h3>Your Shortened URLs</h3>
      <p className="results-description">
        Your URLs have been successfully shortened! Click on any short URL to copy it to your clipboard.
      </p>

      <div className="results-list">
        {shortenedUrlList.map((urlData) => (
          <div key={urlData.id} className="result-item">
            <div className="result-header">
              <div className="original-url">
                <label>Original URL:</label>
                <a
                  href={urlData.longUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="long-url-link"
                  title={urlData.longUrl}
                >
                  {urlData.longUrl.length > 60
                    ? `${urlData.longUrl.substring(0, 60)}...`
                    : urlData.longUrl
                  }
                </a>
              </div>
            </div>

            <div className="result-details">
              <div className="short-url-section">
                <label>Short URL:</label>
                <div className="short-url-container">
                  <button
                    onClick={() => handleCopyUrlToClipboard(urlData.shortUrl, urlData.shortcode)}
                    className="short-url-button"
                    title="Click to copy"
                  >
                    {urlData.shortUrl}
                  </button>
                  {currentlyCopiedShortcode === urlData.shortcode && (
                    <span className="copied-indicator">✓ Copied!</span>
                  )}
                </div>
              </div>

              <div className="url-metadata">
                <div className="metadata-item">
                  <label>Shortcode:</label>
                  <span className="shortcode">{urlData.shortcode}</span>
                </div>

                <div className="metadata-item">
                  <label>Created:</label>
                  <span>{formatDate(urlData.createdAt)}</span>
                </div>

                <div className="metadata-item">
                  <label>Expires:</label>
                  <span>{formatDate(urlData.expiryTime)}</span>
                </div>

                <div className="metadata-item">
                  <label>Status:</label>
                  <span className="status-indicator">
                    {getTimeRemaining(urlData.expiryTime)}
                  </span>
                </div>

                <div className="metadata-item">
                  <label>Validity Period:</label>
                  <span>{urlData.validityMinutes} minutes</span>
                </div>
              </div>
            </div>

            <div className="result-actions">
              <button
                onClick={() => window.open(urlData.shortUrl, '_blank')}
                className="test-button"
                title="Test the short URL"
              >
                Test Link
              </button>

              <button
                onClick={() => handleCopyUrlToClipboard(urlData.shortUrl, urlData.shortcode)}
                className="copy-button"
                title="Copy to clipboard"
              >
                {currentlyCopiedShortcode === urlData.shortcode ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="results-footer">
        <p className="info-text">
          💡 <strong>Tip:</strong> You can view detailed statistics for all your URLs on the
          <a href="/stats" className="stats-link"> Statistics page</a>.
        </p>
      </div>
    </div>
  );
};

export default ShortenedUrlResults;
